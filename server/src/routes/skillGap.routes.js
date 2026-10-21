import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getSkillGapAnalysis } from '../controllers/skillGap.controller.js';

const router = Router();

// All skill gap endpoints require valid Firebase Bearer token authentication
router.use(authenticate);

// Real-time skill gap analysis calculation
router.get('/gap', getSkillGapAnalysis);

export default router;
