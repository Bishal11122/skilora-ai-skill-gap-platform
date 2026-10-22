import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CLIENT_URL, getAllowedOrigins } from './config/env.js';
import apiRouter from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers with cross-origin resource policy enabled for API consumers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

/**
 * Validates whether an incoming Origin header is permitted.
 * - Missing/undefined origin: allowed (mobile apps, curl, server-to-server, Render health checks)
 * - Stable production domain (https://skilora-ai-skill-gap-platform.vercel.app)
 * - Vercel preview domains ending in .vercel.app
 * - Localhost / 127.0.0.1 development servers (http://localhost:5173, etc.)
 * - Explicitly configured origins from CLIENT_URL or ALLOWED_ORIGINS
 */
export function isOriginAllowed(origin) {
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/+$/, '');

  // Check explicit allowed origins list
  if (getAllowedOrigins().includes(normalized)) {
    return true;
  }

  // Local development origins
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalized)) {
    return true;
  }

  // Stable production and Vercel preview domains (*.vercel.app)
  if (/^https:\/\/([a-zA-Z0-9_-]+\.)*vercel\.app$/.test(normalized)) {
    return true;
  }

  return false;
}

export const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // Reject without throwing an unhandled Error (which bypasses CORS headers and causes 500)
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours preflight cache
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

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
