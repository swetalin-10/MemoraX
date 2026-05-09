import StudyPlanner from "../models/studyPlannerModel.js";
import Document from "../models/documentModel.js";
import { generateAIContent, AI_TASK } from "../utils/aiRouter.js";

// ─── Syllabus detection keywords ─────────────────────────────────────────────
const SYLLABUS_KEYWORDS = [
  "syllabus",
  "curriculum",
  "course outline",
  "subject plan",
  "course plan",
  "roadmap",
  "course structure",
  "study plan",
  "lesson plan",
];

/**
 * Check if a document title/filename looks like a syllabus.
 * @param {string} title - Document title
 * @returns {boolean}
 */
const isSyllabusLike = (title) => {
  if (!title) return false;
  const lower = title.toLowerCase();
  return SYLLABUS_KEYWORDS.some((kw) => lower.includes(kw));
};

// ─── Gemini: Generate Study Roadmap ──────────────────────────────────────────

/**
 * Generate a structured study roadmap JSON from document text.
 * @param {string} text - Extracted document text
 * @param {string} docTitle - Document title for context
 * @returns {Promise<Object>} Parsed roadmap object
 */
const generateRoadmapFromText = async (text, docTitle) => {
  const prompt = `You are an expert academic study planner. Analyze the following syllabus/document content and generate a comprehensive, structured study roadmap.

DOCUMENT TITLE: "${docTitle}"

DOCUMENT CONTENT:
${text.substring(0, 20000)}

INSTRUCTIONS:
- Create a realistic weekly study plan covering all topics in the document.
- Order topics from foundational/beginner to advanced.
- Estimate realistic study hours per week.
- Include revision sessions.
- Prioritize topics by importance (high/medium/low).
- Provide actionable study tips.
- If the content is a syllabus, follow its structure. If it's general content, organize it logically.

RESPOND WITH ONLY VALID JSON (no markdown fences, no extra text). Use this exact structure:

{
  "title": "Study Roadmap: [Subject/Topic Name]",
  "overview": "[2-3 sentence overview of what this study plan covers]",
  "estimatedDuration": "[e.g. 4 weeks, 30 days]",
  "difficulty": "[beginner/intermediate/advanced/mixed]",
  "studyPlan": [
    {
      "week": "Week 1: [Theme]",
      "topics": ["Topic 1", "Topic 2"],
      "goals": ["Goal 1", "Goal 2"],
      "revision": "Revise [specific topics]",
      "estimatedHours": 8,
      "priority": "high"
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}

RULES:
- Return ONLY valid JSON. No markdown, no code fences, no explanation text.
- Create at least 3 weeks and at most 12 weeks.
- Each week must have at least 2 topics and 2 goals.
- Include at least 4 practical tips.
- estimatedHours should be realistic (4-12 per week).
- Vary priorities across weeks.`;

  const result = await generateAIContent({
    taskType: AI_TASK.STUDY_PLANNER,
    prompt,
  });

  const generatedText = result.text;

  // Parse the JSON response — strip markdown fences if Gemini adds them
  const cleaned = generatedText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error("Failed to parse Gemini roadmap JSON:", parseError.message);
    console.error("Raw response:", cleaned.substring(0, 500));
    throw new Error("AI generated an invalid response. Please try again.");
  }
};

// ─── Gemini: Modify Existing Roadmap ─────────────────────────────────────────

/**
 * Modify an existing roadmap based on user instruction.
 * @param {Object} existingPlan - Current roadmap object
 * @param {string} userInstruction - User's modification request
 * @returns {Promise<Object>} Updated roadmap object
 */
const modifyRoadmapWithAI = async (existingPlan, userInstruction) => {
  const prompt = `You are an expert study planner assistant. The user has an existing study roadmap and wants to modify it.

EXISTING ROADMAP:
${JSON.stringify(existingPlan, null, 2)}

USER'S MODIFICATION REQUEST:
"${userInstruction}"

INSTRUCTIONS:
- Modify the existing roadmap based on the user's request.
- Preserve the overall structure and topic coverage.
- Only change what the user specifically requested.
- Keep the same JSON schema.
- If the user asks to change duration, redistribute topics accordingly.
- If the user asks to change priority, adjust the priority fields.
- If the user asks to add revision, add revision fields to relevant weeks.

RESPOND WITH ONLY VALID JSON (no markdown fences, no extra text). Use the exact same structure:

{
  "title": "...",
  "overview": "...",
  "estimatedDuration": "...",
  "difficulty": "...",
  "studyPlan": [...],
  "tips": [...]
}

RULES:
- Return ONLY valid JSON. No markdown, no code fences, no explanation.
- Maintain the same schema as the existing roadmap.
- Apply the user's requested changes accurately.`;

  const result = await generateAIContent({
    taskType: AI_TASK.PLANNER_EDIT,
    prompt,
  });

  const generatedText = result.text;

  const cleaned = generatedText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (parseError) {
    console.error("Failed to parse Gemini modification JSON:", parseError.message);
    throw new Error("AI generated an invalid response. Please try again.");
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLERS
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Detect syllabus-like documents from user's uploads
// @route   GET /api/study-planner/detect-syllabus
// @access  Private
export const detectSyllabusDocs = async (req, res, next) => {
  try {
    const documents = await Document.find({
      userId: req.user._id,
      status: "ready",
    }).select("title fileSize uploadDate filePath");

    // Filter documents whose title looks like a syllabus
    const syllabusLike = documents.filter((doc) => isSyllabusLike(doc.title));

    // Also check if any planners already exist for these documents
    const existingPlanners = await StudyPlanner.find({
      userId: req.user._id,
    }).select("sourceDocumentId");

    const existingDocIds = new Set(
      existingPlanners.map((p) => p.sourceDocumentId.toString())
    );

    const result = syllabusLike.map((doc) => ({
      ...doc.toObject(),
      hasPlannerGenerated: existingDocIds.has(doc._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate a study planner from a document
// @route   POST /api/study-planner/generate
// @access  Private
export const generatePlanner = async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide a documentId",
        statusCode: 400,
      });
    }

    // Find the source document
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

    if (!document.extractedText || document.extractedText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Document has no extracted text. Please re-upload.",
        statusCode: 400,
      });
    }

    // Create a planner entry in "generating" state
    const planner = await StudyPlanner.create({
      userId: req.user._id,
      sourceDocumentId: document._id,
      title: `Study Plan: ${document.title}`,
      status: "generating",
    });

    // Respond immediately, then generate in background
    res.status(201).json({
      success: true,
      data: planner,
      message: "Study planner generation started. This may take a moment.",
    });

    // Generate roadmap in background
    try {
      const roadmap = await generateRoadmapFromText(
        document.extractedText,
        document.title
      );

      await StudyPlanner.findByIdAndUpdate(planner._id, {
        title: roadmap.title || planner.title,
        overview: roadmap.overview || "",
        estimatedDuration: roadmap.estimatedDuration || "",
        difficulty: roadmap.difficulty || "mixed",
        studyPlan: (roadmap.studyPlan || []).map((week) => ({
          week: week.week,
          topics: week.topics || [],
          goals: week.goals || [],
          revision: week.revision || "",
          estimatedHours: week.estimatedHours || 0,
          priority: week.priority || "medium",
          isCompleted: false,
        })),
        tips: roadmap.tips || [],
        status: "ready",
      });

      console.log(`[Study Planner] Generated planner ${planner._id} successfully`);
    } catch (genError) {
      console.error(`[Study Planner] Generation failed for ${planner._id}:`, genError.message);
      await StudyPlanner.findByIdAndUpdate(planner._id, {
        status: "failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all planners for current user
// @route   GET /api/study-planner
// @access  Private
export const getPlanners = async (req, res, next) => {
  try {
    const planners = await StudyPlanner.find({
      userId: req.user._id,
    })
      .populate("sourceDocumentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: planners.length,
      data: planners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single planner by ID
// @route   GET /api/study-planner/:id
// @access  Private
export const getPlannerById = async (req, res, next) => {
  try {
    const planner = await StudyPlanner.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("sourceDocumentId", "title");

    if (!planner) {
      return res.status(404).json({
        success: false,
        error: "Study planner not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: planner,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Modify planner via AI chat
// @route   POST /api/study-planner/:id/chat
// @access  Private
export const plannerChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Please provide a message",
        statusCode: 400,
      });
    }

    const planner = await StudyPlanner.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: "ready",
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        error: "Study planner not found or not ready",
        statusCode: 404,
      });
    }

    // Build current plan object for AI
    const currentPlan = {
      title: planner.title,
      overview: planner.overview,
      estimatedDuration: planner.estimatedDuration,
      difficulty: planner.difficulty,
      studyPlan: planner.studyPlan.map((w) => ({
        week: w.week,
        topics: w.topics,
        goals: w.goals,
        revision: w.revision,
        estimatedHours: w.estimatedHours,
        priority: w.priority,
      })),
      tips: planner.tips,
    };

    // Generate modified plan
    const updatedPlan = await modifyRoadmapWithAI(currentPlan, message);

    // Update the planner with new data
    planner.title = updatedPlan.title || planner.title;
    planner.overview = updatedPlan.overview || planner.overview;
    planner.estimatedDuration = updatedPlan.estimatedDuration || planner.estimatedDuration;
    planner.difficulty = updatedPlan.difficulty || planner.difficulty;
    planner.tips = updatedPlan.tips || planner.tips;

    if (updatedPlan.studyPlan && updatedPlan.studyPlan.length > 0) {
      planner.studyPlan = updatedPlan.studyPlan.map((week) => ({
        week: week.week,
        topics: week.topics || [],
        goals: week.goals || [],
        revision: week.revision || "",
        estimatedHours: week.estimatedHours || 0,
        priority: week.priority || "medium",
        isCompleted: false,
      }));
    }

    // Save chat history
    planner.chatHistory.push(
      {
        role: "user",
        content: message,
        timestamp: new Date(),
      },
      {
        role: "assistant",
        content: `✅ Roadmap updated successfully based on your request: "${message}"`,
        timestamp: new Date(),
      }
    );

    await planner.save();

    res.status(200).json({
      success: true,
      data: planner,
      message: "Planner updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle week completion status
// @route   PATCH /api/study-planner/:id/toggle/:weekIndex
// @access  Private
export const toggleWeekComplete = async (req, res, next) => {
  try {
    const { id, weekIndex } = req.params;
    const idx = parseInt(weekIndex);

    const planner = await StudyPlanner.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        error: "Study planner not found",
        statusCode: 404,
      });
    }

    if (idx < 0 || idx >= planner.studyPlan.length) {
      return res.status(400).json({
        success: false,
        error: "Invalid week index",
        statusCode: 400,
      });
    }

    planner.studyPlan[idx].isCompleted = !planner.studyPlan[idx].isCompleted;
    await planner.save();

    res.status(200).json({
      success: true,
      data: planner,
      message: `Week ${idx + 1} toggled successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a study planner
// @route   DELETE /api/study-planner/:id
// @access  Private
export const deletePlanner = async (req, res, next) => {
  try {
    const planner = await StudyPlanner.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        error: "Study planner not found",
        statusCode: 404,
      });
    }

    await planner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Study planner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
