import { normalizeSkillName, isValidSkillLevel } from './skillGapEngine.service.js';

/**
 * Conservative Scoring Policy for Skill-Specific Quizzes (Phase 11).
 *
 * RATIONALE & GOVERNING PRINCIPLES:
 * 1. Short Quiz Mastery Ceiling:
 *    A 5-question multiple choice quiz tests targeted, introductory, or checkpoint
 *    knowledge. It cannot replace a comprehensive diagnostic assessment or real project work.
 *    Therefore, the maximum proficiency level achievable SOLELY through quizzes is capped at 60 (QUIZ_MAX_STANDALONE_PROFICIENCY).
 *
 * 2. Strict Evidence Preservation:
 *    If a learner already possesses a higher verified assessment level (e.g. from the Phase 7
 *    comprehensive diagnostic assessment, or a prior quiz with higher score), a practice quiz
 *    must NEVER degrade or overwrite that verified evidence with a lower score.
 *    Furthermore, records created by the Phase 7 Diagnostic Assessment (prefixed with 'assess_')
 *    represent formal comprehensive assessments and are NEVER replaced by practice quizzes.
 *
 * 3. Conservative Upward Adjustment:
 *    When a learner passes or shows competence in a quiz:
 *    - For learners with NO prior diagnostic evidence: their verified level becomes the demonstrated quiz level (up to 60).
 *    - For learners with existing lower evidence: their level is conservatively nudged upwards to max(existingLevel, demonstratedLevel), capped at 60.
 *
 * 4. Zero Undefined Fields (Firestore Schema Guarantee):
 *    No field on any record in assessedSkills may ever be set to `undefined`.
 *
 * 5. Roadmap Independence:
 *    Taking a quiz does NOT mark roadmap milestones as completed or modify topic checklist items.
 */

export const QUIZ_MAX_STANDALONE_PROFICIENCY = 60;
export const QUIZ_PASS_PERCENTAGE = 70; // 70%+ constitutes passing (e.g. 4/5 = 80%)

/**
 * Computes conservative skill proficiency level from quiz score.
 *
 * @param {number} totalCorrect - Number of correct questions
 * @param {number} totalQuestions - Total number of questions (typically 5)
 * @param {number|null} [existingLevel] - Existing verified skill level if any
 * @returns {{
 *   percentage: number,
 *   demonstratedLevel: number,
 *   finalLevel: number,
 *   isImproved: boolean,
 *   preservedExisting: boolean,
 *   passed: boolean
 * }}
 */
export function calculateQuizProficiency(totalCorrect, totalQuestions, existingLevel = null) {
  const safeTotal = typeof totalQuestions === 'number' && totalQuestions > 0 ? totalQuestions : 5;
  const safeCorrect = typeof totalCorrect === 'number' && totalCorrect >= 0
    ? Math.min(totalCorrect, safeTotal)
    : 0;

  const percentage = Math.round((safeCorrect / safeTotal) * 100);
  const passed = percentage >= QUIZ_PASS_PERCENTAGE;

  // Demonstrated level scales linearly with score, capped at QUIZ_MAX_STANDALONE_PROFICIENCY (60)
  // Example: 5/5 (100%) -> 60, 4/5 (80%) -> 48, 3/5 (60%) -> 36, 2/5 (40%) -> 24, 1/5 (20%) -> 12, 0/5 -> 0
  const demonstratedLevel = Math.round((percentage / 100) * QUIZ_MAX_STANDALONE_PROFICIENCY);

  const hasValidExisting = isValidSkillLevel(existingLevel);

  if (hasValidExisting) {
    if (existingLevel >= demonstratedLevel) {
      // Existing verified score is higher or equal: PRESERVE it, never degrade
      return {
        percentage,
        demonstratedLevel,
        finalLevel: existingLevel,
        isImproved: false,
        preservedExisting: true,
        passed,
      };
    }

    // Demonstrated score is higher than existing level: update conservatively (capped at 60)
    return {
      percentage,
      demonstratedLevel,
      finalLevel: Math.min(QUIZ_MAX_STANDALONE_PROFICIENCY, demonstratedLevel),
      isImproved: true,
      preservedExisting: false,
      passed,
    };
  }

  // No prior verified level: award demonstrated level (capped at 60)
  return {
    percentage,
    demonstratedLevel,
    finalLevel: demonstratedLevel,
    isImproved: demonstratedLevel > 0,
    preservedExisting: false,
    passed,
  };
}

/**
 * Sanitizes an assessedSkills array, completely stripping any undefined or invalid fields
 * to guarantee strict Firestore compliance.
 *
 * @param {Array<object>} skillsList
 * @returns {Array<object>}
 */
export function sanitizeAssessedSkillsList(skillsList) {
  if (!Array.isArray(skillsList)) return [];

  return skillsList
    .filter((item) => item && typeof item === 'object' && item.name)
    .map((item) => {
      const clean = {
        name: String(item.name).trim(),
        level: isValidSkillLevel(item.level) ? item.level : 0,
        source: String(
          item.source ||
            (item.assessmentId && String(item.assessmentId).startsWith('assess_')
              ? 'assessment-verified'
              : 'practice-checkpoint')
        ),
        assessedAt: String(item.assessedAt || new Date().toISOString()),
        assessmentId: String(item.assessmentId || ''),
      };

      // Only assign category if it is a non-empty string
      if (item.category && typeof item.category === 'string' && item.category.trim()) {
        clean.category = item.category.trim();
      }

      return clean;
    });
}

/**
 * Merges a quiz result into a user's assessedSkills array according to the conservative scoring policy.
 * Preserves all other skill records unchanged, and prevents overwriting comprehensive Phase 7 diagnostic records.
 *
 * @param {Array<object>} existingAssessedSkills - User's current assessedSkills array
 * @param {object} params
 * @param {string} params.skillName - Name of the tested skill
 * @param {number} params.totalCorrect - Number of correct answers
 * @param {number} params.totalQuestions - Total questions in quiz
 * @param {string} params.attemptId - Unique quiz attempt ID
 * @param {string} [params.category] - Optional category
 * @returns {{
 *   updatedAssessedSkills: Array<object>,
 *   finalLevel: number,
 *   demonstratedLevel: number,
 *   isImproved: boolean,
 *   preservedExisting: boolean,
 *   percentage: number,
 *   passed: boolean
 * }}
 */
export function applyQuizEvidenceUpdate(
  existingAssessedSkills,
  { skillName, totalCorrect, totalQuestions, attemptId, category }
) {
  const safeList = sanitizeAssessedSkillsList(existingAssessedSkills);
  const targetKey = normalizeSkillName(skillName);

  let existingIndex = -1;
  let existingLevel = null;
  let isDiagnosticRecord = false;

  for (let i = 0; i < safeList.length; i++) {
    const item = safeList[i];
    if (normalizeSkillName(item.name) === targetKey) {
      existingIndex = i;
      existingLevel = isValidSkillLevel(item.level) ? item.level : null;
      // Diagnostic assessment IDs start with 'assess_'
      if (item.assessmentId && item.assessmentId.startsWith('assess_')) {
        isDiagnosticRecord = true;
      }
      break;
    }
  }

  const { percentage, demonstratedLevel, finalLevel, isImproved, preservedExisting, passed } =
    calculateQuizProficiency(totalCorrect, totalQuestions, existingLevel);

  const nowIso = new Date().toISOString();

  // Resolve safe category string (never undefined)
  const resolvedCategory = (category && typeof category === 'string' && category.trim())
    ? category.trim()
    : (existingIndex >= 0 && safeList[existingIndex]?.category)
    ? safeList[existingIndex].category
    : undefined;

  if (existingIndex >= 0) {
    // If the record came from the comprehensive diagnostic assessment, do NOT replace its assessmentId or degrade it
    if (isDiagnosticRecord) {
      // Diagnostic assessment record is permanently protected as authoritative diagnostic evidence
      // No mutation of assessmentId or degradation
    } else if (isImproved) {
      const updatedItem = {
        name: safeList[existingIndex].name,
        level: finalLevel,
        source: 'practice-checkpoint',
        assessedAt: nowIso,
        assessmentId: attemptId,
      };
      if (resolvedCategory) {
        updatedItem.category = resolvedCategory;
      }
      safeList[existingIndex] = updatedItem;
    }
  } else if (finalLevel > 0) {
    // Insert new checkpoint record for this previously unassessed skill
    const newItem = {
      name: skillName,
      level: finalLevel,
      source: 'practice-checkpoint',
      assessedAt: nowIso,
      assessmentId: attemptId,
    };
    if (resolvedCategory) {
      newItem.category = resolvedCategory;
    }
    safeList.push(newItem);
  }

  return {
    updatedAssessedSkills: sanitizeAssessedSkillsList(safeList),
    finalLevel,
    demonstratedLevel,
    isImproved,
    preservedExisting,
    percentage,
    passed,
  };
}

export default {
  QUIZ_MAX_STANDALONE_PROFICIENCY,
  QUIZ_PASS_PERCENTAGE,
  calculateQuizProficiency,
  sanitizeAssessedSkillsList,
  applyQuizEvidenceUpdate,
};
