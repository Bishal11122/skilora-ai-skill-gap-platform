import { adminAuth, isAdminConfigured } from '../config/firebaseAdmin.js';

let activeAdminAuth = undefined;

export function getAdminAuth() {
  if (activeAdminAuth !== undefined) {
    return activeAdminAuth;
  }
  return adminAuth;
}

export function setAdminAuthForTesting(mockAuth) {
  activeAdminAuth = mockAuth;
}

/**
 * Authentication middleware that verifies the Firebase ID token in the Authorization header.
 *
 * Extracts 'Bearer <idToken>', verifies cryptographically via Firebase Admin SDK,
 * and attaches verified { uid, email, authTime } to req.user.
 */
export async function authenticate(req, res, next) {
  const currentAuth = getAdminAuth();
  if (!currentAuth && !isAdminConfigured) {
    return res.status(503).json({
      error: {
        message: 'Authentication service is not configured',
      },
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return res.status(401).json({
      error: {
        message: 'Authorization header is required',
      },
    });
  }

  const parts = authHeader.trim().split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({
      error: {
        message: 'Authorization header must follow format: Bearer <token>',
      },
    });
  }

  const idToken = parts[1];

  try {
    const decodedToken = await currentAuth.verifyIdToken(idToken);

    // Attach ONLY cryptographically verified properties. Never trust client body/params.
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      authTime: decodedToken.auth_time || null,
    };

    next();
  } catch (error) {
    // Return safe 401 message without leaking internal SDK stack traces
    return res.status(401).json({
      error: {
        message: 'Invalid or expired authentication token',
      },
    });
  }
}

export default authenticate;
