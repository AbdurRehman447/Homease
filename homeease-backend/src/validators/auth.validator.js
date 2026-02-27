import Joi from 'joi';

// User registration validation
export const registerUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  address: Joi.string().max(500).optional(),
  city: Joi.string().max(100).optional(),
});

// Provider registration validation
export const registerProviderSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().required(),
  bio: Joi.string().max(1000).optional(),
  experience: Joi.number().min(0).max(50).optional(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  location: Joi.string().required(),
  services: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'Please select at least one service',
  }),
});

// Login validation
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('CUSTOMER', 'PROVIDER', 'ADMIN').optional(),
});

// Refresh token validation
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required',
  }),
});

// Password reset request validation
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

// Password reset validation
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

// Change password validation
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

export default {
  registerUserSchema,
  registerProviderSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
