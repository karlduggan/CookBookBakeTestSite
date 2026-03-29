import { Handler } from '@netlify/functions';
import { createSupabaseAnonClient } from './utils/supabase.js';
import { successResponse, errorResponse, serverError, notFoundError } from './utils/response.js';

const handler: Handler = async (event) => {
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: '',
      };
    }

    if (event.httpMethod !== 'GET') {
      return errorResponse('Method not allowed', 'METHOD_NOT_ALLOWED', 405);
    }

    const bookId = event.queryStringParameters?.id;

    if (!bookId) {
      return errorResponse('Missing book id', 'MISSING_PARAM', 400);
    }

    const supabase = createSupabaseAnonClient();

    // Try to fetch by UUID first, then by slug (using title as slug)
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

    // Get reviews if available
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, review_text, created_at')
      .eq('book_id', data.id);

    // Calculate average rating
    const averageRating =
      reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return successResponse({
      book: {
        ...data,
        reviews: reviews || [],
        averageRating,
        reviewCount: reviews?.length || 0,
      },
    });
  } catch (error) {
    return serverError(error as Error);
  }
};

export { handler };
