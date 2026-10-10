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
    selectedCareerId: data.selectedCareerId || null,
    selectedCareerAt: data.selectedCareerAt ? toIso(data.selectedCareerAt) : null,
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
      selectedCareerId: null,
      selectedCareerAt: null,
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

/**
 * PUT /api/users/me/career
 * Updates user's selected career after verifying the careerId exists and is active.
 */
export async function updateMyCareer(req, res, next) {
  try {
    const { careerId } = req.validatedBody;

    // Verify career exists and is active in Firestore
    const careerRef = db.collection('careers').doc(careerId);
    const careerSnap = await careerRef.get();

    if (!careerSnap.exists || !careerSnap.data()?.active) {
      return res.status(404).json({
        error: {
          message: 'Selected career does not exist or is inactive',
        },
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'User profile not found',
        },
      });
    }

    const updates = {
      selectedCareerId: careerId,
      selectedCareerAt: FieldValue.serverTimestamp(),
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
  updateMyCareer,
};
