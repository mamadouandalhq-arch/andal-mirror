export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  exp?: number;
}

/**
 * Decodes a JWT token and returns its payload
 * @param token - JWT token string
 * @returns Decoded JWT payload or null if decoding fails
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - JWT token string or null
 * @param bufferSeconds - Optional buffer time in seconds before considering token expired
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(
  token: string | null,
  bufferSeconds = 0,
): boolean {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp <= now + bufferSeconds;
}

/**
 * Determines the redirect path based on user role from JWT token
 * @param token - JWT token string or null
 * @returns '/admin' for admin users, '/dashboard' for others or if token is invalid
 */
export function getRedirectPathForRole(token: string | null): string {
  if (!token) return '/dashboard';

  const decoded = decodeJWT(token);
  if (!decoded) return '/dashboard';

  return decoded.role === 'admin' ? '/admin' : '/dashboard';
}

/**
 * Gets the home path based on user role
 * Admins go to /admin, regular users go to /dashboard
 * @param role - User role string
 * @returns '/admin' for admin users, '/dashboard' for others
 */
export function getHomePathForRole(role: string | undefined | null): string {
  return role === 'admin' ? '/admin' : '/dashboard';
}

