import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateUserProfile } from '../validators/user.validator.js';
import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
} from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication middleware
router.use(authenticate);

// Profile endpoints
router.get('/me', getMyProfile);
router.post('/me', validateUserProfile, createMyProfile);
router.patch('/me', validateUserProfile, updateMyProfile);

export default router;
