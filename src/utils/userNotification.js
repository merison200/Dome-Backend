import Notification from '../models/userNotification.js';

/**
 * Create a notification for a user
 * @param {ObjectId} userId - The ID of the user
 * @param {String} title - Short title for the notification
 * @param {String} message - Detailed message for the notification
 * @param {String} type - Notification type (info, success, warning, error)
 * @param {Object} options - Optional related data
 */
export const createNotification = async (
  userId,
  title,
  message,
  type = "info",
  options = {}
) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      relatedBooking: options.relatedBooking || null,
      relatedPayment: options.relatedPayment || null,
      relatedChat: options.relatedChat || null,
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
  }
};
