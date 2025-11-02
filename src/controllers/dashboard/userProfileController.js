import Booking from "../../models/hallBooking.js";
import Payment from "../../models/hallPayment.js";
import Notification from "../../models/userNotification.js";

// Get all bookings for logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("hallId", "name location")
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings" });
  }
};

// Get all payments for logged-in user
export const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate({ path: "bookingId", populate: { path: "hallId", select: "name" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

// Get all notifications for logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// Profile aggregator: bookings + payments + notifications
export const getProfileSummary = async (req, res) => {
  try {
    const [bookings, payments, notifications] = await Promise.all([
      Booking.find({ userId: req.user._id })
        .populate("hallId", "name location")
        .sort({ createdAt: -1 }),
      Payment.find({ userId: req.user._id })
        .populate({ path: "bookingId", populate: { path: "hallId", select: "name" } })
        .sort({ createdAt: -1 }),
      Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50),
    ]);

    res.json({ success: true, bookings, payments, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch profile summary" });
  }
};
