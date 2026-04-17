import express from "express";
import protect from "../middleware/auth.js";
import {
  getNotifications,
  getAllNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationSettings,
  updateNotificationSettings,
} from "../controllers/notificationController.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/", getNotifications);
router.get("/all", getAllNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.get("/settings", getNotificationSettings);
router.patch("/settings", updateNotificationSettings);

export default router;
