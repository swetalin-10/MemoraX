import { TOKEN_LIMITS } from "./aiModels.js";

/**
 * Rough token estimation (1 token ≈ 4 characters for English text).
 * Used for pre-flight validation, not billing.
 * @param {string} text
 * @returns {number} Estimated token count
 */
export const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

/**
 * Truncate prompt to fit within the safe token limit for a task.
 * @param {string} prompt - Full prompt text
 * @param {string} taskType - Task type for limit lookup
 * @returns {string} Potentially truncated prompt
 */
export const enforceTokenLimit = (prompt, taskType) => {
  const limit = TOKEN_LIMITS[taskType] || 16000;
  const estimatedTokens = estimateTokens(prompt);

  if (estimatedTokens <= limit) {
    return prompt;
  }

  // Truncate to approximately the safe character limit
  const safeCharLimit = limit * 4;
  const truncated = prompt.substring(0, safeCharLimit);

  console.warn(
    `[AI Limiter] Prompt truncated for ${taskType}: ${estimatedTokens} est. tokens → ~${limit} tokens`
  );

  return truncated;
};

/**
 * Token Reduction Optimization
 * Cleans excessive whitespace and newlines to reduce token usage slightly.
 * @param {string} text 
 * @returns {string} Optimized text
 */
export const optimizeTextTokens = (text) => {
  if (!text) return "";
  return text
    .replace(/\n{3,}/g, "\n\n") // replace 3+ newlines with 2
    .replace(/[ \t]{2,}/g, " ") // replace multiple spaces/tabs with single space
    .trim();
};
