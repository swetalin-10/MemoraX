/**
 * LEGACY WRAPPER: AI Router
 * 
 * NOTE: This file is preserved for backward compatibility.
 * The actual implementation has been moved to utils/ai/aiRouter.js.
 */

import { generateAIResponse } from "./ai/aiRouter.js";

/**
 * Legacy wrapper for generateAIContent to maintain compatibility with existing controllers.
 * @param {Object} params 
 * @returns {Promise<{ text: string, usage: Object }>}
 */
export const generateAIContent = async (params) => {
  return await generateAIResponse(params);
};

export { AI_TASK } from "./ai/aiModels.js";
