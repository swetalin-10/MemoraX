import { generateAIResponse } from "./ai/aiRouter.js";
import { AI_TASK } from "./ai/aiModels.js";
import { optimizeTextTokens } from "./ai/aiLimiter.js";
import { parseAIJSON } from "./ai/aiResponseFormatter.js";

// ─── Mode-specific prompt instructions ───────────────────────────────────────

const MODE_PROMPTS = {
  exam_revision: `You are creating EXAM REVISION notes. Focus on:
- Important concepts and their definitions
- Key formulas and equations
- Theory-based questions and answers
- Revision bullet points
- Frequently tested topics
- Mnemonics and memory aids
Prioritize content that is likely to appear in exams.`,

  interview_prep: `You are creating INTERVIEW PREPARATION notes. Focus on:
- Concise explanations of core concepts
- Comparisons between similar concepts (tables/vs format)
- Commonly asked interview questions and ideal answers
- Common interview traps and misconceptions
- Practical examples and real-world applications
Prioritize clarity and confidence-building content.`,

  beginner_friendly: `You are creating BEGINNER-FRIENDLY study notes. Focus on:
- Simplified explanations using plain language
- Real-world analogies and examples
- Step-by-step breakdowns of complex topics
- Visual/structured explanations
- "Why it matters" context for each concept
Avoid jargon. Make every concept accessible to someone new to the topic.`,

  one_page: `You are creating ULTRA-COMPRESSED one-page revision notes. Focus on:
- Maximum information density
- Only the most critical points
- Abbreviated, telegram-style bullets
- Key formulas and definitions only
- No explanations — pure facts
This must fit conceptually on a single page. Be ruthlessly concise.`,

  visual_learning: `You are creating VISUALLY STRUCTURED study notes. Focus on:
- Categorized sections with clear hierarchy
- Comparison tables
- Structured breakdowns (cause→effect, input→output)
- Classification trees and groupings
- Step-by-step processes
- Pattern-based organization
Prioritize structure and categorization over prose.`,
};

// ─── Compression level modifiers ─────────────────────────────────────────────

const COMPRESSION_PROMPTS = {
  standard: `Compression level: STANDARD (~60% compression).
Keep important details. Remove filler, redundancy, and verbose explanations.
Aim for clear, concise bullet points.`,

  aggressive: `Compression level: AGGRESSIVE (~75% compression).
Keep only essential concepts, definitions, and formulas.
Remove all examples unless critical. Use abbreviated language.
Each point should be 1-2 lines maximum.`,

  ultra: `Compression level: ULTRA (~90% compression).
Keep ONLY the most critical facts, formulas, and definitions.
Use telegram-style brevity. No explanations.
Each point should be a single short line.
This is last-minute-before-exam material.`,
};

// ─── Stage 1: Extract key information from each chunk ────────────────────────

const extractFromChunk = async (chunkContent, mode, compressionLevel, chunkIndex) => {
  const prompt = `${MODE_PROMPTS[mode]}

${COMPRESSION_PROMPTS[compressionLevel]}

Extract the most important study-worthy information from the following text chunk.
Return a JSON object with this exact structure (omit empty arrays):

{
  "keyPoints": ["point1", "point2"],
  "definitions": [{"term": "...", "definition": "..."}],
  "formulas": [{"name": "...", "formula": "...", "description": "..."}],
  "importantFacts": ["fact1", "fact2"],
  "commonMistakes": ["mistake1"],
  "heading": "inferred section topic"
}

IMPORTANT:
- Return ONLY valid JSON, no markdown fences, no explanation text.
- If a category has no relevant content, use an empty array [].
- Be precise and factual — do NOT hallucinate information not in the text.

Text chunk:
${optimizeTextTokens(chunkContent)}`;

  try {
    const result = await generateAIResponse({
      taskType: AI_TASK.CHEATSHEET_EXTRACT,
      prompt,
    });

    const parsed = parseAIJSON(result.text);
    if (!parsed) throw new Error("Failed to parse extracted JSON");

    return {
      ...parsed,
      chunkIndex,
    };
  } catch (error) {
    console.error(`[CheatSheet] Failed to extract from chunk ${chunkIndex}:`, error.message);
    // Return empty extract on failure — don't break the pipeline
    return {
      keyPoints: [],
      definitions: [],
      formulas: [],
      importantFacts: [],
      commonMistakes: [],
      heading: "",
      chunkIndex,
    };
  }
};

// ─── Stage 2+3: Merge extracts and produce final structured output ───────────

const mergeAndStructure = async (chunkExtracts, mode, compressionLevel, documentTitle) => {
  // Combine all chunk extracts into a single payload for the merge step
  const allKeyPoints = chunkExtracts.flatMap((e) => e.keyPoints || []);
  const allDefinitions = chunkExtracts.flatMap((e) => e.definitions || []);
  const allFormulas = chunkExtracts.flatMap((e) => e.formulas || []);
  const allFacts = chunkExtracts.flatMap((e) => e.importantFacts || []);
  const allMistakes = chunkExtracts.flatMap((e) => e.commonMistakes || []);
  const headings = chunkExtracts.map((e) => e.heading).filter(Boolean);

  const extractSummary = JSON.stringify(
    {
      documentTitle,
      sectionHeadings: headings,
      keyPoints: allKeyPoints,
      definitions: allDefinitions,
      formulas: allFormulas,
      importantFacts: allFacts,
      commonMistakes: allMistakes,
    },
    null,
    0
  );

  const prompt = `${MODE_PROMPTS[mode]}

${COMPRESSION_PROMPTS[compressionLevel]}

You are given extracted study material from a document titled "${documentTitle}".
Your job is to merge, deduplicate, organize, and compress this into a final structured cheat sheet.

RULES:
1. Remove duplicate or near-duplicate points.
2. Group related points into logical sections.
3. Create clear section headings.
4. Ensure definitions are unique (no duplicate terms).
5. Preserve all formulas exactly.
6. Add memory tips and exam focus points based on the content.
7. Write a brief 1-2 sentence overview of the document.
8. Return ONLY valid JSON — no markdown fences, no explanation.

Return this exact JSON structure:
{
  "title": "cheat sheet title (short, descriptive)",
  "overview": "1-2 sentence overview",
  "sections": [
    {
      "heading": "Section Name",
      "points": ["concise point 1", "concise point 2"]
    }
  ],
  "definitions": [
    {"term": "Term", "definition": "Clear definition"}
  ],
  "formulas": [
    {"name": "Formula Name", "formula": "the formula", "description": "when to use it"}
  ],
  "quickFacts": ["rapid-fire fact 1", "fact 2"],
  "commonMistakes": ["mistake to avoid 1"],
  "examFocus": ["high-priority exam topic 1"],
  "memoryTips": ["mnemonic or memory trick 1"]
}

Extracted material:
${optimizeTextTokens(extractSummary).substring(0, 28000)}`;

  const result = await generateAIResponse({
    taskType: AI_TASK.CHEATSHEET_MERGE,
    prompt,
  });

  const parsed = parseAIJSON(result.text);
  if (!parsed) throw new Error("Failed to parse merged JSON");
  return parsed;
};

// ─── Validate output structure ───────────────────────────────────────────────

const validateOutput = (output) => {
  if (!output || typeof output !== "object") {
    throw new Error("Invalid cheat sheet output: not an object");
  }

  // Ensure required fields exist with defaults
  return {
    title: output.title || "Cheat Sheet",
    overview: output.overview || "",
    sections: Array.isArray(output.sections)
      ? output.sections.map((s) => ({
          heading: s.heading || "Section",
          points: Array.isArray(s.points) ? s.points.filter((p) => typeof p === "string") : [],
        }))
      : [],
    definitions: Array.isArray(output.definitions)
      ? output.definitions
          .filter((d) => d.term && d.definition)
          .map((d) => ({ term: d.term, definition: d.definition }))
      : [],
    formulas: Array.isArray(output.formulas)
      ? output.formulas
          .filter((f) => f.name || f.formula)
          .map((f) => ({
            name: f.name || "",
            formula: f.formula || "",
            description: f.description || "",
          }))
      : [],
    quickFacts: Array.isArray(output.quickFacts)
      ? output.quickFacts.filter((f) => typeof f === "string")
      : [],
    commonMistakes: Array.isArray(output.commonMistakes)
      ? output.commonMistakes.filter((m) => typeof m === "string")
      : [],
    examFocus: Array.isArray(output.examFocus)
      ? output.examFocus.filter((e) => typeof e === "string")
      : [],
    memoryTips: Array.isArray(output.memoryTips)
      ? output.memoryTips.filter((t) => typeof t === "string")
      : [],
  };
};

// ─── Calculate metadata ──────────────────────────────────────────────────────

const calculateMetadata = (content, chunkCount) => {
  // Count total words across all text fields
  let totalWords = 0;

  const countWords = (text) => {
    if (typeof text === "string") {
      totalWords += text.split(/\s+/).filter(Boolean).length;
    }
  };

  countWords(content.title);
  countWords(content.overview);
  content.sections?.forEach((s) => {
    countWords(s.heading);
    s.points?.forEach(countWords);
  });
  content.definitions?.forEach((d) => {
    countWords(d.term);
    countWords(d.definition);
  });
  content.formulas?.forEach((f) => {
    countWords(f.name);
    countWords(f.formula);
    countWords(f.description);
  });
  content.quickFacts?.forEach(countWords);
  content.commonMistakes?.forEach(countWords);
  content.examFocus?.forEach(countWords);
  content.memoryTips?.forEach(countWords);

  return {
    wordCount: totalWords,
    readingTimeMinutes: Math.max(1, Math.ceil(totalWords / 200)),
    chunkCount,
  };
};

// ─── Main generation function ────────────────────────────────────────────────

/**
 * Generate a structured cheat sheet from document chunks.
 *
 * @param {Array<{content: string, chunkIndex: number, heading: string}>} chunks
 * @param {string} mode - One of the 5 mode keys
 * @param {string} compressionLevel - standard | aggressive | ultra
 * @param {string} documentTitle - Title of the source document
 * @returns {Promise<{generatedContent: Object, metadata: Object, sourceChunks: Array}>}
 */
export const generateCheatSheet = async (chunks, mode, compressionLevel, documentTitle) => {
  if (!chunks || chunks.length === 0) {
    throw new Error("No content chunks provided for cheat sheet generation");
  }

  // Safely limit chunks to prevent quota exhaustion
  const MAX_CHUNKS = 3;
  const processedChunks = chunks.slice(0, MAX_CHUNKS);

  if (chunks.length > MAX_CHUNKS) {
    console.warn(`[CheatSheet] Truncated document chunks from ${chunks.length} to ${MAX_CHUNKS} for quota safety.`);
  }

  console.log(
    `[CheatSheet] Generating: mode=${mode}, compression=${compressionLevel}, chunks=${processedChunks.length}`
  );

  // Stage 1: Extract from each chunk (batched, 3 at a time)
  const BATCH_SIZE = 3;
  const chunkExtracts = [];

  for (let i = 0; i < processedChunks.length; i += BATCH_SIZE) {
    const batch = processedChunks.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((chunk) =>
        extractFromChunk(chunk.content, mode, compressionLevel, chunk.chunkIndex)
      )
    );
    chunkExtracts.push(...results);
  }

  console.log(`[CheatSheet] Stage 1 complete: ${chunkExtracts.length} chunk extracts`);

  // Stage 2+3: Merge and produce final structure
  const rawOutput = await mergeAndStructure(chunkExtracts, mode, compressionLevel, documentTitle);

  console.log("[CheatSheet] Stage 2+3 complete: merge & structure done");

  // Validate and clean
  const generatedContent = validateOutput(rawOutput);

  // Calculate metadata based on processed chunks
  const metadata = calculateMetadata(generatedContent, processedChunks.length);

  // Build source chunk references
  const sourceChunks = processedChunks.map((c) => ({
    chunkIndex: c.chunkIndex,
    heading: c.heading || "",
  }));

  return { generatedContent, metadata, sourceChunks };
};

// ─── Single section regeneration ─────────────────────────────────────────────

/**
 * Regenerate a single section of a cheat sheet.
 *
 * @param {Array<{content: string}>} chunks - Original document chunks
 * @param {string} sectionHeading - The heading of the section to regenerate
 * @param {string} mode - Cheat sheet mode
 * @param {string} compressionLevel - Compression level
 * @returns {Promise<{heading: string, points: string[]}>}
 */
export const regenerateSection = async (chunks, sectionHeading, mode, compressionLevel) => {
  const context = chunks.map((c) => c.content).join("\n\n").substring(0, 20000);

  const prompt = `${MODE_PROMPTS[mode]}

${COMPRESSION_PROMPTS[compressionLevel]}

Regenerate the following section of a cheat sheet based on the document content below.
Section to regenerate: "${sectionHeading}"

Return ONLY valid JSON with this structure:
{
  "heading": "${sectionHeading}",
  "points": ["point 1", "point 2", "point 3"]
}

IMPORTANT: Return ONLY the JSON, no markdown fences, no explanation.

Document content:
${optimizeTextTokens(context)}`;

  const result = await generateAIResponse({
    taskType: AI_TASK.CHEATSHEET_REGEN,
    prompt,
  });

  const parsed = parseAIJSON(result.text) || {};

  return {
    heading: parsed.heading || sectionHeading,
    points: Array.isArray(parsed.points)
      ? parsed.points.filter((p) => typeof p === "string")
      : [],
  };
};
