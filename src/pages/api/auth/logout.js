import { clearTokenCookie } from '../../../lib/api-utils/auth.js';

export async function POST(context) {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: { message: 'Logged out successfully' },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': clearTokenCookie(),
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
