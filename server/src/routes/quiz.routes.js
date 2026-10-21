import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import {
  getQuizSkills,
  startQuiz,
  submitQuiz,
  getQuizAttempt,
  getQuizHistory,
} from '../controllers/quiz.controller.js';
import {
  validateStartQuiz,
  validateSubmitQuiz,
} from '../validators/quiz.validator.js';

const router = Router();

// All quiz endpoints require Firebase Bearer token authentication
router.use(authenticate);

// List available quiz skills
router.get('/skills', getQuizSkills);

// Start a new skill quiz
router.post('/start', validateStartQuiz, startQuiz);

// Submit quiz answers
router.post('/submit', validateSubmitQuiz, submitQuiz);

// Retrieve past quiz history
router.get('/history', getQuizHistory);

// Retrieve specific attempt details
router.get('/attempts/:attemptId', getQuizAttempt);

export default router;
