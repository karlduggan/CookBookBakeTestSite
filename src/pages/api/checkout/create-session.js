import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { stripe } from '../../../lib/api-utils/stripe.js';
import { successResponse, validationError, serverError, unauthorizedError } from '../../../lib/api-utils/response.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';

export async function POST(context) {
  try {
    console.log('[create-session] POST request received');
    console.log('[create-session] Content-Type:', context.request.headers.get('content-type'));
    console.log('[create-session] Content-Length:', context.request.headers.get('content-length'));

    // Clone the body to inspect it
    const bodyText = await context.request.text();
    console.log('[create-session] Raw body:', bodyText);
    console.log('[create-session] Body length:', bodyText.length);

    if (!bodyText) {
      console.error('[create-session] Body is empty!');
      return serverError('Request body is empty');
    }

    const body = JSON.parse(bodyText);
    console.log('[create-session] Request body:', JSON.stringify(body, null, 2));

    // Validate cart items
    if (!body.items || body.items.length === 0) {
      console.log('[create-session] Cart is empty');
      return validationError('Cart is empty');
    }

    // Validate shipping details
    if (!body.shippingDetails || !body.shippingDetails.name || !body.shippingDetails.email) {
      console.log('[create-session] Missing shipping details');
      return validationError('Missing shipping details');
    }

    // Authenticate optional (allow guest checkout)
    const auth = authenticateRequest(context.request.headers);
    const userId = auth.isAuthenticated ? auth.user?.userId : undefined;
    const email = body.shippingDetails.email;
    console.log('[create-session] User:', userId ? `ID ${userId}` : 'guest', 'Email:', email);

    const supabase = createSupabaseClient();
    console.log('[create-session] Supabase client created');

    // Fetch book details and validate stock
    const bookIds = body.items.map((item) => item.bookId);
    console.log('[create-session] Fetching books:', bookIds);

    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, price, stock_quantity, cover_image_url')
      .in('id', bookIds);

    if (booksError) {
      console.error('[create-session] Supabase error fetching books:', booksError);
      return serverError('Failed to fetch books: ' + booksError.message);
    }

    if (!books) {
      console.error('[create-session] No books returned from database');
      return serverError('Failed to fetch books');
    }

    console.log('[create-session] Found', books.length, 'books');

    // Create line items for Stripe
    const lineItems = body.items
      .map((cartItem) => {
        const book = books.find((b) => b.id === cartItem.bookId);
        if (!book) return null;

        // Validate stock
        if (book.stock_quantity < cartItem.quantity) {
          return null;
        }

        return {
          price_data: {
            currency: 'gbp',
            unit_amount: Math.round(book.price * 100), // Convert to pence
            product_data: {
              name: book.title,
              description: `by ${book.author}`,
              images: book.cover_image_url ? [book.cover_image_url] : [],
            },
          },
          quantity: cartItem.quantity,
        };
      })
      .filter((item) => item !== null);

    if (lineItems.length === 0) {
      return validationError('One or more items are out of stock');
    }

    // Calculate total for metadata
    const totalAmount = body.items.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.bookId);
      return sum + (book ? book.price * item.quantity : 0);
    }, 0);

    // Add shipping (£5.99 if under £30, free otherwise)
    const shippingCost = totalAmount >= 30 ? 0 : 5.99;
    const taxAmount = (totalAmount + shippingCost) * 0.2; // 20% VAT

    // Add shipping line item if applicable
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(shippingCost * 100),
          product_data: {
            name: 'Standard Shipping',
          },
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const siteUrl = import.meta.env.PUBLIC_SITE_URL || import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
    console.log('[create-session] Site URL:', siteUrl);
    console.log('[create-session] Creating Stripe session with', lineItems.length, 'line items');
    console.log('[create-session] Line items:', JSON.stringify(lineItems, null, 2));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'required',
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancelled`,
      metadata: {
        userId: userId || 'guest',
        email: email,
        itemCount: body.items.length.toString(),
        shippingName: body.shippingDetails.name,
        shippingAddressLine1: body.shippingDetails.addressLine1,
        shippingAddressLine2: body.shippingDetails.addressLine2 || '',
        shippingCity: body.shippingDetails.city,
        shippingPostcode: body.shippingDetails.postcode,
        shippingCountry: body.shippingDetails.country,
        totalAmount: (totalAmount + shippingCost + taxAmount).toFixed(2),
        subtotal: totalAmount.toFixed(2),
        shippingCost: shippingCost.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
      },
    });

    console.log('[create-session] Stripe session created:', checkoutSession.id);
    console.log('[create-session] Session URL:', checkoutSession.url);

    return successResponse({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('[create-session] Error:', error);
    if (error.message) {
      console.error('[create-session] Error message:', error.message);
    }
    if (error.code) {
      console.error('[create-session] Error code:', error.code);
    }
    return serverError(error.message || 'Checkout failed');
  }
}
