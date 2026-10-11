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

export default {
  PORT,
  NODE_ENV,
  CLIENT_URL,
  FIREBASE_SERVICE_ACCOUNT_PATH,
  FIREBASE_STORAGE_BUCKET,
};
