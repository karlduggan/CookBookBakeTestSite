import { stripe } from '../../../lib/api-utils/stripe.js';
import { successResponse, validationError, serverError } from '../../../lib/api-utils/response.js';

export const prerender = false;

export async function GET(context) {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

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
    console.error('[session-details] Error:', error);
    if (error instanceof Error) {
      console.error('[session-details] Error message:', error.message);
    }
    return serverError(error instanceof Error ? error.message : 'Failed to retrieve session details');
  }
}
