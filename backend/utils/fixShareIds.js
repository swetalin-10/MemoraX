import mongoose from "mongoose";
import crypto from "crypto";
import Post from "../models/postModel.js";
import dotenv from "dotenv";

dotenv.config();

const generateShareId = () => crypto.randomBytes(6).toString("base64url").slice(0, 8);

const fixOldPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const posts = await Post.find({
      $or: [
        { shareId: { $exists: false } },
        { shareId: null },
        { shareId: "" },
      ],
    });

    console.log(`Found ${posts.length} posts without shareId`);

    if (posts.length === 0) {
      console.log("Nothing to fix — all posts already have shareId");
      process.exit(0);
    }

    let updated = 0;
    for (const post of posts) {
      post.shareId = generateShareId();
      await post.save();
      updated++;
    }

    console.log(`✅ Updated ${updated} posts with new shareId`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
};

fixOldPosts();
