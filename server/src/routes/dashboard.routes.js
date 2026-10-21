import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getDashboardData } from '../controllers/dashboard.controller.js';

const router = Router();

// All dashboard endpoints require valid Firebase authentication
router.use(authenticate);

// GET /api/dashboard/analytics - Phase 12 Visual Analytics & Progress Reporting
router.get('/analytics', getDashboardData);

export default router;
