import Joi from 'joi';

// Create booking validation
export const createBookingSchema = Joi.object({
  providerId: Joi.string().uuid().required(),
  serviceId: Joi.string().uuid().required(),
  date: Joi.date().greater('now').required().messages({
    'date.greater': 'Booking date must be in the future',
  }),
  timeSlot: Joi.string().required(),
  address: Joi.string().required(),
  area: Joi.string().required(),
  city: Joi.string().required(),
  notes: Joi.string().max(500).optional(),
  jobDescription: Joi.string().max(1000).optional(),
});

// Update booking status validation
export const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED').required(),
  cancellationReason: Joi.string().max(500).optional(),
});

// Cancel booking validation
export const cancelBookingSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});

export default {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
};
