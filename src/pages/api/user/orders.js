import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { successResponse, unauthorizedError, serverError } from '../../../lib/api-utils/response.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';

export async function GET(context) {
  try {
    // Authenticate request
    const auth = authenticateRequest(context.request.headers);

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
}
