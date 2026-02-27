import { errorResponse } from '../utils/responseHandler.js';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return errorResponse(res, 'Validation failed', 400, errors);
    }

    // Replace req.body with validated and sanitized value
    req.body = value;
    next();
  };
};

export default validate;
