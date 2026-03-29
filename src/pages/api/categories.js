import { createSupabaseAnonClient } from '../../lib/api-utils/supabase.js';
import { successResponse, serverError } from '../../lib/api-utils/response.js';

export async function GET(context) {
  try {
    const supabase = createSupabaseAnonClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return serverError(error);
    }

    return successResponse({
      categories: data || [],
    });
  } catch (error) {
    return serverError(error);
  }
}
