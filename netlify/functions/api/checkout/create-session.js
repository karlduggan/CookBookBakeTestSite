import { Handler } from '@netlify/functions';
import { createSupabaseClient } from '../utils/supabase.js';
import { stripe } from '../utils/stripe.js';
import { successResponse, validationError, serverError, unauthorizedError } from '../utils/response.js';
import { authenticateRequest } from '../utils/auth.js';

interface CheckoutRequest {
  items: Array<{
    bookId: string;
    quantity: number;
  }>;
  shippingDetails: {
    name: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
    country: string;
  };
  guestEmail?: string;
}

const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}') as CheckoutRequest;

    // Validate cart items
    if (!body.items || body.items.length === 0) {
      return validationError('Cart is empty');
    }

    // Validate shipping details
    if (!body.shippingDetails || !body.shippingDetails.name || !body.shippingDetails.email) {
      return validationError('Missing shipping details');
    }

    // Authenticate optional (allow guest checkout)
    const auth = authenticateRequest(event.headers as Record<string, string | string[] | undefined>);
    const userId = auth.isAuthenticated ? auth.user?.userId : null;
    const email = body.shippingDetails.email;

    const supabase = createSupabaseClient();

    // Fetch book details and validate stock
    const bookIds = body.items.map((item) => item.bookId);
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('id, title, author, price, stock_quantity, cover_image_url')
      .in('id', bookIds);

    if (booksError || !books) {
      return serverError('Failed to fetch books');
    }

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
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      billing_address_collection: 'required',
      success_url: `${process.env.PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.PUBLIC_SITE_URL}/checkout/cancelled`,
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

    return successResponse({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return serverError(error as Error);
  }
};

export { handler };
