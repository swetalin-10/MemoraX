import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

// @desc    Get recent notifications (latest 20)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("triggeredBy", "username profileImage")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notifications (paginated, limit 50)
// @route   GET /api/notifications/all
// @access  Private
export const getAllNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user.id })
        .populate("triggeredBy", "username profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: "Notification marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
export const getNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("notificationSettings");

    res.status(200).json({
      success: true,
      data: user.notificationSettings || {
        likes: true,
        comments: true,
        reposts: true,
        streaks: true,
        system: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PATCH /api/notifications/settings
// @access  Private
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const allowedKeys = ["likes", "comments", "reposts", "streaks", "system"];
    const updates = {};

    for (const key of allowedKeys) {
      if (typeof req.body[key] === "boolean") {
        updates[`notificationSettings.${key}`] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid settings provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select("notificationSettings");

    res.status(200).json({
      success: true,
      data: user.notificationSettings,
      message: "Notification settings updated",
    });
  } catch (error) {
    next(error);
  }
};
