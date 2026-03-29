import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import { successResponse, unauthorizedError, serverError, validationError, validateRequired } from '../../../lib/api-utils/response.js';
import { authenticateRequest } from '../../../lib/api-utils/auth.js';

export async function GET(context) {
  try {
    // Authenticate request
    const auth = authenticateRequest(context.request.headers);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const supabase = createSupabaseClient();

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
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(context) {
  try {
    // Authenticate request
    const auth = authenticateRequest(context.request.headers);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const body = await context.request.json();

    // Validate required fields
    const missingField = validateRequired(body, ['addressLine1', 'city', 'postcode']);
    if (missingField) {
      return validationError(missingField);
    }

    const supabase = createSupabaseClient();

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

    return new Response(
      JSON.stringify({
        success: true,
        data: newAddress,
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(context) {
  try {
    // Authenticate request
    const auth = authenticateRequest(context.request.headers);

    if (!auth.isAuthenticated || !auth.user) {
      return unauthorizedError();
    }

    const url = new URL(context.request.url);
    const addressId = url.searchParams.get('id');

    if (!addressId) {
      return validationError('Missing address ID');
    }

    const supabase = createSupabaseClient();

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
  } catch (error) {
    return serverError(error);
  }
}
