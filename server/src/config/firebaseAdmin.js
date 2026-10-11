import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FIREBASE_SERVICE_ACCOUNT_PATH } from './env.js';

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

export { adminAuth, db, isAdminConfigured, adminApp };
export default {
  adminAuth,
  db,
  isAdminConfigured,
  adminApp,
};
