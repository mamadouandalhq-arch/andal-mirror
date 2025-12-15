const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { authStorage } from './auth-storage';

export interface ApiError {
  message: string;
  statusCode?: number;
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // Important: sends refreshToken cookie
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }
      const data = await response.json();
      authStorage.setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const accessToken = authStorage.getAccessToken();

  // Add Authorization header if token exists
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    (headers as Record<string, string>)[
      'Authorization'
    ] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for cookies (refresh token)
  });

  // If 401 Unauthorized, try to refresh token
  if (response.status === 401 && accessToken) {
    try {
      const newAccessToken = await refreshAccessToken();

      // Retry original request with new token
      (headers as Record<string, string>)[
        'Authorization'
      ] = `Bearer ${newAccessToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } catch {
      // Refresh failed, user needs to login again
      authStorage.clearAccessToken();
      // Redirect to login or handle as needed
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      message: 'An error occurred',
      statusCode: response.status,
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  // Check if response has content and is JSON
  const contentType = response.headers.get('content-type');
  const hasJsonContent =
    contentType && contentType.includes('application/json');

  // If no content or empty body, return null
  const text = await response.text();
  if (!text.trim()) {
    return null as T;
  }

  // Try to parse as JSON if it looks like JSON or has JSON content type
  if (
    hasJsonContent ||
    text.trim().startsWith('{') ||
    text.trim().startsWith('[')
  ) {
    try {
      return JSON.parse(text) as T;
    } catch {
      // If JSON parsing fails but we expected JSON, return null
      return null as T;
    }
  }

  // Return raw text if not JSON
  return text as T;
}

export const apiClient = {
  post: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
