import puppeteer from 'puppeteer';
import Payment from '../models/hallPayment.js';
import Booking from '../models/hallBooking.js';
import { paystackAPI } from '../config/paystack.js';
import { sendPaymentConfirmation, sendPaymentFailure,
         sendTransferInstructions, sendCautionFeeRefund  } from '../utils/hallBookingEmail.js';
import { uploadImage } from '../utils/cloudinaryUtils.js';
import { generateReceiptPDF } from '../templates/hallBookingEmail.js';

// Generate unique transaction ID and reference
const generateTransactionId = () => `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateReference = () => `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

// Helper function to update booking status based on payment status
const updateBookingStatusFromPayment = async (paymentId, paymentStatus, rejectionReason = null) => {
  try {
    const payment = await Payment.findById(paymentId).populate('bookingId');
    if (!payment || !payment.bookingId) return;

    const booking = payment.bookingId;
    
    switch (paymentStatus) {
      case 'completed':
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.paymentReference = payment.referenceNumber;
        break;
        
      case 'failed':
        booking.paymentStatus = 'failed';
        booking.status = 'cancelled';
        booking.refundReason = rejectionReason || 'Payment failed';
        booking.cancelledAt = new Date();
        break;
        
      case 'processing':
      case 'pending':
        booking.status = 'pending';
        booking.paymentStatus = 'pending';
        break;
        
      default:
        console.warn(`Unhandled payment status: ${paymentStatus}`);
    }
    
    await booking.save();
    return booking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// FIXED: Comprehensive payment statistics function
export const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Get ALL payment counts first
    const totalPayments = await Payment.countDocuments(filters);
    const completedPayments = await Payment.countDocuments({ 
      status: 'completed',
      ...filters 
    });
    const pendingPayments = await Payment.countDocuments({ 
      status: 'pending',
      ...filters
    });
    const failedPayments = await Payment.countDocuments({ 
      status: 'failed',
      ...filters
    });

    // Get revenue stats only from completed payments
    const revenueStats = await Payment.getRevenueStats({
      status: 'completed', // Only count completed payments for revenue
      ...filters
    });

    // Calculate pending revenue
    const pendingPaymentsData = await Payment.find({ 
      status: 'pending',
      ...filters
    });
    const pendingRevenue = pendingPaymentsData.reduce((sum, payment) => sum + payment.amount, 0);

    // Get method breakdown
    const cardPayments = await Payment.countDocuments({ 
      method: 'card',
      ...filters
    });
    const transferPayments = await Payment.countDocuments({ 
      method: 'transfer',
      ...filters
    });

    const pendingTransferVerifications = await Payment.countDocuments({
      method: 'transfer',
      'transferDetails.verificationStatus': 'pending',
      status: { $in: ['pending', 'processing'] },
      ...filters
    });

    // Build the stats object with correct data
    const stats = {
      // Payment counts - CORRECTED
      totalPayments, // This should be 13 in your case
      completedPayments, // This should be 5 in your case
      pendingPayments,
      failedPayments,
      pendingRevenue,
      
      // Revenue metrics - from completed payments only
      grossRevenue: revenueStats.grossRevenue || 0,
      gatewayCharges: revenueStats.gatewayCharges || 0,
      processingFees: revenueStats.processingFees || 0,
      totalFees: revenueStats.totalFees || 0,
      netRevenue: revenueStats.netRevenue || 0,
      refundAmount: revenueStats.refundAmount || 0,
      
      // Method breakdown
      cardPayments,
      transferPayments,
      pendingTransferVerifications,
      
      // Percentages
      feePercentage: revenueStats.feePercentage || '0%',
      netRevenuePercentage: revenueStats.netRevenuePercentage || '0%'
    };

    console.log('Payment Stats Calculation:', {
      totalPayments,
      completedPayments, 
      pendingPayments,
      failedPayments,
      grossRevenue: stats.grossRevenue
    });

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};

// Process payment (initialize) - UPDATED with proper fee tracking
export const processPayment = async (req, res) => {
  try {
    const { bookingId, method, cardDetails, transferDetails } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('hallId', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      bookingId, 
      status: { $in: ['completed', 'processing'] } 
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this booking'
      });
    }

    const transactionId = generateTransactionId();
    const referenceNumber = generateReference();
    const amount = booking.totalAmount;

    // Calculate fees - UPDATED: Track gateway fees separately
    const gatewayFee = method === 'card' ? paystackAPI.calculatePaystackFee(amount) : 0;
    const processingFee = 0; // You can add other processing fees here if needed
    const netAmount = amount - gatewayFee - processingFee;

    // Create payment record - UPDATED with gatewayFee
    const payment = new Payment({
      bookingId,
      userId: req.user._id,
      transactionId,
      referenceNumber,
      amount,
      method,
      gatewayFee, // Track gateway fees separately
      processingFee,
      netAmount,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        hallName: booking.hallId.name,
        eventDates: booking.eventDates,
      }
    });

    if (method === 'card') {
      // Process card payment
      payment.status = 'processing';
      payment.cardDetails = {
        last4Digits: cardDetails.cardNumber.slice(-4),
        cardholderName: cardDetails.cardholderName,
        expiryMonth: cardDetails.expiryDate.split('/')[0],
        expiryYear: cardDetails.expiryDate.split('/')[1],
      };

      // Initialize payment with Paystack
      const gatewayResult = await paystackAPI.initializePaystackPayment({
        email: booking.customerEmail,
        amount: amount,
        reference: referenceNumber,
        bookingId: bookingId,
        userId: req.user._id,
        customerName: booking.customerName,
      });

      if (!gatewayResult.success) {
        return res.status(400).json({
          success: false,
          message: gatewayResult.error
        });
      }

      payment.gatewayResponse = {
        gatewayTransactionId: gatewayResult.data.reference,
        gatewayReference: gatewayResult.data.access_code,
        gatewayData: gatewayResult.data,
      };

      await payment.save();

      // UPDATE BOOKING STATUS FOR CARD PAYMENT
      booking.status = 'pending';
      booking.paymentStatus = 'processing';
      await booking.save();

      // Return response with Paystack URL for frontend redirect
      res.json({
        success: true,
        transactionId,
        referenceNumber,
        amount,
        method,
        status: 'processing',
        message: 'Payment is being processed',
        paymentUrl: gatewayResult.authorizationUrl,
        // NEW: Include fee breakdown in response
        fees: {
          gatewayFee,
          processingFee,
          netAmount
        }
      });

    } else if (method === 'transfer') {
      // Process bank transfer
      payment.status = 'pending';
      payment.transferDetails = {
        accountName: 'Cavudos Nigeria Limited',
        accountNumber: '1228862083',
        bankName: 'Zenith Bank Nigeria',
        verificationStatus: 'pending',
      };

      await payment.save();

      // UPDATE BOOKING STATUS FOR TRANSFER PAYMENT
      booking.status = 'pending';
      booking.paymentStatus = 'pending';
      await booking.save();
      
      // Send transfer instructions
      await sendTransferInstructions(booking.customerEmail, {
        customerName: booking.customerName,
        transactionId,
        referenceNumber,
        amount,
        accountDetails: payment.transferDetails,
        hallName: booking.hallId.name,
        eventDates: booking.eventDates,
      });

      res.json({
        success: true,
        transactionId,
        referenceNumber,
        amount,
        method,
        status: 'pending',
        message: 'Transfer instructions sent to your email',
        transferDetails: {
          accountName: payment.transferDetails.accountName,
          accountNumber: payment.transferDetails.accountNumber,
          bankName: payment.transferDetails.bankName,
        },
        // NEW: Include fee breakdown in response
        fees: {
          gatewayFee,
          processingFee,
          netAmount
        }
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed'
    });
  }
};

// Admin: Record offline payment - UPDATED with proper fee tracking
export const recordOfflinePayment = async (req, res) => {
  try {
    const { bookingId, amount, customerNotes } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('hallId', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is offline type
    if (booking.bookingType !== 'offline') {
      return res.status(400).json({
        success: false,
        message: 'Can only record payments for offline bookings'
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      bookingId, 
      status: 'completed'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already recorded for this booking'
      });
    }

    // Validate amount matches booking total
    if (amount !== booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must match booking total'
      });
    }

    const transactionId = generateTransactionId();
    const referenceNumber = generateReference();

    // Create payment record - UPDATED with proper fee tracking
    const payment = new Payment({
      bookingId,
      userId: booking.userId._id,
      transactionId,
      referenceNumber,
      amount,
      method: 'transfer',
      status: 'completed',
      gatewayFee: 0, // No gateway fees for offline payments
      processingFee: 0,
      netAmount: amount,
      transferDetails: {
        accountName: 'The Dome Event Center',
        accountNumber: '1234567890',
        bankName: 'Cash/Transfer Payment',
        verificationStatus: 'verified',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      metadata: {
        hallName: booking.hallId.name,
        eventDates: booking.eventDates,
        recordedBy: req.user._id,
        customerNotes: customerNotes || 'Offline payment recorded by admin',
        paymentType: 'offline'
      }
    });

    await payment.save();

    // Update booking payment reference
    booking.paymentReference = referenceNumber;
    await booking.save();

    res.status(201).json({
      success: true,
      message: 'Offline payment recorded successfully',
      payment: {
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        // NEW: Include revenue breakdown
        revenueBreakdown: payment.getRevenueBreakdown()
      }
    });

  } catch (error) {
    console.error('Record offline payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record offline payment'
    });
  }
};

// Verify payment - UPDATED with revenue breakdown
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.method === 'card' && payment.status === 'processing') {
      // Verify with payment gateway
      const verification = await paystackAPI.verifyPaystackPayment(payment.referenceNumber);
      
      if (verification.success && verification.data.status === 'success') {
        // PAYMENT SUCCESSFUL
        payment.status = 'completed';
        payment.gatewayResponse.gatewayStatus = verification.data.status;
        payment.gatewayResponse.gatewayMessage = verification.data.gateway_response;
        await payment.save();

        // Update booking to confirmed
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          booking.paymentReference = payment.referenceNumber;
          await booking.save();
        }
        
      } else {
        // PAYMENT FAILED
        payment.status = 'failed';
        payment.gatewayResponse.gatewayStatus = verification.data?.status || 'failed';
        payment.gatewayResponse.gatewayMessage = verification.data?.gateway_response || 'Payment verification failed';
        await payment.save();

        // CANCEL BOOKING FOR FAILED PAYMENT
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'failed';
          booking.status = 'cancelled';
          booking.refundReason = 'Payment failed';
          booking.cancelledAt = new Date();
          await booking.save();
        }
      }
    }

    // NEW: Include revenue breakdown in response
    const response = {
      success: true,
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      message: payment.status === 'completed' ? 'Payment successful' : 
               payment.status === 'processing' ? 'Payment is being processed' :
               payment.status === 'pending' ? 'Payment pending verification' : 
               'Payment failed - booking cancelled',
    };

    // Add revenue breakdown for completed payments
    if (payment.status === 'completed') {
      response.revenueBreakdown = payment.getRevenueBreakdown();
    }

    res.json(response);

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Upload transfer proof
export const uploadTransferProof = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Transfer proof image is required'
      });
    }

    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.method !== 'transfer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Upload image
    const uploadResult = await uploadImage(file, 'transfer-proofs');
    
    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: uploadResult.error
      });
    }

    // Update payment with proof
    payment.transferDetails.transferProof = uploadResult.url;
    payment.transferDetails.verificationStatus = 'pending';
    payment.status = 'processing';
    await payment.save();

    res.json({
      success: true,
      message: 'Transfer proof uploaded successfully',
      proofUrl: uploadResult.url
    });

  } catch (error) {
    console.error('Upload transfer proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload transfer proof'
    });
  }
};

// Get payment receipt - UPDATED to include fee breakdown
export const getReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name location'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const receipt = {
      id: `RCP_${payment._id}`,
      bookingId: payment.bookingId._id,
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      customerName: payment.bookingId.customerName,
      customerEmail: payment.bookingId.customerEmail,
      hallName: payment.bookingId.hallId.name,
      eventDates: payment.bookingId.eventDates,
      amount: payment.amount,
      paymentMethod: payment.method === 'card' ? 'Credit/Debit Card' : 'Bank Transfer',
      paymentDate: payment.updatedAt,
      status: payment.status === 'completed' ? 'paid' : payment.status,
      breakdown: {
        basePrice: payment.bookingId.basePrice || 0,
        cautionFee: payment.bookingId.cautionFee || 0,
        additionalHours: payment.bookingId.additionalHoursPrice || 0,
        banquetChairs: payment.bookingId.banquetChairsPrice || 0,
        total: payment.amount,
      },
      // NEW: Include fee breakdown in receipt
      fees: {
        gatewayFee: payment.gatewayFee || 0,
        processingFee: payment.processingFee || 0,
        totalFees: (payment.gatewayFee || 0) + (payment.processingFee || 0),
        netAmount: payment.netAmount
      }
    };

    res.json(receipt);

  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get receipt'
    });
  }
};

// Send receipt via email
export const sendReceiptEmail = async (req, res) => {
  try {
    const { transactionId, email } = req.body;

    const payment = await Payment.findOne({ transactionId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send receipt for incomplete payment'
      });
    }

    // Send receipt email (reuse existing confirmation email for now)
    await sendPaymentConfirmation(email, {
      customerName: payment.bookingId.customerName,
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      hallName: payment.bookingId.hallId.name,
      eventDates: payment.bookingId.eventDates,
    });

    res.json({
      success: true,
      message: 'Receipt sent successfully'
    });

  } catch (error) {
    console.error('Send receipt email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt'
    });
  }
};

// Download receipt function using Puppeteer
export const downloadReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name location'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate HTML content
    const htmlContent = await generateReceiptPDF(payment);

    // Launch Puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    // Set PDF headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${transactionId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send the PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Download receipt PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF receipt'
    });
  }
};

// Admin: Verify transfer payment
export const verifyTransferPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const payment = await Payment.findOne({ transactionId })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name location'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.method !== 'transfer') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    if (action === 'approve') {
      payment.status = 'completed';
      payment.transferDetails.verificationStatus = 'verified';
      payment.transferDetails.verifiedBy = req.user._id;
      payment.transferDetails.verifiedAt = new Date();

      // Update booking to confirmed
      const booking = await Booking.findById(payment.bookingId._id);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.status = 'confirmed';
        booking.paymentReference = payment.referenceNumber;
        await booking.save();
      }

      // Send confirmation email - now with proper hall name access
      await sendPaymentConfirmation(payment.userId.email, {
        customerName: payment.userId.name,
        transactionId: payment.transactionId,
        referenceNumber: payment.referenceNumber,
        amount: payment.amount,
        hallName: payment.bookingId.hallId?.name || 'Event Hall', // Now properly populated
        eventDates: payment.bookingId.eventDates,
      });

    } else if (action === 'reject') {
      payment.status = 'failed';
      payment.transferDetails.verificationStatus = 'rejected';
      payment.transferDetails.rejectionReason = rejectionReason;
      payment.transferDetails.verifiedBy = req.user._id;
      payment.transferDetails.verifiedAt = new Date();

      // CANCEL BOOKING FOR REJECTED TRANSFER
      const booking = await Booking.findById(payment.bookingId._id);
      if (booking) {
        booking.paymentStatus = 'failed';
        booking.status = 'cancelled';
        booking.refundReason = rejectionReason || 'Transfer payment rejected';
        booking.cancelledAt = new Date();
        await booking.save();
      }

      // Send failure email
      await sendPaymentFailure(payment.userId.email, {
        customerName: payment.userId.name,
        transactionId: payment.transactionId,
        rejectionReason,
      });
    }

    await payment.save();

    res.json({
      success: true,
      message: `Payment ${action}d successfully`,
      payment
    });

  } catch (error) {
    console.error('Verify transfer payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Get all payments (Admin) - UPDATED to include revenue breakdown
export const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      method, 
      startDate, 
      endDate 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (method) query.method = method;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // NEW: Enhance payments with revenue breakdown
    const enhancedPayments = payments.map(payment => ({
      ...payment.toObject(),
      revenueBreakdown: payment.getRevenueBreakdown()
    }));

    res.json({
      success: true,
      payments: enhancedPayments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
};

// Get payment by Paystack reference
export const getPaymentByReference = async (req, res) => {
  try {
    const { reference } = req.params;

    const payment = await Payment.findOne({ referenceNumber: reference })
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      message: payment.status === 'completed' ? 'Payment successful' : 
               payment.status === 'processing' ? 'Payment is being processed' :
               payment.status === 'pending' ? 'Payment pending verification' : 'Payment failed',
      bookingId: payment.bookingId._id,
      customerName: payment.bookingId.customerName,
      hallName: payment.bookingId.hallId?.name
    });

  } catch (error) {
    console.error('Get payment by reference error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment'
    });
  }
};

// Get pending transfer proofs for admin verification
export const getPendingTransferProofs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      method: 'transfer',
      'transferDetails.transferProof': { $exists: true, $ne: null },
      'transferDetails.verificationStatus': 'pending'
    };

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    const pendingProofs = payments.map(payment => ({
      transactionId: payment.transactionId,
      referenceNumber: payment.referenceNumber,
      amount: payment.amount,
      customerName: payment.userId.name,
      customerEmail: payment.userId.email,
      hallName: payment.bookingId?.hallId?.name,
      eventDates: payment.bookingId?.eventDates,
      transferProofUrl: payment.transferDetails.transferProof,
      uploadedAt: payment.createdAt,
      bookingId: payment.bookingId?._id,
      paymentStatus: payment.status
    }));

    res.json({
      success: true,
      message: `Found ${total} pending transfer proofs`,
      pendingProofs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get pending transfer proofs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending transfer proofs'
    });
  }
};

// Handle Paystack callback/redirect - UPDATED
export const handlePaymentCallback = async (req, res) => {
  try {
    const { reference, trxref, status } = req.query;
    const paymentReference = reference || trxref;

    if (!paymentReference) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=missing_reference`);
    }

    // Find payment by reference
    const payment = await Payment.findOne({ referenceNumber: paymentReference })
      .populate('bookingId')
      .populate('userId', 'name email');

    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_not_found`);
    }

    // Verify payment with Paystack if it's still processing
    if (payment.method === 'card' && payment.status === 'processing') {
      const verification = await paystackAPI.verifyPaystackPayment(paymentReference);
      
      if (verification.success) {
        if (verification.data.status === 'success') {
          // Payment successful
          payment.status = 'completed';
          payment.gatewayResponse.gatewayStatus = verification.data.status;
          payment.gatewayResponse.gatewayMessage = verification.data.gateway_response || 'Payment successful';
          await payment.save();

          // Update booking
          const booking = await Booking.findById(payment.bookingId);
          if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            booking.paymentReference = paymentReference;
            await booking.save();

            // Send confirmation email
            try {
              await sendPaymentConfirmation(payment.userId.email, {
                customerName: booking.customerName,
                transactionId: payment.transactionId,
                referenceNumber: payment.referenceNumber,
                amount: payment.amount,
                hallName: booking.hallId?.name || 'Event Hall',
                eventDates: booking.eventDates,
              });
            } catch (emailError) {
              console.error('Email sending failed:', emailError);
            }
          }

          // Redirect to success page with transaction details
          return res.redirect(`${process.env.FRONTEND_URL}/payment/success?transactionId=${payment.transactionId}&reference=${paymentReference}`);
          
        } else {
          // Payment failed
          payment.status = 'failed';
          payment.gatewayResponse.gatewayStatus = verification.data.status;
          payment.gatewayResponse.gatewayMessage = verification.data.gateway_response || 'Payment failed';
          await payment.save();

          // CANCEL BOOKING FOR FAILED PAYMENT
          const booking = await Booking.findById(payment.bookingId);
          if (booking) {
            booking.paymentStatus = 'failed';
            booking.status = 'cancelled';
            booking.refundReason = 'Payment failed';
            booking.cancelledAt = new Date();
            await booking.save();
          }

          return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?transactionId=${payment.transactionId}&reason=${verification.data.gateway_response}`);
        }
      } else {
        // Verification failed
        console.error('Payment verification failed:', verification.error);
        
        // Mark payment as failed and cancel booking
        payment.status = 'failed';
        payment.gatewayResponse.gatewayStatus = 'verification_failed';
        payment.gatewayResponse.gatewayMessage = 'Payment verification failed';
        await payment.save();

        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'failed';
          booking.status = 'cancelled';
          booking.refundReason = 'Payment verification failed';
          booking.cancelledAt = new Date();
          await booking.save();
        }

        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?transactionId=${payment.transactionId}&error=verification_failed`);
      }
    } else {
      // Payment already processed or different method
      const redirectStatus = payment.status === 'completed' ? 'success' : 'failed';
      return res.redirect(`${process.env.FRONTEND_URL}/payment/${redirectStatus}?transactionId=${payment.transactionId}&reference=${paymentReference}`);
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
  }
};

// Payment webhook (for real payment gateways) - UPDATED
export const paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const body = JSON.stringify(req.body);
    
    // TODO: Verify webhook signature properly
    // const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(body).digest('hex');
    
    const event = req.body;
    
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const payment = await Payment.findOne({ referenceNumber: reference });
      
      if (payment && payment.status === 'processing') {
        payment.status = 'completed';
        payment.gatewayResponse.gatewayStatus = event.data.status;
        payment.gatewayResponse.gatewayMessage = event.data.gateway_response;
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'paid';
          booking.status = 'confirmed';
          booking.paymentReference = reference;
          await booking.save();
        }
      }
    } else if (event.event === 'charge.failed') {
      // HANDLE FAILED WEBHOOK
      const reference = event.data.reference;
      const payment = await Payment.findOne({ referenceNumber: reference });
      
      if (payment && payment.status === 'processing') {
        payment.status = 'failed';
        payment.gatewayResponse.gatewayStatus = event.data.status;
        payment.gatewayResponse.gatewayMessage = event.data.gateway_response;
        await payment.save();

        // Cancel booking
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus = 'failed';
          booking.status = 'cancelled';
          booking.refundReason = 'Payment failed';
          booking.cancelledAt = new Date();
          await booking.save();
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Error');
  }
};



/**
 * Process caution fee refund offline
 * Admin can refund full, partial, or no amount based on damage assessment
 */
export const processCautionFeeRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { 
      refundAmount, 
      damageCharges, 
      refundReason, 
      damageDescription,
      sendEmailNotification = true 
    } = req.body;

    // Validate required fields
    if (refundAmount === undefined || damageCharges === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount and damage charges are required'
      });
    }

    if (refundAmount < 0 || damageCharges < 0) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount and damage charges cannot be negative'
      });
    }

    // Find payment with populated user and booking data
    const payment = await Payment.findOne({ transactionId })
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment is eligible for caution fee refund
    if (!payment.isCautionFeeRefundEligible()) {
      return res.status(400).json({
        success: false,
        message: 'Payment is not eligible for caution fee refund'
      });
    }

    // Validate amounts against original caution fee
    const originalCautionFee = payment.cautionFee || 0;
    if (refundAmount > originalCautionFee) {
      return res.status(400).json({
        success: false,
        message: `Refund amount (${refundAmount}) cannot exceed original caution fee (${originalCautionFee})`
      });
    }

    if (damageCharges > originalCautionFee) {
      return res.status(400).json({
        success: false,
        message: `Damage charges (${damageCharges}) cannot exceed original caution fee (${originalCautionFee})`
      });
    }

    if ((refundAmount + damageCharges) > originalCautionFee) {
      return res.status(400).json({
        success: false,
        message: 'Refund amount plus damage charges cannot exceed original caution fee'
      });
    }

    // Process the caution fee refund
    payment.processCautionFeeRefund({
      refundAmount,
      damageCharges,
      refundReason,
      damageDescription,
      processedOffline: true
    }, req.user._id);

    await payment.save();

    // Send email notification if requested
    if (sendEmailNotification && payment.userId.email) {
      try {
        await sendCautionFeeRefund(payment.userId.email, {
          customerName: payment.bookingId.customerName,
          transactionId: payment.transactionId,
          originalAmount: originalCautionFee,
          refundAmount: refundAmount,
          damageCharges: damageCharges,
          reason: refundReason,
          damageDescription: damageDescription
        });
      } catch (emailError) {
        console.error('Failed to send caution fee refund email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Populate the updated payment for response
    const updatedPayment = await Payment.findById(payment._id)
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      });

    res.json({
      success: true,
      message: `Caution fee refund processed successfully`,
      payment: updatedPayment,
      refundSummary: {
        originalCautionFee,
        refundAmount,
        damageCharges,
        amountRetained: originalCautionFee - refundAmount,
        refundStatus: payment.cautionFeeRefund.refundStatus
      }
    });

  } catch (error) {
    console.error('Process caution fee refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process caution fee refund'
    });
  }
};

/**
 * Get payments eligible for caution fee refund
 */
export const getEligibleCautionFeeRefunds = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    // Build query for eligible payments
    let query = {
      status: 'completed',
      cautionFee: { $gt: 0 },
      $or: [
        { 'cautionFeeRefund': { $exists: false } },
        { 'cautionFeeRefund.refundStatus': 'pending' }
      ]
    };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { transactionId: searchRegex },
        { referenceNumber: searchRegex },
        { 'bookingId.customerName': searchRegex },
        { 'userId.name': searchRegex },
        { 'userId.email': searchRegex }
      ];
    }

    const payments = await Payment.find(query)
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    // Format response with eligibility info
    const eligiblePayments = payments.map(payment => ({
      ...payment.toObject(),
      isEligible: payment.isCautionFeeRefundEligible(),
      daysSincePayment: Math.floor((new Date() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      payments: eligiblePayments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      summary: {
        totalEligible: total,
        totalCautionFees: payments.reduce((sum, p) => sum + (p.cautionFee || 0), 0)
      }
    });

  } catch (error) {
    console.error('Get eligible caution fee refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch eligible caution fee refunds'
    });
  }
};

/**
 * Get caution fee refund statistics
 */
export const getCautionFeeRefundStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filters = {};
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }

    // Get all completed payments with caution fees
    const payments = await Payment.find({
      status: 'completed',
      cautionFee: { $gt: 0 },
      ...filters
    });

    const stats = {
      // Totals
      totalPaymentsWithCautionFee: payments.length,
      totalCautionFees: payments.reduce((sum, p) => sum + (p.cautionFee || 0), 0),
      
      // Refund status breakdown
      fullyRefunded: payments.filter(p => p.cautionFeeRefund?.refundStatus === 'full').length,
      partiallyRefunded: payments.filter(p => p.cautionFeeRefund?.refundStatus === 'partial').length,
      notRefunded: payments.filter(p => p.cautionFeeRefund?.refundStatus === 'none').length,
      pendingAssessment: payments.filter(p => !p.cautionFeeRefund || p.cautionFeeRefund.refundStatus === 'pending').length,
      
      // Financial breakdown
      totalRefunded: payments.reduce((sum, p) => sum + (p.cautionFeeRefund?.refundedAmount || 0), 0),
      totalDamageCharges: payments.reduce((sum, p) => sum + (p.cautionFeeRefund?.damageCharges || 0), 0),
      totalRetained: payments.reduce((sum, p) => {
        const refunded = p.cautionFeeRefund?.refundedAmount || 0;
        return sum + (p.cautionFee || 0) - refunded;
      }, 0),
    };

    // Calculate percentages
    stats.refundRate = stats.totalCautionFees > 0 ? 
      ((stats.totalRefunded / stats.totalCautionFees) * 100).toFixed(2) : 0;
    
    stats.damageRate = stats.totalCautionFees > 0 ?
      ((stats.totalDamageCharges / stats.totalCautionFees) * 100).toFixed(2) : 0;

    stats.retentionRate = stats.totalCautionFees > 0 ?
      ((stats.totalRetained / stats.totalCautionFees) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get caution fee refund stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch caution fee refund statistics'
    });
  }
};

/**
 * Get caution fee refund history for a specific payment
 */
export const getCautionFeeRefundHistory = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId })
      .populate('userId', 'name email')
      .populate('cautionFeeRefund.processedBy', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (!payment.cautionFeeRefund) {
      return res.status(404).json({
        success: false,
        message: 'No caution fee refund history found for this payment'
      });
    }

    res.json({
      success: true,
      refundDetails: payment.cautionFeeRefund,
      paymentDetails: {
        transactionId: payment.transactionId,
        customerName: payment.bookingId.customerName,
        customerEmail: payment.userId.email,
        hallName: payment.bookingId.hallId?.name,
        originalCautionFee: payment.cautionFee
      }
    });

  } catch (error) {
    console.error('Get caution fee refund history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch caution fee refund history'
    });
  }
};

/**
 * Update existing caution fee refund
 */
export const updateCautionFeeRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { 
      refundAmount, 
      damageCharges, 
      refundReason, 
      damageDescription,
      sendEmailNotification = true 
    } = req.body;

    const payment = await Payment.findOne({ transactionId })
      .populate('userId', 'name email')
      .populate({
        path: 'bookingId',
        populate: {
          path: 'hallId',
          select: 'name'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (!payment.cautionFeeRefund) {
      return res.status(400).json({
        success: false,
        message: 'No caution fee refund found to update'
      });
    }

    // Validate amounts
    const originalCautionFee = payment.cautionFee || 0;
    if (refundAmount > originalCautionFee) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed original caution fee`
      });
    }

    if (damageCharges > originalCautionFee) {
      return res.status(400).json({
        success: false,
        message: `Damage charges cannot exceed original caution fee`
      });
    }

    // Update refund details
    payment.cautionFeeRefund.refundedAmount = refundAmount;
    payment.cautionFeeRefund.damageCharges = damageCharges;
    payment.cautionFeeRefund.refundReason = refundReason;
    payment.cautionFeeRefund.damageDescription = damageDescription;
    payment.cautionFeeRefund.processedBy = req.user._id;
    payment.cautionFeeRefund.processedAt = new Date();

    // Update refund status
    if (refundAmount === 0) {
      payment.cautionFeeRefund.refundStatus = 'none';
    } else if (refundAmount === originalCautionFee) {
      payment.cautionFeeRefund.refundStatus = 'full';
    } else {
      payment.cautionFeeRefund.refundStatus = 'partial';
    }

    // Recalculate overall refund amount
    payment.refundAmount = (payment.refundAmount || 0) - (payment.cautionFeeRefund.refundedAmount || 0) + refundAmount;
    payment.refundAmount = Math.max(0, payment.refundAmount); // Ensure non-negative

    await payment.save();

    // Send email notification if requested
    if (sendEmailNotification && payment.userId.email) {
      try {
        await sendCautionFeeRefund(payment.userId.email, {
          customerName: payment.bookingId.customerName,
          transactionId: payment.transactionId,
          originalAmount: originalCautionFee,
          refundAmount: refundAmount,
          damageCharges: damageCharges,
          reason: refundReason,
          damageDescription: damageDescription
        });
      } catch (emailError) {
        console.error('Failed to send updated caution fee refund email:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Caution fee refund updated successfully',
      payment: payment
    });

  } catch (error) {
    console.error('Update caution fee refund error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update caution fee refund'
    });
  }
};