import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { stripe } from '../../../lib/api-utils/stripe.js';
import { successResponse, validationError, serverError } from '../../../lib/api-utils/response.js';

export const prerender = false;

function generateOrderNumber() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${month}${day}`;
  const randomNum = Math.floor(Math.random() * 60466176);
  const randomStr = randomNum.toString(36).toUpperCase().padStart(5, '0');
  return `ORD-${dateStr}-${randomStr}`;
}

export async function POST(context) {
  try {
    console.log('[save-order] START');
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      console.log('[save-order] Missing session_id');
      return validationError('Missing session_id');
    }

    // Fetch session details from Stripe
    console.log('[save-order] Fetching session from Stripe:', sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('[save-order] Session retrieved');

    // Generate order number
    console.log('[save-order] Generating order number');
    const orderNumber = generateOrderNumber();
    console.log('[save-order] Generated:', orderNumber);

    // Create Supabase client with service role (bypass RLS)
    const supabase = createSupabaseClient();

    // Extract data from session
    const metadata = session.metadata || {};
    const shippingEmail = metadata.email || session.customer_email || '';
    const totalAmount = (session.amount_total || 0) / 100; // Convert from cents to pounds
    const subtotal = parseFloat(metadata.subtotal || '0');
    const shipping = parseFloat(metadata.shippingCost || '0');
    const tax = parseFloat(metadata.taxAmount || '0');

    console.log('[save-order] Saving order:', {
      orderNumber,
      sessionId,
      shippingEmail,
      totalAmount,
      subtotal,
      shipping,
      tax,
    });

    // Insert order into Supabase
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        stripe_session_id: sessionId,
        shipping_email: shippingEmail,
        shipping_name: metadata.shippingName || '',
        shipping_address_line1: metadata.shippingAddressLine1 || '',
        shipping_address_line2: metadata.shippingAddressLine2 || '',
        shipping_city: metadata.shippingCity || '',
        shipping_postcode: metadata.shippingPostcode || '',
        shipping_country: metadata.shippingCountry || 'United Kingdom',
        total: totalAmount,
        payment_status: session.payment_status,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        metadata: metadata,
      })
      .select();

    if (orderError) {
      console.error('[save-order] Supabase insert error:', orderError);
      console.error('[save-order] Error details:', orderError.message);
      return serverError('Failed to save order: ' + orderError.message);
    }

    console.log('[save-order] Order saved successfully:', orderData);

    // Return success with order number
    console.log('[save-order] Returning success');
    return successResponse({
      orderNumber: orderNumber,
      sessionId: sessionId,
    });
  } catch (error) {
    console.error('[save-order] EXCEPTION:', error);
    if (error instanceof Error) {
      console.error('[save-order] Error message:', error.message);
    }
    return serverError('Order number generation failed');
  }
}
