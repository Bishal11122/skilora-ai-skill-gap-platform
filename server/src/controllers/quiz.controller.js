import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db as defaultDb } from '../config/firebaseAdmin.js';
import {
  getSkillQuizQuestions,
  sanitizeSkillQuizQuestions,
  gradeSkillQuizSubmission,
} from '../data/skillQuizQuestions.js';
import { getOrGenerateQuizQuestions } from '../services/skillQuizAi.service.js';
import { applyQuizEvidenceUpdate } from '../services/quizScoringPolicy.js';
import { resolveUserQuizEligibility } from '../services/quizEligibility.service.js';
import { getResourcesForSkill } from '../data/learningResources.js';
import { rankResourcesForMilestone } from '../services/resource.service.js';
import { normalizeSkillName } from '../services/skillGapEngine.service.js';

let activeDb = null;

/**
 * Returns active Firestore instance with test injection support.
 */
export function getDb() {
  return activeDb || defaultDb;
}

/**
 * Injects a mock Firestore DB instance for unit testing.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * GET /api/quiz/skills
 * Returns ONLY the authenticated user's personalized eligible practice skills derived
 * from their selected career, resume-extracted skills, and identified positive gaps.
 * Unrelated career skills are strictly excluded.
 */
export async function getQuizSkills(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const eligibility = await resolveUserQuizEligibility(db, req.user.uid);

    return res.status(200).json({
      data: eligibility,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/quiz/start
 * Starts a new skill quiz session ONLY if the requested skill is in the user's
 * personalized eligible skill-gap list.
 * Strips answer keys and explanations before returning questions to client.
 */
export async function startQuiz(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const { skillName, topic } = req.validatedBody || req.body;

    if (!skillName || typeof skillName !== 'string') {
      return res.status(400).json({
        error: { message: 'skillName is required', code: 'VALIDATION_ERROR' },
      });
    }

    const targetKey = normalizeSkillName(skillName);

    // 1. Enforce strict personalization & eligibility check on server
    const eligibility = await resolveUserQuizEligibility(db, req.user.uid);

    if (!eligibility.careerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before starting practice quizzes.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    const matchedEligible = eligibility.eligibleSkills.find(
      (s) => normalizeSkillName(s.skillName) === targetKey
    );

    if (!matchedEligible) {
      // Check if already achieved benchmark target (gap <= 0)
      const benchmarkMet = eligibility.benchmarkMetSkills?.find(
        (s) => normalizeSkillName(s.skillName) === targetKey
      );

      if (benchmarkMet) {
        return res.status(400).json({
          error: {
            message: `Skill "${skillName}" has already achieved or exceeded your target career benchmark level (${benchmarkMet.currentLevel}/${benchmarkMet.requiredLevel}).`,
            code: 'BENCHMARK_TARGET_ACHIEVED',
          },
        });
      }

      // Unrelated skill outside career benchmark or no positive gap
      return res.status(403).json({
        error: {
          message: `Skill "${skillName}" is not an identified positive skill gap for your current career path (${eligibility.careerName}). Practice quizzes are strictly tailored to your target career and identified skill gaps.`,
          code: 'SKILL_NOT_ELIGIBLE',
        },
      });
    }

    // 2. Verify questions exist for this skill
    const baseQuestions = getSkillQuizQuestions(skillName);
    if (!baseQuestions || baseQuestions.length === 0) {
      return res.status(404).json({
        error: {
          message: `No quiz questions found for skill: "${skillName}"`,
          code: 'SKILL_NOT_FOUND',
        },
      });
    }

    // 3. Generate or fetch questions with automatic fallback
    const { questions, source } = await getOrGenerateQuizQuestions(skillName, topic);

    // Sanitize questions: answer keys must never be revealed to client
    const sanitizedQuestions = sanitizeSkillQuizQuestions(questions);

    const attemptId = `quiz_${crypto.randomUUID()}`;
    const startedAt = new Date().toISOString();
    const category = matchedEligible.category || 'General';

    const quizDocRef = db.collection('quizzes').doc(attemptId);
    await quizDocRef.set({
      id: attemptId,
      userId: req.user.uid,
      skillName: matchedEligible.skillName,
      category,
      careerId: eligibility.careerId,
      careerName: eligibility.careerName,
      topic: topic || 'Core Concepts',
      status: 'in_progress',
      source,
      totalQuestions: sanitizedQuestions.length,
      questions, // Full internal questions including answers stored server-side
      startedAt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      data: {
        attemptId,
        skillName: matchedEligible.skillName,
        category,
        careerName: eligibility.careerName,
        topic: topic || 'Core Concepts',
        totalQuestions: sanitizedQuestions.length,
        source,
        questions: sanitizedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/quiz/submit
 * Validates, grades, and records quiz attempt inside an atomic transaction.
 * Applies conservative evidence scoring policy without mutating roadmap milestone status
 * and eliminates all undefined Firestore attributes.
 */
export async function submitQuiz(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const { attemptId, answers } = req.validatedBody || req.body;

    if (!attemptId) {
      return res.status(400).json({
        error: { message: 'attemptId is required', code: 'VALIDATION_ERROR' },
      });
    }

    const quizRef = db.collection('quizzes').doc(attemptId);
    const userRef = db.collection('users').doc(req.user.uid);

    const submissionResult = await db.runTransaction(async (transaction) => {
      const quizSnap = await transaction.get(quizRef);

      if (!quizSnap.exists) {
        const error = new Error('Quiz attempt not found');
        error.statusCode = 404;
        error.code = 'QUIZ_NOT_FOUND';
        throw error;
      }

      const quizData = quizSnap.data();

      // Ownership enforcement
      if (quizData.userId !== req.user.uid) {
        const error = new Error('Unauthorized access to quiz attempt');
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }

      // Duplicate-submission protection
      if (quizData.status === 'completed') {
        const error = new Error('Quiz attempt has already been submitted');
        error.statusCode = 409;
        error.code = 'ALREADY_SUBMITTED';
        throw error;
      }

      // Grade submission against the specific questions bound to this session
      const graded = gradeSkillQuizSubmission(
        quizData.skillName,
        answers,
        quizData.questions
      );

      // Read user document to apply conservative scoring policy
      const userSnap = await transaction.get(userRef);
      const userData = userSnap.exists ? userSnap.data() : {};
      const existingAssessedSkills = Array.isArray(userData.assessedSkills)
        ? userData.assessedSkills
        : [];

      const skillCategory = (quizData.category && typeof quizData.category === 'string')
        ? quizData.category.trim()
        : 'General';

      // Calculate conservative evidence update (guaranteeing zero undefined values and preserving diagnostic scores)
      const evidenceResult = applyQuizEvidenceUpdate(existingAssessedSkills, {
        skillName: quizData.skillName,
        totalCorrect: graded.totalCorrect,
        totalQuestions: graded.totalQuestions,
        attemptId,
        category: skillCategory,
      });

      const completedAtIso = new Date().toISOString();

      // Atomic update of quiz document
      transaction.update(quizRef, {
        status: 'completed',
        completedAt: FieldValue.serverTimestamp(),
        overallScore: graded.percentage,
        totalCorrect: graded.totalCorrect,
        totalQuestions: graded.totalQuestions,
        passed: graded.passed,
        questionResponses: graded.questionResponses,
        demonstratedLevel: evidenceResult.demonstratedLevel,
        finalLevel: evidenceResult.finalLevel,
        isImproved: evidenceResult.isImproved,
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Track practice stats on user document (distinct from diagnostic assessment)
      const skillKey = normalizeSkillName(quizData.skillName);
      const existingPracticeStats = userData.practiceQuizStats || {};
      const prevStat = existingPracticeStats[skillKey] || {};

      const updatedPracticeStat = {
        skillName: quizData.skillName,
        latestScore: graded.percentage,
        bestScore: Math.max(prevStat.bestScore || 0, graded.percentage),
        totalAttempts: (prevStat.totalAttempts || 0) + 1,
        passed: graded.passed,
        lastAttemptAt: completedAtIso,
        lastAttemptId: attemptId,
      };

      const updatedPracticeMap = {
        ...existingPracticeStats,
        [skillKey]: updatedPracticeStat,
      };

      // Atomic update of user document (preserving existing roadmap milestones and checklists)
      if (userSnap.exists) {
        transaction.update(userRef, {
          assessedSkills: evidenceResult.updatedAssessedSkills,
          practiceQuizStats: updatedPracticeMap,
          lastQuizAt: FieldValue.serverTimestamp(),
          lastQuizAttemptId: attemptId,
          quizCount: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      return {
        attemptId,
        skillName: quizData.skillName,
        category: skillCategory,
        careerName: quizData.careerName || null,
        topic: quizData.topic,
        overallScore: graded.percentage,
        totalCorrect: graded.totalCorrect,
        totalQuestions: graded.totalQuestions,
        passed: graded.passed,
        questionResponses: graded.questionResponses,
        proficiency: {
          demonstratedLevel: evidenceResult.demonstratedLevel,
          finalLevel: evidenceResult.finalLevel,
          isImproved: evidenceResult.isImproved,
          preservedExisting: evidenceResult.preservedExisting,
        },
        practiceStats: updatedPracticeStat,
        completedAt: completedAtIso,
      };
    });

    // Curate revision resources for topics the learner missed
    const rawResources = getResourcesForSkill(submissionResult.skillName);
    const rankedResources = rankResourcesForMilestone(rawResources, {
      currentLevel: submissionResult.proficiency.finalLevel,
    });

    return res.status(200).json({
      data: {
        ...submissionResult,
        recommendedResources: rankedResources.slice(0, 4),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code || 'QUIZ_ERROR',
        },
      });
    }
    next(error);
  }
}

/**
 * GET /api/quiz/attempts/:attemptId
 * Retrieves detailed result of a completed quiz attempt for the authenticated user.
 */
export async function getQuizAttempt(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const { attemptId } = req.params;
    const docRef = db.collection('quizzes').doc(attemptId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        error: { message: 'Quiz attempt not found', code: 'NOT_FOUND' },
      });
    }

    const data = docSnap.data();

    if (data.userId !== req.user.uid) {
      return res.status(403).json({
        error: { message: 'Unauthorized access to quiz attempt', code: 'FORBIDDEN' },
      });
    }

    if (data.status !== 'completed') {
      return res.status(400).json({
        error: { message: 'Quiz attempt is not yet completed', code: 'NOT_COMPLETED' },
      });
    }

    const rawResources = getResourcesForSkill(data.skillName);
    const recommendedResources = rankResourcesForMilestone(rawResources, {
      currentLevel: data.finalLevel || 0,
    }).slice(0, 4);

    return res.status(200).json({
      data: {
        attemptId: data.id,
        skillName: data.skillName,
        category: data.category || 'General',
        topic: data.topic,
        overallScore: data.overallScore,
        totalCorrect: data.totalCorrect,
        totalQuestions: data.totalQuestions,
        passed: data.passed,
        questionResponses: data.questionResponses,
        completedAt: data.completedAt,
        recommendedResources,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/quiz/history
 * Retrieves recent completed quiz history for the authenticated user.
 */
export async function getQuizHistory(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const querySnap = await db
      .collection('quizzes')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'completed')
      .limit(20)
      .get();

    const attempts = [];
    querySnap.forEach((doc) => {
      const data = doc.data();
      attempts.push({
        attemptId: data.id,
        skillName: data.skillName,
        category: data.category || 'General',
        topic: data.topic,
        overallScore: data.overallScore,
        totalCorrect: data.totalCorrect,
        totalQuestions: data.totalQuestions,
        passed: data.passed,
        completedAt: data.completedAt,
      });
    });

    return res.status(200).json({
      data: {
        totalAttempts: attempts.length,
        attempts,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getDb,
  setDbForTesting,
  getQuizSkills,
  startQuiz,
  submitQuiz,
  getQuizAttempt,
  getQuizHistory,
};
