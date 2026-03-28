import { createSupabaseClient } from '../../utils/supabase';
import { authenticateRequest } from '../../utils/auth';
import { successResponse, errorResponse, validationError, unauthorizedError, notFoundError, serverError } from '../../utils/response';

// GET /api/admin/orders - Get all orders
// PUT /api/admin/orders/:id - Update order status

export default async (req: Request) => {
  try {
    const { isAuthenticated, user, error: authError } = authenticateRequest(req.headers);

    if (!isAuthenticated || !user) {
      return unauthorizedError('Unauthorized');
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return forbiddenError('Admin access required');
    }

    const supabase = createSupabaseClient();
    const url = new URL(req.url);
    const orderId = url.searchParams.get('id');

    if (req.method === 'GET') {
      return await getAllOrders(req, supabase);
    } else if (req.method === 'PUT' && orderId) {
      return await updateOrderStatus(req, supabase, orderId);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Admin orders error:', error);
    return serverError();
  }
};

async function getAllOrders(req: Request, supabase: any) {
  try {
    const url = new URL(req.url);
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
        shippingName,
        shippingAddressLine1,
        shippingCity,
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
    return serverError();
  }
}

async function updateOrderStatus(req: Request, supabase: any, orderId: string) {
  try {
    const body = await req.json();

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
    return serverError();
  }
}

function forbiddenError(message: string) {
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
