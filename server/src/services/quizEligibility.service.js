import { getCareerBenchmark } from '../data/careerBenchmarks.js';
import { calculateSkillGaps, normalizeSkillName, safeTimestamp } from './skillGapEngine.service.js';
import { getSkillQuizQuestions } from '../data/skillQuizQuestions.js';

/**
 * Safely converts diverse date representations (Firestore Timestamps, Dates, strings, numbers)
 * into a clean ISO 8601 string, or null if invalid or missing.
 * Does not fabricate timestamps.
 *
 * @param {any} val
 * @returns {string|null}
 */
function toIsoDateString(val) {
  if (!val) return null;
  if (typeof val.toDate === 'function') {
    const d = val.toDate();
    return d instanceof Date && Number.isFinite(d.getTime()) ? d.toISOString() : null;
  }
  if (typeof val === 'object' && val !== null) {
    const sec = val.seconds ?? val._seconds;
    if (typeof sec === 'number' && Number.isFinite(sec)) {
      const nano = val.nanoseconds ?? val._nanoseconds ?? 0;
      return new Date(sec * 1000 + Math.round(nano / 1e6)).toISOString();
    }
  }
  if (val instanceof Date) {
    return Number.isFinite(val.getTime()) ? val.toISOString() : null;
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return Number.isFinite(d.getTime()) ? d.toISOString() : null;
  }
  return null;
}

/**
 * Resolves personalized quiz eligibility for an authenticated user based on:
 * 1. User's selected career benchmark.
 * 2. Calculated positive skill gaps (gap > 0).
 *
 * Single Source of Truth: Uses the pure Skill-Gap Engine (`calculateSkillGaps`).
 *
 * ELIGIBILITY RULE:
 * A skill is eligible for a practice quiz when:
 * 1. The user has selected a target career.
 * 2. The skill belongs to that career's benchmark.
 * 3. The calculated skill gap is greater than zero (`gap > 0`).
 *
 * Note: Resume evidence is NOT required to unlock practice quizzes. Skills with no
 * prior evidence have a calculated gap based on baseline proficiency and are labeled
 * as "Not yet assessed".
 *
 * Excludes all unrelated career benchmark skills and benchmark-met skills (`gap <= 0`).
 *
 * @param {object} db - Firestore database instance
 * @param {string} userId - Authenticated user UID
 * @returns {Promise<object>} Detailed eligibility report
 */
export async function resolveUserQuizEligibility(db, userId) {
  if (!db || !userId) {
    return {
      careerId: null,
      careerName: null,
      eligibleSkills: [],
      benchmarkMetSkills: [],
      emptyReason: 'DB_OR_USER_MISSING',
      totalEligible: 0,
    };
  }

  // 1. Fetch user profile
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    return {
      careerId: null,
      careerName: null,
      eligibleSkills: [],
      benchmarkMetSkills: [],
      emptyReason: 'USER_NOT_FOUND',
      totalEligible: 0,
    };
  }

  const userData = userSnap.data() || {};
  const selectedCareerId = userData.selectedCareerId;

  // 2. Validate career selection
  if (!selectedCareerId) {
    return {
      careerId: null,
      careerName: null,
      eligibleSkills: [],
      benchmarkMetSkills: [],
      emptyReason: 'NO_CAREER_SELECTED',
      totalEligible: 0,
    };
  }

  const benchmark = getCareerBenchmark(selectedCareerId);
  if (!benchmark) {
    return {
      careerId: selectedCareerId,
      careerName: selectedCareerId,
      eligibleSkills: [],
      benchmarkMetSkills: [],
      emptyReason: 'CAREER_NOT_SUPPORTED',
      totalEligible: 0,
    };
  }

  // 3. Run pure skill gap engine
  const assessedSkills = Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [];
  const extractedSkills = Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [];

  const gapAnalysis = calculateSkillGaps({
    benchmarkSkills: benchmark.skills,
    assessedSkills,
    extractedSkills,
  });

  // 4. Fetch user's practice quiz history to show latest/best practice results
  const practiceResultsMap = new Map();
  try {
    const historySnap = await db
      .collection('quizzes')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    if (!historySnap.empty) {
      historySnap.forEach((doc) => {
        const qData = doc.data();
        const key = normalizeSkillName(qData.skillName);
        if (!key) return;

        const score = typeof qData.overallScore === 'number' ? qData.overallScore : 0;
        const totalCorrect = typeof qData.totalCorrect === 'number' ? qData.totalCorrect : 0;
        const totalQuestions = typeof qData.totalQuestions === 'number' ? qData.totalQuestions : 5;
        const passed = Boolean(qData.passed);
        const completedAtRaw = qData.completedAt || qData.updatedAt || null;
        const completedTime = safeTimestamp(completedAtRaw);
        const completedAtIso = toIsoDateString(completedAtRaw);

        const existing = practiceResultsMap.get(key);

        if (!existing) {
          practiceResultsMap.set(key, {
            attemptsCount: 1,
            latestScore: score,
            bestScore: score,
            latestCorrect: totalCorrect,
            totalQuestions,
            passed,
            lastAttemptAt: completedAtIso,
            lastAttemptId: doc.id,
            _latestTime: completedTime,
          });
        } else {
          existing.attemptsCount += 1;
          existing.bestScore = Math.max(existing.bestScore, score);

          // Update latest attempt if strictly newer by timestamp, or deterministic tie-breaker on equal time
          const isNewer = completedTime > existing._latestTime;
          const isSameTimeTieBreaker =
            completedTime === existing._latestTime &&
            String(doc.id).localeCompare(String(existing.lastAttemptId || '')) > 0;

          if (isNewer || isSameTimeTieBreaker) {
            existing.latestScore = score;
            existing.latestCorrect = totalCorrect;
            existing.totalQuestions = totalQuestions;
            existing.passed = passed;
            existing.lastAttemptAt = completedAtIso;
            existing.lastAttemptId = doc.id;
            existing._latestTime = completedTime;
          }
        }
      });
    }
  } catch {
    // Non-blocking history query
  }

  const eligibleSkills = [];
  const benchmarkMetSkills = [];

  // 5. Partition career benchmark skills strictly by calculated gap
  for (const gapItem of gapAnalysis.skillGaps) {
    const canonicalKey = normalizeSkillName(gapItem.name);
    const questionsAvailable = getSkillQuizQuestions(gapItem.name).length;
    const rawPracticeStats = practiceResultsMap.get(canonicalKey) || null;

    let practiceStats = null;
    if (rawPracticeStats) {
      practiceStats = {
        attemptsCount: rawPracticeStats.attemptsCount,
        latestScore: rawPracticeStats.latestScore,
        bestScore: rawPracticeStats.bestScore,
        latestCorrect: rawPracticeStats.latestCorrect,
        totalQuestions: rawPracticeStats.totalQuestions,
        passed: rawPracticeStats.passed,
        lastAttemptAt: rawPracticeStats.lastAttemptAt,
        lastAttemptId: rawPracticeStats.lastAttemptId,
      };
    }

    // Condition: Benchmark Met (gap <= 0)
    if (gapItem.gap <= 0) {
      benchmarkMetSkills.push({
        skillName: gapItem.name,
        category: gapItem.category || 'General',
        currentLevel: gapItem.effectiveLevel,
        requiredLevel: gapItem.requiredLevel,
        statusText: 'Current benchmark target met',
      });
      continue;
    }

    // Condition: Positive Gap (gap > 0) -> ELIGIBLE FOR PRACTICE QUIZ
    const hasPriorEvidence = Boolean(gapItem.hasEvidence && gapItem.currentLevel !== null);
    const proficiencyDisplay = hasPriorEvidence
      ? `${gapItem.currentLevel} / ${gapItem.requiredLevel} pts`
      : 'Not yet assessed';

    // Simple learning status: 'Improving' | 'Ready to practise' | 'Learning recommended'
    let learningStatus = 'Learning recommended';
    if (practiceStats?.attemptsCount > 0) {
      learningStatus = practiceStats.passed ? 'Improving' : 'Ready to practise';
    } else if (hasPriorEvidence) {
      learningStatus = 'Ready to practise';
    } else {
      learningStatus = 'Learning recommended';
    }

    eligibleSkills.push({
      skillName: gapItem.name,
      category: gapItem.category || 'General',
      currentLevel: gapItem.currentLevel, // number or null
      effectiveLevel: gapItem.effectiveLevel, // 0 if unassessed
      proficiencyDisplay,
      hasEvidence: gapItem.hasEvidence,
      requiredLevel: gapItem.requiredLevel,
      gap: gapItem.gap,
      gapClassification: gapItem.classification || 'High Gap',
      classificationCode: gapItem.classificationCode || 'high',
      evidenceSource: gapItem.evidenceSource || 'none',
      learningStatus,
      questionsAvailable,
      practiceStats,
    });
  }

  let emptyReason = null;
  if (eligibleSkills.length === 0) {
    if (benchmarkMetSkills.length === benchmark.skills.length) {
      emptyReason = 'ALL_GAPS_RESOLVED';
    } else {
      emptyReason = 'NO_ACTIONABLE_GAPS';
    }
  }

  return {
    careerId: selectedCareerId,
    careerName: benchmark.name,
    eligibleSkills,
    benchmarkMetSkills,
    emptyReason,
    totalEligible: eligibleSkills.length,
  };
}

export default {
  resolveUserQuizEligibility,
};
