import sendEmail from './sendEmail.js';
import { 
  bookingConfirmationTemplate, 
  bookingCancellationTemplate,
  bookingReminderTemplate,
  paymentConfirmationTemplate,
  paymentFailureTemplate,
  transferInstructionsTemplate,
  cautionRefundEmail,
} from '../templates/hallBookingEmail.js';

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (email, bookingData) => {
  try {
    const {
      customerName,
      hallName,
      bookingId,
      eventDates,
      totalAmount,
      paymentReference
    } = bookingData;

    const formattedDates = eventDates.map(date => 
      new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ).join(', ');

    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(totalAmount);

    const htmlContent = bookingConfirmationTemplate({
      customerName,
      hallName,
      bookingId,
      eventDates: formattedDates,
      totalAmount: formattedAmount,
      paymentReference
    });

    await sendEmail({
      to: email,
      subject: 'Booking Confirmation - The Dome Event Center',
      html: htmlContent,
      text: `Dear ${customerName}, your booking for ${hallName} (ID: ${bookingId}) has been confirmed for ${formattedDates}. Total amount: ${formattedAmount}. Payment reference: ${paymentReference}.`
    });

    console.log('Booking confirmation email sent to:', email);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    throw error;
  }
};

/**
 * Send booking cancellation email
 */
export const sendBookingCancellation = async (email, cancellationData) => {
  try {
    const {
      customerName,
      hallName,
      bookingId,
      refundAmount,
      eventDates
    } = cancellationData;

    const formattedDates = eventDates.map(date => 
      new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    ).join(', ');

    const formattedRefund = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(refundAmount);

    const htmlContent = bookingCancellationTemplate({
      customerName,
      hallName,
      bookingId,
      eventDates: formattedDates,
      refundAmount: formattedRefund
    });

    await sendEmail({
      to: email,
      subject: 'Booking Cancellation - The Dome Event Center',
      html: htmlContent,
      text: `Dear ${customerName}, your booking for ${hallName} (ID: ${bookingId}) scheduled for ${formattedDates} has been cancelled. Refund amount: ${formattedRefund}.`
    });

    console.log('Booking cancellation email sent to:', email);
  } catch (error) {
    console.error('Failed to send booking cancellation email:', error);
    throw error;
  }
};

/**
 * Send transfer instructions email
 */
export const sendTransferInstructions = async (email, data) => {
  try {
    const html = transferInstructionsTemplate(data);

    await sendEmail({
      to: email,
      subject: 'Bank Transfer Instructions - Complete Your Payment',
      html,
      text: `Dear ${data.customerName}, please complete your payment by transferring ${data.amount} to our account. Reference: ${data.referenceNumber}`
    });

    console.log('Transfer instructions email sent to:', email);
  } catch (error) {
    console.error('Error sending transfer instructions email:', error);
    throw error;
  }
};

/**
 * Send payment failure email
 */
export const sendPaymentFailure = async (email, data) => {
  try {
    const html = paymentFailureTemplate(data);

    await sendEmail({
      to: email,
      subject: 'Payment Issue - Action Required',
      html,
      text: `Dear ${data.customerName}, we encountered an issue with your payment for transaction ID: ${data.transactionId}. Please contact our support team.`
    });

    console.log('Payment failure email sent to:', email);
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    throw error;
  }
};

/**
 * Send booking reminder email
 */
export const sendBookingReminder = async (email, reminderData) => {
  try {
    const {
      customerName,
      hallName,
      bookingId,
      eventDate,
      daysUntilEvent
    } = reminderData;

    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const htmlContent = bookingReminderTemplate({
      customerName,
      hallName,
      bookingId,
      eventDate: formattedDate,
      daysUntilEvent
    });

    await sendEmail({
      to: email,
      subject: `Event Reminder - ${daysUntilEvent} days to go!`,
      html: htmlContent,
      text: `Dear ${customerName}, this is a reminder that your event at ${hallName} (Booking ID: ${bookingId}) is scheduled for ${formattedDate} - only ${daysUntilEvent} days to go!`
    });

    console.log('Booking reminder email sent to:', email);
  } catch (error) {
    console.error('Failed to send booking reminder email:', error);
    throw error;
  }
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmation = async (email, data) => {
  try {
    const html = paymentConfirmationTemplate(data);

    await sendEmail({
      to: email,
      subject: 'Payment Confirmed - Your Booking is Secured!',
      html,
      text: `Dear ${data.customerName}, your payment has been confirmed! Transaction ID: ${data.transactionId}, Amount: ${data.amount}`
    });

    console.log('Payment confirmation email sent to:', email);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

/**
 * Test email configuration by sending a test email
 */
export const testEmailConfig = async (testEmail = process.env.EMAIL_USER) => {
  try {
    await sendEmail({
      to: testEmail,
      subject: 'Email Configuration Test - The Dome Event Center',
      html: '<h2>Email Test</h2><p>If you receive this email, your email configuration is working correctly!</p>',
      text: 'Email Test - If you receive this email, your email configuration is working correctly!'
    });
    
    console.log('Test email sent successfully - Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
};

/**
 * Send caution fee refund notification email
 */
export const sendCautionFeeRefund = async (email, refundData) => {
  try {
    const {
      customerName,
      transactionId,
      originalAmount,
      refundAmount,
      damageCharges,
      reason,
      damageDescription
    } = refundData;

    // Format amounts (already formatted strings from your template)
    const formattedOriginalAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(originalAmount);

    const formattedRefundAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(refundAmount);

    const formattedDamageCharges = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(damageCharges);

    // Use the template
    const htmlContent = cautionRefundEmail({
      customerName,
      transactionId,
      originalAmount: formattedOriginalAmount,
      refundAmount: formattedRefundAmount,
      damageCharges: formattedDamageCharges,
      reason,
      damageDescription
    });

    // Determine subject based on refund amount
    let subject;
    if (refundAmount === 0) {
      subject = 'Caution Fee Assessment - The Dome Event Center';
    } else if (refundAmount === originalAmount) {
      subject = 'Full Caution Fee Refund - The Dome Event Center';
    } else {
      subject = 'Partial Caution Fee Refund - The Dome Event Center';
    }

    // Create plain text version
    const text = `Dear ${customerName},

We have processed the refund for your caution fee. Below are the details:

Transaction ID: ${transactionId}
Original Caution Fee: ${formattedOriginalAmount}
Damage Charges: ${formattedDamageCharges}
Refund Amount: ${formattedRefundAmount}
Status: ${refundAmount === 0 ? 'No Refund' : refundAmount === originalAmount ? 'Full Refund' : 'Partial Refund'}
Reason: ${reason || 'Standard refund processing'}

${damageDescription ? `Damage Description: ${damageDescription}` : ''}

${refundAmount > 0 ? `
Your refund of ${formattedRefundAmount} will be processed within 3-5 business days.
The refund will be sent to your original payment method.
` : `
The entire caution fee of ${formattedOriginalAmount} has been retained to cover damage charges. No refund will be issued.
`}

If you have any questions, please contact our support team:
Email: officialdomeakure@gmail.com
Phone: +234 810 198 8988

Thank you for choosing The Dome!

Best regards,
The Dome Team`;

    await sendEmail({
      to: email,
      subject: subject,
      html: htmlContent,
      text: text
    });

    console.log('Caution fee refund email sent to:', email);
  } catch (error) {
    console.error('Failed to send caution fee refund email:', error);
    throw error;
  }
};