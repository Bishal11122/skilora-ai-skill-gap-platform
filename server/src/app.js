import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CLIENT_URL } from './config/env.js';
import apiRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration: permit CLIENT_URL as well as default Vite dev ports
const allowedOrigins = Array.from(
  new Set([CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'].filter(Boolean))
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount central API router at /api
app.use('/api', apiRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
