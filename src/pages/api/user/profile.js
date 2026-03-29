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

    // Fetch user profile
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, is_admin, created_at')
      .eq('id', auth.user.userId)
      .single();

    if (error || !user) {
      return unauthorizedError('User not found');
    }

    return successResponse({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(context) {
  try {
    // Authenticate request
    const auth = authenticateRequest(context.request.headers);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const body = await context.request.json();

    const supabase = createSupabaseClient();

    // Update user profile
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        first_name: body.firstName || undefined,
        last_name: body.lastName || undefined,
      })
      .eq('id', auth.user.userId)
      .select('id, email, first_name, last_name, is_admin')
      .single();

    if (error || !updated) {
      return serverError(error?.message || 'Failed to update profile');
    }

    return successResponse({
      id: updated.id,
      email: updated.email,
      firstName: updated.first_name,
      lastName: updated.last_name,
      isAdmin: updated.is_admin,
    });
  } catch (error) {
    return serverError(error);
  }
}
