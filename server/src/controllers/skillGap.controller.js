import { db as defaultDb } from '../config/firebaseAdmin.js';
import { getCareerBenchmark } from '../data/careerBenchmarks.js';
import { calculateSkillGaps } from '../services/skillGapEngine.service.js';

let activeDb = undefined;

/**
 * Returns the active Firestore database instance, with support for test injection.
 * @internal
 */
export function getDb() {
  if (activeDb !== undefined) {
    return activeDb;
  }
  return defaultDb;
}

/**
 * Allows injecting a mock Firestore DB instance for offline unit/integration testing.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * GET /api/skills/gap
 * Computes and returns real-time skill gap analysis for the authenticated user based on
 * their selected career benchmarks, verified assessment scores, and resume skills.
 *
 * Guaranteed properties:
 * - Derives user identity exclusively from cryptographically verified req.user.uid.
 * - Real-time calculation on every request; does not persist or cache stale gap documents.
 * - Returns 404 if profile does not exist.
 * - Returns 409 (CAREER_NOT_SELECTED) if user has not chosen an active career goal.
 * - Returns 503 if Firestore database is unconfigured or unreachable.
 */
export async function getSkillGapAnalysis(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    // 1. Fetch user profile from Cloud Firestore
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
          message: 'A target career must be selected before calculating skill gaps.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    // 2. Resolve benchmark dataset
    const benchmark = getCareerBenchmark(selectedCareerId);
    if (!benchmark) {
      return res.status(400).json({
        error: {
          message: `No skill benchmark configured for career: ${selectedCareerId}`,
          code: 'CAREER_NOT_SUPPORTED',
        },
      });
    }

    // Resolve career name (prefer career metadata from Firestore if available, fallback to benchmark name)
    let careerName = benchmark.name;
    try {
      const careerRef = db.collection('careers').doc(selectedCareerId);
      const careerSnap = await careerRef.get();
      if (careerSnap.exists) {
        careerName = careerSnap.data()?.name || benchmark.name;
      }
    } catch {
      // Non-blocking fallback
    }

    // 3. Perform pure deterministic gap calculation in memory
    const assessedSkills = Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [];
    const extractedSkills = Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [];

    const result = calculateSkillGaps({
      benchmarkSkills: benchmark.skills,
      assessedSkills,
      extractedSkills,
    });

    const analyzedAt = new Date().toISOString();

    return res.status(200).json({
      data: {
        careerId: selectedCareerId,
        careerName,
        analyzedAt,
        summary: result.summary,
        skillGaps: result.skillGaps,
        otherExtractedSkills: result.otherExtractedSkills,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getSkillGapAnalysis,
  getDb,
  setDbForTesting,
};
