import express from "express";
import protect from "../middleware/auth.js";
import upload from "../config/multer.js";
import {
  createPost,
  getAllPosts,
  likePost,
  createComment,
  getPostComments,
  repostPost,
  updatePost,
  deletePost,
  updateComment,
  deleteComment,
  getSharedPost,
} from "../controllers/communityController.js";

const router = express.Router();

// Public route — no auth required
router.get("/post/share/:shareId", getSharedPost);

// Apply auth middleware to all routes below
router.use(protect);

router.post(
  "/post",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createPost
);
router.get("/posts", getAllPosts);

router.put("/post/:id/like", likePost);

router.post("/post/:id/comment", createComment);
router.get("/post/:id/comments", getPostComments);

router.post("/post/:id/repost", repostPost);

// Edit and Delete routes
router.put("/post/:id", updatePost);
router.delete("/post/:id", deletePost);

router.put("/comment/:id", updateComment);
router.delete("/comment/:id", deleteComment);

export default router;
