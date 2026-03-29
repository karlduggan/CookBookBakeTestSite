import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Generate refresh token (long-lived)
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return {
      isValid: true,
      payload,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid token',
    };
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

/**
 * Extract JWT from cookies
 */
export const extractTokenFromCookies = (cookieHeader) => {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const [key, value] = cookie.trim().split('=');
      return [key, decodeURIComponent(value)];
    })
  );

  return cookies['accessToken'] || null;
};

/**
 * Authenticate request and return user info
 */
export const authenticateRequest = (headers) => {
  const authHeader = headers.authorization;
  const cookieHeader = headers.cookie;

  const token = extractTokenFromHeader(authHeader) || extractTokenFromCookies(cookieHeader);

  if (!token) {
    return {
      isAuthenticated: false,
      error: 'No token provided',
    };
  }

  const result = verifyToken(token);

  if (!result.isValid) {
    return {
      isAuthenticated: false,
      error: result.error || 'Invalid token',
    };
  }

  return {
    isAuthenticated: true,
    user: result.payload,
  };
};

/**
 * Set JWT cookie in response headers
 */
export const setTokenCookie = (
  token,
  httpOnly = true,
  secure = true,
  sameSite = 'Lax'
) => {
  const cookieAttrs = [
    `accessToken=${token}`,
    'Max-Age=900', // 15 minutes
    `SameSite=${sameSite}`,
  ];

  if (httpOnly) cookieAttrs.push('HttpOnly');
  if (secure) cookieAttrs.push('Secure');

  return cookieAttrs.join('; ');
};

/**
 * Clear JWT cookie
 */
export const clearTokenCookie = () => {
  return 'accessToken=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax';
};
