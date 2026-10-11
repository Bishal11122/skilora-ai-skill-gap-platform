import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import careerRoutes from './career.routes.js';
import resumeRoutes from './resume.routes.js';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use('/health', healthRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/careers', careerRoutes);
apiRouter.use('/resume', resumeRoutes);

export default apiRouter;
