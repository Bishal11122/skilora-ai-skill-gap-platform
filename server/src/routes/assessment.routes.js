import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getAssessmentStatus,
  startAssessment,
  submitAssessment,
  getAssessmentResult,
} from '../controllers/assessment.controller.js';
import { validateSubmitAssessment } from '../validators/assessment.validator.js';

const router = Router();

// All assessment endpoints require valid Firebase Bearer token authentication
router.use(authenticate);

// Assessment session workflows
router.get('/status', getAssessmentStatus);
router.post('/start', startAssessment);
router.post('/submit', validateSubmitAssessment, submitAssessment);
router.get('/results/:assessmentId', getAssessmentResult);

export default router;
