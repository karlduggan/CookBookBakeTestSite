import { Handler } from '@netlify/functions';
import { createSupabaseAnonClient } from './utils/supabase.js';
import { successResponse, serverError } from './utils/response.js';

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
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          error: 'Method not allowed',
        }),
      };
    }

    const supabase = createSupabaseAnonClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return serverError(error.message);
    }

    return successResponse({
      categories: data || [],
    });
  } catch (error) {
    return serverError(error as Error);
  }
};

export { handler };
