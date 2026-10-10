import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_STORAGE_BUCKET } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let adminApp = null;
let adminAuth = null;
let db = null;
let isAdminConfigured = false;

const rawKeyPath = (FIREBASE_SERVICE_ACCOUNT_PATH || '').trim().replace(/^["']|["']$/g, '');

let resolvedKeyPath = '';
if (rawKeyPath) {
  if (path.isAbsolute(rawKeyPath) && fs.existsSync(rawKeyPath)) {
    resolvedKeyPath = rawKeyPath;
  } else {
    const serverRelPath = path.resolve(__dirname, '../../', rawKeyPath);
    if (fs.existsSync(serverRelPath)) {
      resolvedKeyPath = serverRelPath;
    } else {
      const cwdRelPath = path.resolve(process.cwd(), rawKeyPath);
      if (fs.existsSync(cwdRelPath)) {
        resolvedKeyPath = cwdRelPath;
      } else {
        // Fallback to server-relative path for error messaging
        resolvedKeyPath = serverRelPath;
      }
    }
  }
}

try {
  if (resolvedKeyPath && fs.existsSync(resolvedKeyPath)) {
    const serviceAccountRaw = fs.readFileSync(resolvedKeyPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountRaw);

    adminApp = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
          storageBucket: FIREBASE_STORAGE_BUCKET || undefined,
        })
      : getApps()[0];

    adminAuth = getAuth(adminApp);
    db = getFirestore(adminApp);
    isAdminConfigured = true;
  } else {
    // Graceful notice without leaking paths or keys; allows /api/health to function cleanly
    console.warn(
      '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_PATH is not set or file does not exist. Protected endpoints will return 503 until configured.'
    );
  }
} catch (error) {
  console.warn(
    `[Firebase Admin] Failed to initialize Firebase Admin SDK (${error.message}). Protected endpoints will return 503.`
  );
}

/**
 * Lazily retrieves the configured Cloud Storage bucket instance.
 * Returns null if Admin SDK is not configured, or if FIREBASE_STORAGE_BUCKET is empty.
 */
export function getStorageBucket() {
  if (!isAdminConfigured || !adminApp) {
    return null;
  }

  const bucketName = FIREBASE_STORAGE_BUCKET && FIREBASE_STORAGE_BUCKET.trim();
  if (!bucketName) {
    return null;
  }

  try {
    return getStorage(adminApp).bucket(bucketName);
  } catch (error) {
    console.warn(`[Firebase Admin] Failed to get storage bucket: ${error.message}`);
    return null;
  }
}

export { adminAuth, db, isAdminConfigured, adminApp };
export default {
  adminAuth,
  db,
  isAdminConfigured,
  adminApp,
  getStorageBucket,
};
