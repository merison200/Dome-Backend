/**
 * Inquiry reply email template
 */
export const inquiryReplyTemplate = ({
  customerName,
  originalMessage,
  replySubject,
  replyMessage,
  repliedBy,
  inquiryDate
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Response to Your Inquiry - The Dome</title>
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
        .reply-section { 
            background: #fef2f2; 
            padding: 20px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 4px solid #dc2626; 
        }
        .original-inquiry { 
            background: #f8f9fa; 
            padding: 16px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-left: 3px solid #94a3b8; 
        }
        .signature { 
            background: #f1f5f9; 
            padding: 16px; 
            border-radius: 6px; 
            margin: 20px 0; 
            border-top: 2px solid #dc2626; 
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
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Response to Your Inquiry</h1>
            <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
        </div>
        
        <div class="content">
            <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${customerName}</strong>,</p>
            
            <p style="color: #333333; margin: 0 0 16px 0;">Thank you for contacting The Dome. Here's our response to your inquiry:</p>
            
            <div class="reply-section" style="background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <div style="white-space: pre-line; font-size: 16px; line-height: 1.6; color: #333333;">
                    ${replyMessage}
                </div>
                <p style="color: #333333; margin: 16px 0 0 0;">Please feel free to contact us again if you need further assistance.</p>
            </div>
            
            <div class="original-inquiry" style="background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #94a3b8;">
                <h4 style="color: #475569; margin: 0 0 10px 0; font-size: 16px;">Your inquiry (${inquiryDate}):</h4>
                <p style="font-style: italic; color: #475569; margin: 0; white-space: pre-line;">
                    "${originalMessage}"
                </p>
            </div>
            
            <div class="signature" style="background: #f1f5f9; padding: 16px; border-radius: 6px; margin: 20px 0; border-top: 2px solid #dc2626;">
                <p style="margin: 0; font-weight: bold; color: #333333;">Best regards,</p>
                <p style="margin: 5px 0 0 0; color: #dc2626; font-weight: bold;">${repliedBy}</p>
                <p style="margin: 0; color: #64748b; font-size: 14px;">The Dome Team</p>
            </div>
            
            <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="color: #333333; margin: 0 0 16px 0;">Need more help? Our support team is here for you!</p>
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