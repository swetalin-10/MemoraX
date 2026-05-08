import Document from "../models/documentModel.js";
import Flashcard from "../models/flashcardModel.js";
import Quiz from "../models/quizModel.js";
import ChatHistory from "../models/chatHistoryModel.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks, chunkText } from "../utils/textChunker.js";

// @desc    Generate flashcards from a document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate flashcards using Gemini
    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      parseInt(count)
    );

    // Save flashcards to database
    const flashcardSet = await Flashcard.create({
      userId: req.user._id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isReviewed: false,
        isStarred: false,
      })),
    });

    return res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a quiz from a document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate quiz using Gemini
    const questions = await geminiService.generateQuiz(
      document.extractedText,
      parseInt(numQuestions)
    );

    // Save quiz to database
    const quiz = await Quiz.create({
      userId: req.user._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions: questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    return res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate document summary
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Generate summary using Gemini
    const summary = await geminiService.generateSummary(document.extractedText);

    return res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },
      message: "Summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with AI about a document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and question",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // ── Smart re-chunking: detect broken chunks and re-process ──────────
    // The old chunker had a bug that destroyed whitespace. If chunks seem
    // broken (e.g., no spaces in content), re-chunk from extractedText.
    let chunks = document.chunks;
    if (chunks && chunks.length > 0) {
      const sampleContent = chunks[0].content || "";
      const wordCount = sampleContent.split(/\s+/).length;
      const charCount = sampleContent.length;

      // If a chunk has many chars but very few words, it's likely broken
      // (the old bug collapsed all spaces, creating one giant "word")
      if (charCount > 100 && wordCount < 5) {
        console.log(`[AI Chat] Detected broken chunks for document ${documentId}, re-chunking...`);
        if (document.extractedText && document.extractedText.trim().length > 0) {
          chunks = chunkText(document.extractedText, 300, 75);

          // Persist the fixed chunks back to the document (background, non-blocking)
          Document.findByIdAndUpdate(documentId, { chunks }).catch((err) => {
            console.error("Failed to persist re-chunked document:", err);
          });
        }
      }
    } else if (document.extractedText && document.extractedText.trim().length > 0) {
      // No chunks at all — generate them
      console.log(`[AI Chat] No chunks found for document ${documentId}, generating...`);
      chunks = chunkText(document.extractedText, 300, 75);

      Document.findByIdAndUpdate(documentId, { chunks }).catch((err) => {
        console.error("Failed to persist generated chunks:", err);
      });
    }

    // ── Get or Create chat history ──────────────────────────────────────
    let chatHistory = await ChatHistory.findOne({
      userId: req.user._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user._id,
        documentId: document._id,
        messages: [],
      });
    }

    // ── Build enhanced query for retrieval ───────────────────────────────
    // For follow-up questions (short, vague), combine with previous question
    // for better chunk retrieval. E.g., "Why?" → "Why [previous topic]?"
    let retrievalQuery = question;
    const recentMessages = chatHistory.messages || [];

    if (recentMessages.length >= 2 && question.split(/\s+/).length <= 6) {
      // Short follow-up question — find the last user message for context
      const lastUserMsg = [...recentMessages]
        .reverse()
        .find((m) => m.role === "user");
      if (lastUserMsg) {
        retrievalQuery = `${lastUserMsg.content} ${question}`;
      }
    }

    // ── Find relevant chunks with document title context ────────────────
    const relevantChunks = findRelevantChunks(
      chunks,
      retrievalQuery,
      5,
      document.title
    );
    const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

    // ── Generate AI response with conversation context ──────────────────
    const answer = await geminiService.chatWithContext(
      question,
      relevantChunks,
      {
        chatHistory: recentMessages.slice(-6), // Last 3 conversation turns
        documentTitle: document.title,
      }
    );

    // ── Save conversation ───────────────────────────────────────────────
    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      }
    );

    await chatHistory.save();

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain a concept from a document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and concept",
        statusCode: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    // Find relevant chunks for the concept
    const relevantChunks = await findRelevantChunks(
      document.chunks,
      concept,
      3
    );
    const context = relevantChunks.map((c) => c.content).join("\n\n");

    // Generate explanation using Gemini
    const explanation = await geminiService.explainConcept(concept, context);

    return res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat-history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        statusCode: 400,
      });
    }

    const chatHistory = await ChatHistory.findOne({
        userId: req.user._id,
        documentId: documentId,
    }).select('messages'); // Only retrieve the messages array

    if (!chatHistory) {
        return res.status(200).json({
            success: true,
            data: [], //Return an empty array if no chat history found
            message: "No chat history found for this document",
        });
    }

    return res.status(200).json({
        success: true,
        data: chatHistory.messages,
        message: "Chat history retrieved successfully",
    })
  } catch (error) {
    next(error);
  }
};
