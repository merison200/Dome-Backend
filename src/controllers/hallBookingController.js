import Booking from '../models/hallBooking.js';
import Payment from '../models/hallPayment.js';
import Hall from '../models/hall.js';
import { sendBookingConfirmation, sendBookingCancellation } from '../utils/hallBookingEmail.js';
import { calculateBookingPricing } from '../utils/pricingUtils.js';

// Check availability for specific dates
export const checkAvailability = async (req, res) => {
  try {
    const { hallId, dates } = req.body;

    if (!hallId || !dates || !Array.isArray(dates)) {
      return res.status(400).json({
        success: false,
        message: 'Hall ID and dates array are required'
      });
    }

    // Convert string dates to Date objects
    const eventDates = dates.map(date => new Date(date));
    
    // Check for existing bookings on these dates
    const existingBookings = await Booking.find({
      hallId,
      eventDates: { $in: eventDates },
      status: { $in: ['confirmed', 'pending'] }
    });

    // Create availability results
    const availabilityResults = dates.map(date => {
      const dateObj = new Date(date);
      const isBooked = existingBookings.some(booking => 
        booking.eventDates.some(eventDate => 
          eventDate.toDateString() === dateObj.toDateString()
        )
      );

      return {
        date,
        available: !isBooked,
        reason: isBooked ? 'Already booked' : undefined
      };
    });

    res.json(availabilityResults);
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability'
    });
  }
};

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      hallId,
      customerName,
      customerEmail,
      customerPhone,
      eventDates,
      additionalHours = 0,
      banquetChairs = 0,
      eventType,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!hallId || !eventDates || !Array.isArray(eventDates) || eventDates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hall ID and event dates are required'
      });
    }

    // Validate customer information
    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone are required'
      });
    }

    // Get hall details
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    // Convert string dates to Date objects
    const eventDateObjects = eventDates.map(date => new Date(date));

    // Check availability again
    const existingBookings = await Booking.find({
      hallId,
      eventDates: { $in: eventDateObjects },
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some dates are no longer available'
      });
    }

    // Calculate pricing
    const pricing = calculateBookingPricing({
      basePrice: hall.basePrice,
      additionalHourPrice: hall.additionalHourPrice,
      eventDates: eventDateObjects,
      additionalHours,
      banquetChairs
    });

    // Set cancellation deadline (7 days before first event date)
    const firstEventDate = new Date(Math.min(...eventDateObjects));
    const cancellationDeadline = new Date(firstEventDate);
    cancellationDeadline.setDate(cancellationDeadline.getDate() - 7);

    // Create booking
    const booking = new Booking({
      userId: req.user._id,
      hallId,
      customerName,
      customerEmail,
      customerPhone,
      eventDates: eventDateObjects,
      additionalHours,
      banquetChairs,
      eventType,
      specialRequests,
      ...pricing,
      cancellationDeadline
    });

    await booking.save();

    // Populate hall and user details
    await booking.populate('hallId', 'name location');
    await booking.populate('userId', 'name email');

    res.status(201).json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
};

// Admin: Create offline booking
export const createOfflineBooking = async (req, res) => {
  try {
    const {
      hallId,
      customerName,
      customerEmail,
      customerPhone,
      eventDates,
      additionalHours = 0,
      banquetChairs = 0,
      eventType,
      specialRequests
    } = req.body;

    // Validate required fields
    if (!hallId || !eventDates || !Array.isArray(eventDates) || eventDates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Hall ID and event dates are required'
      });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, email, and phone are required'
      });
    }

    // Get hall details
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).json({
        success: false,
        message: 'Hall not found'
      });
    }

    // Convert string dates to Date objects
    const eventDateObjects = eventDates.map(date => new Date(date));

    // Check availability
    const existingBookings = await Booking.find({
      hallId,
      eventDates: { $in: eventDateObjects },
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some dates are no longer available'
      });
    }

    // Calculate pricing
    const pricing = calculateBookingPricing({
      basePrice: hall.basePrice,
      additionalHourPrice: hall.additionalHourPrice,
      eventDates: eventDateObjects,
      additionalHours,
      banquetChairs
    });

    // Set cancellation deadline (7 days before first event date)
    const firstEventDate = new Date(Math.min(...eventDateObjects));
    const cancellationDeadline = new Date(firstEventDate);
    cancellationDeadline.setDate(cancellationDeadline.getDate() - 7);

    // Create offline booking (confirmed and paid)
    const booking = new Booking({
      userId: req.user._id, // Admin user creating the booking
      hallId,
      customerName,
      customerEmail,
      customerPhone,
      eventDates: eventDateObjects,
      additionalHours,
      banquetChairs,
      eventType,
      specialRequests,
      ...pricing,
      cancellationDeadline,
      bookingType: 'offline',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    await booking.save();
    
    const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generateReference = () => `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const transactionId = generateTransactionId();
    const referenceNumber = generateReference();

    // Create payment record for offline booking
    const payment = new Payment({
      bookingId: booking._id,
      userId: req.user._id,
      transactionId,
      referenceNumber,
      amount: booking.totalAmount,
      method: 'transfer',
      status: 'completed',
      processingFee: 0,
      netAmount: booking.totalAmount,
      refundStatus: 'none', // ADDED: Initialize refund status
      refundAmount: 0, // ADDED: Initialize refund amount
      transferDetails: {
        accountName: 'Cavudos Nigeria Limited',
        accountNumber: '1228862083',
        bankName: 'Zenith Bank',
        verificationStatus: 'verified',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        hallName: hall.name,
        eventDates: eventDateObjects,
        recordedBy: req.user._id,
        customerNotes: 'Offline booking payment recorded by admin',
        paymentType: 'offline',
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone
      }
    });

    await payment.save();

    // Update booking with payment reference
    booking.paymentReference = referenceNumber;
    await booking.save();

    // Populate hall details
    await booking.populate('hallId', 'name location');

    res.status(201).json({
      success: true,
      message: 'Offline booking created successfully',
      booking,
      payment: {
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        method: payment.method,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Create offline booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create offline booking'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('hallId', 'name location images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('hallId', 'name location images basePrice additionalHourPrice')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin/staff
    if (booking.userId._id.toString() !== req.user._id.toString() && 
        !['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking'
    });
  }
};

// Cancel booking - FIXED
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('hallId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (new Date() >= booking.cancellationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation deadline has passed'
      });
    }

    // Calculate refund amount (90% of total - 10% processing fee)
    const refundAmount = Math.round(booking.totalAmount * 0.9);

    // Update booking
    booking.status = 'cancelled';
    booking.refundAmount = refundAmount;
    booking.refundReason = 'Customer cancellation';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    await booking.save();

    // FIXED: Update associated payment record
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment) {
      payment.status = 'cancelled';
      payment.refundAmount = refundAmount;
      payment.refundStatus = 'full';
      payment.refundDate = new Date();
      payment.refundReference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      if (!payment.metadata) {
        payment.metadata = {};
      }
      payment.metadata.cancellationReason = 'Customer cancellation';
      payment.metadata.cancelledBy = req.user._id;
      payment.metadata.cancelledAt = new Date();
      
      await payment.save();
    }

    // Send cancellation email
    try {
      await sendBookingCancellation(booking.userId.email, {
        customerName: booking.userId.name,
        hallName: booking.hallId.name,
        bookingId: booking._id,
        refundAmount,
        eventDates: booking.eventDates
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// Confirm payment (webhook or manual confirmation)
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentReference, transactionId } = req.body;

    const booking = await Booking.findById(id)
      .populate('hallId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Find the payment record associated with this booking
    const payment = await Payment.findOne({ bookingId: booking._id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found for this booking'
      });
    }

    // Update payment status
    payment.status = 'completed';
    if (paymentReference) {
      payment.referenceNumber = paymentReference;
    }
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    
    // If it's a card payment, update gateway response
    if (payment.method === 'card') {
      payment.gatewayResponse = {
        ...payment.gatewayResponse,
        gatewayStatus: 'success',
        gatewayMessage: 'Payment manually confirmed'
      };
    }
    
    // If it's a transfer, update verification status
    if (payment.method === 'transfer') {
      payment.transferDetails = {
        ...payment.transferDetails,
        verificationStatus: 'verified',
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      };
    }

    await payment.save();

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentReference = payment.referenceNumber;
    await booking.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking.userId.email, {
        customerName: booking.userId.name,
        hallName: booking.hallId.name,
        bookingId: booking._id,
        eventDates: booking.eventDates,
        totalAmount: booking.totalAmount,
        paymentReference: booking.paymentReference
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      booking,
      payment: {
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        status: payment.status,
        method: payment.method
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment'
    });
  }
};

// // Admin: Get all bookings
// export const getAllBookings = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 20, 
//       status, 
//       paymentStatus, 
//       startDate, 
//       endDate,
//       hallId 
//     } = req.query;

//     const query = {};
    
//     if (status) query.status = status;
//     if (paymentStatus) query.paymentStatus = paymentStatus;
//     if (hallId) query.hallId = hallId;
    
//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) query.createdAt.$gte = new Date(startDate);
//       if (endDate) query.createdAt.$lte = new Date(endDate);
//     }

//     const bookings = await Booking.find(query)
//       .populate('hallId', 'name location')
//       .populate('userId', 'name email')
//       .sort({ createdAt: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await Booking.countDocuments(query);

//     res.json({
//       bookings,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / limit)
//     });
//   } catch (error) {
//     console.error('Get all bookings error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch bookings'
//     });
//   }
// };

// Admin: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus, 
      startDate, 
      endDate,
      hallId 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (hallId) query.hallId = hallId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(query)
      .populate('hallId', 'name location')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      total,
      success: true
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Admin: Update booking status - FIXED
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, confirmed, cancelled, completed'
      });
    }

    const booking = await Booking.findById(id)
      .populate('hallId', 'name location')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Find associated payment
    const payment = await Payment.findOne({ bookingId: booking._id });

    // Update booking status
    booking.status = status;

    // FIXED: Sync payment status based on booking status
    if (status === 'confirmed') {
      booking.paymentStatus = 'paid';
      
      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.refundStatus = 'none'; // ADDED
        payment.refundAmount = 0; // ADDED
        
        // Update verification details based on payment method
        if (payment.method === 'transfer') {
          payment.transferDetails = {
            ...payment.transferDetails,
            verificationStatus: 'verified',
            verifiedBy: req.user._id,
            verifiedAt: new Date()
          };
        } else if (payment.method === 'card') {
          payment.gatewayResponse = {
            ...payment.gatewayResponse,
            gatewayStatus: 'success',
            gatewayMessage: 'Payment confirmed by admin'
          };
        }
        
        await payment.save();
      }
    } else if (status === 'cancelled') {
      booking.paymentStatus = 'refunded';
      booking.cancelledAt = new Date();
      
      // FIXED: Properly update payment refund status
      if (payment && payment.status !== 'failed') {
        payment.status = 'cancelled';
        payment.refundStatus = 'full';
        payment.refundAmount = booking.totalAmount;
        payment.refundDate = new Date();
        payment.refundReference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        if (!payment.metadata) {
          payment.metadata = {};
        }
        payment.metadata.cancellationReason = 'Admin status update';
        payment.metadata.cancelledBy = req.user._id;
        payment.metadata.cancelledAt = new Date();
        
        await payment.save();
      }
    }

    await booking.save();

    // Re-populate after save to get fresh data
    await booking.populate('hallId', 'name location');
    await booking.populate('userId', 'name email');

    res.json({
      success: true,
      message: `Booking status updated to ${status} successfully`,
      booking,
      paymentUpdated: payment ? true : false
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// Admin: Cancel booking with custom refund - FIXED
export const adminCancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, reason } = req.body;

    const booking = await Booking.findById(id)
      .populate('hallId', 'name')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    // Calculate refund amount if not provided
    let finalRefundAmount = refundAmount;
    if (finalRefundAmount === undefined || finalRefundAmount === null) {
      // Default to 90% refund if no amount specified
      finalRefundAmount = Math.round(booking.totalAmount * 0.9);
    }

    // Validate refund amount doesn't exceed total amount
    if (finalRefundAmount > booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount cannot exceed total booking amount'
      });
    }

    // Update booking details
    booking.status = 'cancelled';
    booking.refundAmount = finalRefundAmount;
    booking.refundReason = reason || 'Admin cancellation';
    booking.cancelledBy = 'admin';
    booking.cancelledAt = new Date();
    
    // FIXED: Update booking payment status based on refund amount
    if (finalRefundAmount > 0) {
      booking.paymentStatus = finalRefundAmount >= booking.totalAmount ? 'refunded' : 'partially_refunded';
    } else {
      booking.paymentStatus = 'failed';
    }
    
    await booking.save();

    // FIXED: Update related payment record with proper refund tracking
    const payment = await Payment.findOne({ bookingId: booking._id });
    if (payment) {
      payment.status = 'cancelled';
      payment.refundAmount = finalRefundAmount;
      
      // Set refund status based on amount
      if (finalRefundAmount === 0) {
        payment.refundStatus = 'none';
      } else if (finalRefundAmount >= booking.totalAmount) {
        payment.refundStatus = 'full';
      } else {
        payment.refundStatus = 'partial';
      }
      
      payment.refundDate = new Date();
      payment.refundReference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Add cancellation details to metadata
      if (!payment.metadata) {
        payment.metadata = {};
      }
      payment.metadata.cancellationReason = reason || 'Admin cancellation';
      payment.metadata.cancelledBy = req.user._id;
      payment.metadata.cancelledAt = new Date();
      payment.metadata.refundPercentage = Math.round((finalRefundAmount / booking.totalAmount) * 100);
      
      await payment.save();
    }

    // Send cancellation email
    try {
      await sendBookingCancellation(booking.userId.email, {
        customerName: booking.userId.name,
        hallName: booking.hallId.name,
        bookingId: booking._id,
        refundAmount: finalRefundAmount,
        eventDates: booking.eventDates,
        reason: reason || 'Administrative cancellation'
      });
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully by admin',
      booking: {
        id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        refundAmount: finalRefundAmount,
        cancelledAt: booking.cancelledAt
      },
      payment: payment ? {
        status: payment.status,
        refundStatus: payment.refundStatus,
        refundReference: payment.refundReference
      } : null
    });
  } catch (error) {
    console.error('Admin cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};