/**
 * Smart Text Chunker
 * Splits large texts into overlapping semantic chunks to prevent token limit exhaustion
 * while preserving context.
 */

export const chunkText = (text, options = {}) => {
  const { maxTokens = 4000, overlap = 400 } = options;
  // Rough estimation: 1 token ≈ 4 chars
  const chunkSizeChars = maxTokens * 4;
  const overlapChars = overlap * 4;
  
  if (!text || text.length <= chunkSizeChars) {
    return [{ content: text, chunkIndex: 0 }];
  }

  const chunks = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    // Determine end of chunk
    let endIndex = startIndex + chunkSizeChars;
    
    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Try to find a safe boundary (paragraph or sentence) within the last 10% of the chunk
      const searchRegion = text.substring(endIndex - Math.floor(chunkSizeChars * 0.1), endIndex);
      
      const paragraphBreak = searchRegion.lastIndexOf("\n\n");
      const sentenceBreak = searchRegion.lastIndexOf(". ");

      if (paragraphBreak !== -1) {
        endIndex = (endIndex - Math.floor(chunkSizeChars * 0.1)) + paragraphBreak + 2;
      } else if (sentenceBreak !== -1) {
        endIndex = (endIndex - Math.floor(chunkSizeChars * 0.1)) + sentenceBreak + 2;
      }
    }

    chunks.push({
      content: text.substring(startIndex, endIndex).trim(),
      chunkIndex,
    });

    // Advance startIndex, ensuring overlap
    startIndex = endIndex - overlapChars;
    // Prevent infinite loop if overlap is somehow larger than progression
    if (startIndex <= chunks[chunkIndex].chunkIndex * chunkSizeChars) {
      startIndex = endIndex;
    }
    
    chunkIndex++;
  }

  return chunks;
};
