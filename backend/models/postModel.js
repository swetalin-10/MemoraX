import mongoose from "mongoose";
import crypto from "crypto";

// Generate a short unique ID (8 chars, URL-safe)
const generateShareId = () => crypto.randomBytes(6).toString("base64url").slice(0, 8);

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shareId: {
      type: String,
      unique: true,
      default: generateShareId,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, "Post content cannot exceed 2000 characters"],
    },
    image: {
      type: String,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    reposts: {
      type: Number,
      default: 0,
    },
    repostedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    file: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
