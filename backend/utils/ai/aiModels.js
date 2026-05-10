/**
 * Centralized AI Model Configuration
 *
 * This is the SINGLE SOURCE OF TRUTH for all AI model selection across MemoraX.
 * Task categories:
 * - LIGHTWEIGHT: extraction, compression, structured output → fast, cheap models
 * - REASONING:   contextual chat, planning, adaptive logic  → capable models
 */

// ─── Task Type Constants ─────────────────────────────────────────────────────

export const AI_TASK = {
  // Lightweight extraction / generation tasks
  FLASHCARDS: "FLASHCARDS",
  QUIZZES: "QUIZZES",
  SUMMARY: "SUMMARY",
  EXPLAIN_CONCEPT: "EXPLAIN_CONCEPT",
  CHEATSHEET_EXTRACT: "CHEATSHEET_EXTRACT",
  CHEATSHEET_MERGE: "CHEATSHEET_MERGE",
  CHEATSHEET_REGEN: "CHEATSHEET_REGEN",

  // Reasoning-heavy tasks
  CHAT: "CHAT",
  STUDY_PLANNER: "STUDY_PLANNER",
  PLANNER_EDIT: "PLANNER_EDIT",
};

// ─── Model Assignments ───────────────────────────────────────────────────────

const AI_MODELS = {
  // ── Lightweight tasks → Flash Lite (fast, cheap, high-throughput) ──
  [AI_TASK.FLASHCARDS]: "gemini-2.5-flash-lite",
  [AI_TASK.QUIZZES]: "gemini-2.5-flash-lite",
  [AI_TASK.SUMMARY]: "gemini-2.5-flash-lite",
  [AI_TASK.EXPLAIN_CONCEPT]: "gemini-2.5-flash-lite",
  [AI_TASK.CHEATSHEET_EXTRACT]: "gemini-2.5-flash-lite",
  [AI_TASK.CHEATSHEET_MERGE]: "gemini-2.5-flash-lite",
  [AI_TASK.CHEATSHEET_REGEN]: "gemini-2.5-flash-lite",

  // ── Reasoning tasks → Temporarily downgraded to Flash Lite for quota stability ──
  [AI_TASK.CHAT]: "gemini-2.5-flash-lite",
  [AI_TASK.STUDY_PLANNER]: "gemini-2.5-flash-lite",
  [AI_TASK.PLANNER_EDIT]: "gemini-2.5-flash-lite",
};

// ─── Token Limits (safe maximums per task to prevent oversized requests) ─────

export const TOKEN_LIMITS = {
  [AI_TASK.FLASHCARDS]: 16000,
  [AI_TASK.QUIZZES]: 16000,
  [AI_TASK.SUMMARY]: 22000,
  [AI_TASK.EXPLAIN_CONCEPT]: 12000,
  [AI_TASK.CHEATSHEET_EXTRACT]: 10000,
  [AI_TASK.CHEATSHEET_MERGE]: 30000,
  [AI_TASK.CHEATSHEET_REGEN]: 22000,
  [AI_TASK.CHAT]: 20000,
  [AI_TASK.STUDY_PLANNER]: 22000,
  [AI_TASK.PLANNER_EDIT]: 25000,
};

// ─── Retry Configuration ─────────────────────────────────────────────────────

export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 2000, // 2s → 4s → 8s exponential backoff
  retryableStatusCodes: [429, 500, 503], // 429 is explicitly handled in aiErrors to distinguish quota vs transient
};

/**
 * Get the model identifier for a given task type.
 * @param {string} taskType - One of AI_TASK constants
 * @returns {string} Model identifier string
 */
export const getModelForTask = (taskType) => {
  const model = AI_MODELS[taskType];
  if (!model) {
    console.warn(`[AI Config] Unknown task type "${taskType}", falling back to flash-lite`);
    return "gemini-2.5-flash-lite";
  }
  return model;
};

export default AI_MODELS;
