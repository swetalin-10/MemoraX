import mongoose from "mongoose";

const studyPlannerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a planner title"],
      trim: true,
    },
    overview: {
      type: String,
      default: "",
    },
    estimatedDuration: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "mixed"],
      default: "mixed",
    },
    studyPlan: [
      {
        week: {
          type: String,
          required: true,
        },
        topics: {
          type: [String],
          default: [],
        },
        goals: {
          type: [String],
          default: [],
        },
        revision: {
          type: String,
          default: "",
        },
        estimatedHours: {
          type: Number,
          default: 0,
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    tips: {
      type: [String],
      default: [],
    },
    chatHistory: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["generating", "ready", "failed"],
      default: "generating",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
studyPlannerSchema.index({ userId: 1, sourceDocumentId: 1 });

const StudyPlanner = mongoose.model("StudyPlanner", studyPlannerSchema);

export default StudyPlanner;
