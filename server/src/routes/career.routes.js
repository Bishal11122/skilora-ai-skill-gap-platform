import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getCareers } from '../controllers/career.controller.js';

const router = Router();

// All career routes require authentication
router.use(authenticate);

// GET /api/careers
router.get('/', getCareers);

export default router;
