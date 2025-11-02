import express from 'express';
import {
  processPayment,
  verifyPayment,
  uploadTransferProof,
  getReceipt,
  sendReceiptEmail,
  downloadReceipt,
  getPaymentByReference,
  handlePaymentCallback,
  verifyTransferPayment,
  getAllPayments,
  paymentWebhook,
  recordOfflinePayment,
  getPendingTransferProofs,
  getPaymentStats,

  //Caution Fees
  processCautionFeeRefund,
  getEligibleCautionFeeRefunds,
  getCautionFeeRefundStats,
  getCautionFeeRefundHistory,
  updateCautionFeeRefund
} from '../controllers/hallPaymentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrict } from '../middlewares/roleMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';
import {
  validatePaymentData,
  checkDuplicatePayment,
  validateBookingForPayment,
  paymentRateLimit,
  logPaymentAttempt,
  sanitizePaymentResponse
} from '../middlewares/paymentMiddleware.js';

const router = express.Router();

// Public routes
router.post('/webhook', paymentWebhook);

router.get('/callback', handlePaymentCallback);

// Protected routes (require authentication)
router.use(protect);

// Apply sanitization to all routes from this point
router.use(sanitizePaymentResponse);

// Customer routes
router.post('/process', 
  paymentRateLimit,
  logPaymentAttempt,
  validatePaymentData,
  checkDuplicatePayment,
  validateBookingForPayment,
  processPayment
);

router.get('/verify/:transactionId', verifyPayment);

router.get('/reference/:reference', getPaymentByReference);

router.get('/receipt/:transactionId', getReceipt);

router.post('/receipt/email', sendReceiptEmail);

// Download receipt as PDF
router.get('/receipt/:transactionId/download', downloadReceipt);

router.post('/transfer-proof/:transactionId', 
  upload.single('proof'), 
  uploadTransferProof
);

// Admin/Staff routes
router.use(restrict('admin', 'staff'));

router.get('/all', getAllPayments);

router.get('/stats', getPaymentStats);

router.put('/verify-transfer/:transactionId', verifyTransferPayment);

router.post('/record-offline', recordOfflinePayment);

router.get('/pending-transfer-proofs', getPendingTransferProofs);

// Get payments eligible for caution fee refund
router.get('/caution-refund/eligible', getEligibleCautionFeeRefunds);

// Get caution fee refund statistics
router.get('/caution-refund/stats', getCautionFeeRefundStats);

// Process caution fee refund for a specific payment
router.post('/caution-refund/process/:transactionId', processCautionFeeRefund);

// Update existing caution fee refund
router.put('/caution-refund/update/:transactionId', updateCautionFeeRefund);

// Get caution fee refund history for a payment
router.get('/caution-refund/history/:transactionId', getCautionFeeRefundHistory);

export default router;