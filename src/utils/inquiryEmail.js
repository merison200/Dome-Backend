import sendEmail from './sendEmail.js';
import { inquiryReplyTemplate } from '../templates/inquiryEmail.js';

/**
 * Send inquiry reply email
 */
export const sendInquiryReply = async (email, replyData) => {
  try {
    const {
      customerName,
      originalMessage,
      replySubject,
      replyMessage,
      repliedBy,
      inquiryDate
    } = replyData;

    const formattedInquiryDate = new Date(inquiryDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });

    const htmlContent = inquiryReplyTemplate({
      customerName,
      originalMessage,
      replySubject,
      replyMessage,
      repliedBy,
      inquiryDate: formattedInquiryDate
    });

    // Create text version for accessibility
    const textContent = `
Dear ${customerName},

Thank you for your inquiry. Here's our response:

${replyMessage}

Your original inquiry (${formattedInquiryDate}):
"${originalMessage}"

Best regards,
${repliedBy}
The Dome Event Center

Contact us:
Email: support@domeeventcenter.com
Phone: +234 (0) 123 456 7890
Hours: Monday - Sunday, 8:00 AM - 8:00 PM
    `.trim();

    await sendEmail({
      to: email,
      subject: replySubject,
      html: htmlContent,
      text: textContent
    });

    console.log('Inquiry reply email sent to:', email);
  } catch (error) {
    console.error('Failed to send inquiry reply email:', error);
    throw error;
  }
};

/**
 * Send inquiry confirmation email (auto-reply when inquiry is first received)
 */
export const sendInquiryConfirmation = async (email, inquiryData) => {
  try {
    const { name } = inquiryData;

    const subject = 'We Received Your Inquiry - The Dome';
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Received - The Dome</title>
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
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Inquiry Received</h1>
            <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
        </div>
        
        <div class="content">
            <p style="color: #333333; margin: 0 0 16px 0;">Dear <strong style="color: #333333;">${name}</strong>,</p>
            
            <p style="color: #333333; margin: 0 0 16px 0;">Thank you for contacting The Dome International Culture and Event Centre. We have received your inquiry and our team will review it shortly.</p>
            
            <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
            
            <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">What to expect next:</strong></p>
            <ul style="color: #333333; padding-left: 20px; margin: 0 0 16px 0;">
                <li style="margin-bottom: 8px;">Our team will review your inquiry</li>
                <li style="margin-bottom: 8px;">We'll respond within 24 hours during business hours</li>
                <li style="margin-bottom: 8px;">You'll receive a detailed response from our specialist</li>
            </ul>
            
            <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 16px 0;">For urgent matters, our support team is here to help!</p>
                <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
                <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
            </div>
            
            <p style="color: #333333; margin: 0;">We appreciate your interest in The Dome and look forward to assisting you.</p>
        </div>
        
        <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
            <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
            <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
            <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    await sendEmail({
      to: email,
      subject,
      html: htmlContent
    });

    console.log('Inquiry confirmation email sent to:', email);
  } catch (error) {
    console.error('Failed to send inquiry confirmation email:', error);
    throw error;
  }
};