import { createSupabaseAnonClient } from '../../lib/api-utils/supabase.js';
import { successResponse, errorResponse, serverError, notFoundError } from '../../lib/api-utils/response.js';

export async function GET(context) {
  try {
    const url = new URL(context.request.url);
    const bookId = url.searchParams.get('id');

    if (!bookId) {
      return errorResponse('Missing book id', 'MISSING_PARAM', 400);
    }

    const supabase = createSupabaseAnonClient();

    // Try to fetch by UUID first, then by slug (using title)
    let { data, error } = await supabase
      .from('books')
      .select('*,categories(id,name,slug,description)', { count: 'exact' })
      .eq('id', bookId)
      .single();

    // If not found by ID, try by slugified title
    if (error || !data) {
      const { data: bookBySlug, error: slugError } = await supabase
        .from('books')
        .select('*,categories(id,name,slug,description)', { count: 'exact' })
        .ilike('title', `%${bookId}%`)
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
