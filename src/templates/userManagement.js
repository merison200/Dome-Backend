export const adminNotificationEmail = (name, subject, message) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
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
    .message-text {
      font-size: 16px;
      color: #0f172a;
      margin-bottom: 20px;
      line-height: 1.7;
      white-space: pre-line;
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
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">The Dome</h1>
      <p style="color: #ffffff; margin: 0;">International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <p style="color: #0f172a; font-size: 18px; margin-bottom: 20px;">Hello <strong style="color: #0f172a;">${name}</strong>,</p>
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <div class="message-text" style="font-size: 16px; color: #0f172a; margin-bottom: 20px; line-height: 1.7; white-space: pre-line;">${message}</div>
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p style="color: #333333; margin: 0;">Best regards,<br>The Dome Management Team</p>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Email: officialdomeakure@gmail.com | Phone: +234 810 198 8988</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Role change notification email template
export const roleChangeNotificationEmail = (name, oldRole, newRole) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Role Updated</title>
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
    .role-change-info {
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
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">The Dome</h1>
      <p style="color: #ffffff; margin: 0;">International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <p style="color: #0f172a; font-size: 18px; margin-bottom: 20px;">Hello <strong style="color: #0f172a;">${name}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">We're writing to inform you that your account role has been updated.</p>
      
      <div class="role-change-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 8px 0;"><strong style="color: #333333;">Previous Role:</strong> ${oldRole.charAt(0).toUpperCase() + oldRole.slice(1)}</p>
        <p style="color: #333333; margin: 0;"><strong style="color: #333333;">New Role:</strong> ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}</p>
      </div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">This change may affect your access permissions and available features. If you have any questions about these changes or need assistance, please contact our support team.</p>
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <p style="color: #333333; margin: 0;">Best regards,<br>The Dome Management Team</p>
    </div>
    
    <div class="footer" style="text-align: center; padding: 20px 30px; background: #f1f5f9; color: #64748b; font-size: 14px;">
      <p style="color: #64748b; margin: 0 0 8px 0;"><strong style="color: #64748b;">The Dome International Culture and Event Centre</strong></p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Igbatoro Road, Akure, Ondo State</p>
      <p style="color: #64748b; margin: 0 0 8px 0;">Email: officialdomeakure@gmail.com | Phone: +234 810 198 8988</p>
      <p style="color: #64748b; margin: 0;">© ${new Date().getFullYear()} The Dome. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};