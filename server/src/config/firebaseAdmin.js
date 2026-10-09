import fs from 'fs';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { FIREBASE_SERVICE_ACCOUNT_PATH } from './env.js';

let adminAuth = null;
let db = null;
let isAdminConfigured = false;

try {
  if (FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(FIREBASE_SERVICE_ACCOUNT_PATH)) {
    const serviceAccountRaw = fs.readFileSync(FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountRaw);

    const app = getApps().length === 0
      ? initializeApp({
          credential: cert(serviceAccount),
        })
      : getApps()[0];

    adminAuth = getAuth(app);
    db = getFirestore(app);
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

export { adminAuth, db, isAdminConfigured };
export default {
  adminAuth,
  db,
  isAdminConfigured,
};
