import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { stripe } from '../../../lib/api-utils/stripe.js';
import { successResponse, validationError, serverError } from '../../../lib/api-utils/response.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';

export const prerender = false;

/**
 * Generate a custom order number
 * Format: ORD-YYYYMMDD-XXXXX (where XXXXX is random 5-digit number)
 */
function generateOrderNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `ORD-${dateStr}-${randomNum}`;
}

export async function POST(context) {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      return validationError('Missing session_id');
    }

    console.log('[save-order] Processing order for session:', sessionId);

    // Get authentication info
    const auth = authenticateRequest(context.request.headers);
    const userId = auth.isAuthenticated ? auth.user?.userId : undefined;

    const supabase = createSupabaseClient();

    // Retrieve session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return validationError('Session not found');
    }

    console.log('[save-order] Session retrieved:', session.payment_status);

    // Check if order already exists for this session
    const { data: existingOrder, error: checkError } = await supabase
      .from('orders')
      .select('order_number')
      .eq('stripe_payment_intent_id', sessionId);

    if (!checkError && existingOrder && existingOrder.length > 0) {
      console.log('[save-order] Order already exists:', existingOrder[0].order_number);
      return successResponse({
        orderNumber: existingOrder[0].order_number,
        sessionId: sessionId,
      });
    } else if (checkError && checkError.code !== 'PGRST116') {
      console.warn('[save-order] Check existing order error:', checkError);
    }

    // Generate custom order number
    let orderNumber;
    let attempts = 0;
    const maxAttempts = 10;

    // Ensure order number is unique
    while (attempts < maxAttempts) {
      orderNumber = generateOrderNumber();
      const { data: existing, error } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .single();

      if (error && error.code === 'PGRST116') {
        // PGRST116 means no rows found - good!
        break;
      }
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.error('[save-order] Failed to generate unique order number');
      return serverError('Failed to generate order number');
    }

    console.log('[save-order] Generated order number:', orderNumber);

    // Extract metadata from session
    const metadata = session.metadata || {};

    // Create order in database
    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId || null,
        guest_email: session.customer_email || metadata.email,
        total_amount: (session.amount_total || 0) / 100, // Convert from cents to pounds
        status: session.payment_status === 'paid' ? 'payment_received' : 'pending',
        stripe_payment_intent_id: sessionId,
        shipping_name: metadata.shippingName,
        shipping_address_line1: metadata.shippingAddressLine1,
        shipping_address_line2: metadata.shippingAddressLine2 || null,
        shipping_city: metadata.shippingCity,
        shipping_county: metadata.shippingCounty || null,
        shipping_postcode: metadata.shippingPostcode,
        shipping_country: metadata.shippingCountry || 'United Kingdom',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[save-order] Database insert error:', insertError);
      return serverError('Failed to save order: ' + insertError.message);
    }

    console.log('[save-order] Order saved successfully:', orderNumber);

    return successResponse({
      orderNumber: orderNumber,
      sessionId: sessionId,
      orderId: order.id,
    });
  } catch (error) {
    console.error('[save-order] Error:', error);
    if (error instanceof Error) {
      console.error('[save-order] Error message:', error.message);
    }
    return serverError(error instanceof Error ? error.message : 'Failed to save order');
  }
}
