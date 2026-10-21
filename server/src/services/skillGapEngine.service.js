/**
 * Pure, Deterministic Skill Gap Calculation Engine (Phase 8).
 *
 * Implements:
 * 1. Canonical skill name normalization for robust matching.
 * 2. Strict evidence precedence: assessment-verified > resume-inferred > none.
 * 3. Zero-fabrication missing evidence rule: currentLevel is null, effectiveLevel is 0.
 * 4. Mathematical gap: max(0, requiredLevel - effectiveLevel).
 * 5. Official gap classifications: Small (<15), Medium (15-39), High (>=40).
 * 6. Deterministic 5-tier priority ranking with tie-breakers.
 * 7. Documented readiness percentage formula: round(100 * sum(effective) / sum(required)).
 * 8. Separation of non-benchmark extracted skills.
 *
 * PURE ENGINE: Contains ZERO network calls, Firestore access, Express dependencies, or side-effects.
 */

/**
 * Normalizes a skill string into a canonical representation for matching:
 * - Trims whitespace
 * - Converts to lowercase
 * - Strips all non-alphanumeric punctuation
 *
 * @param {string} skillName
 * @returns {string}
 */
export function normalizeSkillName(skillName) {
  if (!skillName || typeof skillName !== 'string') return '';
  return skillName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Validates whether a skill level is an integer between 0 and 100 inclusive.
 *
 * @param {any} level
 * @returns {boolean}
 */
export function isValidSkillLevel(level) {
  return typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= 100;
}

/**
 * Maps numeric gap size to verbal classification and code matching docs/04-scoring-method.md:
 * - Small Gap: 0 through 14 (under 15)
 * - Medium Gap: 15 through 39
 * - High Gap: 40 through 100 (40 or more)
 *
 * @param {number} gap
 * @returns {{ classification: 'Small Gap'|'Medium Gap'|'High Gap', classificationCode: 'small'|'medium'|'high' }}
 */
export function classifyGap(gap) {
  if (gap >= 40) {
    return { classification: 'High Gap', classificationCode: 'high' };
  }
  if (gap >= 15) {
    return { classification: 'Medium Gap', classificationCode: 'medium' };
  }
  return { classification: 'Small Gap', classificationCode: 'small' };
}

const CONFIDENCE_WEIGHTS = {
  high: 3,
  medium: 2,
  low: 1,
};

const EVIDENCE_URGENCY = {
  none: 1,
  'resume-inferred': 2,
  'assessment-verified': 3,
};

/**
 * Safely parses a date value into an epoch millisecond timestamp.
 * Returns 0 if missing, invalid, or non-finite, completely avoiding NaN in sort comparisons.
 *
 * @param {any} dateVal
 * @returns {number}
 */
export function safeTimestamp(dateVal) {
  if (!dateVal) return 0;
  const time = new Date(dateVal).getTime();
  return Number.isFinite(time) ? time : 0;
}

/**
 * Selects the best valid assessment record from multiple candidates:
 * 1. Most recent assessedAt timestamp
 * 2. Higher skill level
 * 3. Alphabetical tie-breaker on assessmentId/name
 *
 * @param {Array<object>} records
 * @returns {object|null}
 */
function resolveBestAssessmentRecord(records) {
  const valid = records.filter((r) => r && isValidSkillLevel(r.level));
  if (valid.length === 0) return null;

  return valid.slice().sort((a, b) => {
    const timeA = safeTimestamp(a.assessedAt);
    const timeB = safeTimestamp(b.assessedAt);
    if (timeB !== timeA) return timeB - timeA;

    if (b.level !== a.level) return b.level - a.level;

    const idA = String(a.assessmentId || '');
    const idB = String(b.assessmentId || '');
    return idA.localeCompare(idB);
  })[0];
}

/**
 * Selects the best valid resume record from multiple candidates:
 * 1. Highest confidence (high > medium > low)
 * 2. Highest skill level
 * 3. Alphabetical tie-breaker
 *
 * @param {Array<object>} records
 * @returns {object|null}
 */
function resolveBestResumeRecord(records) {
  const valid = records.filter((r) => r && isValidSkillLevel(r.level));
  if (valid.length === 0) return null;

  return valid.slice().sort((a, b) => {
    const confA = CONFIDENCE_WEIGHTS[a.confidence] || 0;
    const confB = CONFIDENCE_WEIGHTS[b.confidence] || 0;
    if (confB !== confA) return confB - confA;

    if (b.level !== a.level) return b.level - a.level;

    const rA = String(a.reasoning || a.name || '');
    const rB = String(b.reasoning || b.name || '');
    return rA.localeCompare(rB);
  })[0];
}

/**
 * Pure calculation function that computes skill gaps, evidence precedence,
 * deterministic ranking, and overall summary metrics.
 *
 * @param {object} params
 * @param {Array<object>} params.benchmarkSkills - List of required skills [{ name, requiredLevel, category }]
 * @param {Array<object>} [params.assessedSkills] - Verified assessment scores [{ name, level, source, assessedAt, assessmentId }]
 * @param {Array<object>} [params.extractedSkills] - Resume-extracted skills [{ name, level, source, confidence, reasoning }]
 * @returns {object} Calculated gap analysis report
 */
export function calculateSkillGaps({ benchmarkSkills = [], assessedSkills = [], extractedSkills = [] }) {
  const safeBenchmarkSkills = Array.isArray(benchmarkSkills) ? benchmarkSkills : [];
  const safeAssessedSkills = Array.isArray(assessedSkills) ? assessedSkills : [];
  const safeExtractedSkills = Array.isArray(extractedSkills) ? extractedSkills : [];

  // Group candidate evidence by canonical skill name
  const assessedMap = new Map();
  for (const item of safeAssessedSkills) {
    if (!item || !item.name) continue;
    const key = normalizeSkillName(item.name);
    if (!key) continue;
    if (!assessedMap.has(key)) assessedMap.set(key, []);
    assessedMap.get(key).push(item);
  }

  const extractedMap = new Map();
  for (const item of safeExtractedSkills) {
    if (!item || !item.name) continue;
    const key = normalizeSkillName(item.name);
    if (!key) continue;
    if (!extractedMap.has(key)) extractedMap.set(key, []);
    extractedMap.get(key).push(item);
  }

  const benchmarkCanonicalKeys = new Set();
  const calculatedSkills = [];

  // 1. Process each benchmark skill in the career profile
  safeBenchmarkSkills.forEach((bSkill, index) => {
    const rawName = typeof bSkill === 'string' ? bSkill : bSkill.name || 'Unknown Skill';
    const canonicalKey = normalizeSkillName(rawName);
    benchmarkCanonicalKeys.add(canonicalKey);

    const requiredLevel = typeof bSkill === 'object' && isValidSkillLevel(bSkill.requiredLevel)
      ? bSkill.requiredLevel
      : 80;

    const category = typeof bSkill === 'object' && bSkill.category ? bSkill.category : undefined;

    // Check evidence precedence: assessed > resume > none
    const assessmentCandidates = assessedMap.get(canonicalKey) || [];
    const bestAssessment = resolveBestAssessmentRecord(assessmentCandidates);

    let currentLevel = null;
    let effectiveLevel = 0;
    let evidenceSource = 'none';
    let hasEvidence = false;
    let assessmentId;
    let assessedAt;
    let confidence;
    let explanation;

    if (bestAssessment) {
      currentLevel = bestAssessment.level;
      effectiveLevel = bestAssessment.level;
      evidenceSource = 'assessment-verified';
      hasEvidence = true;
      assessmentId = bestAssessment.assessmentId || undefined;
      assessedAt = bestAssessment.assessedAt || undefined;
      explanation = `Verified through diagnostic assessment score of ${bestAssessment.level}/100.`;
    } else {
      const resumeCandidates = extractedMap.get(canonicalKey) || [];
      const bestResume = resolveBestResumeRecord(resumeCandidates);

      if (bestResume) {
        currentLevel = bestResume.level;
        effectiveLevel = bestResume.level;
        evidenceSource = 'resume-inferred';
        hasEvidence = true;
        confidence = bestResume.confidence || 'medium';
        explanation = `Inferred from resume analysis with ${confidence} confidence level of ${bestResume.level}/100.`;
      } else {
        currentLevel = null;
        effectiveLevel = 0;
        evidenceSource = 'none';
        hasEvidence = false;
        explanation = 'Not assessed. No verified assessment or resume evidence detected. Gap calculated assuming baseline 0 proficiency.';
      }
    }

    // Mathematical gap formula: max(0, requiredLevel - effectiveLevel)
    const gap = Math.max(0, requiredLevel - effectiveLevel);
    const { classification, classificationCode } = classifyGap(gap);

    const entry = {
      benchmarkIndex: index,
      name: rawName,
      requiredLevel,
      currentLevel,
      effectiveLevel,
      gap,
      classification,
      classificationCode,
      evidenceSource,
      hasEvidence,
      explanation,
    };

    if (category) entry.category = category;
    if (assessmentId) entry.assessmentId = assessmentId;
    if (assessedAt) entry.assessedAt = assessedAt;
    if (confidence) entry.confidence = confidence;

    calculatedSkills.push(entry);
  });

  // 2. Deterministic 5-tier Priority Ranking
  calculatedSkills.sort((a, b) => {
    // 1. Larger gap first
    if (b.gap !== a.gap) return b.gap - a.gap;

    // 2. Higher required level first
    if (b.requiredLevel !== a.requiredLevel) return b.requiredLevel - a.requiredLevel;

    // 3. Lower effective level first (student is weaker)
    if (a.effectiveLevel !== b.effectiveLevel) return a.effectiveLevel - b.effectiveLevel;

    // 4. Evidence urgency: none (1) before resume-inferred (2) before assessment-verified (3)
    const urgA = EVIDENCE_URGENCY[a.evidenceSource] || 99;
    const urgB = EVIDENCE_URGENCY[b.evidenceSource] || 99;
    if (urgA !== urgB) return urgA - urgB;

    // 5. Original benchmark order, followed by stable alphabetical fallback
    if (a.benchmarkIndex !== b.benchmarkIndex) return a.benchmarkIndex - b.benchmarkIndex;
    return a.name.localeCompare(b.name);
  });

  // Assign priorityRank from 1 through N and clean temporary sort fields
  const skillGaps = calculatedSkills.map((item, idx) => {
    const { benchmarkIndex, ...cleanItem } = item;
    return {
      priorityRank: idx + 1,
      ...cleanItem,
    };
  });

  // 3. Compute Documented Summary Metrics
  const totalBenchmarkSkills = skillGaps.length;
  const evaluatedSkillsCount = skillGaps.filter((s) => s.hasEvidence).length;
  const highGapCount = skillGaps.filter((s) => s.classificationCode === 'high').length;
  const mediumGapCount = skillGaps.filter((s) => s.classificationCode === 'medium').length;
  const smallGapCount = skillGaps.filter((s) => s.classificationCode === 'small').length;

  const totalEffective = skillGaps.reduce((sum, s) => sum + s.effectiveLevel, 0);
  const totalRequired = skillGaps.reduce((sum, s) => sum + s.requiredLevel, 0);

  // Overall readiness formula: round(100 * sum(effectiveLevel) / sum(requiredLevel)), clamped 0-100
  let overallReadinessPercentage = 0;
  if (totalRequired > 0) {
    overallReadinessPercentage = Math.min(100, Math.max(0, Math.round((100 * totalEffective) / totalRequired)));
  }

  const topPrioritySkill = skillGaps.length > 0 ? skillGaps[0].name : null;

  const summary = {
    totalBenchmarkSkills,
    evaluatedSkillsCount,
    highGapCount,
    mediumGapCount,
    smallGapCount,
    overallReadinessPercentage,
    topPrioritySkill,
  };

  // 4. Identify Other Extracted Skills (Non-Benchmark)
  const otherExtractedSkills = [];
  const seenOtherKeys = new Set();

  for (const item of safeExtractedSkills) {
    if (!item || !item.name) continue;
    const key = normalizeSkillName(item.name);
    if (!key || benchmarkCanonicalKeys.has(key) || seenOtherKeys.has(key)) {
      continue;
    }
    if (!isValidSkillLevel(item.level)) continue;

    seenOtherKeys.add(key);
    otherExtractedSkills.push({
      name: item.name.trim(),
      level: item.level,
      category: item.category ? item.category.trim() : 'General',
      source: 'resume-inferred',
      confidence: item.confidence || 'medium',
      isCareerBenchmark: false,
    });
  }

  return {
    summary,
    skillGaps,
    otherExtractedSkills,
  };
}

export default {
  normalizeSkillName,
  isValidSkillLevel,
  classifyGap,
  calculateSkillGaps,
  safeTimestamp,
};
