import Joi from 'joi';

// Create review validation
export const createReviewSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  comment: Joi.string().max(1000).optional().allow(''),
});

// Update review validation
export const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().max(1000).optional().allow(''),
});

// Provider response validation
export const respondToReviewSchema = Joi.object({
  response: Joi.string().max(500).required().messages({
    'string.max': 'Response cannot exceed 500 characters',
    'any.required': 'Response is required',
  }),
});

export default {
  createReviewSchema,
  updateReviewSchema,
  respondToReviewSchema,
};
