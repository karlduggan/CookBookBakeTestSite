import { Handler } from '@netlify/functions';
import { createSupabaseClient } from '../utils/supabase';
import { successResponse, unauthorizedError, serverError } from '../utils/response';
import { authenticateRequest } from '../utils/auth';

const handler: Handler = async (event) => {
  try {
    // Authenticate request
    const auth = authenticateRequest(event.headers as Record<string, string | string[] | undefined>);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    if (event.httpMethod === 'GET') {
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
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body || '{}');

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
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  } catch (error) {
    return serverError(error as Error);
  }
};

export { handler };
