import app from './app.js';
import { PORT, NODE_ENV } from './config/env.js';

app.listen(PORT, () => {
  console.log(`[server]: Skill Gap Platform API running in ${NODE_ENV} mode`);
  console.log(`[server]: Listening on port ${PORT} -> http://localhost:${PORT}`);
  console.log(`[server]: Health check available at http://localhost:${PORT}/api/health`);
});
