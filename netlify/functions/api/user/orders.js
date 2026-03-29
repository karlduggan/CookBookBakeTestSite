import { createSupabaseClient } from '../utils/supabase.js';
import { successResponse, unauthorizedError, serverError } from '../utils/response.js';
import { authenticateRequest } from '../utils/auth.js';

const handler = async (event) => {
  try {
    if (event.httpMethod !== 'GET') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    // Authenticate request
    const auth = authenticateRequest(event.headers, string | string[] | undefined>);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const supabase = createSupabaseClient();

    // Fetch user's orders with items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total_amount,
        status,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          price_at_purchase,
          title_snapshot,
          author_snapshot
        )
      `
      )
      .eq('user_id', auth.user.userId)
      .order('created_at', { ascending: false });

    if (error) {
      return serverError(error.message);
    }

    return successResponse({
      orders: (orders || []).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
};

export { handler };
