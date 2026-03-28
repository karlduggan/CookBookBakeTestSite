export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Create a successful API response
 */
export const successResponse = <T,>(data: T, statusCode = 200) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: true,
      data,
    } as ApiResponse<T>),
  };
};

/**
 * Create an error API response
 */
export const errorResponse = (error: string, code = 'ERROR', statusCode = 400) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      success: false,
      error,
      code,
    } as ApiResponse),
  };
};

/**
 * Create a validation error response
 */
export const validationError = (error: string) => {
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
export const serverError = (error: string | Error) => {
  const message = error instanceof Error ? error.message : error;
  console.error('Server error:', message);
  return errorResponse('Internal server error', 'SERVER_ERROR', 500);
};

/**
 * Validate required fields
 */
export const validateRequired = (
  data: Record<string, any>,
  fields: string[]
): string | null => {
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
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

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
