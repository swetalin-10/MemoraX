import mongoose from "mongoose";

const cheatSheetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: [
        "exam_revision",
        "interview_prep",
        "beginner_friendly",
        "one_page",
        "visual_learning",
      ],
      required: true,
    },
    compressionLevel: {
      type: String,
      enum: ["standard", "aggressive", "ultra"],
      default: "standard",
    },
    generatedContent: {
      title: { type: String, default: "" },
      overview: { type: String, default: "" },
      sections: [
        {
          heading: { type: String, default: "" },
          points: [{ type: String }],
        },
      ],
      definitions: [
        {
          term: { type: String, default: "" },
          definition: { type: String, default: "" },
        },
      ],
      formulas: [
        {
          name: { type: String, default: "" },
          formula: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      quickFacts: [{ type: String }],
      commonMistakes: [{ type: String }],
      examFocus: [{ type: String }],
      memoryTips: [{ type: String }],
    },
    metadata: {
      wordCount: { type: Number, default: 0 },
      readingTimeMinutes: { type: Number, default: 1 },
      chunkCount: { type: Number, default: 0 },
      model: { type: String, default: "gemini-2.5-flash-lite" },
    },
    sourceChunks: [
      {
        chunkIndex: { type: Number },
        heading: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup by user + document
cheatSheetSchema.index({ user: 1, document: 1 });

const CheatSheet = mongoose.model("CheatSheet", cheatSheetSchema);

export default CheatSheet;
