import { NODE_ENV } from '../config/env.js';

/**
 * Centralized Express error-handling middleware.
 * Returns { "error": { "message": "..." } } with the appropriate status code.
 * Stack traces are omitted in production environments.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse = {
    error: {
      message,
    },
  };

  // Include stack trace only in development/test environments
  if (NODE_ENV !== 'production' && err.stack) {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

export default errorHandler;
