import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSkillName,
  isValidSkillLevel,
  classifyGap,
  calculateSkillGaps,
  safeTimestamp,
} from '../src/services/skillGapEngine.service.js';
import {
  CAREER_BENCHMARKS,
  BENCHMARK_REQUIRED_LEVEL,
  getCareerBenchmark,
  isValidCareerId,
} from '../src/data/careerBenchmarks.js';
import {
  getSkillGapAnalysis,
  setDbForTesting,
} from '../src/controllers/skillGap.controller.js';

// ============================================================================
// PART 1: PURE ENGINE TESTS (Offline, Deterministic, Zero DB Dependencies)
// ============================================================================

test('Career Benchmarks - Covers all 5 active careers with requiredLevel 80', () => {
  const expectedCareers = [
    'full-stack-developer',
    'frontend-developer',
    'data-analyst',
    'python-developer',
    'ai-ml-engineer',
  ];

  for (const careerId of expectedCareers) {
    assert.equal(isValidCareerId(careerId), true, `Career ${careerId} must be valid`);
    const benchmark = getCareerBenchmark(careerId);
    assert.ok(benchmark, `Benchmark must exist for ${careerId}`);
    assert.equal(benchmark.id, careerId);
    assert.ok(benchmark.name);
    assert.equal(Array.isArray(benchmark.skills), true);
    assert.equal(benchmark.skills.length, 5, `${careerId} must have exactly 5 benchmark skills`);

    for (const skill of benchmark.skills) {
      assert.ok(skill.name, 'Skill must have a name');
      assert.equal(skill.requiredLevel, BENCHMARK_REQUIRED_LEVEL, 'Skill must require level 80');
      assert.ok(skill.category, 'Skill must have a category');
    }
  }

  assert.equal(isValidCareerId('non-existent-career'), false);
  assert.equal(getCareerBenchmark('non-existent-career'), null);
});

test('Engine - Canonical skill name normalization', () => {
  assert.equal(normalizeSkillName('React'), 'react');
  assert.equal(normalizeSkillName('  React  '), 'react');
  assert.equal(normalizeSkillName('Node.js'), 'nodejs');
  assert.equal(normalizeSkillName('node.js'), 'nodejs');
  assert.equal(normalizeSkillName('REST APIs'), 'restapis');
  assert.equal(normalizeSkillName('rest apis'), 'restapis');
  assert.equal(normalizeSkillName('UI/UX'), 'uiux');
  assert.equal(normalizeSkillName('Prompt Eng'), 'prompteng');
  assert.equal(normalizeSkillName('Vector DBs'), 'vectordbs');
  assert.equal(normalizeSkillName(null), '');
  assert.equal(normalizeSkillName(undefined), '');
  assert.equal(normalizeSkillName(123), '');
});

test('Engine - Skill level validator', () => {
  assert.equal(isValidSkillLevel(0), true);
  assert.equal(isValidSkillLevel(50), true);
  assert.equal(isValidSkillLevel(100), true);
  assert.equal(isValidSkillLevel(-1), false);
  assert.equal(isValidSkillLevel(101), false);
  assert.equal(isValidSkillLevel(45.5), false);
  assert.equal(isValidSkillLevel('80'), false);
  assert.equal(isValidSkillLevel(null), false);
  assert.equal(isValidSkillLevel(undefined), false);
});

test('Engine - Mathematical gap calculation: below, equal, and exceeding required level', () => {
  const benchmarkSkills = [
    { name: 'Skill Below', requiredLevel: 80 },
    { name: 'Skill Equal', requiredLevel: 80 },
    { name: 'Skill Exceeds', requiredLevel: 80 },
  ];

  const assessedSkills = [
    { name: 'Skill Below', level: 50, source: 'assessment-verified' },
    { name: 'Skill Equal', level: 80, source: 'assessment-verified' },
    { name: 'Skill Exceeds', level: 95, source: 'assessment-verified' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });
  const map = new Map(result.skillGaps.map((s) => [s.name, s]));

  assert.equal(map.get('Skill Below').gap, 30); // 80 - 50 = 30
  assert.equal(map.get('Skill Equal').gap, 0);  // 80 - 80 = 0
  assert.equal(map.get('Skill Exceeds').gap, 0); // max(0, 80 - 95) = 0
});

test('Engine - Gaps never become negative under any inputs', () => {
  const benchmarkSkills = [{ name: 'SuperSkill', requiredLevel: 70 }];
  const assessedSkills = [{ name: 'SuperSkill', level: 100, source: 'assessment-verified' }];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });
  assert.equal(result.skillGaps[0].gap, 0);
  assert.ok(result.skillGaps[0].gap >= 0);
});

test('Engine - Official acceptance test worked example (docs/04-scoring-method.md Section 4)', () => {
  // Acceptance scenario: JavaScript (curr 75, req 80), React (curr 45, req 80), Node.js (curr 30, req 80)
  const benchmarkSkills = [
    { name: 'JavaScript', requiredLevel: 80 },
    { name: 'React', requiredLevel: 80 },
    { name: 'Node.js', requiredLevel: 80 },
  ];

  const assessedSkills = [
    { name: 'JavaScript', level: 75, source: 'assessment-verified' },
    { name: 'React', level: 45, source: 'assessment-verified' },
    { name: 'Node.js', level: 30, source: 'assessment-verified' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });

  assert.equal(result.skillGaps.length, 3);

  // Rank 1: Node.js (gap 50, High Gap)
  assert.equal(result.skillGaps[0].name, 'Node.js');
  assert.equal(result.skillGaps[0].gap, 50);
  assert.equal(result.skillGaps[0].classification, 'High Gap');
  assert.equal(result.skillGaps[0].classificationCode, 'high');
  assert.equal(result.skillGaps[0].priorityRank, 1);

  // Rank 2: React (gap 35, Medium Gap)
  assert.equal(result.skillGaps[1].name, 'React');
  assert.equal(result.skillGaps[1].gap, 35);
  assert.equal(result.skillGaps[1].classification, 'Medium Gap');
  assert.equal(result.skillGaps[1].classificationCode, 'medium');
  assert.equal(result.skillGaps[1].priorityRank, 2);

  // Rank 3: JavaScript (gap 5, Small Gap)
  assert.equal(result.skillGaps[2].name, 'JavaScript');
  assert.equal(result.skillGaps[2].gap, 5);
  assert.equal(result.skillGaps[2].classification, 'Small Gap');
  assert.equal(result.skillGaps[2].classificationCode, 'small');
  assert.equal(result.skillGaps[2].priorityRank, 3);

  // Summary checks
  assert.equal(result.summary.totalBenchmarkSkills, 3);
  assert.equal(result.summary.evaluatedSkillsCount, 3);
  assert.equal(result.summary.highGapCount, 1);
  assert.equal(result.summary.mediumGapCount, 1);
  assert.equal(result.summary.smallGapCount, 1);
  assert.equal(result.summary.topPrioritySkill, 'Node.js');
  // Readiness = round(100 * (75 + 45 + 30) / (80 + 80 + 80)) = round(15000 / 240) = round(62.5) = 63%
  assert.equal(result.summary.overallReadinessPercentage, 63);
});

test('Engine - Classification boundary thresholds (0, 14, 15, 39, 40, 100)', () => {
  assert.deepEqual(classifyGap(0), { classification: 'Small Gap', classificationCode: 'small' });
  assert.deepEqual(classifyGap(14), { classification: 'Small Gap', classificationCode: 'small' });
  assert.deepEqual(classifyGap(15), { classification: 'Medium Gap', classificationCode: 'medium' });
  assert.deepEqual(classifyGap(39), { classification: 'Medium Gap', classificationCode: 'medium' });
  assert.deepEqual(classifyGap(40), { classification: 'High Gap', classificationCode: 'high' });
  assert.deepEqual(classifyGap(100), { classification: 'High Gap', classificationCode: 'high' });
});

test('Engine - Evidence Precedence: assessment-verified strictly overrides resume-inferred', () => {
  const benchmarkSkills = [{ name: 'React', requiredLevel: 80 }];

  const extractedSkills = [
    { name: 'React', level: 90, source: 'resume-inferred', confidence: 'high' },
  ];
  const assessedSkills = [
    { name: 'React', level: 60, source: 'assessment-verified', assessmentId: 'assess_1' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills, extractedSkills });
  const react = result.skillGaps[0];

  assert.equal(react.evidenceSource, 'assessment-verified');
  assert.equal(react.currentLevel, 60); // 60 from assessment, NOT 90 from resume
  assert.equal(react.effectiveLevel, 60);
  assert.equal(react.gap, 20);
  assert.equal(react.hasEvidence, true);
  assert.equal(react.assessmentId, 'assess_1');
});

test('Engine - Resume evidence is used when no assessment evidence exists', () => {
  const benchmarkSkills = [{ name: 'Node.js', requiredLevel: 80 }];
  const extractedSkills = [
    { name: 'Node.js', level: 55, source: 'resume-inferred', confidence: 'medium', reasoning: 'Used in Express projects' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills: [], extractedSkills });
  const node = result.skillGaps[0];

  assert.equal(node.evidenceSource, 'resume-inferred');
  assert.equal(node.currentLevel, 55);
  assert.equal(node.effectiveLevel, 55);
  assert.equal(node.gap, 25);
  assert.equal(node.hasEvidence, true);
  assert.equal(node.confidence, 'medium');
  assert.ok(node.explanation.includes('resume analysis'));
});

test('Engine - Source preservation: Never converts resume-inferred into assessment-verified', () => {
  const benchmarkSkills = [
    { name: 'Docker', requiredLevel: 80 },
    { name: 'Python', requiredLevel: 80 },
  ];
  const extractedSkills = [
    { name: 'Docker', level: 50, source: 'resume-inferred' },
  ];
  const assessedSkills = [
    { name: 'Python', level: 70, source: 'assessment-verified' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills, extractedSkills });
  const docker = result.skillGaps.find((s) => s.name === 'Docker');
  const python = result.skillGaps.find((s) => s.name === 'Python');

  assert.equal(docker.evidenceSource, 'resume-inferred');
  assert.notEqual(docker.evidenceSource, 'assessment-verified');
  assert.equal(python.evidenceSource, 'assessment-verified');
});

test('Engine - Missing evidence returns currentLevel null, effectiveLevel 0, evidenceSource none', () => {
  const benchmarkSkills = [{ name: 'System Design', requiredLevel: 80 }];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills: [], extractedSkills: [] });
  const sys = result.skillGaps[0];

  assert.equal(sys.currentLevel, null);
  assert.equal(sys.effectiveLevel, 0);
  assert.equal(sys.evidenceSource, 'none');
  assert.equal(sys.hasEvidence, false);
  assert.equal(sys.gap, 80);
  assert.equal(sys.classification, 'High Gap');
  assert.equal(sys.classificationCode, 'high');
  assert.ok(sys.explanation.includes('Not assessed'));
  assert.ok(sys.explanation.includes('baseline 0'));
});

test('Engine - Safe handling of invalid levels, malformed records, and absent arrays', () => {
  const benchmarkSkills = [
    { name: 'React', requiredLevel: 80 },
    { name: 'Node.js', requiredLevel: 80 },
  ];

  // Malformed records with strings, booleans, out-of-range, or nulls
  const assessedSkills = [
    { name: 'React', level: 'invalid_string', source: 'assessment-verified' },
    { name: 'React', level: 150, source: 'assessment-verified' },
    { name: 'React', level: -10, source: 'assessment-verified' },
    null,
    undefined,
  ];

  const extractedSkills = [
    { name: 'React', level: 50, source: 'resume-inferred', confidence: 'medium' },
    { name: 'Node.js', level: null, source: 'resume-inferred' },
  ];

  const result = calculateSkillGaps({
    benchmarkSkills,
    assessedSkills,
    extractedSkills,
  });

  const react = result.skillGaps.find((s) => s.name === 'React');
  const node = result.skillGaps.find((s) => s.name === 'Node.js');

  // React should safely fall back to the valid resume score of 50
  assert.equal(react.evidenceSource, 'resume-inferred');
  assert.equal(react.currentLevel, 50);

  // Node.js had only an invalid resume level, so it safely falls back to none
  assert.equal(node.evidenceSource, 'none');
  assert.equal(node.currentLevel, null);
  assert.equal(node.effectiveLevel, 0);

  // Missing arrays parameter handling
  const emptyResult = calculateSkillGaps({});
  assert.equal(emptyResult.skillGaps.length, 0);
  assert.equal(emptyResult.summary.totalBenchmarkSkills, 0);
});

test('Engine - Canonical matching for casing, whitespace, and punctuation', () => {
  const benchmarkSkills = [
    { name: 'Node.js', requiredLevel: 80 },
    { name: 'REST APIs', requiredLevel: 80 },
    { name: 'UI/UX', requiredLevel: 80 },
  ];

  const assessedSkills = [
    { name: 'nodejs', level: 60, source: 'assessment-verified' },
    { name: '  rest apis  ', level: 70, source: 'assessment-verified' },
    { name: 'uiux', level: 80, source: 'assessment-verified' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });

  const node = result.skillGaps.find((s) => s.name === 'Node.js');
  const rest = result.skillGaps.find((s) => s.name === 'REST APIs');
  const uiux = result.skillGaps.find((s) => s.name === 'UI/UX');

  assert.equal(node.evidenceSource, 'assessment-verified');
  assert.equal(node.currentLevel, 60);
  assert.equal(rest.evidenceSource, 'assessment-verified');
  assert.equal(rest.currentLevel, 70);
  assert.equal(uiux.evidenceSource, 'assessment-verified');
  assert.equal(uiux.currentLevel, 80);
});

test('Engine - Duplicate resume evidence resolution prefers higher confidence then higher level', () => {
  const benchmarkSkills = [{ name: 'React', requiredLevel: 80 }];

  const extractedSkills = [
    { name: 'react', level: 85, confidence: 'low', source: 'resume-inferred' },
    { name: 'React', level: 75, confidence: 'high', source: 'resume-inferred' },
    { name: 'REACT', level: 60, confidence: 'medium', source: 'resume-inferred' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, extractedSkills });
  // 'high' confidence with 75 should be selected over 'low' confidence with 85
  assert.equal(result.skillGaps[0].currentLevel, 75);
  assert.equal(result.skillGaps[0].confidence, 'high');
});

test('Engine - Multiple assessment records select the most recent valid record deterministically', () => {
  const benchmarkSkills = [{ name: 'PostgreSQL', requiredLevel: 80 }];

  const assessedSkills = [
    {
      name: 'PostgreSQL',
      level: 40,
      assessedAt: '2026-10-01T10:00:00.000Z',
      assessmentId: 'assess_older',
      source: 'assessment-verified',
    },
    {
      name: 'PostgreSQL',
      level: 80,
      assessedAt: '2026-10-15T10:00:00.000Z',
      assessmentId: 'assess_newer',
      source: 'assessment-verified',
    },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });
  assert.equal(result.skillGaps[0].currentLevel, 80);
  assert.equal(result.skillGaps[0].assessmentId, 'assess_newer');
});

test('Engine - Safe timestamp parser safely handles null, undefined, invalid, and valid dates', () => {
  assert.equal(safeTimestamp(null), 0);
  assert.equal(safeTimestamp(undefined), 0);
  assert.equal(safeTimestamp(''), 0);
  assert.equal(safeTimestamp('not-a-valid-date'), 0);
  assert.equal(safeTimestamp(NaN), 0);
  assert.equal(safeTimestamp(123456789), 123456789);
  const iso = '2026-10-15T10:00:00.000Z';
  assert.equal(safeTimestamp(iso), new Date(iso).getTime());
});

test('Engine - Deterministically handles malformed assessedAt dates without NaN in sort', () => {
  const benchmarkSkills = [{ name: 'PostgreSQL', requiredLevel: 80 }];

  // Record with valid date vs records with malformed/missing dates
  const assessedSkills = [
    {
      name: 'PostgreSQL',
      level: 50,
      assessedAt: 'invalid-date-string',
      assessmentId: 'assess_invalid_1',
      source: 'assessment-verified',
    },
    {
      name: 'PostgreSQL',
      level: 70,
      assessedAt: null,
      assessmentId: 'assess_null_date',
      source: 'assessment-verified',
    },
    {
      name: 'PostgreSQL',
      level: 60,
      assessedAt: '2026-10-10T12:00:00.000Z',
      assessmentId: 'assess_valid_date',
      source: 'assessment-verified',
    },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills });

  // Valid date (2026-10-10) must be selected over invalid/null dates despite lower score
  assert.equal(result.skillGaps[0].currentLevel, 60);
  assert.equal(result.skillGaps[0].assessmentId, 'assess_valid_date');

  // When only invalid dates exist, deterministically falls back to level tie-breaker
  const onlyInvalid = [
    { name: 'PostgreSQL', level: 50, assessedAt: 'garbage_date', assessmentId: 'a1', source: 'assessment-verified' },
    { name: 'PostgreSQL', level: 75, assessedAt: 'broken_date', assessmentId: 'a2', source: 'assessment-verified' },
  ];
  const resultInvalid = calculateSkillGaps({ benchmarkSkills, assessedSkills: onlyInvalid });
  assert.equal(resultInvalid.skillGaps[0].currentLevel, 75);
  assert.equal(resultInvalid.skillGaps[0].assessmentId, 'a2');
});

test('Engine - Comprehensive 5-tier Priority Ranking tie-breaker rules', () => {
  const benchmarkSkills = [
    { name: 'Skill Zero Overachieve', requiredLevel: 80 }, // gap 0, req 80, eff 95, assessed
    { name: 'Skill Large Gap', requiredLevel: 80 },        // gap 60, req 80, eff 20, assessed -> Rank 1 (Tier 1: Largest gap)
    { name: 'Skill High Req', requiredLevel: 90 },         // gap 40, req 90, eff 50, assessed -> Rank 2 (Tier 2: Higher req 90 vs 80)
    { name: 'Skill Resume Med', requiredLevel: 80 },       // gap 40, req 80, eff 40, resume   -> Rank 3 (Tier 4: resume urgency over assessed)
    { name: 'Skill Assessed Med', requiredLevel: 80 },     // gap 40, req 80, eff 40, assessed -> Rank 4
    { name: 'Skill Zero Base', requiredLevel: 80 },        // gap 0, req 80, eff 80, assessed  -> Rank 5 (Tier 3: lower eff 80 vs 95)
  ];

  const assessedSkills = [
    { name: 'Skill Large Gap', level: 20, source: 'assessment-verified' },
    { name: 'Skill High Req', level: 50, source: 'assessment-verified' },
    { name: 'Skill Assessed Med', level: 40, source: 'assessment-verified' },
    { name: 'Skill Zero Base', level: 80, source: 'assessment-verified' },
    { name: 'Skill Zero Overachieve', level: 95, source: 'assessment-verified' },
  ];

  const extractedSkills = [
    { name: 'Skill Resume Med', level: 40, source: 'resume-inferred', confidence: 'medium' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, assessedSkills, extractedSkills });

  // 1. Skill Large Gap (Gap 60 -> Tier 1: Largest gap)
  assert.equal(result.skillGaps[0].name, 'Skill Large Gap');
  assert.equal(result.skillGaps[0].priorityRank, 1);

  // 2. Skill High Req (Gap 40, requiredLevel 90 vs 80 -> Tier 2: Higher required level)
  assert.equal(result.skillGaps[1].name, 'Skill High Req');
  assert.equal(result.skillGaps[1].priorityRank, 2);

  // 3. Skill Resume Med (Gap 40, req 80, eff 40, resume-inferred -> Tier 4: resume urgency over assessed)
  assert.equal(result.skillGaps[2].name, 'Skill Resume Med');
  assert.equal(result.skillGaps[2].priorityRank, 3);

  // 4. Skill Assessed Med (Gap 40, req 80, eff 40, assessment-verified)
  assert.equal(result.skillGaps[3].name, 'Skill Assessed Med');
  assert.equal(result.skillGaps[3].priorityRank, 4);

  // 5. Skill Zero Base (Gap 0, req 80, eff 80 -> Tier 3: lower effective level 80 vs 95)
  assert.equal(result.skillGaps[4].name, 'Skill Zero Base');
  assert.equal(result.skillGaps[4].priorityRank, 5);

  // 6. Skill Zero Overachieve (Gap 0, req 80, eff 95)
  assert.equal(result.skillGaps[5].name, 'Skill Zero Overachieve');
  assert.equal(result.skillGaps[5].priorityRank, 6);
});

test('Engine - Overall readiness formula: rounding, bounds, and precision', () => {
  // Case 1: 5 skills all requiring 80 = 400 total required.
  // Effective: 80 + 80 + 80 + 80 + 80 = 400. Readiness = round(100 * 400 / 400) = 100%
  const bSkills = [
    { name: 'S1', requiredLevel: 80 },
    { name: 'S2', requiredLevel: 80 },
    { name: 'S3', requiredLevel: 80 },
    { name: 'S4', requiredLevel: 80 },
    { name: 'S5', requiredLevel: 80 },
  ];
  const aSkills = [
    { name: 'S1', level: 80 },
    { name: 'S2', level: 80 },
    { name: 'S3', level: 80 },
    { name: 'S4', level: 80 },
    { name: 'S5', level: 80 },
  ];
  const res1 = calculateSkillGaps({ benchmarkSkills: bSkills, assessedSkills: aSkills });
  assert.equal(res1.summary.overallReadinessPercentage, 100);

  // Case 2: Effective sum = 125, Total required = 400 -> 12500 / 400 = 31.25 -> 31%
  const aSkills2 = [
    { name: 'S1', level: 50 },
    { name: 'S2', level: 75 },
    // S3, S4, S5 are unassessed (0)
  ];
  const res2 = calculateSkillGaps({ benchmarkSkills: bSkills, assessedSkills: aSkills2 });
  assert.equal(res2.summary.overallReadinessPercentage, 31);
});

test('Engine - Empty benchmark handling without division by zero', () => {
  const result = calculateSkillGaps({ benchmarkSkills: [], assessedSkills: [], extractedSkills: [] });
  assert.equal(result.summary.totalBenchmarkSkills, 0);
  assert.equal(result.summary.evaluatedSkillsCount, 0);
  assert.equal(result.summary.overallReadinessPercentage, 0);
  assert.equal(result.summary.topPrioritySkill, null);
  assert.deepEqual(result.skillGaps, []);
  assert.deepEqual(result.otherExtractedSkills, []);
});

test('Engine - Extra extracted skills reported separately and excluded from benchmark readiness', () => {
  const benchmarkSkills = [
    { name: 'React', requiredLevel: 80 },
    { name: 'Node.js', requiredLevel: 80 },
  ];

  const extractedSkills = [
    { name: 'React', level: 60, source: 'resume-inferred', confidence: 'high' },
    { name: 'Docker', level: 70, category: 'DevOps', source: 'resume-inferred', confidence: 'medium' },
    { name: 'Kubernetes', level: 50, category: 'DevOps', source: 'resume-inferred', confidence: 'low' },
  ];

  const result = calculateSkillGaps({ benchmarkSkills, extractedSkills });

  // Only React and Node.js should be in skillGaps
  assert.equal(result.skillGaps.length, 2);
  assert.equal(result.summary.totalBenchmarkSkills, 2);
  // Readiness calculated exclusively from React (60) and Node.js (0) -> 6000 / 160 = 37.5 -> 38%
  assert.equal(result.summary.overallReadinessPercentage, 38);

  // Docker and Kubernetes should be in otherExtractedSkills
  assert.equal(result.otherExtractedSkills.length, 2);
  const otherNames = result.otherExtractedSkills.map((s) => s.name);
  assert.ok(otherNames.includes('Docker'));
  assert.ok(otherNames.includes('Kubernetes'));
  assert.equal(result.otherExtractedSkills[0].isCareerBenchmark, false);
});

test('Engine - Repeated calls with identical inputs produce identical results (idempotence)', () => {
  const benchmark = getCareerBenchmark('full-stack-developer');
  const assessed = [
    { name: 'React', level: 70, source: 'assessment-verified' },
    { name: 'Node.js', level: 40, source: 'assessment-verified' },
  ];
  const extracted = [
    { name: 'PostgreSQL', level: 50, source: 'resume-inferred' },
  ];

  const run1 = calculateSkillGaps({ benchmarkSkills: benchmark.skills, assessedSkills: assessed, extractedSkills: extracted });
  const run2 = calculateSkillGaps({ benchmarkSkills: benchmark.skills, assessedSkills: assessed, extractedSkills: extracted });

  assert.deepEqual(run1, run2);
});

// ============================================================================
// PART 2: CONTROLLER & API INTEGRATION TESTS (Mock Firestore Injection)
// ============================================================================

function createMockFirestore(store = {}) {
  return {
    collection(colName) {
      return {
        doc(docId) {
          return {
            async get() {
              const key = `${colName}/${docId}`;
              if (store[key]) {
                return {
                  exists: true,
                  id: docId,
                  data: () => store[key],
                };
              }
              return {
                exists: false,
                id: docId,
                data: () => null,
              };
            },
          };
        },
      };
    },
  };
}

test('Controller - Rejects request with 503 when database is not configured', async () => {
  setDbForTesting(null);

  const req = { user: { uid: 'u1' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});
  assert.equal(statusCode, 503);
  assert.equal(responseData?.error?.code, 'DB_UNAVAILABLE');
});

test('Controller - Rejects request with 404 when user profile document is not found', async () => {
  const mockDb = createMockFirestore({});
  setDbForTesting(mockDb);

  const req = { user: { uid: 'non_existent_user' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});
  assert.equal(statusCode, 404);
  assert.equal(responseData?.error?.code, 'USER_NOT_FOUND');
});

test('Controller - Rejects request with 409 when user has not selected a career', async () => {
  const mockDb = createMockFirestore({
    'users/user_no_career': {
      uid: 'user_no_career',
      displayName: 'Learner',
      selectedCareerId: null,
    },
  });
  setDbForTesting(mockDb);

  const req = { user: { uid: 'user_no_career' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});
  assert.equal(statusCode, 409);
  assert.equal(responseData?.error?.code, 'CAREER_NOT_SELECTED');
});

test('Controller - Rejects request with 400 when selected career is not recognized', async () => {
  const mockDb = createMockFirestore({
    'users/user_bad_career': {
      uid: 'user_bad_career',
      selectedCareerId: 'unsupported-career-path',
    },
  });
  setDbForTesting(mockDb);

  const req = { user: { uid: 'user_bad_career' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});
  assert.equal(statusCode, 400);
  assert.equal(responseData?.error?.code, 'CAREER_NOT_SUPPORTED');
});

test('Controller - Successfully calculates gaps in real-time without caching or persistence', async () => {
  const userStore = {
    'users/valid_student': {
      uid: 'valid_student',
      displayName: 'Bishal Sharma',
      selectedCareerId: 'full-stack-developer',
      assessedSkills: [
        { name: 'React', level: 67, source: 'assessment-verified', assessmentId: 'assess_test_1' },
      ],
      extractedSkills: [
        { name: 'Node.js', level: 40, source: 'resume-inferred', confidence: 'medium' },
        { name: 'Docker', level: 70, source: 'resume-inferred' },
      ],
    },
    'careers/full-stack-developer': {
      name: 'Full Stack Developer',
    },
  };

  const mockDb = createMockFirestore(userStore);
  setDbForTesting(mockDb);

  const req = { user: { uid: 'valid_student' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});

  assert.equal(statusCode, 200);
  assert.ok(responseData?.data);
  const data = responseData.data;

  assert.equal(data.careerId, 'full-stack-developer');
  assert.equal(data.careerName, 'Full Stack Developer');
  assert.ok(data.analyzedAt);

  // Summary validation
  assert.equal(data.summary.totalBenchmarkSkills, 5);
  assert.equal(data.summary.evaluatedSkillsCount, 2); // React (assessed) + Node.js (resume)
  assert.equal(data.summary.highGapCount, 4); // 1 evaluated (Node.js gap 40) + 3 unassessed (gap 80)
  assert.equal(data.summary.mediumGapCount, 0);
  assert.equal(data.summary.smallGapCount, 1); // React (gap 13)
  assert.equal(data.summary.overallReadinessPercentage, 27); // round(100 * (67 + 40) / 400) = 27%

  // Gaps validation
  assert.equal(data.skillGaps.length, 5);
  const react = data.skillGaps.find((s) => s.name === 'React');
  const node = data.skillGaps.find((s) => s.name === 'Node.js');
  const sysDesign = data.skillGaps.find((s) => s.name === 'System Design');

  assert.equal(react.evidenceSource, 'assessment-verified');
  assert.equal(react.currentLevel, 67);
  assert.equal(react.gap, 13); // 80 - 67 = 13 (Small Gap)
  assert.equal(react.classificationCode, 'small');

  assert.equal(node.evidenceSource, 'resume-inferred');
  assert.equal(node.currentLevel, 40);
  assert.equal(node.gap, 40); // 80 - 40 = 40 (High Gap)
  assert.equal(node.classificationCode, 'high');

  assert.equal(sysDesign.evidenceSource, 'none');
  assert.equal(sysDesign.currentLevel, null);
  assert.equal(sysDesign.effectiveLevel, 0);
  assert.equal(sysDesign.gap, 80); // 80 - 0 = 80 (High Gap)
  assert.equal(sysDesign.hasEvidence, false);

  // Other extracted skills (Docker)
  assert.equal(data.otherExtractedSkills.length, 1);
  assert.equal(data.otherExtractedSkills[0].name, 'Docker');
  assert.equal(data.otherExtractedSkills[0].isCareerBenchmark, false);

  // Verify real-time dynamic update: modify userStore and check that new call reflects it immediately
  userStore['users/valid_student'].assessedSkills = [
    { name: 'React', level: 80, source: 'assessment-verified' },
    { name: 'System Design', level: 80, source: 'assessment-verified' },
  ];

  await getSkillGapAnalysis(req, res, () => {});
  const updatedReact = responseData.data.skillGaps.find((s) => s.name === 'React');
  assert.equal(updatedReact.currentLevel, 80);
  assert.equal(updatedReact.gap, 0);
  const updatedSys = responseData.data.skillGaps.find((s) => s.name === 'System Design');
  assert.equal(updatedSys.currentLevel, 80);
  assert.equal(updatedSys.gap, 0);
  assert.equal(updatedSys.evidenceSource, 'assessment-verified');

  // Reset test db
  setDbForTesting(null);
});

test('Controller - Missing skill arrays default safely to empty arrays', async () => {
  const mockDb = createMockFirestore({
    'users/legacy_user': {
      uid: 'legacy_user',
      selectedCareerId: 'frontend-developer',
      // Neither assessedSkills nor extractedSkills defined
    },
  });
  setDbForTesting(mockDb);

  const req = { user: { uid: 'legacy_user' } };
  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
    },
  };

  await getSkillGapAnalysis(req, res, () => {});
  assert.equal(statusCode, 200);
  assert.equal(responseData.data.skillGaps.length, 5);
  // All 5 benchmark skills should be unassessed
  for (const s of responseData.data.skillGaps) {
    assert.equal(s.evidenceSource, 'none');
    assert.equal(s.currentLevel, null);
    assert.equal(s.effectiveLevel, 0);
    assert.equal(s.gap, 80);
  }

  setDbForTesting(null);
});

test('Authentication - Rejects unauthenticated requests with 401', async () => {
  const { authenticate } = await import('../src/middleware/authenticate.js');

  // Case 1: Missing Authorization header
  let code1 = 200;
  let body1 = null;
  const req1 = { headers: {} };
  const res1 = {
    status(c) {
      code1 = c;
      return this;
    },
    json(b) {
      body1 = b;
    },
  };
  await authenticate(req1, res1, () => {});
  assert.equal(code1, 401);
  assert.equal(body1?.error?.message, 'Authorization header is required');

  // Case 2: Malformed Authorization header
  let code2 = 200;
  let body2 = null;
  const req2 = { headers: { authorization: 'Basic 12345' } };
  const res2 = {
    status(c) {
      code2 = c;
      return this;
    },
    json(b) {
      body2 = b;
    },
  };
  await authenticate(req2, res2, () => {});
  assert.equal(code2, 401);
  assert.equal(body2?.error?.message, 'Authorization header must follow format: Bearer <token>');
});
