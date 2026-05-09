import Document from "../models/documentModel.js";
import CheatSheet from "../models/cheatSheetModel.js";
import { generateCheatSheet, regenerateSection } from "../utils/cheatSheetGenerator.js";
import { chunkText } from "../utils/textChunker.js";

// @desc    Generate a cheat sheet from a document
// @route   POST /api/cheatsheets/generate/:documentId
// @access  Private
export const generateCheatSheetHandler = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { mode = "exam_revision", compressionLevel = "standard" } = req.body;

    // Validate mode
    const validModes = [
      "exam_revision",
      "interview_prep",
      "beginner_friendly",
      "one_page",
      "visual_learning",
    ];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        success: false,
        error: `Invalid mode. Must be one of: ${validModes.join(", ")}`,
        statusCode: 400,
      });
    }

    // Validate compression level
    const validCompressions = ["standard", "aggressive", "ultra"];
    if (!validCompressions.includes(compressionLevel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid compression level. Must be one of: ${validCompressions.join(", ")}`,
        statusCode: 400,
      });
    }

    // Fetch document with ownership check
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

    // Get chunks — reuse existing or re-chunk from extractedText
    let chunks = document.chunks;

    if (!chunks || chunks.length === 0) {
      if (!document.extractedText || document.extractedText.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: "Document has no extractable content",
          statusCode: 400,
        });
      }
      chunks = chunkText(document.extractedText, 300, 75);

      // Persist chunks for future use (non-blocking)
      Document.findByIdAndUpdate(documentId, { chunks }).catch((err) => {
        console.error("Failed to persist chunks:", err);
      });
    }

    // Detect broken chunks (same logic as aiController.chat)
    if (chunks.length > 0) {
      const sampleContent = chunks[0].content || "";
      const wordCount = sampleContent.split(/\s+/).length;
      const charCount = sampleContent.length;

      if (charCount > 100 && wordCount < 5) {
        console.log(
          `[CheatSheet] Detected broken chunks for document ${documentId}, re-chunking...`
        );
        if (document.extractedText && document.extractedText.trim().length > 0) {
          chunks = chunkText(document.extractedText, 300, 75);
          Document.findByIdAndUpdate(documentId, { chunks }).catch((err) => {
            console.error("Failed to persist re-chunked document:", err);
          });
        }
      }
    }

    // Generate cheat sheet via multi-stage AI pipeline
    const { generatedContent, metadata, sourceChunks } = await generateCheatSheet(
      chunks,
      mode,
      compressionLevel,
      document.title
    );

    // Save to database
    const cheatSheet = await CheatSheet.create({
      user: req.user._id,
      document: document._id,
      title: generatedContent.title || `${document.title} — Cheat Sheet`,
      mode,
      compressionLevel,
      generatedContent,
      metadata,
      sourceChunks,
    });

    return res.status(201).json({
      success: true,
      data: cheatSheet,
      message: "Cheat sheet generated successfully",
    });
  } catch (error) {
    console.error("[CheatSheet] Generation error:", error);
    next(error);
  }
};

// @desc    Get all cheat sheets for a document
// @route   GET /api/cheatsheets/document/:documentId
// @access  Private
export const getCheatSheetsForDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    const cheatSheets = await CheatSheet.find({
      user: req.user._id,
      document: documentId,
    })
      .sort({ createdAt: -1 })
      .select("title mode compressionLevel metadata createdAt");

    return res.status(200).json({
      success: true,
      data: cheatSheets,
      message: "Cheat sheets retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cheat sheets for the current user
// @route   GET /api/cheatsheets
// @access  Private
export const getAllCheatSheets = async (req, res, next) => {
  try {
    const cheatSheets = await CheatSheet.find({
      user: req.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("document", "title")
      .select("title mode compressionLevel metadata createdAt document");

    return res.status(200).json({
      success: true,
      data: cheatSheets,
      message: "Cheat sheets retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single cheat sheet by ID
// @route   GET /api/cheatsheets/:id
// @access  Private
export const getCheatSheetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cheatSheet = await CheatSheet.findOne({
      _id: id,
      user: req.user._id,
    }).populate("document", "title");

    if (!cheatSheet) {
      return res.status(404).json({
        success: false,
        error: "Cheat sheet not found",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      data: cheatSheet,
      message: "Cheat sheet retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a cheat sheet
// @route   DELETE /api/cheatsheets/:id
// @access  Private
export const deleteCheatSheet = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cheatSheet = await CheatSheet.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!cheatSheet) {
      return res.status(404).json({
        success: false,
        error: "Cheat sheet not found",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cheat sheet deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate a single section of a cheat sheet
// @route   PATCH /api/cheatsheets/:id/regenerate-section
// @access  Private
export const regenerateSectionHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sectionIndex, sectionHeading } = req.body;

    if (sectionIndex === undefined || !sectionHeading) {
      return res.status(400).json({
        success: false,
        error: "Please provide sectionIndex and sectionHeading",
        statusCode: 400,
      });
    }

    // Fetch cheat sheet
    const cheatSheet = await CheatSheet.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!cheatSheet) {
      return res.status(404).json({
        success: false,
        error: "Cheat sheet not found",
        statusCode: 404,
      });
    }

    // Fetch the source document for chunk context
    const document = await Document.findOne({
      _id: cheatSheet.document,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Source document not found",
        statusCode: 404,
      });
    }

    let chunks = document.chunks;
    if (!chunks || chunks.length === 0) {
      if (document.extractedText) {
        chunks = chunkText(document.extractedText, 300, 75);
      } else {
        return res.status(400).json({
          success: false,
          error: "No document content available for regeneration",
          statusCode: 400,
        });
      }
    }

    // Regenerate the section
    const newSection = await regenerateSection(
      chunks,
      sectionHeading,
      cheatSheet.mode,
      cheatSheet.compressionLevel
    );

    // Update the section in the cheat sheet
    if (
      cheatSheet.generatedContent.sections &&
      sectionIndex < cheatSheet.generatedContent.sections.length
    ) {
      cheatSheet.generatedContent.sections[sectionIndex] = newSection;
      cheatSheet.markModified("generatedContent");
      await cheatSheet.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        sectionIndex,
        section: newSection,
      },
      message: "Section regenerated successfully",
    });
  } catch (error) {
    console.error("[CheatSheet] Section regeneration error:", error);
    next(error);
  }
};
