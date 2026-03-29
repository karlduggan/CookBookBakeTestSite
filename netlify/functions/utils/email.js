/**
 * Email utility functions
 * Currently using a placeholder for email sending
 * Can be integrated with Resend, SendGrid, or other email services
 */

interface OrderEmailData {
  orderNumber: string;
  email: string;
  firstName: string;
  items: Array<{
    title: string;
    author: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: string;
}

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  // Placeholder implementation
  // In production, integrate with Resend, SendGrid, or similar service

  console.log('Sending order confirmation email:', {
    to: data.email,
    orderNumber: data.orderNumber,
    items: data.items.length,
  });

  // Example of how this would work with Resend:
  // const { Resend } = await import('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // return resend.emails.send({
  //   from: 'orders@cookbookbake.co.uk',
  //   to: data.email,
  //   subject: `Order Confirmation - ${data.orderNumber}`,
  //   html: generateOrderConfirmationHTML(data),
  // });

  return {
    success: true,
    messageId: `email-${Date.now()}`,
  };
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.PUBLIC_SITE_URL}/verify-email?token=${token}`;

  console.log('Sending verification email:', {
    to: email,
    url: verificationUrl,
  });

  return {
    success: true,
    messageId: `email-${Date.now()}`,
  };
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.PUBLIC_SITE_URL}/reset-password?token=${token}`;

  console.log('Sending password reset email:', {
    to: email,
    url: resetUrl,
  });

  return {
    success: true,
    messageId: `email-${Date.now()}`,
  };
};

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (
  email: string,
  orderNumber: string,
  status: string,
  trackingUrl?: string
) => {
  console.log('Sending order status email:', {
    to: email,
    orderNumber,
    status,
  });

  return {
    success: true,
    messageId: `email-${Date.now()}`,
  };
};

/**
 * Generate HTML for order confirmation email
 */
function generateOrderConfirmationHTML(data: OrderEmailData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <strong>${item.title}</strong><br>
        by ${item.author}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
        ${item.quantity}x
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
        £${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <div style="font-family: Karla, Arial, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #90C2DD; margin-bottom: 20px;">Order Confirmation</h1>

        <p>Dear ${data.firstName},</p>

        <p>Thank you for your order! Here are your order details:</p>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Shipping Address:</strong><br>${data.shippingAddress}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #004a66;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr style="font-weight: bold; font-size: 16px; border-top: 2px solid #90C2DD;">
              <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
              <td style="padding: 15px; text-align: right;">£${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p>You will receive another email when your order is dispatched.</p>

        <p>Thank you for shopping at Cook Book Bake!</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #BBBBBB; color: #DEDEDE; font-size: 12px;">
          <p>Cook Book Bake<br>
          7 Victoria Terrace, Hove, BN3 2WB<br>
          01273 779520</p>
        </div>
      </div>
    </div>
  `;
}
