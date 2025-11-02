// import mongoose from 'mongoose';
// import { createNotification } from "../utils/userNotification.js";

// const paymentSchema = new mongoose.Schema(
//   {
//     bookingId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Booking',
//       required: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     transactionId: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     referenceNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     method: {
//       type: String,
//       enum: ['card', 'transfer'],
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
//       default: 'pending',
//     },
//     // Card payment details
//     cardDetails: {
//       last4Digits: String,
//       cardType: String,
//       expiryMonth: String,
//       expiryYear: String,
//       cardholderName: String,
//     },
//     transferDetails: {
//       accountName: String,
//       accountNumber: String,
//       bankName: String,
//       transferProof: String,
//       verificationStatus: {
//         type: String,
//         enum: ['pending', 'verified', 'rejected'],
//         default: 'pending',
//       },
//       verifiedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//       },
//       verifiedAt: Date,
//       rejectionReason: String,
//     },
//     // Payment gateway response
//     gatewayResponse: {
//       gatewayTransactionId: String,
//       gatewayReference: String,
//       gatewayStatus: String,
//       gatewayMessage: String,
//       gatewayData: mongoose.Schema.Types.Mixed,
//     },
//     // Fees and charges
//     processingFee: {
//       type: Number,
//       default: 0,
//     },
//     gatewayFee: {
//       type: Number,
//       default: 0,
//     },
//     netAmount: {
//       type: Number,
//       required: true,
//     },
//     // Refund information
//     refundAmount: {
//       type: Number,
//       default: 0,
//     },
//     refundStatus: {
//       type: String,
//       enum: ['none', 'partial', 'full', 'processing', 'failed'],
//       default: 'none',
//     },
//     refundReference: String,
//     refundDate: Date,
//     // Metadata
//     ipAddress: String,
//     userAgent: String,
//     metadata: mongoose.Schema.Types.Mixed,
//   },
//   { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
//   }
// );

// // Indexes for efficient queries
// paymentSchema.index({ bookingId: 1 });
// paymentSchema.index({ userId: 1, createdAt: -1 });
// paymentSchema.index({ status: 1, method: 1 });
// paymentSchema.index({ 'transferDetails.verificationStatus': 1 });

// // Virtual for formatted amount
// paymentSchema.virtual('formattedAmount').get(function() {
//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(this.amount);
// });

// // NEW: Virtual for gross revenue (amount + refunds - this represents total booking value)
// paymentSchema.virtual('grossRevenue').get(function() {
//   return this.amount + this.refundAmount;
// });

// // NEW: Virtual for total fees (gateway + processing fees)
// paymentSchema.virtual('totalFees').get(function() {
//   return (this.gatewayFee || 0) + (this.processingFee || 0);
// });

// // NEW: Virtual for net revenue (gross revenue minus all fees and refunds)
// paymentSchema.virtual('netRevenue').get(function() {
//   return this.grossRevenue - this.totalFees - this.refundAmount;
// });

// // NEW: Virtual for fee percentage (useful for analytics)
// paymentSchema.virtual('feePercentage').get(function() {
//   if (!this.amount || this.amount === 0) return 0;
//   return ((this.totalFees / this.amount) * 100).toFixed(2);
// });

// // NEW: Virtual for net revenue percentage
// paymentSchema.virtual('netRevenuePercentage').get(function() {
//   if (!this.grossRevenue || this.grossRevenue === 0) return 0;
//   return ((this.netRevenue / this.grossRevenue) * 100).toFixed(2);
// });

// // NEW: Virtual for formatted values
// paymentSchema.virtual('formattedGrossRevenue').get(function() {
//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(this.grossRevenue);
// });

// paymentSchema.virtual('formattedTotalFees').get(function() {
//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(this.totalFees);
// });

// paymentSchema.virtual('formattedNetRevenue').get(function() {
//   return new Intl.NumberFormat('en-NG', {
//     style: 'currency',
//     currency: 'NGN',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(this.netRevenue);
// });

// // NEW: Instance method to calculate revenue breakdown
// paymentSchema.methods.getRevenueBreakdown = function() {
//   return {
//     grossRevenue: this.grossRevenue,
//     gatewayFee: this.gatewayFee,
//     processingFee: this.processingFee,
//     totalFees: this.totalFees,
//     refundAmount: this.refundAmount,
//     netRevenue: this.netRevenue,
//     feePercentage: this.feePercentage,
//     netRevenuePercentage: this.netRevenuePercentage,
//     formatted: {
//       grossRevenue: this.formattedGrossRevenue,
//       totalFees: this.formattedTotalFees,
//       netRevenue: this.formattedNetRevenue,
//       amount: this.formattedAmount
//     }
//   };
// };

// // NEW: Static method to get payment statistics
// paymentSchema.statics.getRevenueStats = async function(filters = {}) {
//   const query = { status: 'completed', ...filters };
  
//   const payments = await this.find(query);
  
//   const stats = {
//     totalPayments: payments.length,
//     grossRevenue: payments.reduce((sum, payment) => sum + payment.grossRevenue, 0),
//     gatewayCharges: payments.reduce((sum, payment) => sum + (payment.gatewayFee || 0), 0),
//     processingFees: payments.reduce((sum, payment) => sum + (payment.processingFee || 0), 0),
//     refundAmount: payments.reduce((sum, payment) => sum + (payment.refundAmount || 0), 0),
//     cardPayments: payments.filter(p => p.method === 'card').length,
//     transferPayments: payments.filter(p => p.method === 'transfer').length,
//   };

//   // Calculate derived stats
//   stats.totalFees = stats.gatewayCharges + stats.processingFees;
//   stats.netRevenue = stats.grossRevenue - stats.totalFees - stats.refundAmount;
  
//   // Calculate percentages
//   stats.feePercentage = stats.grossRevenue > 0 ? ((stats.totalFees / stats.grossRevenue) * 100).toFixed(2) : 0;
//   stats.netRevenuePercentage = stats.grossRevenue > 0 ? ((stats.netRevenue / stats.grossRevenue) * 100).toFixed(2) : 0;

//   return stats;
// };

// // Notification Hooks
// paymentSchema.post("save", async function (doc) {
//   try {
//     if (doc.isNew) {
//       await createNotification(
//         doc.userId,
//         "Payment Initiated",
//         `Your payment of ₦${doc.amount} is being processed.`,
//         "info"
//       );
//     }
//   } catch (err) {
//     console.error("Payment init notification error:", err.message);
//   }
// });

// paymentSchema.post("findOneAndUpdate", async function (doc) {
//   try {
//     if (!doc) return;

//     const status = this._update.status;
//     if (status === "completed") {
//       await createNotification(
//         doc.userId,
//         "Payment Successful",
//         `Your payment of ₦${doc.amount} was successful.`,
//         "success"
//       );
//     } else if (status === "failed" || status === "cancelled") {
//       await createNotification(
//         doc.userId,
//         "Payment Failed",
//         `Your payment of ₦${doc.amount} has failed or was cancelled.`,
//         "error"
//       );
//     }
//   } catch (err) {
//     console.error("Payment status notification error:", err.message);
//   }
// });

// const Payment = mongoose.model('Payment', paymentSchema);
// export default Payment;




import mongoose from 'mongoose';
import { createNotification } from "../utils/userNotification.js";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['card', 'transfer'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    
    // NEW: Caution fee tracking
    cautionFee: {
      type: Number,
      default: 0,
    },
    
    // Card payment details
    cardDetails: {
      last4Digits: String,
      cardType: String,
      expiryMonth: String,
      expiryYear: String,
      cardholderName: String,
    },
    transferDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      transferProof: String,
      verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      rejectionReason: String,
    },
    
    // Payment gateway response
    gatewayResponse: {
      gatewayTransactionId: String,
      gatewayReference: String,
      gatewayStatus: String,
      gatewayMessage: String,
      gatewayData: mongoose.Schema.Types.Mixed,
    },
    
    // Fees and charges
    processingFee: {
      type: Number,
      default: 0,
    },
    gatewayFee: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    
    // Refund information - ENHANCED for caution fee refunds
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ['none', 'partial', 'full', 'processing', 'failed'],
      default: 'none',
    },
    refundReference: String,
    refundDate: Date,
    
    // NEW: Caution fee refund details
    cautionFeeRefund: {
      originalCautionFee: {
        type: Number,
        default: 0,
      },
      refundedAmount: {
        type: Number,
        default: 0,
      },
      damageCharges: {
        type: Number,
        default: 0,
      },
      refundStatus: {
        type: String,
        enum: ['pending', 'processed', 'not_eligible', 'full', 'partial', 'none'],
        default: 'pending',
      },
      processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      processedAt: Date,
      refundReason: String,
      damageDescription: String,
      // NEW: Track if refund was processed offline
      processedOffline: {
        type: Boolean,
        default: false,
      },
      // NEW: Refund transaction details for tracking
      refundTransactionId: String,
      offlineReference: String,
    },
    
    // Metadata
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, method: 1 });
paymentSchema.index({ 'transferDetails.verificationStatus': 1 });
// NEW: Index for caution fee refund queries
paymentSchema.index({ 'cautionFeeRefund.refundStatus': 1 });
paymentSchema.index({ 'cautionFeeRefund.processedOffline': 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.amount);
});

// NEW: Virtual for formatted caution fee
paymentSchema.virtual('formattedCautionFee').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.cautionFee);
});

// NEW: Virtual for formatted caution fee refund amount
paymentSchema.virtual('formattedCautionFeeRefund').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.cautionFeeRefund.refundedAmount || 0);
});

// NEW: Virtual for formatted damage charges
paymentSchema.virtual('formattedDamageCharges').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.cautionFeeRefund.damageCharges || 0);
});

// NEW: Virtual for caution fee refund status display
paymentSchema.virtual('cautionFeeRefundStatus').get(function() {
  const refund = this.cautionFeeRefund;
  if (!refund || refund.refundStatus === 'pending') return 'Pending Assessment';
  if (refund.refundStatus === 'not_eligible') return 'Not Eligible';
  if (refund.refundStatus === 'full') return 'Full Refund';
  if (refund.refundStatus === 'partial') return 'Partial Refund';
  if (refund.refundStatus === 'none') return 'No Refund';
  return 'Processed';
});

// UPDATED: Virtual for gross revenue (amount + refunds - this represents total booking value)
// Now includes caution fee in the calculation
paymentSchema.virtual('grossRevenue').get(function() {
  const baseRevenue = this.amount + this.refundAmount;
  // Include caution fee in gross revenue calculation
  const cautionFeeAmount = this.cautionFee || 0;
  const cautionFeeRefund = this.cautionFeeRefund?.refundedAmount || 0;
  
  return baseRevenue + cautionFeeAmount - cautionFeeRefund;
});

// UPDATED: Virtual for total fees (gateway + processing fees + damage charges)
paymentSchema.virtual('totalFees').get(function() {
  const standardFees = (this.gatewayFee || 0) + (this.processingFee || 0);
  const damageCharges = this.cautionFeeRefund?.damageCharges || 0;
  return standardFees + damageCharges;
});

// UPDATED: Virtual for net revenue (gross revenue minus all fees, refunds, and damage charges)
paymentSchema.virtual('netRevenue').get(function() {
  const cautionFeeRefund = this.cautionFeeRefund?.refundedAmount || 0;
  const damageCharges = this.cautionFeeRefund?.damageCharges || 0;
  
  return this.grossRevenue - this.totalFees - this.refundAmount - cautionFeeRefund - damageCharges;
});

// UPDATED: Virtual for fee percentage (useful for analytics)
paymentSchema.virtual('feePercentage').get(function() {
  if (!this.grossRevenue || this.grossRevenue === 0) return 0;
  return ((this.totalFees / this.grossRevenue) * 100).toFixed(2);
});

// UPDATED: Virtual for net revenue percentage
paymentSchema.virtual('netRevenuePercentage').get(function() {
  if (!this.grossRevenue || this.grossRevenue === 0) return 0;
  return ((this.netRevenue / this.grossRevenue) * 100).toFixed(2);
});

// NEW: Virtual for caution fee refund percentage
paymentSchema.virtual('cautionFeeRefundPercentage').get(function() {
  const originalCaution = this.cautionFeeRefund?.originalCautionFee || this.cautionFee || 0;
  const refundedAmount = this.cautionFeeRefund?.refundedAmount || 0;
  
  if (!originalCaution || originalCaution === 0) return '0%';
  const percentage = (refundedAmount / originalCaution) * 100;
  return `${percentage.toFixed(1)}%`;
});

// UPDATED: Virtual for formatted values
paymentSchema.virtual('formattedGrossRevenue').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.grossRevenue);
});

paymentSchema.virtual('formattedTotalFees').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.totalFees);
});

paymentSchema.virtual('formattedNetRevenue').get(function() {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(this.netRevenue);
});

// NEW: Virtual for formatted caution fee breakdown
paymentSchema.virtual('formattedCautionFeeBreakdown').get(function() {
  const refund = this.cautionFeeRefund;
  const original = refund?.originalCautionFee || this.cautionFee || 0;
  const refunded = refund?.refundedAmount || 0;
  const damage = refund?.damageCharges || 0;
  
  return {
    original: new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(original),
    refunded: new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(refunded),
    damage: new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(damage),
    retained: new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(original - refunded)
  };
});

// UPDATED: Instance method to calculate revenue breakdown - now includes caution fee
paymentSchema.methods.getRevenueBreakdown = function() {
  const cautionRefund = this.cautionFeeRefund || {};
  
  return {
    // Core revenue metrics
    grossRevenue: this.grossRevenue,
    gatewayFee: this.gatewayFee,
    processingFee: this.processingFee,
    totalFees: this.totalFees,
    refundAmount: this.refundAmount,
    netRevenue: this.netRevenue,
    feePercentage: this.feePercentage,
    netRevenuePercentage: this.netRevenuePercentage,
    
    // NEW: Caution fee specific metrics
    cautionFee: this.cautionFee || 0,
    cautionFeeRefund: cautionRefund.refundedAmount || 0,
    damageCharges: cautionRefund.damageCharges || 0,
    cautionFeeRefundPercentage: this.cautionFeeRefundPercentage,
    
    formatted: {
      grossRevenue: this.formattedGrossRevenue,
      totalFees: this.formattedTotalFees,
      netRevenue: this.formattedNetRevenue,
      amount: this.formattedAmount,
      // NEW: Formatted caution fee values
      cautionFee: this.formattedCautionFee,
      cautionFeeRefund: this.formattedCautionFeeRefund,
      damageCharges: this.formattedDamageCharges,
      cautionFeeBreakdown: this.formattedCautionFeeBreakdown
    }
  };
};

// NEW: Instance method to process caution fee refund offline
paymentSchema.methods.processCautionFeeRefund = function(refundData, processedBy) {
  const {
    refundAmount,
    damageCharges,
    refundReason,
    damageDescription,
    processedOffline = true
  } = refundData;

  // Validate refund amount
  const originalCautionFee = this.cautionFee || 0;
  if (refundAmount > originalCautionFee) {
    throw new Error('Refund amount cannot exceed original caution fee');
  }

  if (damageCharges > originalCautionFee) {
    throw new Error('Damage charges cannot exceed original caution fee');
  }

  // Determine refund status
  let refundStatus;
  if (refundAmount === 0) {
    refundStatus = 'none';
  } else if (refundAmount === originalCautionFee) {
    refundStatus = 'full';
  } else {
    refundStatus = 'partial';
  }

  // Update caution fee refund details
  this.cautionFeeRefund = {
    originalCautionFee: originalCautionFee,
    refundedAmount: refundAmount,
    damageCharges: damageCharges,
    refundStatus: refundStatus,
    processedBy: processedBy,
    processedAt: new Date(),
    refundReason: refundReason,
    damageDescription: damageDescription,
    processedOffline: processedOffline,
    refundTransactionId: `CFR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    offlineReference: `CF_REF_${Date.now()}`
  };

  // Update overall refund amount to include caution fee refund
  this.refundAmount = (this.refundAmount || 0) + refundAmount;
  
  if (refundAmount > 0) {
    this.refundStatus = this.refundStatus === 'none' ? 'partial' : this.refundStatus;
  }

  return this;
};

// NEW: Instance method to check if caution fee refund is eligible
paymentSchema.methods.isCautionFeeRefundEligible = function() {
  // Caution fee refund is eligible if:
  // 1. Payment is completed
  // 2. Caution fee exists and is greater than 0
  // 3. Caution fee refund hasn't been processed yet or is pending
  return this.status === 'completed' && 
         (this.cautionFee || 0) > 0 && 
         (!this.cautionFeeRefund || 
          this.cautionFeeRefund.refundStatus === 'pending');
};

// UPDATED: Static method to get payment statistics - now includes caution fee metrics
paymentSchema.statics.getRevenueStats = async function(filters = {}) {
  const query = { status: 'completed', ...filters };
  
  const payments = await this.find(query);
  
  const stats = {
    totalPayments: payments.length,
    grossRevenue: payments.reduce((sum, payment) => sum + payment.grossRevenue, 0),
    gatewayCharges: payments.reduce((sum, payment) => sum + (payment.gatewayFee || 0), 0),
    processingFees: payments.reduce((sum, payment) => sum + (payment.processingFee || 0), 0),
    refundAmount: payments.reduce((sum, payment) => sum + (payment.refundAmount || 0), 0),
    cardPayments: payments.filter(p => p.method === 'card').length,
    transferPayments: payments.filter(p => p.method === 'transfer').length,
    
    // NEW: Caution fee statistics
    totalCautionFees: payments.reduce((sum, payment) => sum + (payment.cautionFee || 0), 0),
    totalCautionFeeRefunds: payments.reduce((sum, payment) => sum + (payment.cautionFeeRefund?.refundedAmount || 0), 0),
    totalDamageCharges: payments.reduce((sum, payment) => sum + (payment.cautionFeeRefund?.damageCharges || 0), 0),
    pendingCautionFeeRefunds: payments.filter(p => p.isCautionFeeRefundEligible()).length,
  };

  // Calculate derived stats - UPDATED to include caution fee metrics
  stats.totalFees = stats.gatewayCharges + stats.processingFees + stats.totalDamageCharges;
  stats.netRevenue = stats.grossRevenue - stats.totalFees - stats.refundAmount;
  
  // Calculate percentages
  stats.feePercentage = stats.grossRevenue > 0 ? ((stats.totalFees / stats.grossRevenue) * 100).toFixed(2) : 0;
  stats.netRevenuePercentage = stats.grossRevenue > 0 ? ((stats.netRevenue / stats.grossRevenue) * 100).toFixed(2) : 0;

  // NEW: Caution fee refund percentage
  stats.cautionFeeRefundPercentage = stats.totalCautionFees > 0 ? 
    ((stats.totalCautionFeeRefunds / stats.totalCautionFees) * 100).toFixed(2) : 0;

  return stats;
};

// NEW: Static method to get payments eligible for caution fee refund
paymentSchema.statics.getEligibleCautionFeeRefunds = async function(filters = {}) {
  const query = { 
    status: 'completed',
    cautionFee: { $gt: 0 },
    $or: [
      { 'cautionFeeRefund': { $exists: false } },
      { 'cautionFeeRefund.refundStatus': 'pending' }
    ],
    ...filters 
  };

  return await this.find(query)
    .populate('userId', 'name email')
    .populate({
      path: 'bookingId',
      populate: {
        path: 'hallId',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });
};

// Notification Hooks - UPDATED to include caution fee refund notifications
paymentSchema.post("save", async function (doc) {
  try {
    if (doc.isNew) {
      await createNotification(
        doc.userId,
        "Payment Initiated",
        `Your payment of ₦${doc.amount} is being processed.`,
        "info"
      );
    }
    
    // NEW: Notification for caution fee refund processing
    if (doc.cautionFeeRefund && doc.cautionFeeRefund.processedAt) {
      const refund = doc.cautionFeeRefund;
      let message, type;
      
      if (refund.refundStatus === 'full') {
        message = `Your full caution fee of ₦${refund.originalCautionFee} has been refunded.`;
        type = 'success';
      } else if (refund.refundStatus === 'partial') {
        message = `Partial caution fee refund of ₦${refund.refundedAmount} processed. Damage charges: ₦${refund.damageCharges}.`;
        type = 'info';
      } else if (refund.refundStatus === 'none') {
        message = `Caution fee of ₦${refund.originalCautionFee} retained due to damage charges.`;
        type = 'warning';
      }
      
      if (message) {
        await createNotification(
          doc.userId,
          "Caution Fee Refund Processed",
          message,
          type
        );
      }
    }
  } catch (err) {
    console.error("Payment init notification error:", err.message);
  }
});

paymentSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) return;

    const status = this._update.status;
    if (status === "completed") {
      await createNotification(
        doc.userId,
        "Payment Successful",
        `Your payment of ₦${doc.amount} was successful.`,
        "success"
      );
    } else if (status === "failed" || status === "cancelled") {
      await createNotification(
        doc.userId,
        "Payment Failed",
        `Your payment of ₦${doc.amount} has failed or was cancelled.`,
        "error"
      );
    }
  } catch (err) {
    console.error("Payment status notification error:", err.message);
  }
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;