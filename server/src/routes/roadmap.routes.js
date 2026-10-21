import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getRoadmap,
  generateRoadmap,
  updateMilestoneStatus,
} from '../controllers/roadmap.controller.js';

const router = Router();

// All roadmap endpoints require Firebase Bearer authentication
router.use(authenticate);

// GET /api/roadmap - Retrieve active roadmap
router.get('/', getRoadmap);

// POST /api/roadmap/generate - Generate/regenerate personalized roadmap
router.post('/generate', generateRoadmap);

// PATCH /api/roadmap/milestones/:order - Update milestone status or topic
router.patch('/milestones/:order', updateMilestoneStatus);

export default router;
