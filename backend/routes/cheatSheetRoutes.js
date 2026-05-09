import express from "express";
import {
  generateCheatSheetHandler,
  getCheatSheetsForDocument,
  getCheatSheetById,
  deleteCheatSheet,
  regenerateSectionHandler,
} from "../controllers/cheatSheetController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.post("/generate/:documentId", generateCheatSheetHandler);
router.get("/document/:documentId", getCheatSheetsForDocument);
router.get("/:id", getCheatSheetById);
router.delete("/:id", deleteCheatSheet);
router.patch("/:id/regenerate-section", regenerateSectionHandler);

export default router;
