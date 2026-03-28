/**
 * HTML Email Templates for Cook Book Bake
 * These templates are ready for integration with Resend or similar services
 */

export function getOrderConfirmationEmail(orderData: {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{ title: string; author: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  };
}): string {
  const itemsHtml = orderData.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #f0f0f0;">
      <td style="padding: 12px; text-align: left;">
        <strong>${item.title}</strong><br>
        <span style="color: #666; font-size: 14px;">by ${item.author}</span>
      </td>
      <td style="padding: 12px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right;">£${item.price.toFixed(2)}</td>
      <td style="padding: 12px; text-align: right;">£${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Karla', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #0A0A0A;
      color: #90C2DD;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }
    .content {
      padding: 30px;
    }
    .order-details {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .order-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-item {
      font-size: 14px;
    }
    .info-item strong {
      display: block;
      color: #90C2DD;
      margin-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background-color: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 12px;
    }
    .summary {
      text-align: right;
      margin-top: 20px;
    }
    .summary-row {
      display: flex;
      justify-content: flex-end;
      padding: 8px 0;
      font-size: 14px;
    }
    .summary-row span:first-child {
      margin-right: 40px;
      color: #666;
    }
    .summary-row span:last-child {
      font-weight: bold;
      min-width: 100px;
      text-align: right;
    }
    .summary-row.total {
      border-top: 2px solid #90C2DD;
      padding-top: 15px;
      font-size: 16px;
      color: #90C2DD;
    }
    .next-steps {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .next-steps h3 {
      color: #90C2DD;
      margin-top: 0;
    }
    .next-steps ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 8px 0;
      font-size: 14px;
      color: #666;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
    }
    .contact-info {
      margin-top: 10px;
      font-size: 13px;
    }
    .contact-info a {
      color: #90C2DD;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✓ Order Confirmed!</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Thank you for your purchase, ${orderData.customerName}</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Order Details -->
      <div class="order-details">
        <div class="order-info">
          <div class="info-item">
            <strong>Order Number</strong>
            ${orderData.orderNumber}
          </div>
          <div class="info-item">
            <strong>Order Date</strong>
            ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <!-- Items Table -->
      <h2 style="color: #90C2DD; font-size: 18px; margin-top: 30px;">Order Items</h2>
      <table>
        <thead>
          <tr>
            <th>Book</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Summary -->
      <div class="summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>£${orderData.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>£${orderData.shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (20%):</span>
          <span>£${orderData.tax.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>£${orderData.total.toFixed(2)}</span>
        </div>
      </div>

      <!-- Shipping Address -->
      <h3 style="color: #90C2DD; margin-top: 30px;">Shipping Address</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 14px; color: #666;">
        <strong>${orderData.shippingAddress.name}</strong><br>
        ${orderData.shippingAddress.line1}<br>
        ${orderData.shippingAddress.line2 ? orderData.shippingAddress.line2 + '<br>' : ''}
        ${orderData.shippingAddress.city}, ${orderData.shippingAddress.postcode}<br>
        ${orderData.shippingAddress.country}
      </div>

      <!-- Next Steps -->
      <div class="next-steps">
        <h3>What's Next?</h3>
        <ol>
          <li><strong>Confirmation Email:</strong> You'll receive a detailed confirmation email shortly with tracking information.</li>
          <li><strong>Order Processing:</strong> We'll prepare your order for dispatch within 1-2 business days.</li>
          <li><strong>Shipment Notification:</strong> You'll receive an email with tracking details once your books are dispatched.</li>
          <li><strong>Delivery:</strong> Your books will arrive within 3-5 business days from dispatch.</li>
        </ol>
      </div>

      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        You can view your order anytime by logging into your account at <strong>cookbookbake.co.uk/account</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p style="margin: 0;">© 2026 Cook Book Bake. All rights reserved.</p>
      <div class="contact-info">
        <p style="margin: 5px 0;">Have questions? We're here to help!</p>
        <p style="margin: 5px 0;">
          📧 <a href="mailto:support@cookbookbake.co.uk">support@cookbookbake.co.uk</a> |
          📞 <a href="tel:01273779520">01273 779520</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

export function getVerificationEmail(data: {
  customerName: string;
  verificationLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Karla', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #0A0A0A;
      color: #90C2DD;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #90C2DD;
      color: #0A0A0A;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Cook Book Bake!</h1>
    </div>

    <div class="content">
      <p>Hi ${data.customerName},</p>

      <p>Thank you for creating an account with Cook Book Bake. To complete your registration and start shopping, please verify your email address by clicking the button below:</p>

      <div style="text-align: center;">
        <a href="${data.verificationLink}" class="button">Verify Email Address</a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <span style="word-break: break-all;">${data.verificationLink}</span>
      </p>

      <p>This link will expire in 24 hours.</p>

      <p>If you didn't create this account, you can safely ignore this email.</p>

      <p>Happy reading!<br><strong>Cook Book Bake Team</strong></p>
    </div>

    <div class="footer">
      <p style="margin: 0;">© 2026 Cook Book Bake. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

export function getPasswordResetEmail(data: {
  customerName: string;
  resetLink: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Karla', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #0A0A0A;
      color: #90C2DD;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #90C2DD;
      color: #0A0A0A;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #ddd;
    }
    .warning {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      color: #856404;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset</h1>
    </div>

    <div class="content">
      <p>Hi ${data.customerName},</p>

      <p>We received a request to reset the password for your Cook Book Bake account. Click the button below to reset your password:</p>

      <div style="text-align: center;">
        <a href="${data.resetLink}" class="button">Reset Password</a>
      </div>

      <p style="color: #666; font-size: 14px;">
        Or copy and paste this link:<br>
        <span style="word-break: break-all;">${data.resetLink}</span>
      </p>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact our support team immediately.
      </div>

      <p>For security reasons, never share this link with anyone.</p>
    </div>

    <div class="footer">
      <p style="margin: 0;">© 2026 Cook Book Bake. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}
