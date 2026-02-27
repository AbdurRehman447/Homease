// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Common error responses
export const errorMessages = {
  // Authentication
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  ACCOUNT_DISABLED: 'Your account has been disabled',
  EMAIL_EXISTS: 'Email already registered',

  // Authorization
  FORBIDDEN: 'You do not have permission to perform this action',
  ROLE_REQUIRED: 'Insufficient permissions',

  // Resources
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',

  // Validation
  VALIDATION_ERROR: 'Validation error',
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED_FIELD: 'Missing required field',

  // Server
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};

// Error factory functions
export const createError = {
  badRequest: (message = 'Bad request') => new ApiError(400, message),
  unauthorized: (message = errorMessages.UNAUTHORIZED) => new ApiError(401, message),
  forbidden: (message = errorMessages.FORBIDDEN) => new ApiError(403, message),
  notFound: (message = errorMessages.NOT_FOUND) => new ApiError(404, message),
  conflict: (message = 'Resource conflict') => new ApiError(409, message),
  unprocessable: (message = 'Unprocessable entity') => new ApiError(422, message),
  internal: (message = errorMessages.INTERNAL_ERROR) => new ApiError(500, message),
};

export default ApiError;
