import mongoose from 'mongoose';
import { createNotification } from "../utils/userNotification.js";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    eventDates: [{
      type: Date,
      required: true,
    }],
    additionalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    banquetChairs: {
      type: Number,
      default: 0,
      min: 0,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    additionalHoursPrice: {
      type: Number,
      default: 0,
    },
    banquetChairsPrice: {
      type: Number,
      default: 0,
    },
    cautionFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    eventType: {
      type: String,
      enum: ['wedding', 'burial', 'birthday', 'corporate', 'conference', 'graduation', 'anniversary', 'baby-shower', 'religious', 'other'],
    },
    specialRequests: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    bookingType: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
    cancellationDeadline: {
      type: Date,
      required: true,
    },
    paymentReference: {
      type: String,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'system'],
    },
    cancelledAt: {
      type: Date,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if booking can be cancelled
bookingSchema.virtual('canCancel').get(function() {
  return new Date() < this.cancellationDeadline && this.status === 'confirmed';
});

// Index for efficient queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ hallId: 1, eventDates: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });

// When a booking is created
bookingSchema.post("save", async function (doc) {
  try {
    if (doc.isNew) {
      await createNotification(
        doc.userId,
        "Booking Created",
        `Your booking for hall ${doc.hallId} has been created and is currently pending.`,
        "info"
      );
    }
  } catch (error) {
    console.error("Booking create notification failed:", error.message);
  }
});

// When booking status changes (confirmed, cancelled, completed)
bookingSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) return;

    const { status } = this._update;

    if (status === "confirmed") {
      await createNotification(
        doc.userId,
        "Booking Confirmed",
        `Your booking for hall ${doc.hallId} has been confirmed.`,
        "success"
      );
    }

    if (status === "cancelled") {
      await createNotification(
        doc.userId,
        "Booking Cancelled",
        `Your booking for hall ${doc.hallId} has been cancelled.`,
        "warning"
      );
    }

    if (status === "completed") {
      await createNotification(
        doc.userId,
        "Booking Completed",
        `Your event booking for hall ${doc.hallId} has been successfully completed.`,
        "success"
      );
    }
  } catch (error) {
    console.error("Booking update notification failed:", error.message);
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;