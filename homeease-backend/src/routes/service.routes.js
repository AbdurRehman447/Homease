import express from 'express';
import {
  getAllServices,
  getServiceById,
  getServiceCategories,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);

// Admin routes
router.post('/', authenticate, isAdmin, createService);
router.put('/:id', authenticate, isAdmin, updateService);
router.delete('/:id', authenticate, isAdmin, deleteService);

export default router;
