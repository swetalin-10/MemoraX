import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

/**
 * Settings key mapping: notification type → user setting key
 */
const SETTING_MAP = {
  like_post: "likes",
  comment_post: "comments",
  repost_post: "reposts",
  streak_reminder: "streaks",
  system: "system",
  new_follower: "system",
};

/**
 * Create a notification (fire-and-forget).
 *
 * @param {Object} opts
 * @param {string} opts.recipientId  - User who receives the notification
 * @param {string} opts.triggerUserId - User who caused the action
 * @param {string} opts.type         - One of the notification type enums
 * @param {string} opts.message      - Human-readable notification text
 * @param {string} [opts.postId]     - Related post ID (optional)
 */
export const createNotification = async ({
  recipientId,
  triggerUserId,
  type,
  message,
  postId = null,
}) => {
  try {
    // Don't notify yourself
    if (recipientId.toString() === triggerUserId.toString()) return;

    // Check recipient's notification settings
    const recipient = await User.findById(recipientId).select(
      "notificationSettings"
    );
    if (!recipient) return;

    const settingKey = SETTING_MAP[type];
    const settings = recipient.notificationSettings || {};

    // If the user has explicitly disabled this notification type, skip
    if (settingKey && settings[settingKey] === false) return;

    await Notification.create({
      user: recipientId,
      type,
      message,
      post: postId,
      triggeredBy: triggerUserId,
    });
  } catch (err) {
    // Silently fail — notifications must never break the main flow
    console.error("Notification creation failed:", err.message);
  }
};
