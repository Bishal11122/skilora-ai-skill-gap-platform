import { Router } from 'express';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use('/health', healthRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
