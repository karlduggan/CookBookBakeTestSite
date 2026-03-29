import { createSupabaseClient } from '../../utils/supabase.js';
import { authenticateRequest } from '../../utils/auth.js';
import { successResponse, unauthorizedError, serverError } from '../../utils/response.js';

// GET /api/admin/analytics - Get sales analytics

export default async (req) => {
  try {
    const { isAuthenticated, user, error: authError } = authenticateRequest(req.headers);

    if (!isAuthenticated || !user) {
      return unauthorizedError('Unauthorized');
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return forbiddenError('Admin access required');
    }

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createSupabaseClient();
    const analytics = await getAnalytics(supabase);

    return successResponse(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return serverError();
  }
};

async function getAnalytics(supabase) {
  // Get total orders
  const { data: ordersData, count: totalOrders } = await supabase
    .from('orders')
    .select('id, total_amount, status, created_at', { count: 'exact' });

  // Get total revenue (paid orders only)
  const { data: paidOrders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'paid');

  const totalRevenue = (paidOrders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('users')
    .select('id', { count: 'exact' })
    .eq('is_admin', false);

  // Get total books
  const { count: totalBooks } = await supabase.from('books').select('id', { count: 'exact' });

  // Get average order value
  const averageOrderValue = totalOrders && totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Get order status breakdown
  const { data: statusCounts } = await supabase.rpc('get_order_status_counts');

  // Get top selling books
  const { data: topBooks } = await supabase.from('order_items').select('book_id, quantity').order('quantity', {
    ascending: false,
  }).limit(5);

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, total_amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    summary: {
      totalOrders: totalOrders || 0,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalCustomers: totalCustomers || 0,
      totalBooks: totalBooks || 0,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
    },
    orderStatus: statusCounts || {
      pending: 0,
      processing: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    },
    topBooks: topBooks || [],
    recentOrders: recentOrders || [],
  };
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
