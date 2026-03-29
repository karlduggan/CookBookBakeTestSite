import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10', // Use stable API version
});

export { stripe };

/**
 * Create a Stripe Checkout session
 */
export const createCheckoutSession = async (params) => {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: params.lineItems,
    mode: 'payment',
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId || 'guest',
      ...params.metadata,
    },
  });
};

/**
 * Verify webhook signature
 */
export const verifyWebhookSignature = (
  body,
  signature,
  secret
) => {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
};

/**
 * Get Stripe customer by ID
 */
export const getCustomer = (customerId) => {
  return stripe.customers.retrieve(customerId);
};

/**
 * Create or retrieve Stripe customer
 */
export const getOrCreateCustomer = async (email, customerId) => {
  // If we already have a customer ID, retrieve it
  if (customerId) {
    return stripe.customers.retrieve(customerId);
  }

  // Search for existing customer by email
  const customers = await stripe.customers.list({ email, limit: 1 });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return stripe.customers.create({ email });
};
