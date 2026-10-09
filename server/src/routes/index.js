import { Router } from 'express';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

// Mount individual domain route modules
apiRouter.use('/health', healthRoutes);

export default apiRouter;
