import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { stripe } from '../../../lib/api-utils/stripe.js';
import { successResponse, validationError, serverError } from '../../../lib/api-utils/response.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';

export const prerender = false;

/**
 * Generate a user-friendly order number
 * Format: ORD-MMDD-XXXXX (e.g., ORD-0329-AB12C)
 * Uses month/day + base36 encoded random for short, memorable format
 */
function generateOrderNumber() {
  const now = new Date();

  // Month and day (e.g., "0329" for March 29)
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${month}${day}`;

  // Generate a random number and convert to base36 (0-9, a-z)
  // This makes it shorter and more interesting than pure numbers
  const randomNum = Math.floor(Math.random() * 60466176); // 36^5
  const randomStr = randomNum.toString(36).toUpperCase().padStart(5, '0');

  return `ORD-${dateStr}-${randomStr}`;
}

export async function POST(context) {
  try {
    console.log('[save-order] ===== START =====');
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      console.log('[save-order] Missing session_id');
      return validationError('Missing session_id');
    }

    console.log('[save-order] Processing order for session:', sessionId);

    // Get authentication info
    try {
      const auth = authenticateRequest(context.request.headers);
      const userId = auth.isAuthenticated ? auth.user?.userId : undefined;
      console.log('[save-order] Auth processed, userId:', userId);
    } catch (authErr) {
      console.warn('[save-order] Auth error (non-fatal):', authErr);
    }

    console.log('[save-order] Creating Supabase client...');
    const supabase = createSupabaseClient();
    console.log('[save-order] Supabase client created');

    // Retrieve session details from Stripe
    console.log('[save-order] Retrieving session from Stripe...');
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[save-order] Stripe session retrieved successfully');

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
        .eq('order_number', orderNumber);

      if (!error && (!existing || existing.length === 0)) {
        // No rows found - order number is unique!
        console.log('[save-order] Generated unique order number:', orderNumber);
        break;
      }
      console.log('[save-order] Order number exists, generating new one...');
      attempts++;
    }

    if (attempts === maxAttempts) {
      console.error('[save-order] Failed to generate unique order number after', maxAttempts, 'attempts');
      return serverError('Failed to generate order number');
    }

    console.log('[save-order] Generated order number:', orderNumber);

    // Extract metadata from session
    const metadata = session.metadata || {};

    console.log('[save-order] Session metadata:', JSON.stringify(metadata, null, 2));

    // Validate required fields
    if (!metadata.shippingName || !metadata.shippingAddressLine1 || !metadata.shippingCity || !metadata.shippingPostcode) {
      console.error('[save-order] Missing required shipping details in metadata');
      console.log('[save-order] Available metadata:', Object.keys(metadata));
      return validationError('Missing shipping details in session metadata');
    }

    // Create order in database
    const orderData = {
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
      shipping_postcode: metadata.shippingPostcode,
      shipping_country: metadata.shippingCountry || 'United Kingdom',
    };

    console.log('[save-order] Inserting order data:', JSON.stringify(orderData, null, 2));

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (insertError) {
      console.error('[save-order] Database insert error:', JSON.stringify(insertError, null, 2));
      return serverError('Database insert failed');
    }

    console.log('[save-order] Order saved successfully:', orderNumber);

    return successResponse({
      orderNumber: orderNumber,
      sessionId: sessionId,
      orderId: order.id,
    });
  } catch (error) {
    console.error('[save-order] ===== EXCEPTION =====');
    console.error('[save-order] Error type:', typeof error);
    console.error('[save-order] Error:', error);
    if (error instanceof Error) {
      console.error('[save-order] Error message:', error.message);
      console.error('[save-order] Stack:', error.stack);
    } else {
      console.error('[save-order] Error (non-Error object):', JSON.stringify(error));
    }
    console.error('[save-order] ===== END EXCEPTION =====');
    return serverError(error instanceof Error ? error.message : 'Failed to save order');
  }
}
