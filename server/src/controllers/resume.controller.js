import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebaseAdmin.js';
import { isGroqConfigured } from '../config/env.js';
import {
  isStorageConfigured,
  uploadResumeFile,
  deleteResumeFile,
  downloadResumeFile,
} from '../services/supabaseStorage.service.js';
import {
  validateResumeBuffer,
  validateConsent,
  sanitizeFileName,
} from '../validators/resumeFile.validator.js';
import {
  extractResumeText,
  ResumeParseError,
} from '../services/resumeParser.service.js';
import {
  extractSkillsWithGroq,
  GroqServiceError,
} from '../services/groq.service.js';


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

/**
 * POST /api/resume/analyze
 * Extracts and infers technical skills from the user's stored resume using Groq Cloud API.
 *
 * Strict Privacy & Integrity Rules:
 * 1. Analyzes only the current authenticated user's resume (req.user.uid).
 * 2. File is downloaded in-memory, parsed into transient text, and raw text is never stored in DB.
 * 3. Prompt injection defense with isolated data boundaries.
 * 4. Extracted skills validated via Zod, clamped to 0-100 integer range, and tagged with source: 'resume-inferred'.
 * 5. Persists structured skills in Firestore users/{uid}.extractedSkills.
 */
export async function analyzeMyResume(req, res, next) {
  try {
    // 1. Check AI service configuration
    if (!isGroqConfigured()) {
      return res.status(503).json({
        error: {
          message:
            'AI skill extraction service is not configured. Please contact the administrator.',
          code: 'GROQ_NOT_CONFIGURED',
        },
      });
    }

    // 2. Storage availability gate
    if (!isStorageConfigured()) {
      return res.status(503).json({
        error: {
          message:
            'Storage service is not configured. Please contact the administrator.',
          code: 'STORAGE_NOT_CONFIGURED',
        },
      });
    }

    // 3. Verify user's resume exists
    const resumeRef = db.collection('resumes').doc(req.user.uid);
    const resumeSnap = await resumeRef.get();

    if (!resumeSnap.exists) {
      return res.status(404).json({
        error: {
          message: 'No resume found to analyze. Please upload a resume first.',
          code: 'RESUME_NOT_FOUND',
        },
      });
    }

    const resumeData = resumeSnap.data();

    // Verify ownership
    if (resumeData.userId !== req.user.uid) {
      return res.status(403).json({
        error: {
          message: 'Unauthorized access to resume document',
          code: 'FORBIDDEN',
        },
      });
    }

    // 4. Verify target career
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    const targetCareerId =
      userData?.selectedCareerId || resumeData.targetCareerId;

    if (!targetCareerId) {
      return res.status(409).json({
        error: {
          message:
            'A target career must be selected before analyzing your resume.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    // Fetch target career metadata for benchmark context
    let targetCareerName = targetCareerId;
    let benchmarkSkills = [];

    try {
      const careerRef = db.collection('careers').doc(targetCareerId);
      const careerSnap = await careerRef.get();
      if (careerSnap.exists) {
        const cData = careerSnap.data();
        targetCareerName = cData.name || targetCareerId;
        benchmarkSkills = Array.isArray(cData.skills) ? cData.skills : [];
      }
    } catch {
      // Non-blocking fallback: proceed with career ID
    }

    // 5. Download resume file buffer in-memory
    const cleanStoragePath = normalizeStoragePath(resumeData.storagePath);
    let fileBuffer;
    try {
      fileBuffer = await downloadResumeFile(cleanStoragePath);
    } catch (downloadErr) {
      return res.status(downloadErr.status || 500).json({
        error: {
          message:
            'Failed to retrieve stored resume file from private storage.',
          code: 'STORAGE_DOWNLOAD_FAILED',
        },
      });
    }

    // 6. In-memory text extraction & sanitization (Phase 5 service)
    let parsedTextResult;
    try {
      parsedTextResult = await extractResumeText(
        fileBuffer,
        resumeData.originalFileName || 'resume.pdf'
      );
    } catch (parseErr) {
      if (parseErr instanceof ResumeParseError) {
        return res.status(parseErr.statusCode || 422).json({
          error: {
            message: parseErr.message,
            code: parseErr.code,
          },
        });
      }
      throw parseErr;
    }

    // 7. Extract skills using Groq Cloud API
    let extraction;
    try {
      extraction = await extractSkillsWithGroq(parsedTextResult.text, {
        targetCareerName,
        benchmarkSkills,
      });
    } catch (groqErr) {
      if (groqErr instanceof GroqServiceError) {
        return res.status(groqErr.statusCode || 502).json({
          error: {
            message: groqErr.message,
            code: groqErr.code,
          },
        });
      }
      throw groqErr;
    }

    // 8. Persist structured skill data in Firestore
    // Update users/{uid} with extractedSkills
    await userRef.update({
      extractedSkills: extraction.skills,
      skillsExtractedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update resumes/{uid} with analysis status (metadata only, zero raw text)
    await resumeRef.update({
      analysisStatus: 'completed',
      analyzedAt: FieldValue.serverTimestamp(),
      skillCount: extraction.skills.length,
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 9. Return structured response (never return raw extracted text)
    return res.status(200).json({
      data: {
        skills: extraction.skills,
        skillCount: extraction.skills.length,
        targetCareerId,
        targetCareerName,
        analyzedAt: new Date().toISOString(),
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
  analyzeMyResume,
};
