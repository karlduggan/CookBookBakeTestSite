import { createSupabaseClient } from '../utils/supabase.js';
import { successResponse, unauthorizedError, serverError, validateRequired } from '../utils/response.js';
import { authenticateRequest } from '../utils/auth.js';

const handler = async (event) => {
  try {
    // Authenticate request
    const auth = authenticateRequest(event.headers, string | string[] | undefined>);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const supabase = createSupabaseClient();

    if (event.httpMethod === 'GET') {
      // Fetch user's addresses
      const { data: addresses, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', auth.user.userId)
        .order('created_at', { ascending: false });

      if (error) {
        return serverError(error.message);
      }

      return successResponse({ addresses: addresses || [] });
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');

      // Validate required fields
      const missingField = validateRequired(body, ['addressLine1', 'city', 'postcode']);
      if (missingField) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: missingField }),
        };
      }

      // Create address
      const { data: newAddress, error } = await supabase
        .from('addresses')
        .insert({
          user_id: auth.user.userId,
          address_line1: body.addressLine1,
          address_line2: body.addressLine2 || null,
          city: body.city,
          county: body.county || null,
          postcode: body.postcode,
          country: body.country || 'United Kingdom',
          is_default: body.isDefault || false,
        })
        .select('*')
        .single();

      if (error) {
        return serverError(error.message);
      }

      return {
        statusCode: 201,
        body: JSON.stringify({
          success: true,
          data: newAddress,
        }),
      };
    }

    if (event.httpMethod === 'DELETE') {
      const addressId = event.queryStringParameters?.id;

      if (!addressId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ success: false, error: 'Missing address ID' }),
        };
      }

      // Verify address belongs to user
      const { data: address } = await supabase
        .from('addresses')
        .select('id')
        .eq('id', addressId)
        .eq('user_id', auth.user.userId)
        .single();

      if (!address) {
        return unauthorizedError('Address not found');
      }

      // Delete address
      const { error } = await supabase.from('addresses').delete().eq('id', addressId);

      if (error) {
        return serverError(error.message);
      }

      return successResponse({ message: 'Address deleted' });
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  } catch (error) {
    return serverError(error);
  }
};

export { handler };
