export const prerender = false;

import { createSupabaseAnonClient } from '../../../lib/api-utils/supabase.js';
import { successResponse, serverError, notFoundError } from '../../../lib/api-utils/response.js';

export async function GET(context) {
  try {
    const { id } = context.params;

    console.log('Book ID from params:', id);

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Missing book id' }), { status: 400 });
    }

    const supabase = createSupabaseAnonClient();

    // Try to fetch by UUID first, then by slug (using title)
    let { data, error } = await supabase
      .from('books')
      .select('*,categories(id,name,slug,description)', { count: 'exact' })
      .eq('id', id)
      .single();

    // If not found by ID, try by title
    if (error || !data) {
      const { data: bookBySlug, error: slugError } = await supabase
        .from('books')
        .select('*,categories(id,name,slug,description)', { count: 'exact' })
        .ilike('title', `%${id}%`)
        .single();

      if (slugError || !bookBySlug) {
        return notFoundError('Book');
      }

      data = bookBySlug;
    }

    return successResponse({
      book: data,
    });
  } catch (error) {
    return serverError(error);
  }
}
