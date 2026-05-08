import express from "express";
import {
  detectSyllabusDocs,
  generatePlanner,
  getPlanners,
  getPlannerById,
  plannerChat,
  toggleWeekComplete,
  deletePlanner,
} from "../controllers/studyPlannerController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/detect-syllabus", detectSyllabusDocs);
router.post("/generate", generatePlanner);
router.get("/", getPlanners);
router.get("/:id", getPlannerById);
router.post("/:id/chat", plannerChat);
router.patch("/:id/toggle/:weekIndex", toggleWeekComplete);
router.delete("/:id", deletePlanner);

export default router;
