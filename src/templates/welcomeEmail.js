const welcomeEmail = (name) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to The Dome</title>
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
    .welcome-text {
      font-size: 18px;
      color: #0f172a;
      margin-bottom: 20px;
    }
    .highlight {
      color: #dc2626;
      font-weight: 600;
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
      <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">The Dome</h1>
      <p style="color: #ffffff; margin: 0;">International Culture and Event Centre</p>
    </div>
    
    <div class="content">
      <p class="welcome-text" style="color: #0f172a; font-size: 18px; margin-bottom: 20px;">Hello <strong style="color: #0f172a;">${name}</strong>,</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">Welcome to The Dome International Culture and Event Centre! We're thrilled to have you join our community.</p>
      
      <p style="color: #333333; margin: 0 0 16px 0;">At The Dome, we're committed to providing exceptional cultural experiences and premium event hosting services.</p>
      
      <div class="divider" style="height: 1px; background: #e2e8f0; margin: 25px 0;"></div>
      
      <p style="color: #333333; margin: 0 0 16px 0;"><strong style="color: #333333;">What you can expect:</strong></p>
      <ul style="padding-left: 20px;">
        <li style="color: #333333; margin-bottom: 8px;">Premium venue booking services</li>
        <li style="color: #333333; margin-bottom: 8px;">Special member promotions</li>
        <li style="color: #333333; margin-bottom: 8px;">Priority customer support</li>
      </ul>
      
      <div class="contact-info" style="background: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <p style="color: #333333; margin: 0 0 16px 0;">Have questions or need assistance? Our support team is here to help!</p>
        <p style="color: #333333; margin: 0 0 8px 0;">Email: <span style="color: #dc2626; font-weight: 600;">officialdomeakure@gmail.com</span></p>
        <p style="color: #333333; margin: 0;">Phone: +234 810 198 8988</p>
      </div>
      
      <p style="color: #333333; margin: 0 0 16px 0;">We look forward to welcoming you to our centre soon!</p>
      
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

export default welcomeEmail;