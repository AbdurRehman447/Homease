import express from 'express';
import {
  registerUser,
  registerProvider,
  login,
  refreshToken,
  getProfile,
  logout,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerUserSchema,
  registerProviderSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/auth.validator.js';

const router = express.Router();

// Public routes
router.post('/register/user', validate(registerUserSchema), registerUser);
router.post('/register/provider', validate(registerProviderSchema), registerProvider);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;
