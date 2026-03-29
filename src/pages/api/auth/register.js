import bcrypt from 'bcryptjs';
import { createSupabaseClient } from '../../../lib/api-utils/supabase.js';
import {
  successResponse,
  validationError,
  serverError,
  validateRequired,
  validateEmail,
  validatePassword,
} from '../../../lib/api-utils/response.js';
import { generateTokens, setTokenCookie } from '../../../lib/api-utils/auth.js';

export async function POST(context) {
  try {
    const body = await context.request.json();

    // Validate required fields
    const missingField = validateRequired(body, ['email', 'password', 'firstName', 'lastName']);
    if (missingField) {
      return validationError(missingField);
    }

    // Validate email format
    if (!validateEmail(body.email)) {
      return validationError('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.valid) {
      return validationError(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
    }

    const supabase = createSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single();

    if (existingUser) {
      return validationError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Create user in Supabase
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: body.email.toLowerCase(),
        password_hash: hashedPassword,
        first_name: body.firstName,
        last_name: body.lastName,
        email_verified: false,
      })
      .select('id, email, first_name, last_name, is_admin')
      .single();

    if (insertError || !newUser) {
      console.error('Registration error:', insertError);
      return serverError(insertError?.message || 'Failed to create user');
    }

    // Generate JWT tokens
    const tokens = generateTokens({
      userId: newUser.id,
      email: newUser.email,
      isAdmin: newUser.is_admin,
    });

    // TODO: Send verification email
    // await sendVerificationEmail(newUser.email, verificationToken);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.first_name,
            lastName: newUser.last_name,
            isAdmin: newUser.is_admin,
          },
          accessToken: tokens.accessToken,
        },
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': setTokenCookie(tokens.accessToken),
        },
      }
    );
  } catch (error) {
    return serverError(error);
  }
}
