import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getRoadmapResources,
  getCatalogResources,
  getSkillResources,
} from '../controllers/resource.controller.js';

const router = Router();

// All resource routes require Firebase Bearer token authentication
router.use(authenticate);

// GET /api/resources - Retrieve curated resources mapped to user's roadmap milestones
router.get('/', getRoadmapResources);

// GET /api/resources/catalog - Query entire global catalog
router.get('/catalog', getCatalogResources);

// GET /api/resources/skill/:skillName - Query resources for a specific skill
router.get('/skill/:skillName', getSkillResources);

export default router;
