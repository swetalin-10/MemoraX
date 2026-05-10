import { generateAIResponse } from "./ai/aiRouter.js";
import { AI_TASK } from "./ai/aiModels.js";
import { PROMPTS } from "./ai/aiPrompts.js";
import { optimizeTextTokens } from "./ai/aiLimiter.js";
import { chunkText } from "./ai/aiChunker.js";

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{ question: string, answer: string, difficulty: string }>>}
 */

export const generateFlashcards = async (text, count = 10) => {
  const optimizedText = optimizeTextTokens(text);
  // Take the first chunk if text is too large
  const chunks = chunkText(optimizedText, { maxTokens: 4000 });
  const sourceText = chunks[0].content;

  const prompt = PROMPTS.FLASHCARDS(count) + sourceText;

  try {
    const result = await generateAIResponse({
      taskType: AI_TASK.FLASHCARDS,
      prompt,
    });

    const generatedText = result.text;

    const flashcards = [];
    const cards = generatedText.split("---").filter((c) => c.trim());

    for (const card of cards) {
      let question = "";
      let answer = "";
      let difficulty = "medium";

      const lines = card.trim().split("\n");

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("A:")) {
          answer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Flashcard Generation Error:", error.message);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{ question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string }>>}
 */

export const generateQuiz = async (text, numQuestions = 5) => {
  const optimizedText = optimizeTextTokens(text);
  const chunks = chunkText(optimizedText, { maxTokens: 4000 });
  const sourceText = chunks[0].content;

  const prompt = PROMPTS.QUIZZES(numQuestions) + sourceText;

  try {
    const result = await generateAIResponse({
      taskType: AI_TASK.QUIZZES,
      prompt,
    });

    const generatedText = result.text;

    const questions = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.match(/^Q\d:/)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Quiz Generation Error:", error.message);
    throw new Error("Failed to generate quiz");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>} - Summary of the document
 */

export const generateSummary = async (text) => {
  const optimizedText = optimizeTextTokens(text);
  const chunks = chunkText(optimizedText, { maxTokens: 5500 });
  // Pass up to 2 chunks for a broader summary without blowing quota
  const sourceText = chunks.slice(0, 2).map(c => c.content).join("\n\n---\n\n");

  const prompt = PROMPTS.SUMMARY + sourceText;

  try {
    const result = await generateAIResponse({
      taskType: AI_TASK.SUMMARY,
      prompt,
    });

    return result.text;
  } catch (error) {
    console.error("Summary Generation Error:", error.message);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with document context — enhanced with conversation history and semantic prompting.
 * @param {string} question - User's question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @param {Object} options - Additional options
 * @param {Array<{role: string, content: string}>} options.chatHistory - Recent conversation messages
 * @param {string} options.documentTitle - Title of the document for contextual grounding
 * @returns {Promise<string>} - AI's response
 */
export const chatWithContext = async (question, chunks, options = {}) => {
  try {
    const { chatHistory = [], documentTitle = "" } = options;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return "I couldn't find relevant information in the document to answer that question. Try rephrasing your question or asking about a specific topic covered in the document.";
    }

    // Build context from chunks with section labels
    const context = chunks
      .map((c, i) => {
        const heading = c?.heading ? ` (${c.heading})` : "";
        return `[Section ${i + 1}${heading}]\n${c?.content || ""}`;
      })
      .join("\n\n---\n\n");

    // Build conversation history context (last few turns for continuity)
    let conversationContext = "";
    if (chatHistory.length > 0) {
      const recentMessages = chatHistory.slice(-6); // Last 3 exchanges (6 messages)
      conversationContext = "\n\nPrevious conversation:\n" +
        recentMessages
          .map((msg) => `${msg.role === "user" ? "Student" : "Tutor"}: ${msg.content}`)
          .join("\n") +
        "\n";
    }

    // Build the document title context
    const titleContext = documentTitle
      ? `\nDocument Title: "${documentTitle}"\n`
      : "";

    const prompt = `You are an intelligent document tutor helping a student study. Your role is to answer questions based on the provided document context accurately and helpfully.

INSTRUCTIONS:
- Answer based ONLY on the provided document context below. Do not use external knowledge.
- Focus on SEMANTIC MEANING, not just keyword matching. If the student asks "What is this about?" or "What is the purpose?", look for definitions, objectives, introductions, and problem statements in the context.
- If the student refers to "this project", "this app", "this system", or "it" — they are referring to the document topic${documentTitle ? ` ("${documentTitle}")` : ""}.
- If the question is a follow-up to the previous conversation, use the conversation history to understand what "it", "this", "that", etc. refer to.
- If the answer is partially available in the context, provide what you can find and note that some details may be in other sections.
- If the answer is genuinely not in the provided context, clearly state: "This information doesn't appear to be covered in the provided document sections."
- Do NOT hallucinate or invent facts not present in the context.
- Use clear markdown formatting: headings, bullet points, and bold text where appropriate.
- Be concise but thorough — provide a complete answer without unnecessary repetition.
${titleContext}${conversationContext}
Document Context:
${context}

Student's Question: ${question}

Answer:`;

    const result = await generateAIResponse({
      taskType: AI_TASK.CHAT,
      prompt: optimizeTextTokens(prompt),
    });

    return result.text || "Sorry, I couldn't generate an answer. Please try again.";
  } catch (error) {
    console.error("Chat Generation Error:", error.message);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>} - Explanation of the concept
 */

export const explainConcept = async (concept, context) => {
  const optimizedText = optimizeTextTokens(context);
  const chunks = chunkText(optimizedText, { maxTokens: 3000 });
  const sourceText = chunks[0].content;

  const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${sourceText}`;

  try {
    const result = await generateAIResponse({
      taskType: AI_TASK.EXPLAIN_CONCEPT,
      prompt,
    });

    return result.text;
  } catch (error) {
    console.error("Concept Explanation Error:", error.message);
    throw new Error("Failed to explain concept");
  }
};
