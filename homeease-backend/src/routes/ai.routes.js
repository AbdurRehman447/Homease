import express from 'express';
import { suggestService } from '../controllers/ai.controller.js';

const router = express.Router();

router.post('/suggest-service', suggestService);

export default router;
