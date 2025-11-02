const resetPasswordEmail = (name, resetLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - The Dome</title>
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
    .button { 
      display: inline-block; 
      background: #dc2626; 
      color: white; 
      padding: 14px 28px; 
      text-decoration: none; 
      border-radius: 6px; 
      margin: 15px 0; 
      font-weight: 600;
      text-align: center;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 25px 0;
    }
    .link-text {
      background: #fef2f2;
      padding: 16px;
      border-radius: 6px;
      margin: 20px 0;
      border-left: 4px solid #dc2626;
      word-break: break-all;
      font-size: 14px;
      color: #0f172a;
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
      .button {
        display: block;
        margin: 15px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">Password Reset</h1>
      <p style="color: #ffffff; margin: 0;">The Dome International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <p style="color: #333333; margin: 0 0 16px 0;">Hello <strong style="color: #333333;">${name}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">You recently requested to reset your password for your account. Click the button below to proceed:</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" class="button" style="display: inline-block; background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: 600; text-align: center;">Reset Password</a>
      </div>
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">If you can't click the button</strong>, copy and paste the URL below into your web browser:</p>
      
      <div class="link-text" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626; word-break: break-all; font-size: 14px; color: #0f172a;">
        ${resetLink}
      </div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">This password reset link will expire in 1 hour for security reasons.</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
      
      <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">Need help? Our support team is here to assist you!</p>
        <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
      
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

export default resetPasswordEmail;