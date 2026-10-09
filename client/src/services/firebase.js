import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

export const missingFirebaseEnv = REQUIRED_ENV_VARS.filter(
  (varName) => !env || !env[varName]
);

export const isFirebaseConfigured = missingFirebaseEnv.length === 0;

let app;
let auth = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} else {
  // Clear developer-facing notice naming missing variable NAMES without crashing silently
  console.warn(
    `[Firebase Client] Missing required environment variables: ${missingFirebaseEnv.join(
      ', '
    )}. Please add them to client/.env following client/.env.example.`
  );
}

export { auth };
export default auth;
