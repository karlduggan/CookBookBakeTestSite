import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';
import { successResponse, errorResponse, validationError, unauthorizedError, notFoundError, serverError } from '../../../lib/api-utils/response.js';

// GET /api/admin/orders - Get all orders
// PUT /api/admin/orders/:id - Update order status

export async function GET(context) {
  return handleRequest(context, 'GET');
}

export async function PUT(context) {
  return handleRequest(context, 'PUT');
}

async function handleRequest(context, method) {
  try {
    const { isAuthenticated, user, error: authError } = authenticateRequest(context.request.headers);

    if (!isAuthenticated || !user) {
      return unauthorizedError('Unauthorized');
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return forbiddenError('Admin access required');
    }

    const supabase = createSupabaseClient();
    const url = new URL(context.request.url);
    const orderId = url.searchParams.get('id');

    if (method === 'GET') {
      return await getAllOrders(context, supabase);
    } else if (method === 'PUT' && orderId) {
      return await updateOrderStatus(context, supabase, orderId);
    }

    return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
  } catch (error) {
    console.error('Admin orders error:', error);
    return serverError(error);
  }
}

async function getAllOrders(context, supabase) {
  try {
    const url = new URL(context.request.url);
    const status = url.searchParams.get('status');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        user_id,
        guest_email,
        total_amount,
        status,
        stripe_payment_intent_id,
        created_at,
        shipping_name,
        shipping_address_line1,
        shipping_city,
        order_items(id, book_id, quantity, price_at_purchase)
      `,
        { count: 'exact' }
      );

    if (status) {
      query = query.eq('status', status);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return successResponse({
      orders: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    return serverError(error);
  }
}

async function updateOrderStatus(context, supabase, orderId) {
  try {
    const body = await context.request.json();

    if (!body.status) {
      return validationError('Status field is required');
    }

    const validStatuses = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return validationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single();

    if (fetchError || !existingOrder) {
      return notFoundError('Order not found');
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: body.status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return successResponse({
      message: `Order ${existingOrder.order_number} status updated to ${body.status}`,
      order: data,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return serverError(error);
  }
}

function forbiddenError(message) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
