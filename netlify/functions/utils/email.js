/**
 * Email utility functions
 * Currently using a placeholder for email sending
 * Can be integrated with Resend, SendGrid, or other email services
 */

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (data) => {
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
export const sendVerificationEmail = async (email, token) => {
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
export const sendPasswordResetEmail = async (email, token) => {
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
  email,
  orderNumber,
  status,
  trackingUrl?
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
function generateOrderConfirmationHTML(data): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        ${item.title}</strong>
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
    <div style="font-family, Arial, sans-serif; background: #0A0A0A; color: #FFFFFF; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="color: #90C2DD; margin-bottom: 20px;">Order Confirmation</h1>

        Dear ${data.firstName},</p>

        Thank you for your order! Here are your order details:</p>

        <div style="background: #1a1a1a; padding: 20px; border-radius: 8px; margin: 20px 0;">
          Order Number:</strong> ${data.orderNumber}</p>
          Shipping Address:</strong>${data.shippingAddress}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          
            <tr style="background: #004a66;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: right;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          
            ${itemsHTML}
            <tr style="font-weight: bold; font-size: 16px; border-top: 2px solid #90C2DD;">
              <td colspan="2" style="padding: 15px; text-align: right;">Total:</td>
              <td style="padding: 15px; text-align: right;">£${data.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        You will receive another email when your order is dispatched.</p>

        Thank you for shopping at Cook Book Bake!</p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #BBBBBB; color: #DEDEDE; font-size: 12px;">
          Cook Book Bake
          7 Victoria Terrace, Hove, BN3 2WB
          01273 779520</p>
        </div>
      </div>
    </div>
  `;
}
