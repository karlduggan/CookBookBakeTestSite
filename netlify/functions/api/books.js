import { Handler } from '@netlify/functions';
import { createSupabaseAnonClient } from './utils/supabase.js';
import { successResponse, errorResponse, serverError, validationError } from './utils/response.js';

interface ListBooksQuery {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  featured?: string;
  bestseller?: string;
}

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

    const query = event.queryStringParameters as unknown as ListBooksQuery;
    const page = parseInt(query?.page || '1', 10);
    const limit = Math.min(parseInt(query?.limit || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return validationError('Page and limit must be positive numbers');
    }

    const supabase = createSupabaseAnonClient();
    let queryBuilder = supabase
      .from('books')
      .select('*,categories(id,name,slug)', { count: 'exact' });

    // Apply filters
    if (query?.category) {
      queryBuilder = queryBuilder.eq('categories.slug', query.category);
    }

    if (query?.featured === 'true') {
      queryBuilder = queryBuilder.eq('featured', true);
    }

    if (query?.bestseller === 'true') {
      queryBuilder = queryBuilder.eq('bestseller', true);
    }

    // Search across title, author, and description
    if (query?.search) {
      const searchTerm = `%${query.search}%`;
      queryBuilder = queryBuilder.or(
        `title.ilike.${searchTerm},author.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Database error:', error);
      return serverError(error.message);
    }

    return successResponse({
      books: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    return serverError(error as Error);
  }
};

export { handler };
