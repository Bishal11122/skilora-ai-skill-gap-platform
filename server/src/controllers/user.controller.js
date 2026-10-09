import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebaseAdmin.js';

/**
 * Format a Firestore user document snapshot data into a clean JSON response with ISO timestamp strings.
 */
function formatUserProfile(data) {
  if (!data) return null;

  const toIso = (val) => {
    if (!val) return new Date().toISOString();
    if (typeof val.toDate === 'function') {
      return val.toDate().toISOString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    return String(val);
  };

  return {
    uid: data.uid,
    displayName: data.displayName || '',
    email: data.email || '',
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

/**
 * GET /api/users/me
 * Retrieves current authenticated user's profile document from Firestore users/{uid}.
 */
export async function getMyProfile(req, res, next) {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'User profile not found',
        },
      });
    }

    return res.status(200).json({
      data: formatUserProfile(docSnap.data()),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users/me
 * Idempotently creates user profile if not present.
 * If already existing, returns 200 with existing profile without overwriting.
 * If newly created, returns 201.
 */
export async function createMyProfile(req, res, next) {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      // Idempotent: return existing profile unchanged
      return res.status(200).json({
        data: formatUserProfile(docSnap.data()),
      });
    }

    const newProfile = {
      uid: req.user.uid,
      displayName: req.validatedBody.displayName,
      email: req.user.email || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await userRef.set(newProfile);

    // Read back saved document to return generated server timestamps as ISO strings
    const createdSnap = await userRef.get();

    return res.status(201).json({
      data: formatUserProfile(createdSnap.data()),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/users/me
 * Updates user's displayName and updates updatedAt timestamp.
 */
export async function updateMyProfile(req, res, next) {
  try {
    const userRef = db.collection('users').doc(req.user.uid);
    const docSnap = await userRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'User profile not found',
        },
      });
    }

    const updates = {
      displayName: req.validatedBody.displayName,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await userRef.update(updates);

    const updatedSnap = await userRef.get();

    return res.status(200).json({
      data: formatUserProfile(updatedSnap.data()),
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
};
