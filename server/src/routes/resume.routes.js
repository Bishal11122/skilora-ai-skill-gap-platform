import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { handleResumeUpload } from '../middleware/upload.js';
import {
  getMyResume,
  createMyResume,
  replaceMyResume,
  deleteMyResume,
  analyzeMyResume,
} from '../controllers/resume.controller.js';

const router = Router();

// All resume endpoints require authentication
router.use(authenticate);

// Resume metadata and file operations
router.get('/', getMyResume);
router.post('/', handleResumeUpload, createMyResume);
router.put('/', handleResumeUpload, replaceMyResume);
router.delete('/', deleteMyResume);

// AI Skill Extraction (Groq Cloud API)
router.post('/analyze', analyzeMyResume);

export default router;
