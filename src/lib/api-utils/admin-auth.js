import { authenticateRequest } from './auth.js';
import { createSupabaseClient } from './supabase.js';

/**
 * Check if user is authenticated and is an admin
 * Returns { isAdmin: boolean, user: object | null, error: string | null }
 */
export const checkAdminAccess = async (headers) => {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(headers);

    if (!auth.isAuthenticated) {
      return {
        isAdmin: false,
        user: null,
        error: 'Not authenticated',
      };
    }

    const userId = auth.user?.userId;
    if (!userId) {
      return {
        isAdmin: false,
        user: null,
        error: 'Invalid user ID',
      };
    }

    // Get user from database to check is_admin flag
    const supabase = createSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, is_admin')
      .eq('id', userId)
      .single();

    if (error || !user) {
      console.error('[admin-auth] Error fetching user:', error);
      return {
        isAdmin: false,
        user: null,
        error: 'User not found',
      };
    }

    if (!user.is_admin) {
      console.warn('[admin-auth] User', user.email, 'attempted admin access without permission');
      return {
        isAdmin: false,
        user: user,
        error: 'Not an admin user',
      };
    }

    return {
      isAdmin: true,
      user: user,
      error: null,
    };
  } catch (err) {
    console.error('[admin-auth] Error checking admin access:', err);
    return {
      isAdmin: false,
      user: null,
      error: 'Error checking admin access',
    };
  }
};

/**
 * Middleware/guard for admin API endpoints
 */
export const requireAdmin = async (context) => {
  const adminCheck = await checkAdminAccess(context.request.headers);

  if (!adminCheck.isAdmin) {
    return {
      status: 401,
      error: adminCheck.error || 'Unauthorized',
    };
  }

  return {
    status: 200,
    user: adminCheck.user,
  };
};
