import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load server/.env regardless of current working directory, with override enabled
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });

export const PORT = Number(process.env.PORT) || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Returns a list of explicitly allowed client origins, merging default production
 * and development domains with any comma-separated entries in CLIENT_URL / ALLOWED_ORIGINS.
 */
export function getAllowedOrigins() {
  const envOrigins = [process.env.CLIENT_URL, process.env.ALLOWED_ORIGINS]
    .filter(Boolean)
    .flatMap((val) =>
      typeof val === 'string'
        ? val.split(',').map((s) => s.trim().replace(/\/+$/, ''))
        : []
    )
    .filter(Boolean);

  return Array.from(
    new Set([
      'https://skilora-ai-skill-gap-platform.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      ...envOrigins,
    ])
  );
}

export const FIREBASE_SERVICE_ACCOUNT_PATH = (process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '')
  .trim()
  .replace(/^["']|["']$/g, '');
export const FIREBASE_STORAGE_BUCKET = (process.env.FIREBASE_STORAGE_BUCKET || '')
  .trim()
  .replace(/^["']|["']$/g, '');

function sanitizeSupabaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    return parsed.origin;
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}

// Supabase Private Storage Configuration
export const SUPABASE_URL = sanitizeSupabaseUrl(
  process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || ''
);
export const SUPABASE_SERVICE_ROLE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  ''
)
  .trim()
  .replace(/^["']|["']$/g, '');
export const SUPABASE_STORAGE_BUCKET = (process.env.SUPABASE_STORAGE_BUCKET || 'resumes')
  .trim()
  .replace(/^["']|["']$/g, '') || 'resumes';

// Groq Cloud API Configuration (Strictly backend-only)
export function getGroqApiKey() {
  return (process.env.GROQ_API_KEY || '')
    .trim()
    .replace(/^["']|["']$/g, '');
}

export const GROQ_MODEL = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile')
  .trim()
  .replace(/^["']|["']$/g, '') || 'llama-3.3-70b-versatile';

export function isGroqConfigured() {
  const key = getGroqApiKey();
  return Boolean(key);
}

export default {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_STORAGE_BUCKET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET,
  get GROQ_API_KEY() {
    return getGroqApiKey();
  },
  GROQ_MODEL,
  isGroqConfigured,
  getGroqApiKey,
  getAllowedOrigins,
};
