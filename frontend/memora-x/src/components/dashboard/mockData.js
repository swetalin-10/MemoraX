export const chartTheme = {
  colors: {
    cardBackground: "#171717",
    cardSurface: "#262626",
    grid: "rgba(163, 163, 163, 0.14)",
    axisText: "#a3a3a3",
    tooltipBackground: "#1f1f1f",
    tooltipBorder: "#404040",
    tooltipText: "#fafafa",
    primary: "#3D5EE5",
    secondary: "#2F4ED8",
    tertiary: "#8B5CF6",
    success: "#22c55e",
    warning: "#f59e0b",
    muted: "#64748b",
    danger: "#ef4444",
  },
  tooltipStyle: {
    backgroundColor: "#1f1f1f",
    border: "1px solid #404040",
    borderRadius: "8px",
    color: "#fafafa",
    fontSize: "12px",
    padding: "8px 10px",
  },
};

export const activityData = [
  { date: "Mar 12", uploads: 1, flashcards: 8, quizzes: 1 },
  { date: "Mar 13", uploads: 0, flashcards: 5, quizzes: 0 },
  { date: "Mar 14", uploads: 2, flashcards: 12, quizzes: 2 },
  { date: "Mar 15", uploads: 1, flashcards: 10, quizzes: 1 },
  { date: "Mar 16", uploads: 0, flashcards: 3, quizzes: 0 },
  { date: "Mar 17", uploads: 2, flashcards: 14, quizzes: 2 },
  { date: "Mar 18", uploads: 1, flashcards: 11, quizzes: 1 },
  { date: "Mar 19", uploads: 3, flashcards: 16, quizzes: 2 },
  { date: "Mar 20", uploads: 2, flashcards: 13, quizzes: 1 },
  { date: "Mar 21", uploads: 1, flashcards: 9, quizzes: 1 },
  { date: "Mar 22", uploads: 0, flashcards: 4, quizzes: 0 },
  { date: "Mar 23", uploads: 1, flashcards: 7, quizzes: 1 },
  { date: "Mar 24", uploads: 2, flashcards: 15, quizzes: 2 },
  { date: "Mar 25", uploads: 1, flashcards: 12, quizzes: 1 },
  { date: "Mar 26", uploads: 0, flashcards: 6, quizzes: 0 },
  { date: "Mar 27", uploads: 3, flashcards: 18, quizzes: 3 },
  { date: "Mar 28", uploads: 2, flashcards: 14, quizzes: 2 },
  { date: "Mar 29", uploads: 1, flashcards: 9, quizzes: 1 },
  { date: "Mar 30", uploads: 2, flashcards: 13, quizzes: 2 },
  { date: "Mar 31", uploads: 0, flashcards: 5, quizzes: 0 },
  { date: "Apr 01", uploads: 1, flashcards: 11, quizzes: 1 },
  { date: "Apr 02", uploads: 2, flashcards: 15, quizzes: 2 },
  { date: "Apr 03", uploads: 1, flashcards: 10, quizzes: 1 },
  { date: "Apr 04", uploads: 3, flashcards: 17, quizzes: 3 },
  { date: "Apr 05", uploads: 1, flashcards: 8, quizzes: 1 },
  { date: "Apr 06", uploads: 0, flashcards: 4, quizzes: 0 },
  { date: "Apr 07", uploads: 2, flashcards: 16, quizzes: 2 },
  { date: "Apr 08", uploads: 2, flashcards: 14, quizzes: 2 },
  { date: "Apr 09", uploads: 1, flashcards: 12, quizzes: 2 },
  { date: "Apr 10", uploads: 3, flashcards: 19, quizzes: 3 },
];

export const quizData = [
  { attempt: "Quiz 1", score: 48, subject: "Biology" },
  { attempt: "Quiz 2", score: 56, subject: "History" },
  { attempt: "Quiz 3", score: 61, subject: "Math" },
  { attempt: "Quiz 4", score: 59, subject: "Chemistry" },
  { attempt: "Quiz 5", score: 68, subject: "Physics" },
  { attempt: "Quiz 6", score: 73, subject: "Biology" },
  { attempt: "Quiz 7", score: 79, subject: "History" },
  { attempt: "Quiz 8", score: 84, subject: "Math" },
  { attempt: "Quiz 9", score: 88, subject: "Economics" },
  { attempt: "Quiz 10", score: 92, subject: "Literature" },
];

export const flashcardData = [
  { name: "Mastered", value: 54 },
  { name: "Learning", value: 38 },
  { name: "Not Started", value: 28 },
];

export const weeklyData = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 0 },
  { day: "Wed", sessions: 3 },
  { day: "Thu", sessions: 1 },
  { day: "Fri", sessions: 0 },
  { day: "Sat", sessions: 4 },
  { day: "Sun", sessions: 2 },
];

export const featureUsageData = [
  { feature: "Documents", count: 42 },
  { feature: "Flashcards", count: 88 },
  { feature: "Quizzes", count: 27 },
];

export const summaryStats = {
  totalDocuments: 34,
  totalFlashcards: 120,
  totalQuizzes: 16,
  averageScore: 74.3,
};