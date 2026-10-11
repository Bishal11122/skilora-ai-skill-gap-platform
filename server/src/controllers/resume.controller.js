import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebaseAdmin.js';
import {
  isStorageConfigured,
  uploadResumeFile,
  deleteResumeFile,
} from '../services/supabaseStorage.service.js';
import {
  validateResumeBuffer,
  validateConsent,
  sanitizeFileName,
} from '../validators/resumeFile.validator.js';

/**
 * Format resume metadata for client response.
 * Strips raw cloud storage path to preserve internal infrastructure privacy.
 */
function formatResumeResponse(data) {
  if (!data) return null;

  const toIso = (val) => {
    if (!val) return new Date().toISOString();
    if (typeof val.toDate === 'function') return val.toDate().toISOString();
    if (val instanceof Date) return val.toISOString();
    return String(val);
  };

  return {
    originalFileName: data.originalFileName || 'resume.pdf',
    contentType: data.contentType || 'application/pdf',
    fileSize: data.fileSize || 0,
    targetCareerId: data.targetCareerId || null,
    consentedAt: toIso(data.consentedAt),
    uploadedAt: toIso(data.uploadedAt),
    updatedAt: toIso(data.updatedAt),
  };
}

/**
 * Normalizes a storage path by stripping any legacy bucket name prefix.
 * e.g., 'resumes/uid/uuid.pdf' -> 'uid/uuid.pdf'
 */
function normalizeStoragePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return '';
  return rawPath.startsWith('resumes/') ? rawPath.slice('resumes/'.length) : rawPath;
}

/**
 * GET /api/resume
 * Retrieves current authenticated user's resume metadata from Firestore `resumes/{uid}`.
 */
export async function getMyResume(req, res, next) {
  try {
    const resumeRef = db.collection('resumes').doc(req.user.uid);
    const docSnap = await resumeRef.get();

    if (!docSnap.exists) {
      return res.status(200).json({
        data: {
          resume: null,
        },
      });
    }

    return res.status(200).json({
      data: {
        resume: formatResumeResponse(docSnap.data()),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/resume
 * Uploads a new resume file to private Supabase Storage and stores metadata in Firestore.
 */
export async function createMyResume(req, res, next) {
  let uploadedPath = null;

  try {
    // 1. Consent verification
    if (!validateConsent(req.body?.consent)) {
      return res.status(400).json({
        error: {
          message: 'Explicit consent is required to store your resume privately',
        },
      });
    }

    // 2. File presence check
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'A resume file (.pdf or .docx) is required',
        },
      });
    }

    // 3. User must have an active selected career
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    if (!userSnap.exists || !userData?.selectedCareerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before uploading a resume',
        },
      });
    }

    // 4. User cannot already have a resume (use PUT to replace)
    const resumeRef = db.collection('resumes').doc(req.user.uid);
    const existingSnap = await resumeRef.get();

    if (existingSnap.exists) {
      return res.status(409).json({
        error: {
          message: 'A resume has already been uploaded. Use PUT to replace it.',
        },
      });
    }

    // 5. Storage availability gate (Never pretend success if unconfigured)
    if (!isStorageConfigured()) {
      return res.status(503).json({
        error: {
          message:
            'Storage service is not configured. Please contact the administrator.',
        },
      });
    }

    // 6. Validate file buffer and signature
    const validation = validateResumeBuffer(
      req.file.buffer,
      req.file.originalname
    );

    if (!validation.valid) {
      return res.status(validation.status).json({
        error: {
          message: validation.message,
        },
      });
    }

    // 7. Generate safe private storage path inside user directory
    const randomId = crypto.randomUUID();
    uploadedPath = `${req.user.uid}/${randomId}.${validation.ext}`;
    const sanitizedName = sanitizeFileName(req.file.originalname);

    // 8. Upload to Supabase Private Storage
    await uploadResumeFile(
      uploadedPath,
      req.file.buffer,
      validation.contentType
    );

    // 9. Write metadata to Cloud Firestore
    const metadata = {
      userId: req.user.uid,
      originalFileName: sanitizedName,
      storagePath: uploadedPath,
      storageProvider: 'supabase',
      contentType: validation.contentType,
      fileSize: req.file.buffer.length,
      targetCareerId: userData.selectedCareerId,
      consentedAt: FieldValue.serverTimestamp(),
      uploadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      await resumeRef.set(metadata);
    } catch (dbError) {
      // Clean up orphaned storage object if database write fails
      if (uploadedPath) {
        await deleteResumeFile(uploadedPath).catch(() => {});
      }
      throw dbError;
    }

    const savedSnap = await resumeRef.get();

    return res.status(201).json({
      data: {
        resume: formatResumeResponse(savedSnap.data()),
      },
    });
  } catch (error) {
    if (uploadedPath) {
      await deleteResumeFile(uploadedPath).catch(() => {});
    }
    next(error);
  }
}

/**
 * PUT /api/resume
 * Replaces an existing resume. Safe order of operations:
 * 1. Validate new file
 * 2. Upload new storage object
 * 3. Update Firestore metadata
 * 4. Clean up old storage object
 */
export async function replaceMyResume(req, res, next) {
  let newUploadedPath = null;

  try {
    // 1. Consent verification
    if (!validateConsent(req.body?.consent)) {
      return res.status(400).json({
        error: {
          message: 'Explicit consent is required to replace your resume',
        },
      });
    }

    // 2. File presence check
    if (!req.file) {
      return res.status(400).json({
        error: {
          message: 'A replacement resume file (.pdf or .docx) is required',
        },
      });
    }

    // 3. Storage availability check
    if (!isStorageConfigured()) {
      return res.status(503).json({
        error: {
          message:
            'Storage service is not configured. Please contact the administrator.',
        },
      });
    }

    // 4. Verify existing resume document exists
    const resumeRef = db.collection('resumes').doc(req.user.uid);
    const existingSnap = await resumeRef.get();

    if (!existingSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'No existing resume found to replace. Use POST to upload.',
        },
      });
    }

    const oldData = existingSnap.data();

    // 5. User must have an active selected career
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();
    const targetCareerId = userSnap.data()?.selectedCareerId;

    if (!targetCareerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before uploading a resume',
        },
      });
    }

    // 6. Validate new file buffer and signature
    const validation = validateResumeBuffer(
      req.file.buffer,
      req.file.originalname
    );

    if (!validation.valid) {
      return res.status(validation.status).json({
        error: {
          message: validation.message,
        },
      });
    }

    // 7. Upload new storage object
    const newRandomId = crypto.randomUUID();
    newUploadedPath = `${req.user.uid}/${newRandomId}.${validation.ext}`;
    const sanitizedName = sanitizeFileName(req.file.originalname);

    await uploadResumeFile(
      newUploadedPath,
      req.file.buffer,
      validation.contentType
    );

    // 8. Update Firestore metadata
    const updatedMetadata = {
      userId: req.user.uid,
      originalFileName: sanitizedName,
      storagePath: newUploadedPath,
      storageProvider: 'supabase',
      contentType: validation.contentType,
      fileSize: req.file.buffer.length,
      targetCareerId,
      consentedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      await resumeRef.update(updatedMetadata);
    } catch (dbError) {
      // Revert newly uploaded file on failure to keep old state intact
      if (newUploadedPath) {
        await deleteResumeFile(newUploadedPath).catch(() => {});
      }
      throw dbError;
    }

    // 9. Best-effort deletion of old storage object (only after metadata update succeeded)
    if (oldData?.storagePath && typeof oldData.storagePath === 'string') {
      const oldCleanPath = normalizeStoragePath(oldData.storagePath);
      if (oldCleanPath.startsWith(`${req.user.uid}/`)) {
        await deleteResumeFile(oldCleanPath).catch(() => {});
      }
    }

    const savedSnap = await resumeRef.get();

    return res.status(200).json({
      data: {
        resume: formatResumeResponse(savedSnap.data()),
      },
    });
  } catch (error) {
    if (newUploadedPath) {
      await deleteResumeFile(newUploadedPath).catch(() => {});
    }
    next(error);
  }
}

/**
 * DELETE /api/resume
 * Deletes current user's resume object from Supabase Storage and document from Firestore.
 */
export async function deleteMyResume(req, res, next) {
  try {
    const resumeRef = db.collection('resumes').doc(req.user.uid);
    const docSnap = await resumeRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'No resume found to delete',
        },
      });
    }

    const data = docSnap.data();

    // Verify ownership and expected path prefix
    if (data.userId === req.user.uid && data.storagePath) {
      const cleanPath = normalizeStoragePath(data.storagePath);
      if (cleanPath.startsWith(`${req.user.uid}/`)) {
        await deleteResumeFile(cleanPath).catch(() => {});
      }
    }

    // Delete Firestore metadata
    await resumeRef.delete();

    return res.status(200).json({
      data: {
        message: 'Resume deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getMyResume,
  createMyResume,
  replaceMyResume,
  deleteMyResume,
};
