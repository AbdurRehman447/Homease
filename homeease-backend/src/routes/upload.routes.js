import express from 'express';
import {
  uploadProviderAvatar,
  uploadProviderCoverImage,
  uploadProviderDocuments,
  uploadUserAvatar,
  uploadImage,
} from '../controllers/upload.controller.js';
import { authenticate, isProvider, isCustomer } from '../middleware/auth.js';
import {
  uploadImage as uploadImageMiddleware,
  uploadMultipleDocuments,
  handleMulterError,
} from '../middleware/upload.js';

const router = express.Router();

// All upload routes require authentication
router.use(authenticate);

// Provider image uploads
router.post(
  '/provider/avatar',
  isProvider,
  uploadImageMiddleware,
  handleMulterError,
  uploadProviderAvatar
);

router.post(
  '/provider/cover',
  isProvider,
  uploadImageMiddleware,
  handleMulterError,
  uploadProviderCoverImage
);

router.post(
  '/provider/documents',
  isProvider,
  uploadMultipleDocuments,
  handleMulterError,
  uploadProviderDocuments
);

// User image uploads
router.post(
  '/user/avatar',
  isCustomer,
  uploadImageMiddleware,
  handleMulterError,
  uploadUserAvatar
);

// Generic image upload
router.post('/image', uploadImageMiddleware, handleMulterError, uploadImage);

export default router;
