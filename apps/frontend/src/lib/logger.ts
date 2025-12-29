/**
 * Logger utility that only logs in development mode
 * In production, errors are silently handled to avoid exposing sensitive information
 */

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, ...args);
    }
    // In production, you might want to send errors to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  },
  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, ...args);
    }
  },
  log: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, ...args);
    }
  },
};

