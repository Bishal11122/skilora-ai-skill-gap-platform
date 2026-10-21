import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validateUserProfile, validateAccountDeletion } from '../validators/user.validator.js';
import { validateCareerSelection } from '../validators/career.validator.js';
import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  updateMyCareer,
  deleteMyAccount,
} from '../controllers/user.controller.js';

const router = Router();

// All user routes require authentication middleware
router.use(authenticate);

// Profile endpoints
router.get('/me', getMyProfile);
router.post('/me', validateUserProfile, createMyProfile);
router.patch('/me', validateUserProfile, updateMyProfile);
router.put('/me/career', validateCareerSelection, updateMyCareer);
router.delete('/me', validateAccountDeletion, deleteMyAccount);

export default router;
