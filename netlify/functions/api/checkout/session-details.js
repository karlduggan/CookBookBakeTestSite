import { stripe } from '../utils/stripe.js';
import { successResponse, validationError, serverError } from '../utils/response.js';

const handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    const sessionId = event.queryStringParameters?.session_id;

    if (!sessionId) {
      return validationError('Missing session_id');
    }

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return validationError('Session not found');
    }

    // Return session details
    return successResponse({
      sessionId: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      totalAmount: (session.amount_total || 0) / 100, // Convert from cents to pounds
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Session details error:', error);
    return serverError(error);
  }
};

export { handler };
