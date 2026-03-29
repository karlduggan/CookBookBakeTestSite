import { Handler } from '@netlify/functions';
import { clearTokenCookie } from '../utils/auth.js';

const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': clearTokenCookie(),
      },
      body: JSON.stringify({
        success: true,
        data: { message: 'Logged out successfully' },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Internal server error' }),
    };
  }
};

export { handler };
