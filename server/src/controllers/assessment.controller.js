import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db as defaultDb } from '../config/firebaseAdmin.js';
import {
  getQuestionsForCareer,
  sanitizeQuestionsForClient,
  gradeAssessmentSubmission,
} from '../data/diagnosticQuestions.js';

let activeDb = null;

/**
 * Returns the active Firestore database instance, with support for test injection.
 * @internal
 */
export function getDb() {
  return activeDb || defaultDb;
}

/**
 * Allows injecting a mock Firestore DB instance for offline unit testing.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * Helper to convert Firestore timestamp or ISO string to ISO string.
 */
function toIso(val) {
  if (!val) return new Date().toISOString();
  if (typeof val.toDate === 'function') {
    return val.toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  return String(val);
}

/**
 * GET /api/assessment/status
 * Retrieves current assessment readiness and active/last session status for authenticated user.
 */
export async function getAssessmentStatus(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        error: { message: 'User profile not found', code: 'USER_NOT_FOUND' },
      });
    }

    const userData = userSnap.data();
    const selectedCareerId = userData.selectedCareerId;

    if (!selectedCareerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before taking an assessment.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    // Resolve target career name
    let careerName = selectedCareerId;
    try {
      const careerRef = db.collection('careers').doc(selectedCareerId);
      const careerSnap = await careerRef.get();
      if (careerSnap.exists) {
        careerName = careerSnap.data()?.name || selectedCareerId;
      }
    } catch {
      // Non-blocking fallback
    }

    // Check for active in-progress assessment
    let activeAssessment = null;
    const activeQuerySnap = await db
      .collection('assessments')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'in_progress')
      .limit(1)
      .get();

    if (!activeQuerySnap.empty) {
      const activeDoc = activeQuerySnap.docs[0];
      const data = activeDoc.data();
      const deadlineMs = data.deadline ? new Date(data.deadline).getTime() : 0;

      // If active assessment has not expired, return it
      if (deadlineMs && Date.now() < deadlineMs) {
        let questions = [];
        try {
          const rawQuestions = getQuestionsForCareer(data.careerId || selectedCareerId);
          questions = sanitizeQuestionsForClient(rawQuestions);
        } catch {
          // Fallback if career questions missing
        }

        activeAssessment = {
          assessmentId: activeDoc.id,
          careerId: data.careerId,
          careerName: data.careerName || careerName,
          status: 'in_progress',
          timeLimitSeconds: data.timeLimitSeconds || 600,
          startedAt: toIso(data.startedAt),
          deadline: toIso(data.deadline),
          remainingSeconds: Math.max(0, Math.round((deadlineMs - Date.now()) / 1000)),
          totalQuestions: data.totalQuestions || questions.length,
          questions,
        };
      }
    }

    // Check for last completed assessment
    let lastAssessment = null;
    if (userData.lastAssessmentId) {
      try {
        const lastSnap = await db.collection('assessments').doc(userData.lastAssessmentId).get();
        if (lastSnap.exists) {
          const lData = lastSnap.data();
          lastAssessment = {
            assessmentId: lastSnap.id,
            careerId: lData.careerId,
            careerName: lData.careerName,
            overallScore: lData.overallScore,
            totalCorrect: lData.totalCorrect,
            totalQuestions: lData.totalQuestions,
            timeSpentSeconds: lData.timeSpentSeconds,
            skillScores: lData.skillScores || [],
            completedAt: toIso(lData.completedAt),
          };
        }
      } catch {
        // Fallback
      }
    }

    return res.status(200).json({
      data: {
        selectedCareerId,
        careerName,
        hasActiveAssessment: Boolean(activeAssessment),
        activeAssessment,
        lastAssessment,
        assessedSkills: Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/assessment/start
 * Initializes a new 10-minute diagnostic assessment session for the user's selected career.
 * Delivers sanitized questions (no answers/explanations).
 */
export async function startAssessment(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    // 1. Verify user profile and selected career
    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        error: { message: 'User profile not found', code: 'USER_NOT_FOUND' },
      });
    }

    const userData = userSnap.data();
    const selectedCareerId = userData.selectedCareerId;

    if (!selectedCareerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before starting an assessment.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    // 2. Fetch career metadata & canonical questions
    let careerName = selectedCareerId;
    try {
      const careerRef = db.collection('careers').doc(selectedCareerId);
      const careerSnap = await careerRef.get();
      if (careerSnap.exists) {
        careerName = careerSnap.data()?.name || selectedCareerId;
      }
    } catch {
      // Non-blocking fallback
    }

    let canonicalQuestions;
    try {
      canonicalQuestions = getQuestionsForCareer(selectedCareerId);
    } catch (err) {
      return res.status(400).json({
        error: {
          message: err.message || `No diagnostic assessment available for career: ${selectedCareerId}`,
          code: 'CAREER_NOT_SUPPORTED',
        },
      });
    }

    const sanitizedQuestions = sanitizeQuestionsForClient(canonicalQuestions);

    // 3. Check for existing active assessment (idempotent resume if unexpired)
    const activeQuerySnap = await db
      .collection('assessments')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'in_progress')
      .limit(1)
      .get();

    if (!activeQuerySnap.empty) {
      const activeDoc = activeQuerySnap.docs[0];
      const data = activeDoc.data();
      const deadlineMs = data.deadline ? new Date(data.deadline).getTime() : 0;

      // If still within deadline and for the same career, return active session
      if (deadlineMs && Date.now() < deadlineMs && data.careerId === selectedCareerId) {
        return res.status(200).json({
          data: {
            assessmentId: activeDoc.id,
            careerId: data.careerId,
            careerName: data.careerName || careerName,
            timeLimitSeconds: data.timeLimitSeconds || 600,
            startedAt: toIso(data.startedAt),
            deadline: toIso(data.deadline),
            remainingSeconds: Math.max(0, Math.round((deadlineMs - Date.now()) / 1000)),
            totalQuestions: sanitizedQuestions.length,
            questions: sanitizedQuestions,
          },
        });
      }

      // If expired, mark as abandoned
      if (deadlineMs && Date.now() >= deadlineMs) {
        await activeDoc.ref.update({
          status: 'abandoned',
          updatedAt: FieldValue.serverTimestamp(),
        }).catch(() => {});
      }
    }

    // 4. Create new assessment session with server-enforced deadline
    const assessmentId = `assess_${crypto.randomUUID()}`;
    const timeLimitSeconds = 600; // 10 minutes
    const gracePeriodSeconds = 15; // 15 seconds network transit grace
    const startedAt = new Date().toISOString();
    const deadline = new Date(Date.now() + (timeLimitSeconds + gracePeriodSeconds) * 1000).toISOString();

    const assessmentDocRef = db.collection('assessments').doc(assessmentId);
    await assessmentDocRef.set({
      id: assessmentId,
      userId: req.user.uid,
      careerId: selectedCareerId,
      careerName,
      status: 'in_progress',
      timeLimitSeconds,
      startedAt,
      deadline,
      totalQuestions: sanitizedQuestions.length,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      data: {
        assessmentId,
        careerId: selectedCareerId,
        careerName,
        timeLimitSeconds,
        startedAt,
        deadline,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/assessment/submit
 * Submits student answers, enforces backend deadline and duplicate protection inside an atomic transaction,
 * grades server-side, updates Firestore, and returns detailed question explanations.
 */
export async function submitAssessment(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const { assessmentId, answers } = req.validatedBody || req.body;

    if (!assessmentId) {
      return res.status(400).json({
        error: { message: 'assessmentId is required', code: 'VALIDATION_ERROR' },
      });
    }

    const assessmentRef = db.collection('assessments').doc(assessmentId);
    const userRef = db.collection('users').doc(req.user.uid);

    // Atomic transaction for duplicate-submission and concurrency safety
    const submissionResult = await db.runTransaction(async (transaction) => {
      const assessmentSnap = await transaction.get(assessmentRef);

      if (!assessmentSnap.exists) {
        const error = new Error('Assessment session not found');
        error.statusCode = 404;
        error.code = 'ASSESSMENT_NOT_FOUND';
        throw error;
      }

      const assessmentData = assessmentSnap.data();

      // Ownership enforcement
      if (assessmentData.userId !== req.user.uid) {
        const error = new Error('Unauthorized access to assessment session');
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Duplicate-submission protection
      if (assessmentData.status === 'completed') {
        const error = new Error('Assessment has already been submitted');
        error.statusCode = 409;
        error.code = 'ALREADY_SUBMITTED';
        throw error;
      }

      // Server-side deadline enforcement
      const deadlineMs = assessmentData.deadline ? new Date(assessmentData.deadline).getTime() : 0;
      if (deadlineMs && Date.now() > deadlineMs) {
        const error = new Error('Assessment time limit has expired. Submissions are no longer accepted.');
        error.statusCode = 400;
        error.code = 'ASSESSMENT_TIMEOUT';
        throw error;
      }

      // Grade submission
      const careerId = assessmentData.careerId;
      const graded = gradeAssessmentSubmission(careerId, answers);

      // Compute time spent
      const startedMs = assessmentData.startedAt ? new Date(assessmentData.startedAt).getTime() : Date.now();
      const timeSpentSeconds = Math.min(
        assessmentData.timeLimitSeconds || 600,
        Math.max(1, Math.round((Date.now() - startedMs) / 1000))
      );

      const completedAtIso = new Date().toISOString();

      // Atomic update of assessment document
      transaction.update(assessmentRef, {
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
        timeSpentSeconds,
        overallScore: graded.overallScore,
        totalCorrect: graded.totalCorrect,
        totalQuestions: graded.totalQuestions,
        skillScores: graded.skillScores,
        questionResponses: graded.questionResponses,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Prepare verified skills stamped with assessmentId and ISO timestamp
      const assessedSkillsToSave = graded.skillScores.map((s) => ({
        name: s.name,
        level: s.level,
        category: s.category,
        source: 'assessment-verified',
        assessedAt: completedAtIso,
        assessmentId,
      }));

      // Atomic update of user profile document
      transaction.update(userRef, {
        assessedSkills: assessedSkillsToSave,
        lastAssessmentId: assessmentId,
        lastAssessedAt: FieldValue.serverTimestamp(),
        assessmentCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        assessmentId,
        careerId,
        careerName: assessmentData.careerName,
        overallScore: graded.overallScore,
        totalCorrect: graded.totalCorrect,
        totalQuestions: graded.totalQuestions,
        timeSpentSeconds,
        skillScores: graded.skillScores,
        questionResponses: graded.questionResponses,
        completedAt: completedAtIso,
      };
    });

    return res.status(200).json({
      data: submissionResult,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code || 'ASSESSMENT_ERROR',
        },
      });
    }
    next(error);
  }
}

/**
 * GET /api/assessment/results/:assessmentId
 * Retrieves verified assessment results and question review for the authenticated caller.
 */
export async function getAssessmentResult(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const { assessmentId } = req.params;
    if (!assessmentId) {
      return res.status(400).json({
        error: { message: 'assessmentId parameter is required', code: 'VALIDATION_ERROR' },
      });
    }

    const assessmentSnap = await db.collection('assessments').doc(assessmentId).get();

    if (!assessmentSnap.exists) {
      return res.status(404).json({
        error: { message: 'Assessment not found', code: 'ASSESSMENT_NOT_FOUND' },
      });
    }

    const data = assessmentSnap.data();

    // Enforce ownership
    if (data.userId !== req.user.uid) {
      return res.status(403).json({
        error: { message: 'Unauthorized access to assessment result', code: 'FORBIDDEN' },
      });
    }

    if (data.status !== 'completed') {
      return res.status(409).json({
        error: { message: 'Assessment has not been completed yet', code: 'NOT_COMPLETED' },
      });
    }

    return res.status(200).json({
      data: {
        assessmentId: data.id || assessmentId,
        careerId: data.careerId,
        careerName: data.careerName,
        status: data.status,
        overallScore: data.overallScore,
        totalCorrect: data.totalCorrect,
        totalQuestions: data.totalQuestions,
        timeSpentSeconds: data.timeSpentSeconds,
        skillScores: data.skillScores || [],
        questionResponses: data.questionResponses || [],
        completedAt: toIso(data.completedAt),
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getAssessmentStatus,
  startAssessment,
  submitAssessment,
  getAssessmentResult,
  getDb,
  setDbForTesting,
};
