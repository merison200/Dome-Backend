import Payment from '../models/hallPayment.js';
import Booking from '../models/hallBooking.js';

// Validate payment data
export const validatePaymentData = (req, res, next) => {
  const { bookingId, method, cardDetails, transferDetails } = req.body;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: 'Booking ID is required'
    });
  }

  if (!method || !['card', 'transfer'].includes(method)) {
    return res.status(400).json({
      success: false,
      message: 'Valid payment method is required (card or transfer)'
    });
  }

  if (method === 'card') {
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || 
        !cardDetails.cvv || !cardDetails.cardholderName) {
      return res.status(400).json({
        success: false,
        message: 'Complete card details are required'
      });
    }

    // Validate card number (basic validation)
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card number'
      });
    }

    // Validate expiry date
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardDetails.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expiry date format (MM/YY)'
      });
    }

    // Check if card is not expired
    const [month, year] = cardDetails.expiryDate.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    if (expiryDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Card has expired'
      });
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CVV'
      });
    }
  }

  next();
};

// Check for duplicate payments
export const checkDuplicatePayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const existingPayment = await Payment.findOne({
      bookingId,
      userId: req.user._id,
      status: { $in: ['completed', 'processing'] }
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking',
        existingPayment: {
          transactionId: existingPayment.transactionId,
          status: existingPayment.status
        }
      });
    }

    next();
  } catch (error) {
    console.error('Check duplicate payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking payment status'
    });
  }
};

// Validate booking ownership and status
export const validateBookingForPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own bookings'
      });
    }

    // Check booking status
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for cancelled booking'
      });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      });
    }

    // Check if booking is not expired
    const firstEventDate = new Date(Math.min(...booking.eventDates));
    if (firstEventDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for past events'
      });
    }

    req.booking = booking;
    next();
  } catch (error) {
    console.error('Validate booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating booking'
    });
  }
};

// Rate limiting for payment attempts
export const paymentRateLimit = (req, res, next) => {
  // This is a simple in-memory rate limiter
  // In production, use Redis or a proper rate limiting solution
  const userKey = `payment_attempts_${req.user._id}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!global.paymentAttempts) {
    global.paymentAttempts = new Map();
  }

  const userAttempts = global.paymentAttempts.get(userKey) || [];
  const recentAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);

  if (recentAttempts.length >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many payment attempts. Please try again later.',
      retryAfter: Math.ceil((recentAttempts[0] + windowMs - now) / 1000)
    });
  }

  // Add current attempt
  recentAttempts.push(now);
  global.paymentAttempts.set(userKey, recentAttempts);

  next();
};

// Log payment attempts
export const logPaymentAttempt = (req, res, next) => {
  const { bookingId, method } = req.body;
  
  console.log(`Payment attempt: User ${req.user._id}, Booking ${bookingId}, Method ${method}, IP ${req.ip}`);
  
  next();
};

// Sanitize sensitive data in responses
export const sanitizePaymentResponse = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (parsed.cardDetails) {
          delete parsed.cardDetails.cardNumber;
          delete parsed.cardDetails.cvv;
        }
        data = JSON.stringify(parsed);
      } catch (e) {
        // Not JSON, continue as is
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};