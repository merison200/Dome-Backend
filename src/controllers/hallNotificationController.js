import Booking from '../models/hallBooking.js';
import Payment from '../models/hallPayment.js';

// Get admin notifications - only essential items
export const getNotifications = async (req, res) => {
  try {
    const notifications = [];
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));

    // 1. New bookings waiting for confirmation
    const pendingBookings = await Booking.find({
      status: 'pending',
      bookingType: 'online'
    })
    .populate('hallId', 'name')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    pendingBookings.forEach(booking => {
      const hoursAgo = Math.floor((now - booking.createdAt) / (1000 * 60 * 60));
      notifications.push({
        id: `booking_${booking._id}`,
        type: 'pending_booking',
        title: 'New Booking Awaiting Confirmation',
        message: `${booking.customerName} booked ${booking.hallId.name}`,
        details: {
          bookingId: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          hallName: booking.hallId.name,
          eventDate: booking.eventDates[0],
          amount: booking.totalAmount,
          hoursAgo
        },
        createdAt: booking.createdAt,
        priority: hoursAgo > 24 ? 'urgent' : 'high',
        actionRequired: true
      });
    });

    // 2. Transfer payment proofs needing verification
    const pendingTransfers = await Payment.find({
      method: 'transfer',
      status: 'processing',
      'transferDetails.verificationStatus': 'pending'
    })
    .populate({
      path: 'bookingId',
      populate: { path: 'hallId', select: 'name' }
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    pendingTransfers.forEach(payment => {
      notifications.push({
        id: `payment_${payment._id}`,
        type: 'transfer_verification',
        title: 'Payment Proof Needs Verification',
        message: `${payment.userId.name} uploaded payment proof`,
        details: {
          paymentId: payment._id,
          bookingId: payment.bookingId._id,
          customerName: payment.userId.name,
          customerEmail: payment.userId.email,
          hallName: payment.bookingId.hallId.name,
          amount: payment.amount,
          transferProof: payment.transferDetails.transferProof,
          accountName: payment.transferDetails.accountName,
          bankName: payment.transferDetails.bankName
        },
        createdAt: payment.createdAt,
        priority: 'high',
        actionRequired: true
      });
    });

    // 3. Payment failures in last 24 hours
    const failedPayments = await Payment.find({
      status: 'failed',
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    })
    .populate({
      path: 'bookingId',
      populate: { path: 'hallId', select: 'name' }
    })
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(5);

    failedPayments.forEach(payment => {
      notifications.push({
        id: `failed_payment_${payment._id}`,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: `Payment failed for ${payment.userId.name}`,
        details: {
          paymentId: payment._id,
          bookingId: payment.bookingId._id,
          customerName: payment.userId.name,
          customerEmail: payment.userId.email,
          customerPhone: payment.userId.phone,
          hallName: payment.bookingId.hallId.name,
          amount: payment.amount,
          method: payment.method,
          gatewayMessage: payment.gatewayResponse?.gatewayMessage
        },
        createdAt: payment.createdAt,
        priority: 'high',
        actionRequired: true
      });
    });

    // 4. Completed payments today
    const todayCompletedPayments = await Payment.find({
      status: 'completed',
      createdAt: { $gte: today }
    })
    .populate({
      path: 'bookingId',
      populate: { path: 'hallId', select: 'name' }
    })
    .populate('userId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    todayCompletedPayments.forEach(payment => {
      notifications.push({
        id: `completed_payment_${payment._id}`,
        type: 'payment_completed',
        title: 'Payment Completed',
        message: `${payment.userId.name} paid for ${payment.bookingId.hallId.name}`,
        details: {
          paymentId: payment._id,
          bookingId: payment.bookingId._id,
          customerName: payment.userId.name,
          hallName: payment.bookingId.hallId.name,
          amount: payment.amount,
          method: payment.method
        },
        createdAt: payment.createdAt,
        priority: 'low',
        actionRequired: false
      });
    });

    // Sort by priority and creation time
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    notifications.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Generate summary
    const summary = {
      total: notifications.length,
      actionRequired: notifications.filter(n => n.actionRequired).length,
      urgent: notifications.filter(n => n.priority === 'urgent').length,
      high: notifications.filter(n => n.priority === 'high').length,
      byType: {
        pendingBookings: notifications.filter(n => n.type === 'pending_booking').length,
        pendingTransfers: notifications.filter(n => n.type === 'transfer_verification').length,
        failedPayments: notifications.filter(n => n.type === 'payment_failed').length,
        completedPayments: notifications.filter(n => n.type === 'payment_completed').length
      }
    };

    res.json({
      success: true,
      data: {
        notifications: notifications.slice(0, 20),
        summary,
        lastUpdated: new Date()
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load notifications',
      error: error.message
    });
  }
};

// Get notification counts - only actionable items
export const getNotificationCounts = async (req, res) => {
  try {
    const now = new Date();

    // Count critical items needing immediate action
    const pendingBookingsCount = await Booking.countDocuments({
      status: 'pending',
      bookingType: 'online'
    });

    const pendingTransfersCount = await Payment.countDocuments({
      method: 'transfer',
      status: 'processing',
      'transferDetails.verificationStatus': 'pending'
    });

    const failedPaymentsCount = await Payment.countDocuments({
      status: 'failed',
      createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    });

    // Count urgent items (pending bookings > 24 hours)
    const urgentBookings = await Booking.countDocuments({
      status: 'pending',
      bookingType: 'online',
      createdAt: { $lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    });

    const totalActionRequired = pendingBookingsCount + pendingTransfersCount + failedPaymentsCount;
    
    res.json({
      success: true,
      data: {
        total: totalActionRequired,
        urgent: urgentBookings,
        pendingBookings: pendingBookingsCount,
        pendingTransfers: pendingTransfersCount,
        failedPayments: failedPaymentsCount
      }
    });

  } catch (error) {
    console.error('Get notification counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification counts'
    });
  }
};