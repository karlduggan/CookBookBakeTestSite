import bcrypt from 'bcryptjs';
import { createSupabaseClient } from '../utils/supabase.js';
import { successResponse, validationError, serverError, validateRequired, validateEmail } from '../utils/response.js';
import { generateTokens, setTokenCookie } from '../utils/auth.js';

const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ success: false, error: 'Method not allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}');

    // Validate required fields
    const missingField = validateRequired(body, ['email', 'password']);
    if (missingField) {
      return validationError(missingField);
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return validationError('Invalid email format');
    }

    const supabase = createSupabaseClient();

    // Find user by email
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, is_admin')
      .eq('email', body.email.toLowerCase())
      .single();

    if (queryError || !user) {
      // Don't reveal if email exists
      return validationError('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(body.password, user.password_hash);
    if (!passwordMatch) {
      return validationError('Invalid email or password');
    }

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      isAdmin: user.is_admin,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': setTokenCookie(tokens.accessToken),
      },
      body: JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            isAdmin: user.is_admin,
          },
          accessToken: tokens.accessToken,
        },
      }),
    };
  } catch (error) {
    return serverError(error);
  }
};

export { handler };
