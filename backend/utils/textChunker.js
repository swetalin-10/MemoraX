/**
 * Text Chunking & Retrieval Module
 *
 * Splits document text into semantically meaningful chunks and provides
 * intelligent retrieval using TF-IDF scoring, query expansion, n-gram
 * matching, and heading-aware ranking.
 */

import {
  normalizeText,
  extractKeywords,
  expandQuery,
  extractNGrams,
  computeIDF,
  computeTF,
  mergeAdjacentChunks,
  isLikelyHeading,
  STOP_WORDS,
} from "./semanticHelpers.js";

// ─── Chunking ────────────────────────────────────────────────────────────────

/**
 * Split text into semantic chunks for AI processing.
 *
 * Improvements over the original:
 * - Sentence-aware splitting (never cuts mid-sentence)
 * - Heading/section detection and preservation
 * - Each chunk carries its section heading for context
 * - Proper overlap using trailing sentences from previous chunk
 *
 * @param {string} text - Full document text
 * @param {number} chunkSize - Target size per chunk (in words). Default 300.
 * @param {number} overlap - Number of overlap words between chunks. Default 75.
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number, heading: string}>}
 */
export const chunkText = (text, chunkSize = 300, overlap = 75) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text: normalize line endings, collapse excessive whitespace,
  // but PRESERVE spaces between words (the original bug destroyed all spaces)
  const cleanedText = text
    .replace(/\r\n/g, "\n")       // Normalize line endings
    .replace(/\n{3,}/g, "\n\n")   // Collapse 3+ newlines to double
    .replace(/[ \t]+/g, " ")      // Collapse horizontal whitespace (NOT newlines)
    .trim();

  // Split into lines for heading detection and paragraph processing
  const lines = cleanedText.split("\n");

  // Build structured paragraphs with heading tracking
  const paragraphs = [];
  let currentHeading = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (isLikelyHeading(trimmed)) {
      currentHeading = trimmed;
      // Also add the heading as its own paragraph so it gets included in chunks
      paragraphs.push({ text: trimmed, heading: currentHeading, isHeading: true });
    } else {
      paragraphs.push({ text: trimmed, heading: currentHeading, isHeading: false });
    }
  }

  // Split each paragraph into sentences for sentence-aware chunking
  const sentences = [];
  for (const para of paragraphs) {
    // Split by sentence-ending punctuation followed by space or end of string
    const paraSentences = para.text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);

    for (const sent of paraSentences) {
      sentences.push({
        text: sent.trim(),
        heading: para.heading,
        isHeading: para.isHeading,
        wordCount: sent.trim().split(/\s+/).length,
      });
    }
  }

  if (sentences.length === 0) {
    return [];
  }

  // Build chunks using sentence boundaries
  const chunks = [];
  let chunkIndex = 0;
  let i = 0;

  while (i < sentences.length) {
    let currentWords = 0;
    const chunkSentences = [];
    let chunkHeading = sentences[i].heading;
    const startIdx = i;

    // Add sentences until we reach the target chunk size
    while (i < sentences.length && currentWords < chunkSize) {
      chunkSentences.push(sentences[i].text);
      currentWords += sentences[i].wordCount;

      // Keep the first heading found in this chunk (primary section)
      if (sentences[i].isHeading && !chunkHeading) {
        chunkHeading = sentences[i].heading;
      }
      i++;
    }

    if (chunkSentences.length === 0) break;

    // Build chunk content — prepend heading context if available
    let content = chunkSentences.join(" ");
    const headingPrefix =
      chunkHeading && !content.startsWith(chunkHeading)
        ? `[Section: ${chunkHeading}]\n`
        : "";

    chunks.push({
      content: headingPrefix + content,
      chunkIndex: chunkIndex++,
      pageNumber: 0,
      heading: chunkHeading,
    });

    // Calculate overlap: go back by overlap words for the next chunk
    if (i < sentences.length) {
      let overlapWords = 0;
      let backtrack = i - 1;

      while (backtrack > startIdx && overlapWords < overlap) {
        overlapWords += sentences[backtrack].wordCount;
        backtrack--;
      }

      // Move index back for overlap (minimum 1 sentence overlap)
      i = Math.max(backtrack + 1, startIdx + 1);
    }
  }

  // Fallback: if no chunks were created from structured parsing, do simple word-based split
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let j = 0; j < allWords.length; j += chunkSize - overlap) {
      const chunkWords = allWords.slice(j, j + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
        heading: "",
      });
      if (j + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

// ─── Retrieval ───────────────────────────────────────────────────────────────

/**
 * Find the most relevant chunks for a given query using multi-signal scoring.
 *
 * Scoring signals:
 * 1. TF-IDF: weighted term importance across the chunk corpus
 * 2. N-gram matching: phrase-level matching for better precision
 * 3. Query expansion: synonym-based matching for semantic flexibility
 * 4. Heading bonus: chunks whose headings match get boosted
 * 5. Position bonus: slight preference for earlier document sections
 * 6. Coverage bonus: chunks matching more unique query terms rank higher
 *
 * @param {Array<Object>} chunks - Array of document chunks
 * @param {string} query - User's question
 * @param {number} maxChunks - Maximum chunks to return (default 5)
 * @param {string} documentTitle - Optional document title for contextual matching
 * @returns {Array<Object>} Ranked relevant chunks
 */
export const findRelevantChunks = (chunks, query, maxChunks = 5, documentTitle = "") => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // ── Step 1: Expand query with synonyms ──────────────────────────────────
  const { original: queryKeywords, expanded: expandedTerms, allTerms } = expandQuery(query);

  // If after filtering there are no meaningful terms, return first few chunks
  if (allTerms.length === 0) {
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      heading: chunk.heading || "",
      _id: chunk._id,
    }));
  }

  // ── Step 2: Compute IDF scores for all terms ───────────────────────────
  const idfScores = computeIDF(allTerms, chunks);

  // ── Step 3: Extract query n-grams for phrase matching ──────────────────
  const queryBigrams = extractNGrams(query, 2);
  const queryTrigrams = extractNGrams(query, 3);

  // ── Step 4: Check for document title relevance ─────────────────────────
  const titleKeywords = documentTitle ? extractKeywords(documentTitle) : [];
  const queryMentionsTitle = titleKeywords.length > 0 &&
    titleKeywords.some((tw) => queryKeywords.some((qw) => qw.includes(tw) || tw.includes(qw)));

  // ── Step 5: Score each chunk ───────────────────────────────────────────
  const scoredChunks = chunks.map((chunk, index) => {
    const normalizedContent = normalizeText(chunk.content);
    const normalizedHeading = normalizeText(chunk.heading || "");
    let score = 0;

    // --- Signal 1: TF-IDF for original query keywords (highest weight) ---
    let tfidfScore = 0;
    for (const term of queryKeywords) {
      const tf = computeTF(term, normalizedContent);
      const idf = idfScores.get(term) || 1;
      tfidfScore += tf * idf * 3.0; // 3x weight for original terms
    }

    // --- Signal 2: TF-IDF for expanded (synonym) terms (lower weight) ---
    for (const term of expandedTerms) {
      const tf = computeTF(term, normalizedContent);
      const idf = idfScores.get(term) || 1;
      tfidfScore += tf * idf * 1.0; // 1x weight for synonym terms
    }
    score += tfidfScore;

    // --- Signal 3: N-gram phrase matching (bonus for exact phrases) ---
    let ngramScore = 0;
    for (const bigram of queryBigrams) {
      if (normalizedContent.includes(bigram)) {
        ngramScore += 2.0;
      }
    }
    for (const trigram of queryTrigrams) {
      if (normalizedContent.includes(trigram)) {
        ngramScore += 3.0;
      }
    }
    score += ngramScore;

    // --- Signal 4: Heading match bonus ---
    let headingScore = 0;
    if (normalizedHeading) {
      for (const term of allTerms) {
        if (normalizedHeading.includes(term)) {
          headingScore += 2.5;
        }
      }
    }
    score += headingScore;

    // --- Signal 5: Coverage bonus (more unique query terms matched) ---
    const matchedOriginal = queryKeywords.filter((w) =>
      normalizedContent.includes(w)
    ).length;
    const coverage = queryKeywords.length > 0
      ? matchedOriginal / queryKeywords.length
      : 0;
    score += coverage * 3.0;

    // --- Signal 6: Position bonus (slight preference for intro sections) ---
    // Introductory chunks often contain definitions and overviews
    const positionBonus = 1 + (1 - index / chunks.length) * 0.15;
    score *= positionBonus;

    // --- Signal 7: Title-mention bonus for "what is X" type queries ---
    if (queryMentionsTitle && index < Math.ceil(chunks.length * 0.3)) {
      // Boost early chunks when user asks about the document topic itself
      score *= 1.4;
    }

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      heading: chunk.heading || "",
      _id: chunk._id,
      score,
      matchedOriginal,
      matchedExpanded: expandedTerms.filter((w) => normalizedContent.includes(w)).length,
    };
  });

  // ── Step 6: Filter, sort, and merge adjacent chunks ────────────────────
  const relevant = scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      // Primary: score
      if (b.score !== a.score) return b.score - a.score;
      // Secondary: more matched original terms
      if (b.matchedOriginal !== a.matchedOriginal) return b.matchedOriginal - a.matchedOriginal;
      // Tertiary: earlier chunk
      return a.chunkIndex - b.chunkIndex;
    });

  if (relevant.length === 0) {
    // No matches at all — return first few chunks as fallback context
    return chunks.slice(0, Math.min(3, maxChunks)).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      heading: chunk.heading || "",
      _id: chunk._id,
    }));
  }

  // Take top candidates and merge adjacent ones for context continuity
  const topCandidates = relevant.slice(0, maxChunks + 2);
  const merged = mergeAdjacentChunks(topCandidates, chunks, maxChunks);

  return merged;
};