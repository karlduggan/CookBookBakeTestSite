
/**
 * Create a successful API response
 */
export const successResponse = (data, statusCode = 200) => {
  return new Response(JSON.stringify({
    success: true,
    data,
  }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Create an error API response
 */
export const errorResponse = (error, code = 'ERROR', statusCode = 400) => {
  return new Response(JSON.stringify({
    success: false,
    error,
    code,
  }), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Create a validation error response
 */
export const validationError = (error) => {
  return errorResponse(error, 'VALIDATION_ERROR', 400);
};

/**
 * Create an unauthorized error response
 */
export const unauthorizedError = (error = 'Unauthorized') => {
  return errorResponse(error, 'UNAUTHORIZED', 401);
};

/**
 * Create a forbidden error response
 */
export const forbiddenError = (error = 'Forbidden') => {
  return errorResponse(error, 'FORBIDDEN', 403);
};

/**
 * Create a not found error response
 */
export const notFoundError = (resource = 'Resource') => {
  return errorResponse(`${resource} not found`, 'NOT_FOUND', 404);
};

/**
 * Create a server error response
 */
export const serverError = (error) => {
  const message = error instanceof Error ? error.message : error;
  console.error('Server error:', message);
  return errorResponse('Internal server error', 'SERVER_ERROR', 500);
};

/**
 * Validate required fields
 */
export const validateRequired = (
  data,
  fields
) => {
  for (const field of fields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
