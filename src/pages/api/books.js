import dotenv from 'dotenv';
dotenv.config({ path: '/Users/cellsoftware/Documents/cookbookbake/.env.local' });

import { createSupabaseAnonClient } from '../../lib/api-utils/supabase.js';
import { successResponse, errorResponse, validationError, serverError } from '../../lib/api-utils/response.js';

export async function GET(context) {
  try {
    const url = new URL(context.request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return validationError('Page and limit must be positive numbers');
    }

    const supabase = createSupabaseAnonClient();
    let queryBuilder = supabase
      .from('books')
      .select('*,categories(id,name,slug)', { count: 'exact' });

    // Apply filters
    const category = url.searchParams.get('category');
    if (category) {
      queryBuilder = queryBuilder.eq('categories.slug', category);
    }

    const featured = url.searchParams.get('featured');
    if (featured === 'true') {
      queryBuilder = queryBuilder.eq('featured', true);
    }

    const bestseller = url.searchParams.get('bestseller');
    if (bestseller === 'true') {
      queryBuilder = queryBuilder.eq('bestseller', true);
    }

    // Search across title, author, and description
    const search = url.searchParams.get('search');
    if (search) {
      const searchTerm = `%${search}%`;
      queryBuilder = queryBuilder.or(
        `title.ilike.${searchTerm},author.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Database error:', error);
      return serverError(error);
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
    return serverError(error);
  }
}
