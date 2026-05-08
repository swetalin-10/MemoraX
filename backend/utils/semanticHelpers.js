/**
 * Semantic Helpers for AI Chat Retrieval
 * 
 * Provides lightweight semantic text processing utilities:
 * - Text normalization
 * - Query expansion with synonyms
 * - N-gram extraction for phrase matching
 * - TF-IDF inspired scoring
 * - Adjacent chunk merging
 * 
 * Zero external dependencies — works with the existing architecture.
 */

// ─── Extended Stop Words ─────────────────────────────────────────────────────
export const STOP_WORDS = new Set([
  // Articles & determiners
  "the", "a", "an", "this", "that", "these", "those",
  // Pronouns
  "i", "me", "my", "we", "us", "our", "you", "your", "he", "him", "his",
  "she", "her", "it", "its", "they", "them", "their", "what", "which",
  "who", "whom", "whose",
  // Prepositions
  "in", "on", "at", "to", "for", "of", "with", "by", "from", "up", "out",
  "about", "into", "through", "during", "before", "after", "above", "below",
  "between", "under", "over",
  // Conjunctions
  "and", "or", "but", "nor", "so", "yet", "both", "either", "neither",
  // Common verbs (low semantic value)
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "shall", "should", "may", "might",
  "can", "could", "must",
  // Misc
  "not", "no", "if", "then", "else", "when", "where", "how", "why",
  "all", "each", "every", "any", "few", "more", "most", "some", "such",
  "than", "too", "very", "just", "also", "as", "like", "well", "even",
  "only", "own", "same", "here", "there", "again", "once", "because",
  "while", "although", "though", "since", "until", "unless",
]);

// ─── Synonym / Semantic Expansion Map ────────────────────────────────────────
// Maps common query patterns to semantically related terms.
// This enables matching "What is MemoraX?" to chunks about "objective", "purpose", etc.
const SYNONYM_MAP = {
  // Purpose / definition queries
  "purpose": ["objective", "goal", "aim", "mission", "intent", "reason", "motivation"],
  "objective": ["purpose", "goal", "aim", "mission", "target"],
  "goal": ["purpose", "objective", "aim", "target", "mission"],
  "problem": ["issue", "challenge", "difficulty", "concern", "limitation"],
  "solve": ["address", "resolve", "fix", "tackle", "handle", "overcome"],
  "explain": ["describe", "elaborate", "discuss", "clarify", "detail", "overview"],
  "define": ["describe", "explain", "meaning", "definition", "what"],
  "summary": ["overview", "synopsis", "abstract", "brief", "outline", "introduction"],
  "summarize": ["overview", "synopsis", "abstract", "brief", "outline"],
  "introduction": ["overview", "background", "preface", "abstract", "summary", "about"],
  "feature": ["functionality", "capability", "function", "component", "module"],
  "benefit": ["advantage", "strength", "value", "merit", "gain"],
  "limitation": ["weakness", "drawback", "constraint", "restriction", "shortcoming"],
  "architecture": ["design", "structure", "framework", "system", "infrastructure"],
  "methodology": ["approach", "method", "technique", "strategy", "process"],
  "result": ["outcome", "finding", "output", "conclusion", "effect"],
  "conclusion": ["summary", "result", "finding", "takeaway", "outcome"],
  "technology": ["tool", "framework", "platform", "stack", "library"],
  "user": ["student", "learner", "reader", "person", "individual"],
  "app": ["application", "system", "platform", "tool", "software", "project"],
  "application": ["app", "system", "platform", "tool", "software", "project"],
  "project": ["app", "application", "system", "platform", "work"],
  "system": ["app", "application", "platform", "tool", "software", "project"],
  "build": ["develop", "create", "construct", "implement", "make"],
  "built": ["developed", "created", "constructed", "implemented", "made"],
  "work": ["function", "operate", "perform", "run", "execute"],
  "use": ["utilize", "employ", "apply", "leverage"],
  "important": ["significant", "key", "critical", "essential", "crucial", "major"],
  "main": ["primary", "key", "principal", "central", "core", "major"],
  "about": ["regarding", "concerning", "related", "overview", "introduction"],
};

// ─── Text Normalization ──────────────────────────────────────────────────────

/**
 * Normalize text for consistent comparison.
 * Lowercases, removes punctuation, collapses whitespace.
 * @param {string} text - Raw text
 * @returns {string} Normalized text
 */
export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")   // Remove punctuation, keep word chars & spaces
    .replace(/\s+/g, " ")       // Collapse whitespace
    .trim();
};

/**
 * Extract meaningful words from text (removes stop words and short words).
 * @param {string} text - Input text
 * @param {number} minLength - Minimum word length (default 2)
 * @returns {string[]} Array of meaningful words
 */
export const extractKeywords = (text, minLength = 2) => {
  const normalized = normalizeText(text);
  return normalized
    .split(/\s+/)
    .filter((w) => w.length >= minLength && !STOP_WORDS.has(w));
};

// ─── Query Expansion ─────────────────────────────────────────────────────────

/**
 * Expand a query with semantically related terms.
 * E.g., "What is the purpose of this app?" → adds ["objective", "goal", "aim", ...]
 * @param {string} query - User's question
 * @returns {{ original: string[], expanded: string[], allTerms: string[] }}
 */
export const expandQuery = (query) => {
  const keywords = extractKeywords(query);
  const expanded = new Set();

  for (const word of keywords) {
    // Check direct synonyms
    if (SYNONYM_MAP[word]) {
      for (const syn of SYNONYM_MAP[word]) {
        expanded.add(syn);
      }
    }

    // Check if this word appears as a synonym value — add its key too
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (synonyms.includes(word) && !keywords.includes(key)) {
        expanded.add(key);
      }
    }
  }

  // Remove any expanded words that are already in the original keywords
  const uniqueExpanded = [...expanded].filter((w) => !keywords.includes(w));

  return {
    original: keywords,
    expanded: uniqueExpanded,
    allTerms: [...keywords, ...uniqueExpanded],
  };
};

// ─── N-Gram Extraction ──────────────────────────────────────────────────────

/**
 * Extract n-grams (phrases) from text.
 * @param {string} text - Input text
 * @param {number} n - N-gram size (2 for bigrams, 3 for trigrams)
 * @returns {string[]} Array of n-gram strings
 */
export const extractNGrams = (text, n = 2) => {
  const words = normalizeText(text).split(/\s+/).filter((w) => w.length > 1);
  const ngrams = [];

  for (let i = 0; i <= words.length - n; i++) {
    ngrams.push(words.slice(i, i + n).join(" "));
  }

  return ngrams;
};

// ─── TF-IDF Scoring ──────────────────────────────────────────────────────────

/**
 * Compute TF-IDF scores for query terms across a corpus of chunks.
 * - TF (Term Frequency): how often a term appears in a chunk
 * - IDF (Inverse Document Frequency): how unique a term is across all chunks
 * @param {string[]} queryTerms - Terms to score
 * @param {Array<{content: string}>} chunks - Document chunks
 * @returns {Map<string, number>} IDF scores per term
 */
export const computeIDF = (queryTerms, chunks) => {
  const idfMap = new Map();
  const totalDocs = chunks.length;

  for (const term of queryTerms) {
    let docCount = 0;
    for (const chunk of chunks) {
      const normalized = normalizeText(chunk.content);
      if (normalized.includes(term)) {
        docCount++;
      }
    }
    // IDF = log(totalDocs / (1 + docCount)) — smoothed to avoid division by zero
    idfMap.set(term, Math.log((totalDocs + 1) / (1 + docCount)) + 1);
  }

  return idfMap;
};

/**
 * Compute TF (term frequency) for a term in a given text.
 * @param {string} term - Search term
 * @param {string} normalizedText - Pre-normalized text
 * @returns {number} Term frequency (count / total words)
 */
export const computeTF = (term, normalizedText) => {
  const words = normalizedText.split(/\s+/);
  const totalWords = words.length;
  if (totalWords === 0) return 0;

  let count = 0;
  // For single-word terms, count word occurrences
  if (!term.includes(" ")) {
    for (const word of words) {
      if (word === term || word.startsWith(term) || term.startsWith(word)) {
        count++;
      }
    }
  } else {
    // For n-gram terms, count substring occurrences
    let idx = normalizedText.indexOf(term);
    while (idx !== -1) {
      count++;
      idx = normalizedText.indexOf(term, idx + 1);
    }
  }

  return count / totalWords;
};

// ─── Chunk Merging ───────────────────────────────────────────────────────────

/**
 * Merge adjacent high-scoring chunks for better context continuity.
 * If chunks at indices [3] and [4] both score high, they get merged
 * into a single larger context block.
 * @param {Array<Object>} scoredChunks - Chunks with scores, sorted by score
 * @param {Array<Object>} allChunks - All chunks from the document
 * @param {number} maxMergedChunks - Maximum chunks after merging
 * @returns {Array<Object>} Merged chunks
 */
export const mergeAdjacentChunks = (scoredChunks, allChunks, maxMergedChunks = 5) => {
  if (scoredChunks.length <= 1) return scoredChunks;

  // Sort by chunk index for adjacency detection
  const sorted = [...scoredChunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
  const merged = [];
  let current = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];

    // If chunks are adjacent or within 1 index of each other, merge them
    if (next.chunkIndex - current.chunkIndex <= 2) {
      // Fill in any gap chunk between them
      if (next.chunkIndex - current.chunkIndex === 2) {
        const gapIndex = current.chunkIndex + 1;
        const gapChunk = allChunks.find((c) => c.chunkIndex === gapIndex);
        if (gapChunk) {
          current.content += "\n\n" + gapChunk.content;
        }
      }
      current.content += "\n\n" + next.content;
      current.score = Math.max(current.score, next.score);
      current.mergedIndices = [
        ...(current.mergedIndices || [current.chunkIndex]),
        next.chunkIndex,
      ];
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);

  // Re-sort by score and limit
  return merged.sort((a, b) => b.score - a.score).slice(0, maxMergedChunks);
};

// ─── Heading Detection ───────────────────────────────────────────────────────

/**
 * Detect if a line looks like a heading/title.
 * Heuristics: short line, possibly numbered, ALL CAPS, or ends with colon.
 * @param {string} line - A single line of text
 * @returns {boolean}
 */
export const isLikelyHeading = (line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 100) return false;

  // ALL CAPS lines (likely headings in PDFs) — must be short (under 80 chars, under 10 words)
  const wordCount = trimmed.split(/\s+/).length;
  if (trimmed.length > 3 && trimmed.length < 80 && wordCount <= 8 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
    return true;
  }

  // "Chapter 1", "Section 2.3", "Part III" — structural headings
  if (/^(chapter|section|part|module|unit)\s+\w/i.test(trimmed) && trimmed.length < 60) return true;

  // Numbered headings like "1. Introduction", "2.3 Methodology" — but NOT list items
  // Require: short length (< 50 chars) to avoid matching long list items like "4. Provides an AI..."
  if (/^(\d+\.?\d*\.?\d*)\s+/.test(trimmed) && trimmed.length < 50 && wordCount <= 6) return true;

  // Lines ending with colon that are short (likely label headings)
  if (trimmed.endsWith(":") && trimmed.length < 50 && wordCount <= 6) return true;

  // Roman numeral headings (short only)
  if (/^(I{1,3}|IV|V|VI{0,3}|IX|X)\.\s+/i.test(trimmed) && trimmed.length < 50) return true;

  return false;
};
