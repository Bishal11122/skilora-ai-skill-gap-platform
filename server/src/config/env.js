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

export default {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_STORAGE_BUCKET,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET,
};
