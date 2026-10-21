import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';
import careerRoutes from './career.routes.js';
import resumeRoutes from './resume.routes.js';
import assessmentRoutes from './assessment.routes.js';
import skillGapRoutes from './skillGap.routes.js';
import roadmapRoutes from './roadmap.routes.js';
import resourceRoutes from './resource.routes.js';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use('/health', healthRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/careers', careerRoutes);
apiRouter.use('/resume', resumeRoutes);
apiRouter.use('/assessment', assessmentRoutes);
apiRouter.use('/skills', skillGapRoutes);
apiRouter.use('/roadmap', roadmapRoutes);
apiRouter.use('/resources', resourceRoutes);

export default apiRouter;
