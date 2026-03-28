/**
 * Error handling utilities for Cook Book Bake
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Server errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_CART: 'INVALID_CART',
  OUT_OF_STOCK: 'OUT_OF_STOCK',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
};

/**
 * Map HTTP status codes to user-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Response) {
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'You need to be logged in to perform this action.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This resource already exists.';
      case 422:
        return 'Please check your input and try again.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'An error occurred on our end. Please try again later.';
      case 503:
        return 'Our service is temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again later.';
    }
  }

  if (error instanceof TypeError) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Handle API errors
 */
export async function handleApiError(response: Response): Promise<AppError> {
  let data: any = {};

  try {
    data = await response.json();
  } catch {
    // Response is not JSON
  }

  const message = data.error || getErrorMessage(response);
  const code = data.code || 'UNKNOWN_ERROR';

  return new AppError(message, code, response.status, data.details);
}

/**
 * Retry logic for failed requests
 */
export async function retryRequest<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const delayMs = options.delayMs || 1000;
  const backoffMultiplier = options.backoffMultiplier || 2;

  let lastError: Error | null = null;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= backoffMultiplier;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Form error helper - extracts validation errors from API response
 */
export function extractFormErrors(error: AppError): Record<string, string> {
  const errors: Record<string, string> = {};

  if (error.details?.validationErrors) {
    for (const validationError of error.details.validationErrors) {
      errors[validationError.field] = validationError.message;
    }
  }

  return errors;
}

/**
 * Log error for monitoring
 */
export function logError(error: unknown, context: Record<string, any> = {}): void {
  const errorData = {
    timestamp: new Date().toISOString(),
    context,
  };

  if (error instanceof AppError) {
    console.error('AppError:', {
      ...errorData,
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
  } else if (error instanceof Error) {
    console.error('Error:', {
      ...errorData,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    console.error('Unknown Error:', {
      ...errorData,
      error: String(error),
    });
  }
}
