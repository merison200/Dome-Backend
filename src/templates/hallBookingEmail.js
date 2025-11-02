/**
 * Booking confirmation email template
 */
export const bookingConfirmationTemplate = ({
  customerName,
  hallName,
  bookingId,
  eventDates,
  totalAmount,
  paymentReference
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed - The Dome</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header { 
            background: #dc2626; 
            color: white; 
            padding: 35px 30px; 
            text-align: center; 
        }
        .content { 
            padding: 35px 30px; 
            background: #ffffff;
        }
        .footer { 
            text-align: center; 
            padding: 20px 30px; 
            background: #f1f5f9;
            color: #64748b; 
            font-size: 14px;
        }
        .details-box { 
            background: #fef2f2; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626; 
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .detail-label { 
            font-weight: bold; 
            color: #475569; 
        }
        .detail-value { 
            color: #333333; 
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 25px 0;
        }
        .contact-info {
            background: #fef2f2;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
        }
        p {
            margin: 0 0 16px 0;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                border-radius: 0;
            }
            .header, .content {
                padding: 25px 20px;
            }
            h1 {
                font-size: 28px;
            }
            .detail-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Booking Confirmed</h1>
            <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
        </div>
        
        <div class="content">
            <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${customerName}</strong>,</p>
            
            <p style="color: #333333; margin: 0 0 16px 0;">Your booking has been confirmed and payment processed successfully.</p>
            
            <div class="details-box" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Booking ID:</span>
                    <span class="detail-value" style="color: #333333;">${bookingId}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Hall:</span>
                    <span class="detail-value" style="color: #333333;">${hallName}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Event Date(s):</span>
                    <span class="detail-value" style="color: #333333;">${eventDates}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Total Amount:</span>
                    <span class="detail-value" style="font-weight: bold; color: #dc2626;">${totalAmount}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Payment Reference:</span>
                    <span class="detail-value" style="color: #333333;">${paymentReference}</span>
                </div>
            </div>
            
            <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
            
            <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">Important Notes:</strong></p>
            <ul style="color: #333333; padding-left: 20px; margin: 0 0 16px 0;">
                <li style="margin-bottom: 8px;">Caution fee refunded within 2-5 business days after event</li>
                <li style="margin-bottom: 8px;">Hall access available before the day of the event</li>
                <li style="margin-bottom: 8px;">Free cancellation up to 7 days before event date</li>
            </ul>
            
            <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 16px 0;">Need assistance? Our support team is here to help!</p>
                <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
                <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
            </div>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
            <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
            <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
            <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Booking cancellation email template
 */
export const bookingCancellationTemplate = ({
  customerName,
  hallName,
  bookingId,
  eventDates,
  refundAmount
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled - The Dome</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header { 
            background: #dc2626; 
            color: white; 
            padding: 35px 30px; 
            text-align: center; 
        }
        .content { 
            padding: 35px 30px; 
            background: #ffffff;
        }
        .footer { 
            text-align: center; 
            padding: 20px 30px; 
            background: #f1f5f9;
            color: #64748b; 
            font-size: 14px;
        }
        .details-box { 
            background: #fef2f2; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626; 
        }
        .refund-info { 
            background: #fffbeb; 
            padding: 16px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #f59e0b; 
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .detail-label { 
            font-weight: bold; 
            color: #475569; 
        }
        .detail-value { 
            color: #333333; 
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 25px 0;
        }
        .contact-info {
            background: #fef2f2;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
        }
        p {
            margin: 0 0 16px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                border-radius: 0;
            }
            .header, .content {
                padding: 25px 20px;
            }
            h1 {
                font-size: 28px;
            }
            .detail-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Booking Cancelled</h1>
            <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
        </div>
        
        <div class="content">
            <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${customerName}</strong>,</p>
            
            <p style="color: #333333; margin: 0 0 16px 0;">Your booking cancellation has been processed successfully.</p>
            
            <div class="details-box" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Booking ID:</span>
                    <span class="detail-value" style="color: #333333;">${bookingId}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Hall:</span>
                    <span class="detail-value" style="color: #333333;">${hallName}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Event Date(s):</span>
                    <span class="detail-value" style="color: #333333;">${eventDates}</span>
                </div>
                <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0;">
                    <span class="detail-label" style="font-weight: bold; color: #475569;">Refund Amount:</span>
                    <span class="detail-value" style="font-weight: bold; color: #059669;">${refundAmount}</span>
                </div>
            </div>
            
            <div class="refund-info" style="background: #fffbeb; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #333333; margin: 0 0 12px 0;"><strong style="color: #333333;">Refund Details:</strong></p>
                <p style="color: #333333; margin: 0 0 8px 0;"><strong>Processing Time:</strong> 3-5 business days</p>
                <p style="color: #333333; margin: 0 0 8px 0;"><strong>Method:</strong> Original payment method</p>
                <p style="color: #333333; margin: 0;"><strong>Note:</strong> 10% processing fee deducted per cancellation policy</p>
            </div>
            
            <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 16px 0;">Need assistance? Our support team is here to help!</p>
                <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
                <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
            </div>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
            <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
            <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
            <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Booking reminder email template
 */
export const bookingReminderTemplate = ({
  customerName,
  hallName,
  bookingId,
  eventDate,
  daysUntilEvent
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Reminder - The Dome</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header { 
            background: #dc2626; 
            color: white; 
            padding: 35px 30px; 
            text-align: center; 
        }
        .content { 
            padding: 35px 30px; 
            background: #ffffff;
        }
        .footer { 
            text-align: center; 
            padding: 20px 30px; 
            background: #f1f5f9;
            color: #64748b; 
            font-size: 14px;
        }
        .countdown { 
            background: #f0f9ff; 
            padding: 25px; 
            border-radius: 8px; 
            margin: 20px 0; 
            text-align: center; 
            border: 2px solid #0ea5e9; 
        }
        .details-box { 
            background: #fef2f2; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626; 
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 25px 0;
        }
        .contact-info {
            background: #fef2f2;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
        }
        p {
            margin: 0 0 16px 0;
        }
        ul {
            padding-left: 20px;
        }
        li {
            margin-bottom: 8px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                border-radius: 0;
            }
            .header, .content {
                padding: 25px 20px;
            }
            h1 {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Event Reminder</h1>
            <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
        </div>
        
        <div class="content">
            <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${customerName}</strong>,</p>
            
            <p style="color: #333333; margin: 0 0 16px 0;">Your event at <strong style="color: #333333;">${hallName}</strong> is approaching.</p>
            
            <div class="countdown" style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #0ea5e9;">
                <div style="font-size: 3em; font-weight: bold; color: #0ea5e9; margin: 10px 0;">${daysUntilEvent}</div>
                <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Days Until Your Event</strong></p>
                <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Date:</strong> ${eventDate}</p>
                <p style="color: #333333; margin: 0;"><strong style="color: #333333;">Booking ID:</strong> ${bookingId}</p>
            </div>
            
            <div class="details-box" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 12px 0;"><strong style="color: #333333;">Pre-Event Checklist:</strong></p>
                <ul style="color: #333333; padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 8px;">Confirm final guest count</li>
                    <li style="margin-bottom: 8px;">Coordinate with vendors</li>
                    <li style="margin-bottom: 8px;">Plan setup timeline</li>
                    <li style="margin-bottom: 8px;">Prepare equipment/materials</li>
                    <li style="margin-bottom: 0;">Confirm arrival time</li>
                </ul>
            </div>
            
            <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
            
            <p style="color: #333333; margin: 0 0 12px 0;"><strong style="color: #333333;">Venue Details:</strong></p>
            <ul style="color: #333333; padding-left: 20px; margin: 0 0 16px 0;">
                <li style="margin-bottom: 8px;">Setup access: 2 hours before event</li>
                <li style="margin-bottom: 8px;">Free on-site parking available</li>
                <li style="margin-bottom: 0;">Event coordinator on-site</li>
            </ul>
            
            <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 16px 0;">Need assistance? Our support team is here to help!</p>
                <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
                <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
            </div>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
            <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
            <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
            <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Payment confirmation email template
 */
export const paymentConfirmationTemplate = (data) => {
  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date helper function
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const eventDatesHtml = data.eventDates.map(date =>
    `<li style="margin: 5px 0; color: #333333;">${formatDate(date)}</li>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmed - The Dome</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header { 
      background: #dc2626; 
      color: white; 
      padding: 35px 30px; 
      text-align: center; 
    }
    .content { 
      padding: 35px 30px; 
      background: #ffffff;
    }
    .footer { 
      text-align: center; 
      padding: 20px 30px; 
      background: #f1f5f9;
      color: #64748b; 
      font-size: 14px;
    }
    .success-badge { 
      background: #059669; 
      color: white; 
      padding: 12px 24px; 
      border-radius: 25px; 
      display: inline-block; 
      margin: 20px 0; 
      font-weight: 600;
    }
    .details-box { 
      background: #fef2f2; 
      padding: 20px; 
      border-radius: 6px; 
      margin: 20px 0; 
      border-left: 4px solid #dc2626; 
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 25px 0;
    }
    .contact-info {
      background: #fef2f2;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    .detail-row { 
      display: flex; 
      justify-content: space-between; 
      margin: 10px 0; 
      padding: 8px 0; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .detail-label { 
      font-weight: bold; 
      color: #475569; 
    }
    .detail-value { 
      color: #333333; 
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header, .content {
        padding: 25px 20px;
      }
      h1 {
        font-size: 28px;
      }
      .detail-row {
        flex-direction: column;
        gap: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Payment Successful</h1>
      <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <div class="success-badge" style="background: #059669; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: 600;">Payment Confirmed</div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${data.customerName}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Your payment has been processed successfully.</p>

      <div class="details-box" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">Payment Details:</strong></p>
        <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span class="detail-label" style="font-weight: bold; color: #475569;">Transaction ID:</span>
          <span class="detail-value" style="color: #333333;">${data.transactionId}</span>
        </div>
        <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span class="detail-label" style="font-weight: bold; color: #475569;">Reference:</span>
          <span class="detail-value" style="color: #333333;">${data.referenceNumber}</span>
        </div>
        <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
          <span class="detail-label" style="font-weight: bold; color: #475569;">Amount:</span>
          <span class="detail-value" style="font-weight: bold; color: #059669;">${formatCurrency(data.amount)}</span>
        </div>
        <div class="detail-row" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0;">
          <span class="detail-label" style="font-weight: bold; color: #475569;">Date:</span>
          <span class="detail-value" style="color: #333333;">${formatDate(new Date())}</span>
        </div>
      </div>

      <div class="details-box" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">Event Details:</strong></p>
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Venue:</strong> ${data.hallName}</p>
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Dates:</strong></p>
        <ul style="color: #333333; padding-left: 20px; margin: 0;">${eventDatesHtml}</ul>
      </div>

      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>

      <p style="color: #333333; margin: 0 0 12px 0;"><strong style="color: #333333;">Important Notes:</strong></p>
      <ul style="color: #333333; padding-left: 20px; margin: 0 0 16px 0;">
        <li style="margin-bottom: 8px;">Keep this email as your receipt</li>
        <li style="margin-bottom: 8px;">Caution fee refunded 2-5 days after event</li>
        <li style="margin-bottom: 0;">Cancellation allowed up to 7 days before (10% fee applies)</li>
      </ul>

      <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">Need assistance? Our support team is here to help!</p>
        <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Transfer instructions email template
 */
export const transferInstructionsTemplate = (data) => {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const eventDatesHtml = data.eventDates.map(date =>
    `<li style="margin: 5px 0; color: #333333;">${formatDate(date)}</li>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Instructions - The Dome</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header { 
      background: #dc2626; 
      color: white; 
      padding: 35px 30px; 
      text-align: center; 
    }
    .content { 
      padding: 35px 30px; 
      background: #ffffff;
    }
    .footer { 
      text-align: center; 
      padding: 20px 30px; 
      background: #f1f5f9;
      color: #64748b; 
      font-size: 14px;
    }
    .warning-badge { 
      background: #dc2626; 
      color: white; 
      padding: 12px 24px; 
      border-radius: 25px; 
      display: inline-block; 
      margin: 20px 0; 
      font-weight: 600;
    }
    .account-details { 
      background: #1e293b; 
      color: white; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
    }
    .details-box { 
      background: #f8fafc; 
      padding: 20px; 
      border-radius: 6px; 
      margin: 20px 0; 
      border-left: 4px solid #dc2626; 
    }
    .payment-steps { 
      background: #f8fafc; 
      padding: 20px; 
      border-radius: 6px; 
      margin: 20px 0; 
      border-left: 4px solid #dc2626; 
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 25px 0;
    }
    .contact-info {
      background: #f8fafc;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul, ol {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header, .content {
        padding: 25px 20px;
      }
      h1 {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Complete Your Payment</h1>
      <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <div class="warning-badge" style="background: #dc2626; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: 600;">Action Required</div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${data.customerName}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Please complete your payment by transferring to our account below to confirm your booking.</p>

      <div class="account-details" style="background: #1e293b; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #ffffff; margin: 0 0 16px 0;">Bank Transfer Details</h3>
        <p style="color: #ffffff; margin: 0 0 12px 0;"><strong style="color: #ffffff;">Account Name:</strong> ${data.accountDetails.accountName}</p>
        <p style="color: #ffffff; margin: 0 0 12px 0;"><strong style="color: #ffffff;">Account Number:</strong> ${data.accountDetails.accountNumber}</p>
        <p style="color: #ffffff; margin: 0 0 12px 0;"><strong style="color: #ffffff;">Bank:</strong> ${data.accountDetails.bankName}</p>
        <p style="color: #ffffff; margin: 0;"><strong style="color: #ffffff;">Amount:</strong> <span style="font-size: 24px; font-weight: bold; color: #ffffff;">${formatCurrency(data.amount)}</span></p>
      </div>

      <div class="payment-steps" style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="color: #333333; margin: 0 0 16px 0;">Payment Steps</h3>
        <ol style="color: #333333; padding-left: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">Transfer exactly <strong style="color: #333333;">${formatCurrency(data.amount)}</strong></li>
          <li style="margin-bottom: 8px;">Use reference: <strong style="color: #333333;">${data.referenceNumber}</strong></li>
          <li style="margin-bottom: 8px;">Keep your transfer receipt for verification</li>
          <li style="margin-bottom: 0;">Booking will be confirmed once payment is verified</li>
        </ol>
      </div>

      <div class="details-box" style="background: #f8fafc; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="color: #333333; margin: 0 0 16px 0;">Booking Details</h3>
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Transaction ID:</strong> ${data.transactionId}</p>
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Venue:</strong> ${data.hallName}</p>
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Dates:</strong></p>
        <ul style="color: #333333; padding-left: 20px; margin: 0;">${eventDatesHtml}</ul>
      </div>

      <div class="contact-info" style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">Need assistance with your payment? Our support team is here to help!</p>
        <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Payment failure email template
*/
export const paymentFailureTemplate = (data) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Issue - The Dome</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header { 
      background: #dc2626; 
      color: white; 
      padding: 35px 30px; 
      text-align: center; 
    }
    .content { 
      padding: 35px 30px; 
      background: #ffffff;
    }
    .footer { 
      text-align: center; 
      padding: 20px 30px; 
      background: #f1f5f9;
      color: #64748b; 
      font-size: 14px;
    }
    .error-badge { 
      background: #dc2626; 
      color: white; 
      padding: 12px 24px; 
      border-radius: 25px; 
      display: inline-block; 
      margin: 20px 0; 
      font-weight: 600;
    }
    .error-details { 
      background: #fef2f2; 
      padding: 16px; 
      border-radius: 6px; 
      margin: 20px 0; 
      border-left: 4px solid #dc2626; 
    }
    .contact-info {
      background: #fef2f2;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 25px 0;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }
    p {
      margin: 极狐 0 0 16px 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header, .content {
        padding: 25px 20px;
      }
      h1 {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Payment Issue</h1>
      <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <div class="error-badge" style="background: #dc2626; color: white; padding: 12px 24px; border-radius: 25px; display: inline-block; margin: 20px 0; font-weight: 600;">Payment Failed</div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${data.customerName}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">There was an issue with your payment for transaction: <strong style="color: #333333;">${data.transactionId}</strong></p>
      
      ${data.rejectionReason ? `
        <div class="error-details" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p style="color: #333333; margin: 0 0 12px 0;"><strong style="color: #333333;">Reason:</strong></p>
          <p style="color: #333333; margin: 0;">${data.rejectionReason}</p>
        </div>
      ` : ''}
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Please try again or contact our support team for assistance.</p>
      
      <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">Our support team is ready to help you resolve this issue!</p>
        <p style="color: #333333; margin: 0 0 8px 极狐 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Generate Receipt PDF
 */
export const generateReceiptPDF = async (payment) => {
  const booking = payment.bookingId;
  const hall = booking.hallId;
  
  // Format currency helper function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date helper function
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333333; 
            padding: 20px; 
            background-color: #ffffff;
        }
        .receipt-container { 
            max-width: 800px; 
            margin: 0 auto; 
        }
        .header { 
            background: #dc2626; 
            color: white; 
            padding: 35px 30px; 
            text-align: center; 
            margin-bottom: 25px; 
            border-radius: 8px;
        }
        .section { 
            margin-bottom: 25px; 
            padding: 25px; 
            background-color: #f8f9fa; 
            border-radius: 8px; 
            border-left: 4px solid #dc2626; 
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
        }
        .info-item { 
            display: flex; 
            flex-direction: column; 
        }
        .info-label { 
            font-weight: bold; 
            color: #64748b; 
            margin-bottom: 5px; 
            font-size: 14px;
        }
        .info-value { 
            color: #333333; 
            font-weight: 500;
        }
        .amount-display { 
            text-align: center; 
            padding: 30px; 
            background: #059669; 
            color: white; 
            border-radius: 10px; 
            margin: 25px 0; 
        }
        .breakdown-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px; 
        }
        .breakdown-table th, .breakdown-table td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e2e8f0; 
        }
        .breakdown-table th { 
            background-color: #dc2626; 
            color: white; 
            font-weight: 600;
        }
        .footer { 
            text-align: center; 
            padding: 25px; 
            color: #64748b; 
            border-top: 1px solid #e2e8f0; 
            margin-top: 30px; 
            font-size: 14px;
        }
        h1 {
            margin: 0 0 8px 0;
            font-size: 32px;
            font-weight: 700;
        }
        h3 {
            color: #dc2626;
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
        }
        @media print {
            body { 
                padding: 0;
                background-color: white;
            }
            .receipt-container {
                max-width: 100%;
            }
            .section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Payment Receipt</h1>
            <p>The Dome International Culture and Event Centre</p>
            <p>Receipt #${payment.transactionId}</p>
        </div>
        
        <div class="amount-display">
            <div style="font-size: 18px; margin-bottom: 10px;">Total Amount Paid</div>
            <div style="font-size: 2.5em; font-weight: bold; margin: 10px 0;">${formatCurrency(payment.amount)}</div>
            <div style="font-size: 16px;">Payment Confirmed</div>
        </div>
        
        <div class="section">
            <h3>Transaction Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Transaction ID</span>
                    <span class="info-value">${payment.transactionId}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Reference Number</span>
                    <span class="info-value">${payment.referenceNumber}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Date</span>
                    <span class="info-value">${new Date(payment.updatedAt).toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Payment Method</span>
                    <span class="info-value">${payment.method === 'card' ? 'Card Payment' : 'Bank Transfer'}</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Customer Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Name</span>
                    <span class="info-value">${booking.customerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Email</span>
                    <span class="info-value">${booking.customerEmail}</span>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h3>Event Details</h3>
            <div class="info-grid">
                <div class="info-item">
                    <span class="info-label">Venue</span>
                    <span class="info-value">${hall?.name || 'Event Hall'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Booking ID</span>
                    <span class="info-value">${booking._id}</span>
                </div>
            </div>
            
            ${booking.eventDates && booking.eventDates.length > 0 ? `
            <div style="margin-top: 20px;">
                <span class="info-label">Event Dates</span>
                <div style="margin-top: 10px;">
                    ${booking.eventDates.map(date => `
                        <div style="padding: 10px 15px; background-color: white; border-radius: 6px; margin-bottom: 8px; border: 1px solid #e2e8f0;">
                            ${formatDate(date)}
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
        </div>
        
        <div class="section">
            <h3>Payment Breakdown</h3>
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Base Price</td>
                        <td style="text-align: right;">${formatCurrency(booking.basePrice || 0)}</td>
                    </tr>
                    <tr>
                        <td>Caution Fee (Refundable)</td>
                        <td style="text-align: right;">${formatCurrency(booking.cautionFee || 0)}</td>
                    </tr>
                    <tr style="background-color: #f1f5f9; font-weight: bold;">
                        <td><strong>Total Paid</strong></td>
                        <td style="text-align: right;"><strong>${formatCurrency(payment.amount)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="footer">
        <p><strong>The Dome International Culture and Event Centre</strong></p>
        <p>Igbatoro Road, Akure, Ondo State</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>officialdomeakure@gmail.com | +234 810 198 8988</p>
    </div>
</body>
</html>
  `;
};

/**
 * Caution Fee Refund
*/
export const cautionRefundEmail = (refundData) => {
  const {
    customerName,
    transactionId,
    originalAmount,
    refundAmount,
    damageCharges,
    reason,
    damageDescription
  } = refundData;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Caution Fee Refund Update - The Dome</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333333; 
      margin: 0; 
      padding: 0; 
      background-color: #f8fafc;
    }
    .container { 
      max-width: 600px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header { 
      background: #dc2626; 
      color: white; 
      padding: 35px 30px; 
      text-align: center; 
    }
    .content { 
      padding: 35px 30px; 
      background: #ffffff;
    }
    .footer { 
      text-align: center; 
      padding: 20px 30px; 
      background: #f1f5f9;
      color: #64748b; 
      font-size: 14px;
    }
    .refund-summary {
      background: #f0fdf4;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #16a34a;
      margin: 20px 0;
    }
    .damage-details {
      background: #fffbeb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #d97706;
      margin: 20px 0;
    }
    .amount-breakdown {
      background: #f8fafc;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 25px 0;
    }
    .refund-amount {
      font-size: 24px;
      font-weight: bold;
      color: #16a34a;
      text-align: center;
      margin: 15px 0;
    }
    .contact-info {
      background: #fef2f2;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
    }
    h2 {
      color: #1e293b;
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    p {
      margin: 0 0 16px 0;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    .breakdown-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .breakdown-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0;
      }
      .header, .content {
        padding: 25px 20px;
      }
      h1 {
        font-size: 28px;
      }
      .refund-amount {
        font-size: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">The Dome</h1>
      <p style="color: #ffffff; margin: 0;">International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 20px;">Caution Fee Refund Update</h2>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #0f172a;">${customerName}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">We have processed the refund for your caution fee. Below are the details of the transaction:</p>

      <!-- Refund Summary -->
      <div class="refund-summary">
        <h3 style="color: #15803d; margin: 0 0 15px 0;">Refund Summary</h3>
        
        ${refundAmount > 0 ? `
          <div class="refund-amount" style="font-size: 24px; font-weight: bold; color: #16a34a; text-align: center; margin: 15px 0;">
            ${refundAmount === originalAmount ? 'Full Refund' : 'Partial Refund'}: ${refundAmount}
          </div>
        ` : `
          <div class="refund-amount" style="font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; margin: 15px 0;">
            No Refund - Damage Charges Applied
          </div>
        `}

        <div class="amount-breakdown">
          <div class="breakdown-item">
            <span style="color: #333333;">Original Caution Fee:</span>
            <span style="color: #333333; font-weight: 600;">${originalAmount}</span>
          </div>
          ${damageCharges > 0 ? `
          <div class="breakdown-item">
            <span style="color: #333333;">Damage Charges:</span>
            <span style="color: #dc2626; font-weight: 600;">-${damageCharges}</span>
          </div>
          ` : ''}
          <div class="breakdown-item">
            <span style="color: #333333; font-weight: 600;">${refundAmount > 0 ? 'Refund Amount:' : 'Amount Retained:'}</span>
            <span style="color: ${refundAmount > 0 ? '#16a34a' : '#dc2626'}; font-weight: 600;">
              ${refundAmount > 0 ? refundAmount : (originalAmount - refundAmount)}
            </span>
          </div>
        </div>
      </div>

      <!-- Transaction Details -->
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">Transaction Details</h3>
        <div class="breakdown-item">
          <span style="color: #64748b;">Transaction ID:</span>
          <span style="color: #333333; font-family: monospace;">${transactionId}</span>
        </div>
        <div class="breakdown-item">
          <span style="color: #64748b;">Refund Reason:</span>
          <span style="color: #333333;">${reason || 'Standard refund processing'}</span>
        </div>
        <div class="breakdown-item">
          <span style="color: #64748b;">Refund Status:</span>
          <span style="color: #333333; font-weight: 600;">
            ${refundAmount === 0 ? 'No Refund' : refundAmount === originalAmount ? 'Full Refund' : 'Partial Refund'}
          </span>
        </div>
      </div>

      <!-- Damage Details (if applicable) -->
      ${damageCharges > 0 ? `
      <div class="damage-details">
        <h3 style="color: #92400e; margin: 0 0 15px 0;">Damage Assessment</h3>
        <p style="color: #333333; margin: 0 0 10px 0;"><strong>Damage Charges:</strong> ${damageCharges}</p>
        ${damageDescription ? `
        <p style="color: #333333; margin: 0 0 10px 0;"><strong>Damage Description:</strong></p>
        <p style="color: #333333; margin: 0; background: white; padding: 10px; border-radius: 4px;">${damageDescription}</p>
        ` : ''}
      </div>
      ` : ''}

      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>

      <!-- Next Steps -->
      ${refundAmount > 0 ? `
      <p style="color: #333333; margin: 0 0 16px 0;"><strong>Next Steps:</strong></p>
      <ul style="padding-left: 20px;">
        <li style="color: #333333; margin-bottom: 8px;">Your refund of <strong>${refundAmount}</strong> will be processed within 3-5 business days</li>
        <li style="color: #333333; margin-bottom: 8px;">The refund will be sent to your original payment method</li>
        <li style="color: #333333; margin-bottom: 8px;">You will receive a confirmation once the refund is completed</li>
      </ul>
      ` : `
      <p style="color: #333333; margin: 0 0 16px 0;">The entire caution fee of <strong>${originalAmount}</strong> has been retained to cover damage charges. No refund will be issued.</p>
      `}

      <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">If you have any questions about this refund, please contact our support team:</p>
        <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Thank you for choosing The Dome for your event. We hope to serve you again in the future!</p>
      
      <p style="color: #333333; margin: 0;">Best regards,<br>The Dome Team</p>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};