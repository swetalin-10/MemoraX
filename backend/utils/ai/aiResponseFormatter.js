/**
 * Normalize AI responses to ensure a consistent return shape and clean up markdown artifacts.
 */

/**
 * Normalizes the response object from the Gemini API.
 * @param {Object} response - The raw response from Gemini
 * @returns {string} The extracted text
 */
export const extractTextFromResponse = (response) => {
  const text =
    response?.candidates?.[0]?.content?.parts?.[0]?.text ||
    response?.text ||
    "";
  return text.trim();
};

/**
 * Attempts to safely parse JSON from an AI response, stripping markdown blocks if present.
 * @param {string} text - Raw AI text output
 * @returns {Object|null} Parsed JSON or null if failed
 */
export const parseAIJSON = (text) => {
  if (!text) return null;
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[AI Formatter] JSON Parse Error:", error.message);
    // Return null instead of throwing to allow graceful degradation
    return null; 
  }
};

/**
 * Standardize the output format for all AI router calls.
 */
export const createStandardResponse = (text, usageMetadata) => {
  return {
    success: true,
    text, // For backward compatibility with aiRouter wrapper
    content: text, // The new standard
    usage: usageMetadata
  };
};
