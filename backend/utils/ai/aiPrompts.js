/**
 * Centralized AI Prompts
 * 
 * Shared prompt templates for various tasks.
 */

export const PROMPTS = {
  // ─── FLASHCARDS ─────────────────────────────────────────────────────────────
  FLASHCARDS: (count) => `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium or hard]

Separate each flashcard with "---"

Text:
`,

  // ─── QUIZZES ────────────────────────────────────────────────────────────────
  QUIZZES: (count) => `Generate exactly ${count} multiple choice questions from the following text.
Format each question as:
Q: [Question]
Q1: [Option 1]
Q2: [Option 2]
Q3: [Option 3]
Q4: [Option 4]
C: [Correct option - exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium or hard]

Separate each question with "---"

Text:
`,

  // ─── SUMMARY ────────────────────────────────────────────────────────────────
  SUMMARY: `Provide a concise summary of the following text, highlighting key concepts, main ideas and important points.
Keep the summary clear and structured.

Text:
`,

  // ─── STUDY PLANNER ──────────────────────────────────────────────────────────
  STUDY_PLANNER: (docTitle) => `You are an expert academic study planner. Analyze the following syllabus/document content and generate a comprehensive, structured study roadmap.

DOCUMENT TITLE: "${docTitle}"

DOCUMENT CONTENT:
`,
  STUDY_PLANNER_INSTRUCTIONS: `
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
- Vary priorities across weeks.`
};
