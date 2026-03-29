import { Handler } from '@netlify/functions';
import { stripe } from '../utils/stripe.js';
import { createSupabaseClient } from '../utils/supabase.js';
import { sendOrderConfirmationEmail } from '../utils/email.js';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const signature = event.headers['stripe-signature'] as string;
    if (!signature) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing Stripe signature' }),
      };
    }

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body || '',
        signature,
        STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid signature' }),
      };
    }

    // Handle checkout.session.completed event
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as any;

      // Prevent duplicate processing
      const supabase = createSupabaseClient();

      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', session.payment_intent)
        .single();

      if (existingOrder) {
        console.log('Order already processed for session:', session.id);
        return {
          statusCode: 200,
          body: JSON.stringify({ received: true }),
        };
      }

      // Generate unique order number
      const orderNumber = `CBB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get session line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      // Prepare order data
      const {
        userId,
        email,
        shippingName,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingPostcode,
        shippingCountry,
        totalAmount,
        subtotal,
        shippingCost,
        taxAmount,
      } = session.metadata;

      // Calculate total (already includes shipping and tax)
      const total = parseFloat(totalAmount);

      // Create order in Supabase
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: userId !== 'guest' ? userId : null,
          guest_email: userId === 'guest' ? email : null,
          total_amount: total,
          status: 'payment_received',
          stripe_payment_intent_id: session.payment_intent,
          shipping_name: shippingName,
          shipping_address_line1: shippingAddressLine1,
          shipping_address_line2: shippingAddressLine2 || null,
          shipping_city: shippingCity,
          shipping_postcode: shippingPostcode,
          shipping_country: shippingCountry,
        })
        .select('id')
        .single();

      if (orderError || !newOrder) {
        console.error('Failed to create order:', orderError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to create order' }),
        };
      }

      // Create order items and reduce stock
      const items = lineItems.data;
      const orderItems = [];
      const stockUpdates = [];

      for (const item of items) {
        // Skip shipping item
        if (item.description === 'Standard Shipping') {
          continue;
        }

        // Find book by product name
        const { data: book } = await supabase
          .from('books')
          .select('id, title, author')
          .ilike('title', `%${item.description?.split(' by ')[0] || ''}%`)
          .single();

        if (book) {
          // Create order item
          orderItems.push({
            order_id: newOrder.id,
            book_id: book.id,
            quantity: item.quantity,
            price_at_purchase: (item.price_data?.unit_amount || 0) / 100,
            title_snapshot: book.title,
            author_snapshot: book.author,
          });

          // Queue stock reduction
          stockUpdates.push({
            bookId: book.id,
            quantity: item.quantity,
          });
        }
      }

      // Insert order items
      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

        if (itemsError) {
          console.error('Failed to create order items:', itemsError);
        }
      }

      // Reduce stock for each book (with transaction-like safety)
      for (const update of stockUpdates) {
        const { data: currentBook } = await supabase
          .from('books')
          .select('stock_quantity')
          .eq('id', update.bookId)
          .single();

        if (currentBook) {
          const newStock = Math.max(0, currentBook.stock_quantity - update.quantity);
          await supabase.from('books').update({ stock_quantity: newStock }).eq('id', update.bookId);
        }
      }

      // Send order confirmation email
      const orderData = {
        orderNumber,
        email,
        firstName: shippingName.split(' ')[0],
        items: orderItems.map((item) => ({
          title: item.title_snapshot,
          author: item.author_snapshot,
          quantity: item.quantity,
          price: item.price_at_purchase,
        })),
        total,
        shippingAddress: `${shippingAddressLine1}, ${shippingCity}, ${shippingPostcode}, ${shippingCountry}`,
      };

      await sendOrderConfirmationEmail(orderData);

      console.log('Order created successfully:', orderNumber);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook handler failed' }),
    };
  }
};

export { handler };
