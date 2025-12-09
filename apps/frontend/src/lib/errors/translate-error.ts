import { useTranslations } from 'next-intl';

type TranslationFunction = ReturnType<typeof useTranslations>;

/**
 * Maps API error messages to translation keys
 */
const ERROR_MAPPINGS: Record<string, string> = {
  'Invalid credentials': 'errors.invalidCredentials',
  'User was created using Google!': 'errors.userCreatedWithGoogle',
  'Failed to fetch': 'errors.failedToFetch',
  'Session expired. Please login again.': 'errors.sessionExpired',
  'Failed to refresh token': 'errors.failedToRefreshToken',
  'An error occurred': 'errors.genericError',
};

/**
 * Translates API error messages to user-friendly messages in the current language
 */
export function translateError(error: unknown, t: TranslationFunction): string {
  // Handle Error instances
  if (error instanceof Error) {
    const errorMessage = error.message;

    // Check if we have a direct mapping
    if (ERROR_MAPPINGS[errorMessage]) {
      return t(ERROR_MAPPINGS[errorMessage]);
    }

    // Handle network errors (fetch failures)
    if (
      errorMessage === 'Failed to fetch' ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network')
    ) {
      return t('errors.networkError');
    }

    // If no mapping found, try to translate common patterns
    if (errorMessage.toLowerCase().includes('invalid credentials')) {
      return t('errors.invalidCredentials');
    }

    if (
      errorMessage.toLowerCase().includes('session') ||
      errorMessage.toLowerCase().includes('expired')
    ) {
      return t('errors.sessionExpired');
    }

    // Return original message if no translation found
    return errorMessage;
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (ERROR_MAPPINGS[error]) {
      return t(ERROR_MAPPINGS[error]);
    }
    return error;
  }

  // Fallback for unknown error types
  return t('errors.genericError');
}
