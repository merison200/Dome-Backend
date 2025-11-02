// import cron from 'node-cron';
// import Booking from '../models/hallBooking.js';
// import { sendBookingReminder } from '../utils/hallBookingEmail.js';

// /**
//  * Send booking reminders
//  * Runs daily at 9:00 AM
//  */
// export const setupBookingReminders = () => {
//   cron.schedule('0 9 * * *', async () => {
//     console.log('Running booking reminder job...');
    
//     try {
//       const today = new Date();
//       const threeDaysFromNow = new Date();
//       threeDaysFromNow.setDate(today.getDate() + 3);
      
//       const oneDayFromNow = new Date();
//       oneDayFromNow.setDate(today.getDate() + 1);
      
//       // Find bookings with events in 3 days or 1 day
//       const upcomingBookings = await Booking.find({
//         status: 'confirmed',
//         eventDates: {
//           $elemMatch: {
//             $gte: oneDayFromNow,
//             $lte: threeDaysFromNow
//           }
//         }
//       })
//       .populate('userId', 'name email')
//       .populate('hallId', 'name');
      
//       for (const booking of upcomingBookings) {
//         const nextEventDate = booking.eventDates
//           .filter(date => date >= today)
//           .sort((a, b) => a - b)[0];
        
//         if (nextEventDate) {
//           const daysUntilEvent = Math.ceil((nextEventDate - today) / (1000 * 60 * 60 * 24));
          
//           // Send reminder for 3 days and 1 day before event
//           if (daysUntilEvent === 3 || daysUntilEvent === 1) {
//             try {
//               await sendBookingReminder(booking.userId.email, {
//                 customerName: booking.userId.name,
//                 hallName: booking.hallId.name,
//                 bookingId: booking._id,
//                 eventDate: nextEventDate,
//                 daysUntilEvent
//               });
              
//               console.log(`Reminder sent for booking ${booking._id} (${daysUntilEvent} days)`);
//             } catch (emailError) {
//               console.error(`Failed to send reminder for booking ${booking._id}:`, emailError);
//             }
//           }
//         }
//       }
      
//       console.log(`Processed ${upcomingBookings.length} upcoming bookings`);
//     } catch (error) {
//       console.error('Booking reminder job failed:', error);
//     }
//   });
// };

// /**
//  * Update booking statuses
//  * Runs daily at midnight
//  */
// export const setupBookingStatusUpdates = () => {
//   cron.schedule('0 0 * * *', async () => {
//     console.log('Running booking status update job...');
    
//     try {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
      
//       // Mark bookings as completed if all event dates have passed
//       const completedBookings = await Booking.updateMany(
//         {
//           status: 'confirmed',
//           eventDates: { $not: { $elemMatch: { $gte: today } } }
//         },
//         { status: 'completed' }
//       );
      
//       console.log(`Marked ${completedBookings.modifiedCount} bookings as completed`);
      
//       // Cancel pending bookings that are past their event dates
//       const cancelledBookings = await Booking.updateMany(
//         {
//           status: 'pending',
//           eventDates: { $not: { $elemMatch: { $gte: today } } }
//         },
//         { status: 'cancelled' }
//       );
      
//       console.log(`Cancelled ${cancelledBookings.modifiedCount} expired pending bookings`);
      
//     } catch (error) {
//       console.error('Booking status update job failed:', error);
//     }
//   });
// };

// /**
//  * Cancel pending bookings after 1 hour
//  * Runs every 20 minutes
//  */
// export const setupPendingBookingAutoCancel = () => {
//   cron.schedule('*/20 * * * *', async () => {
//     console.log('Running auto-cancel for pending bookings...');

//     const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

//     try {
//       const result = await Booking.updateMany(
//         {
//           status: 'pending',
//           createdAt: { $lt: oneHourAgo }
//         },
//         { status: 'cancelled' }
//       );

//       console.log(`Auto-cancelled ${result.modifiedCount} pending bookings`);
//     } catch (error) {
//       console.error('Failed to auto-cancel pending bookings:', error);
//     }
//   });
// };


// /**
//  * Initialize all cron jobs
//  */
// export const initializeCronJobs = () => {
//   setupBookingReminders();
//   setupBookingStatusUpdates();
//   setupPendingBookingAutoCancel();
//   console.log('Cron jobs initialized successfully');
// };



import cron from 'node-cron';
import Booking from '../models/hallBooking.js';
import Payment from '../models/hallPayment.js';
import { sendBookingReminder, sendBookingCancellation } from '../utils/hallBookingEmail.js';

/**
 * Send booking reminders
 * Runs daily at 9:00 AM
 */
export const setupBookingReminders = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running booking reminder job...');
    
    try {
      const today = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      const oneDayFromNow = new Date();
      oneDayFromNow.setDate(today.getDate() + 1);
      
      // Find bookings with events in 3 days or 1 day
      const upcomingBookings = await Booking.find({
        status: 'confirmed',
        eventDates: {
          $elemMatch: {
            $gte: oneDayFromNow,
            $lte: threeDaysFromNow
          }
        }
      })
      .populate('userId', 'name email')
      .populate('hallId', 'name');
      
      for (const booking of upcomingBookings) {
        const nextEventDate = booking.eventDates
          .filter(date => date >= today)
          .sort((a, b) => a - b)[0];
        
        if (nextEventDate) {
          const daysUntilEvent = Math.ceil((nextEventDate - today) / (1000 * 60 * 60 * 24));
          
          // Send reminder for 3 days and 1 day before event
          if (daysUntilEvent === 3 || daysUntilEvent === 1) {
            try {
              await sendBookingReminder(booking.userId.email, {
                customerName: booking.userId.name,
                hallName: booking.hallId.name,
                bookingId: booking._id,
                eventDate: nextEventDate,
                daysUntilEvent
              });
              
              console.log(`Reminder sent for booking ${booking._id} (${daysUntilEvent} days)`);
            } catch (emailError) {
              console.error(`Failed to send reminder for booking ${booking._id}:`, emailError);
            }
          }
        }
      }
      
      console.log(`Processed ${upcomingBookings.length} upcoming bookings`);
    } catch (error) {
      console.error('Booking reminder job failed:', error);
    }
  });
  
  console.log('Booking reminder job scheduled (runs daily at 9:00 AM)');
};

/**
 * Update booking statuses
 * Runs daily at midnight
 */
export const setupBookingStatusUpdates = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running booking status update job...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Mark confirmed bookings as completed
      const confirmedBookingsToComplete = await Booking.find({
        status: 'confirmed',
        eventDates: { $not: { $elemMatch: { $gte: today } } }
      });

      let completedCount = 0;
      for (const booking of confirmedBookingsToComplete) {
        booking.status = 'completed';
        // Payment status stays as 'paid' - no change needed
        await booking.save();
        completedCount++;
      }
      
      console.log(`Marked ${completedCount} bookings as completed`);
      
      // Cancel expired pending bookings
      const expiredPendingBookings = await Booking.find({
        status: 'pending',
        eventDates: { $not: { $elemMatch: { $gte: today } } }
      })
      .populate('userId', 'name email')
      .populate('hallId', 'name');

      let cancelledCount = 0;
      for (const booking of expiredPendingBookings) {
        // Update booking
        booking.status = 'cancelled';
        booking.paymentStatus = 'failed';
        booking.cancelledBy = 'system';
        booking.cancelledAt = new Date();
        booking.refundReason = 'Event date passed without payment completion';
        booking.refundAmount = 0;
        await booking.save();

        // Update payment if exists
        const payment = await Payment.findOne({ bookingId: booking._id });
        if (payment) {
          payment.status = 'cancelled';
          payment.refundStatus = 'none';
          payment.refundAmount = 0;
          
          if (!payment.metadata) {
            payment.metadata = {};
          }
          payment.metadata.cancellationReason = 'Event date passed without payment';
          payment.metadata.cancelledBy = 'system';
          payment.metadata.cancelledAt = new Date();
          payment.metadata.autoExpired = true;
          
          await payment.save();
        }

        // Send notification email
        try {
          if (booking.userId && booking.userId.email) {
            await sendBookingCancellation(booking.userId.email, {
              customerName: booking.userId.name || booking.customerName,
              hallName: booking.hallId?.name || 'Event Hall',
              bookingId: booking._id,
              refundAmount: 0,
              eventDates: booking.eventDates,
              reason: 'Your booking was automatically cancelled because the event date has passed without payment completion.'
            });
          }
        } catch (emailError) {
          console.error(`Failed to send cancellation email for booking ${booking._id}:`, emailError.message);
        }

        cancelledCount++;
      }
      
      console.log(`Cancelled ${cancelledCount} expired pending bookings`);
      console.log('Booking status update job completed');
      
    } catch (error) {
      console.error('Booking status update job failed:', error);
    }
  });
  
  console.log('Booking status update job scheduled (runs daily at midnight)');
};

/**
 * Cancel pending bookings after 1 hour of creation
 * Runs every 20 minutes
 */
export const setupPendingBookingAutoCancel = () => {
  cron.schedule('*/20 * * * *', async () => {
    console.log('Running auto-cancel for pending bookings...');

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

    try {
      // Find pending bookings older than 1 hour
      const pendingBookings = await Booking.find({
        status: 'pending',
        createdAt: { $lt: oneHourAgo }
      })
      .populate('userId', 'name email')
      .populate('hallId', 'name');

      let cancelledCount = 0;

      // Process each booking individually
      for (const booking of pendingBookings) {
        try {
          // Update booking status
          booking.status = 'cancelled';
          booking.paymentStatus = 'failed';
          booking.cancelledBy = 'system';
          booking.cancelledAt = new Date();
          booking.refundReason = 'Payment not completed within 1 hour';
          booking.refundAmount = 0; // No refund for unpaid bookings
          
          await booking.save();

          // Update associated payment if exists
          const payment = await Payment.findOne({ bookingId: booking._id });
          
          if (payment) {
            payment.status = 'cancelled';
            payment.refundStatus = 'none';
            payment.refundAmount = 0;
            
            // Add cancellation metadata
            if (!payment.metadata) {
              payment.metadata = {};
            }
            payment.metadata.cancellationReason = 'Auto-cancelled: Payment not completed within 1 hour';
            payment.metadata.cancelledBy = 'system';
            payment.metadata.cancelledAt = new Date();
            payment.metadata.autoCancelled = true;
            
            await payment.save();
          }

          // Send cancellation email to customer
          try {
            if (booking.userId && booking.userId.email) {
              await sendBookingCancellation(booking.userId.email, {
                customerName: booking.userId.name || booking.customerName,
                hallName: booking.hallId?.name || 'Event Hall',
                bookingId: booking._id,
                refundAmount: 0,
                eventDates: booking.eventDates,
                reason: 'Your booking was automatically cancelled because payment was not completed within 1 hour of booking creation.'
              });
            }
          } catch (emailError) {
            console.error(`Failed to send cancellation email for booking ${booking._id}:`, emailError.message);
          }

          cancelledCount++;
          console.log(`Auto-cancelled booking ${booking._id}`);

        } catch (bookingError) {
          console.error(`Failed to cancel booking ${booking._id}:`, bookingError.message);
        }
      }

      if (cancelledCount > 0) {
        console.log(`Auto-cancelled ${cancelledCount} pending booking(s)`);
      } else {
        console.log('No pending bookings to cancel');
      }

    } catch (error) {
      console.error('Failed to auto-cancel pending bookings:', error);
    }
  });
  
  console.log('Auto-cancel job scheduled (runs every 20 minutes)');
};

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  console.log('Initializing cron jobs...');
  setupBookingReminders();
  setupBookingStatusUpdates();
  setupPendingBookingAutoCancel();
  console.log('All cron jobs initialized successfully');
};