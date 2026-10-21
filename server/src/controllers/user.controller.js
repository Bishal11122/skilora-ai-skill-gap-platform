import { FieldValue } from 'firebase-admin/firestore';
import { db as defaultDb, adminAuth as defaultAuth } from '../config/firebaseAdmin.js';
import { deleteResumeFile } from '../services/supabaseStorage.service.js';

let activeDb = undefined;
let activeAuth = undefined;

/**
 * Returns the active Firestore database instance with unit test injection support.
 */
export function getDb() {
  if (activeDb !== undefined) {
    return activeDb;
  }
  return defaultDb;
}

/**
 * Injects a mock Firestore database instance for unit tests.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * Returns the active Firebase Admin Auth instance with unit test injection support.
 */
export function getAdminAuth() {
  if (activeAuth !== undefined) {
    return activeAuth;
  }
  return defaultAuth;
}

/**
 * Injects a mock Firebase Admin Auth instance for unit tests.
 * @internal
 */
export function setAdminAuthForTesting(mockAuth) {
  activeAuth = mockAuth;
}

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
    extractedSkills: Array.isArray(data.extractedSkills) ? data.extractedSkills : [],
    skillsExtractedAt: data.skillsExtractedAt ? toIso(data.skillsExtractedAt) : null,
    assessedSkills: Array.isArray(data.assessedSkills) ? data.assessedSkills : [],
    lastAssessmentId: data.lastAssessmentId || null,
    lastAssessedAt: data.lastAssessedAt ? toIso(data.lastAssessedAt) : null,
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
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: {
          message: 'Database service is not configured',
          code: 'DB_UNAVAILABLE',
        },
      });
    }

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
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: {
          message: 'Database service is not configured',
          code: 'DB_UNAVAILABLE',
        },
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const docSnap = await userRef.get();

    if (docSnap.exists) {
      // Idempotent: return existing profile unchanged
      return res.status(200).json({
        data: formatUserProfile(docSnap.data()),
      });
    }

    const nowIso = new Date().toISOString();
    const newProfile = {
      uid: req.user.uid,
      displayName: req.validatedBody.displayName,
      email: req.user.email || '',
      selectedCareerId: null,
      selectedCareerAt: null,
      createdAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : nowIso,
      updatedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : nowIso,
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
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: {
          message: 'Database service is not configured',
          code: 'DB_UNAVAILABLE',
        },
      });
    }

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
      updatedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
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
 * Strictly preserves historical assessments, quiz attempts, and extracted skills.
 */
export async function updateMyCareer(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: {
          message: 'Database service is not configured',
          code: 'DB_UNAVAILABLE',
        },
      });
    }

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
      selectedCareerAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
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
 * DELETE /api/users/me
 * Permanently deletes the current authenticated user's account and all associated user-owned data:
 * - Resume files in Supabase Storage and Firestore resumes/{uid}
 * - Diagnostic assessment records in Firestore assessments (userId == uid)
 * - Practice quiz attempts in Firestore quizzes (userId == uid)
 * - User profile document and subcollections in Firestore users/{uid}
 * - Firebase Authentication user account via Admin SDK
 *
 * Security & Ownership:
 * - Strictly enforces authorization via req.user.uid (never client-supplied ID)
 * - Requires explicit confirmation in request body (confirmation: 'DELETE' or 'DELETE_MY_ACCOUNT')
 * - Checks recent authentication (if authTime present and > 900 seconds, returns 401 RECENT_AUTH_REQUIRED)
 * - Never modifies or deletes shared career benchmarks, curated resources, or question banks
 * - Truthfully reports partial failures if any critical step cannot be completed
 */
export async function deleteMyAccount(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: {
          message: 'Database service is not configured',
          code: 'DB_UNAVAILABLE',
        },
      });
    }

    const uid = req.user.uid;

    // Verify recent authentication if authTime is present
    if (req.user.authTime && typeof req.user.authTime === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const authAgeSeconds = nowSeconds - req.user.authTime;
      // If older than 15 minutes (900 seconds), enforce re-authentication
      if (authAgeSeconds > 900) {
        return res.status(401).json({
          error: {
            message:
              'For your security, deleting your account requires recent authentication. Please sign out and sign in again before proceeding.',
            code: 'RECENT_AUTH_REQUIRED',
          },
        });
      }
    }

    const deletionErrors = [];
    let resumeDeleted = false;
    let storageFileDeleted = false;
    let assessmentsDeletedCount = 0;
    let quizzesDeletedCount = 0;
    let profileDeleted = false;
    let authDeleted = false;

    // 1. Delete user-owned resume file in Supabase Storage and metadata in resumes/{uid}
    try {
      const resumeRef = db.collection('resumes').doc(uid);
      const resumeSnap = await resumeRef.get();

      if (resumeSnap.exists) {
        const resumeData = resumeSnap.data() || {};
        const rawStoragePath = resumeData.storagePath;

        if (rawStoragePath && typeof rawStoragePath === 'string') {
          const cleanPath = rawStoragePath.startsWith('resumes/')
            ? rawStoragePath.slice('resumes/'.length)
            : rawStoragePath;

          // Strictly enforce that storage file is strictly inside this user's folder
          if (cleanPath.startsWith(`${uid}/`)) {
            const storageRes = await deleteResumeFile(cleanPath);
            if (storageRes && storageRes.success) {
              storageFileDeleted = true;
            } else if (storageRes && storageRes.error) {
              deletionErrors.push(`Storage file deletion failed: ${storageRes.error}`);
            }
          } else {
            deletionErrors.push('Resume storage path does not match authenticated user prefix');
          }
        }

        await resumeRef.delete();
        resumeDeleted = true;
      }
    } catch (err) {
      deletionErrors.push(`Failed to clean up resume records: ${err.message}`);
    }

    // 2. Delete all diagnostic assessment records owned by this user
    try {
      const assessSnap = await db.collection('assessments').where('userId', '==', uid).get();
      if (assessSnap && !assessSnap.empty) {
        for (const doc of assessSnap.docs) {
          if (typeof doc.ref?.delete === 'function') {
            await doc.ref.delete();
          } else if (typeof db.collection('assessments').doc === 'function') {
            await db.collection('assessments').doc(doc.id).delete?.();
          }
          assessmentsDeletedCount += 1;
        }
      }
    } catch (err) {
      deletionErrors.push(`Failed to delete assessment records: ${err.message}`);
    }

    // 3. Delete all practice quiz attempts owned by this user
    try {
      const quizSnap = await db.collection('quizzes').where('userId', '==', uid).get();
      if (quizSnap && !quizSnap.empty) {
        for (const doc of quizSnap.docs) {
          if (typeof doc.ref?.delete === 'function') {
            await doc.ref.delete();
          } else if (typeof db.collection('quizzes').doc === 'function') {
            await db.collection('quizzes').doc(doc.id).delete?.();
          }
          quizzesDeletedCount += 1;
        }
      }
    } catch (err) {
      deletionErrors.push(`Failed to delete quiz records: ${err.message}`);
    }

    // 4. Delete user document and subcollections in users/{uid}
    try {
      const userRef = db.collection('users').doc(uid);

      if (typeof userRef.listCollections === 'function') {
        const subcollections = await userRef.listCollections();
        for (const subcol of subcollections) {
          const subSnap = await subcol.get();
          for (const sDoc of subSnap.docs) {
            await sDoc.ref?.delete?.();
          }
        }
      }

      await userRef.delete();
      profileDeleted = true;
    } catch (err) {
      deletionErrors.push(`Failed to delete user profile document: ${err.message}`);
    }

    // 5. Delete Firebase Authentication user
    const adminAuth = getAdminAuth();
    if (adminAuth && typeof adminAuth.deleteUser === 'function') {
      try {
        await adminAuth.deleteUser(uid);
        authDeleted = true;
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          authDeleted = true;
        } else {
          deletionErrors.push(`Firebase auth deletion failed: ${err.message}`);
        }
      }
    } else {
      // Document external limitation honestly if Firebase Admin auth is not available
      deletionErrors.push('Firebase Admin Authentication service is not configured to delete auth credentials');
    }

    // If any deletions failed, report partial failure truthfully
    if (deletionErrors.length > 0) {
      return res.status(207).json({
        error: {
          message: 'Account deletion encountered partial failures. Some data could not be removed.',
          code: 'PARTIAL_DELETION_FAILURE',
          details: {
            profileDeleted,
            resumeDeleted,
            storageFileDeleted,
            assessmentsDeletedCount,
            quizzesDeletedCount,
            authDeleted,
            errors: deletionErrors,
          },
        },
      });
    }

    return res.status(200).json({
      data: {
        message: 'Account and all associated personal data permanently deleted successfully.',
        deleted: {
          profile: profileDeleted,
          resume: resumeDeleted,
          assessmentsCount: assessmentsDeletedCount,
          quizzesCount: quizzesDeletedCount,
          auth: authDeleted,
        },
      },
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
  deleteMyAccount,
  getDb,
  setDbForTesting,
  getAdminAuth,
  setAdminAuthForTesting,
};
