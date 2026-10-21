import { getCareerBenchmark } from '../data/careerBenchmarks.js';
import { calculateSkillGaps, normalizeSkillName, safeTimestamp } from './skillGapEngine.service.js';

/**
 * Safely converts diverse date representations into an ISO 8601 string, or null.
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
 * Aggregates user-specific analytics and metrics for Phase 12 Dashboard.
 * Strictly uses authentic user data and the pure Skill Gap Engine.
 *
 * @param {object} db - Firestore database instance
 * @param {string} userId - Authenticated user UID
 * @returns {Promise<object>} Comprehensive dashboard analytics payload
 */
export async function getDashboardAnalytics(db, userId) {
  if (!db || !userId) {
    const error = new Error('Database or userId missing');
    error.statusCode = 400;
    error.code = 'INVALID_ARGUMENTS';
    throw error;
  }

  // 1. Fetch user document
  const userRef = db.collection('users').doc(userId);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    const error = new Error('User profile not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const userData = userSnap.data() || {};
  const selectedCareerId = userData.selectedCareerId || null;

  // If no career selected yet
  if (!selectedCareerId) {
    return {
      hasCareer: false,
      careerId: null,
      careerName: null,
      readinessPercentage: 0,
      skillsSummary: {
        totalBenchmarkSkills: 0,
        atBenchmarkCount: 0,
        remainingGapsCount: 0,
        notAssessedCount: 0,
      },
      diagnosticAssessment: {
        isCompleted: false,
        lastAssessmentId: null,
        lastAssessedAt: null,
        assessedSkillsCount: 0,
        averageDiagnosticScore: null,
      },
      roadmapProgress: {
        hasRoadmap: false,
        totalMilestones: 0,
        completedMilestones: 0,
        inProgressMilestones: 0,
        notStartedMilestones: 0,
        totalTopics: 0,
        completedTopics: 0,
        topicsCompletionPercentage: 0,
        progressPercentage: 0,
        activeMilestone: null,
      },
      practiceStats: {
        totalAttempts: 0,
        skillsPracticedCount: 0,
        averageLatestScore: null,
        bestOverallScore: null,
        skillStats: [],
      },
      skillGaps: [],
      otherExtractedSkills: Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [],
      nextAction: {
        type: 'SELECT_CAREER',
        title: 'Step 1: Choose Your Career Track',
        description: 'Select your target engineering or data role to establish industry benchmark targets.',
        actionText: 'Choose Career',
        actionUrl: '/career',
      },
    };
  }

  // 2. Resolve Career Benchmark
  const benchmark = getCareerBenchmark(selectedCareerId);
  if (!benchmark) {
    const error = new Error(`No skill benchmark configured for career: ${selectedCareerId}`);
    error.statusCode = 400;
    error.code = 'CAREER_NOT_SUPPORTED';
    throw error;
  }

  let careerName = benchmark.name;
  try {
    const careerSnap = await db.collection('careers').doc(selectedCareerId).get();
    if (careerSnap.exists && careerSnap.data()?.name) {
      careerName = careerSnap.data().name;
    }
  } catch {
    // Non-blocking fallback to benchmark.name
  }

  // 3. Pure Skill Gap Engine Calculation
  const assessedSkills = Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [];
  const extractedSkills = Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [];

  const gapAnalysis = calculateSkillGaps({
    benchmarkSkills: benchmark.skills,
    assessedSkills,
    extractedSkills,
  });

  const readinessPercentage = gapAnalysis.summary.overallReadinessPercentage;

  // 4. Practice Quiz History Aggregation (isolated per user)
  const practiceMap = new Map();
  let totalPracticeAttempts = 0;
  let bestOverallQuizScore = null;

  try {
    const quizSnap = await db
      .collection('quizzes')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .get();

    if (!quizSnap.empty) {
      quizSnap.forEach((doc) => {
        const qData = doc.data();
        const key = normalizeSkillName(qData.skillName);
        if (!key) return;

        totalPracticeAttempts += 1;
        const score = typeof qData.overallScore === 'number' ? qData.overallScore : 0;
        const totalCorrect = typeof qData.totalCorrect === 'number' ? qData.totalCorrect : 0;
        const totalQuestions = typeof qData.totalQuestions === 'number' ? qData.totalQuestions : 5;
        const passed = Boolean(qData.passed);
        const completedAtRaw = qData.completedAt || qData.updatedAt || null;
        const completedTime = safeTimestamp(completedAtRaw);
        const completedAtIso = toIsoDateString(completedAtRaw);

        if (bestOverallQuizScore === null || score > bestOverallQuizScore) {
          bestOverallQuizScore = score;
        }

        const existing = practiceMap.get(key);
        if (!existing) {
          practiceMap.set(key, {
            skillName: qData.skillName,
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

  // 5. Partition Benchmark Skills & Build Visual Analytics Cards
  let atBenchmarkCount = 0;
  let remainingGapsCount = 0;
  let notAssessedCount = 0;

  const skillGaps = gapAnalysis.skillGaps.map((gapItem) => {
    const isAtBenchmark = gapItem.gap <= 0;
    const isNotAssessed = !gapItem.hasEvidence || gapItem.currentLevel === null;

    if (isAtBenchmark) {
      atBenchmarkCount += 1;
    } else {
      remainingGapsCount += 1;
    }

    if (isNotAssessed) {
      notAssessedCount += 1;
    }

    const canonicalKey = normalizeSkillName(gapItem.name);
    const pStat = practiceMap.get(canonicalKey) || null;
    let practiceStats = null;
    if (pStat) {
      practiceStats = {
        attemptsCount: pStat.attemptsCount,
        latestScore: pStat.latestScore,
        bestScore: pStat.bestScore,
        latestCorrect: pStat.latestCorrect,
        totalQuestions: pStat.totalQuestions,
        passed: pStat.passed,
        lastAttemptAt: pStat.lastAttemptAt,
        lastAttemptId: pStat.lastAttemptId,
      };
    }

    return {
      benchmarkIndex: gapItem.benchmarkIndex,
      name: gapItem.name,
      category: gapItem.category || 'General',
      currentLevel: gapItem.currentLevel, // null if unassessed
      effectiveLevel: gapItem.effectiveLevel, // 0 if unassessed
      requiredLevel: gapItem.requiredLevel, // 80
      gap: gapItem.gap,
      classification: gapItem.classification,
      classificationCode: gapItem.classificationCode,
      priorityRank: gapItem.priorityRank,
      isTopPriority: gapItem.priorityRank === 1 && gapItem.gap > 0,
      evidenceSource: gapItem.evidenceSource,
      hasEvidence: gapItem.hasEvidence,
      explanation: gapItem.explanation,
      practiceStats,
    };
  });

  // Calculate practice quiz summary
  const skillStatsList = Array.from(practiceMap.values()).map((s) => ({
    skillName: s.skillName,
    attemptsCount: s.attemptsCount,
    latestScore: s.latestScore,
    bestScore: s.bestScore,
    passed: s.passed,
    lastAttemptAt: s.lastAttemptAt,
    lastAttemptId: s.lastAttemptId,
  }));

  const totalLatestSum = skillStatsList.reduce((acc, s) => acc + s.latestScore, 0);
  const averageLatestScore =
    skillStatsList.length > 0 ? Math.round(totalLatestSum / skillStatsList.length) : null;

  // 6. Diagnostic Assessment Status
  const diagnosticSkills = assessedSkills.filter(
    (s) =>
      s &&
      (String(s.assessmentId || '').startsWith('assess_') ||
        s.source === 'assessment-verified')
  );

  const hasDiagnosticCompleted = Boolean(
    userData.lastAssessmentId || diagnosticSkills.length > 0
  );

  const diagScoreSum = diagnosticSkills.reduce((acc, s) => acc + (s.level || 0), 0);
  const averageDiagnosticScore =
    diagnosticSkills.length > 0 ? Math.round(diagScoreSum / diagnosticSkills.length) : null;

  const diagnosticAssessment = {
    isCompleted: hasDiagnosticCompleted,
    lastAssessmentId: userData.lastAssessmentId || (diagnosticSkills[0]?.assessmentId || null),
    lastAssessedAt: toIsoDateString(userData.lastAssessedAt || (diagnosticSkills[0]?.assessedAt || null)),
    assessedSkillsCount: diagnosticSkills.length,
    averageDiagnosticScore,
  };

  // 7. Roadmap Progress & Topic Counts (Actual Persisted Data)
  const savedRoadmap =
    userData.roadmap && userData.roadmap.careerId === selectedCareerId
      ? userData.roadmap
      : (userData.roadmapsByCareer?.[selectedCareerId] || null);
  const isMatchingRoadmap = Boolean(
    savedRoadmap && savedRoadmap.careerId === selectedCareerId && Array.isArray(savedRoadmap.milestones)
  );

  let totalMilestones = 0;
  let completedMilestones = 0;
  let inProgressMilestones = 0;
  let notStartedMilestones = 0;
  let totalTopics = 0;
  let completedTopics = 0;
  let activeMilestone = null;
  let roadmapProgressPercentage = 0;

  if (isMatchingRoadmap) {
    const milestones = savedRoadmap.milestones;
    totalMilestones = milestones.length;

    milestones.forEach((m) => {
      if (m.status === 'completed') completedMilestones += 1;
      else if (m.status === 'in-progress') inProgressMilestones += 1;
      else notStartedMilestones += 1;

      if (Array.isArray(m.topics)) {
        totalTopics += m.topics.length;
        completedTopics += m.topics.filter((t) => t && t.completed).length;
      }
    });

    roadmapProgressPercentage = savedRoadmap.summary?.progressPercentage ?? (
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
    );

    activeMilestone =
      milestones.find((m) => m.status === 'in-progress') ||
      milestones.find((m) => m.status === 'not-started') ||
      milestones[0] ||
      null;
  }

  const topicsCompletionPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const roadmapProgress = {
    hasRoadmap: isMatchingRoadmap,
    totalMilestones,
    completedMilestones,
    inProgressMilestones,
    notStartedMilestones,
    totalTopics,
    completedTopics,
    topicsCompletionPercentage,
    progressPercentage: roadmapProgressPercentage,
    activeMilestone: activeMilestone
      ? {
          order: activeMilestone.order,
          skillName: activeMilestone.skillName,
          status: activeMilestone.status,
          learningObjective: activeMilestone.learningObjective || '',
          estimatedWeeks: activeMilestone.estimatedWeeks || 2,
        }
      : null,
  };

  // 8. Next Action Recommendation
  let nextAction = null;
  if (!extractedSkills.length && !diagnosticSkills.length) {
    nextAction = {
      type: 'INITIAL_EVALUATION',
      title: 'Establish Your Skill Baseline',
      description: `Upload your resume or take the 10-minute Diagnostic Assessment to identify your initial gaps for ${careerName}.`,
      actionText: 'Upload Resume',
      actionUrl: '/resume',
      secondaryActionText: 'Diagnostic Assessment',
      secondaryActionUrl: '/assessment',
    };
  } else if (!isMatchingRoadmap) {
    nextAction = {
      type: 'GENERATE_ROADMAP',
      title: 'Generate Your Learning Roadmap',
      description: `Build your step-by-step curriculum tailored to your priority skill gaps for ${careerName}.`,
      actionText: 'Generate Roadmap',
      actionUrl: '/roadmap',
    };
  } else if (activeMilestone) {
    nextAction = {
      type: 'CONTINUE_LEARNING',
      title: `Next Focus: ${activeMilestone.skillName}`,
      description: activeMilestone.learningObjective || 'Study your curriculum topics and free learning resources.',
      actionText: 'Continue Learning',
      actionUrl: `/roadmap?skill=${encodeURIComponent(activeMilestone.skillName)}`,
      skillName: activeMilestone.skillName,
      secondaryActionText: 'Practice Quiz',
      secondaryActionUrl: `/quiz?skill=${encodeURIComponent(activeMilestone.skillName)}`,
    };
  } else {
    nextAction = {
      type: 'ALL_COMPLETE',
      title: 'Curriculum Completed!',
      description: `You have completed all milestones for ${careerName}. Take the comprehensive Diagnostic Assessment to verify mastery.`,
      actionText: 'Diagnostic Assessment',
      actionUrl: '/assessment',
    };
  }

  return {
    hasCareer: true,
    careerId: selectedCareerId,
    careerName,
    readinessPercentage,
    skillsSummary: {
      totalBenchmarkSkills: benchmark.skills.length,
      atBenchmarkCount,
      remainingGapsCount,
      notAssessedCount,
    },
    diagnosticAssessment,
    roadmapProgress,
    practiceStats: {
      totalAttempts: totalPracticeAttempts,
      skillsPracticedCount: skillStatsList.length,
      averageLatestScore,
      bestOverallScore: bestOverallQuizScore,
      skillStats: skillStatsList,
    },
    skillGaps,
    otherExtractedSkills: gapAnalysis.otherExtractedSkills || [],
    nextAction,
  };
}

export default {
  getDashboardAnalytics,
};
