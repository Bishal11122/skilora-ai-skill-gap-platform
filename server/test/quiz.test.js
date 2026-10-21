import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SKILL_QUIZ_BANK,
  getSkillQuizQuestions,
  sanitizeSkillQuizQuestions,
  gradeSkillQuizSubmission,
} from '../src/data/skillQuizQuestions.js';
import {
  QUIZ_MAX_STANDALONE_PROFICIENCY,
  calculateQuizProficiency,
  applyQuizEvidenceUpdate,
  sanitizeAssessedSkillsList,
} from '../src/services/quizScoringPolicy.js';
import { resolveUserQuizEligibility } from '../src/services/quizEligibility.service.js';
import {
  startQuizSchema,
  submitQuizSchema,
} from '../src/validators/quiz.validator.js';
import {
  getQuizSkills,
  startQuiz,
  submitQuiz,
  setDbForTesting,
} from '../src/controllers/quiz.controller.js';
import { CAREER_BENCHMARKS } from '../src/data/careerBenchmarks.js';
import { getQuestionsForCareer } from '../src/data/diagnosticQuestions.js';

// --- In-memory mock Firestore DB ---
function createMockDb(initialData = {}) {
  const store = {
    users: new Map(),
    quizzes: new Map(),
    careers: new Map(),
  };

  for (const [col, docs] of Object.entries(initialData)) {
    if (store[col]) {
      for (const [id, data] of docs) {
        store[col].set(id, { ...data });
      }
    }
  }

  const makeDocRef = (colName, docId) => ({
    id: docId,
    async get() {
      const data = store[colName].get(docId);
      return {
        id: docId,
        exists: Boolean(data),
        data: () => (data ? { ...data } : undefined),
      };
    },
    async set(data) {
      // Validate no undefined values
      validateNoUndefined(data, colName);
      store[colName].set(docId, { ...data });
      return { id: docId };
    },
    async update(data) {
      // Validate no undefined values
      validateNoUndefined(data, colName);
      const existing = store[colName].get(docId) || {};
      store[colName].set(docId, { ...existing, ...data });
      return { id: docId };
    },
  });

  function validateNoUndefined(obj, context) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, val] of Object.entries(obj)) {
      if (val === undefined) {
        throw new Error(`Cannot use "undefined" as a Firestore value (found in field "${key}" under ${context})`);
      }
      if (Array.isArray(val)) {
        val.forEach((item, idx) => {
          if (item && typeof item === 'object') {
            for (const [k, v] of Object.entries(item)) {
              if (v === undefined) {
                throw new Error(`Cannot use "undefined" as a Firestore value (found in field "${key}.${idx}.${k}")`);
              }
            }
          }
        });
      }
    }
  }

  return {
    collection(colName) {
      return {
        doc(docId) {
          return makeDocRef(colName, docId);
        },
        where(field, op, val) {
          return {
            where(f2, op2, v2) {
              const runChained = (limitCount) => {
                const all = Array.from(store[colName]?.entries() || []);
                let matches = all.filter(([id, d]) => d[field] === val && d[f2] === v2);
                if (typeof limitCount === 'number') matches = matches.slice(0, limitCount);
                const docs = matches.map(([id, d]) => ({
                  id,
                  data: () => ({ ...d }),
                }));
                return {
                  empty: docs.length === 0,
                  docs,
                  forEach(cb) {
                    docs.forEach(cb);
                  },
                };
              };
              return {
                limit(n) {
                  return {
                    async get() {
                      return runChained(n);
                    },
                  };
                },
                async get() {
                  return runChained();
                },
              };
            },
            limit(n) {
              return {
                async get() {
                  const all = Array.from(store[colName]?.entries() || []);
                  const matches = all
                    .filter(([id, d]) => d[field] === val)
                    .slice(0, n)
                    .map(([id, d]) => ({
                      id,
                      data: () => ({ ...d }),
                    }));
                  return {
                    empty: matches.length === 0,
                    docs: matches,
                    forEach(cb) {
                      matches.forEach(cb);
                    },
                  };
                },
              };
            },
            async get() {
              const all = Array.from(store[colName]?.entries() || []);
              const matches = all
                .filter(([id, d]) => d[field] === val)
                .map(([id, d]) => ({
                  id,
                  data: () => ({ ...d }),
                }));
              return {
                empty: matches.length === 0,
                docs: matches,
                forEach(cb) {
                  matches.forEach(cb);
                },
              };
            },
          };
        },
      };
    },
    async runTransaction(updateFunction) {
      const transaction = {
        async get(docRef) {
          return docRef.get();
        },
        update(docRef, data) {
          return docRef.update(data);
        },
        set(docRef, data) {
          return docRef.set(data);
        },
      };
      return updateFunction(transaction);
    },
    _store: store,
  };
}

// =========================================================================
// 1. Personalized Quiz Eligibility Rules
// =========================================================================

test('Eligibility - Returns ALL positive gap skills in selected career (including absent from resume)', async () => {
  const mockDb = createMockDb({
    users: [
      [
        'user_frontend',
        {
          selectedCareerId: 'frontend-developer',
          // User resume only demonstrates React (40) and Tailwind CSS (50)
          extractedSkills: [
            { name: 'React', level: 40, source: 'resume-inferred', confidence: 'high' },
            { name: 'Tailwind CSS', level: 50, source: 'resume-inferred', confidence: 'high' },
            // Extra non-benchmark skill in resume
            { name: 'Photoshop', level: 90, source: 'resume-inferred', confidence: 'high' },
          ],
          assessedSkills: [],
        },
      ],
    ],
  });

  const eligibility = await resolveUserQuizEligibility(mockDb, 'user_frontend');

  assert.equal(eligibility.careerId, 'frontend-developer');
  assert.equal(eligibility.careerName, 'Frontend Developer');

  // ALL 5 benchmark skills have positive gaps (> 0) and MUST be eligible for practice quizzes!
  assert.equal(eligibility.eligibleSkills.length, 5);
  const eligibleNames = eligibility.eligibleSkills.map((s) => s.skillName);
  assert.ok(eligibleNames.includes('React'));
  assert.ok(eligibleNames.includes('Tailwind CSS'));
  assert.ok(eligibleNames.includes('TypeScript'));
  assert.ok(eligibleNames.includes('Web Vitals'));
  assert.ok(eligibleNames.includes('UI/UX'));

  // Skills absent from resume have proficiency labeled "Not yet assessed"
  const tsSkill = eligibility.eligibleSkills.find((s) => s.skillName === 'TypeScript');
  assert.ok(tsSkill);
  assert.equal(tsSkill.hasEvidence, false);
  assert.equal(tsSkill.currentLevel, null);
  assert.equal(tsSkill.proficiencyDisplay, 'Not yet assessed');
  assert.equal(tsSkill.gap, 80);
  assert.equal(tsSkill.learningStatus, 'Learning recommended');

  const webVitalsSkill = eligibility.eligibleSkills.find((s) => s.skillName === 'Web Vitals');
  assert.ok(webVitalsSkill);
  assert.equal(webVitalsSkill.proficiencyDisplay, 'Not yet assessed');

  // Skills present in resume show their current level
  const reactSkill = eligibility.eligibleSkills.find((s) => s.skillName === 'React');
  assert.ok(reactSkill);
  assert.equal(reactSkill.hasEvidence, true);
  assert.equal(reactSkill.currentLevel, 40);
  assert.equal(reactSkill.proficiencyDisplay, '40 / 80 pts');

  // Non-benchmark skills like Photoshop or Docker must be completely absent from eligible
  assert.equal(eligibleNames.includes('Photoshop'), false);
  assert.equal(eligibleNames.includes('Docker'), false);
});

test('Eligibility - Benchmark met skills (gap <= 0) are excluded from practice', async () => {
  const mockDb = createMockDb({
    users: [
      [
        'user_mastered',
        {
          selectedCareerId: 'frontend-developer',
          assessedSkills: [
            // Verified React at 85 (target is 80) -> gap is 0
            { name: 'React', level: 85, source: 'assessment-verified', assessmentId: 'assess_123' },
            // Verified TypeScript at 45 (target 80) -> gap is 35
            { name: 'TypeScript', level: 45, source: 'assessment-verified', assessmentId: 'assess_123' },
          ],
        },
      ],
    ],
  });

  const eligibility = await resolveUserQuizEligibility(mockDb, 'user_mastered');

  // React benchmark target is achieved -> not in eligibleSkills
  const eligibleNames = eligibility.eligibleSkills.map((s) => s.skillName);
  assert.ok(eligibleNames.includes('TypeScript'));
  assert.equal(eligibleNames.includes('React'), false);

  // React is listed under benchmarkMetSkills
  assert.equal(eligibility.benchmarkMetSkills.length, 1);
  assert.equal(eligibility.benchmarkMetSkills[0].skillName, 'React');
});

test('Eligibility - Empty states for unconfigured career and all gaps resolved', async () => {
  // Case A: No career selected
  const mockDbA = createMockDb({
    users: [['user_no_career', {}]],
  });
  const resA = await resolveUserQuizEligibility(mockDbA, 'user_no_career');
  assert.equal(resA.emptyReason, 'NO_CAREER_SELECTED');
  assert.equal(resA.eligibleSkills.length, 0);

  // Case B: All benchmark skills achieved target level
  const mockDbB = createMockDb({
    users: [
      [
        'user_all_mastered',
        {
          selectedCareerId: 'frontend-developer',
          assessedSkills: [
            { name: 'React', level: 85, source: 'assessment-verified', assessmentId: 'assess_1' },
            { name: 'Tailwind CSS', level: 80, source: 'assessment-verified', assessmentId: 'assess_2' },
            { name: 'TypeScript', level: 90, source: 'assessment-verified', assessmentId: 'assess_3' },
            { name: 'Web Vitals', level: 85, source: 'assessment-verified', assessmentId: 'assess_4' },
            { name: 'UI/UX', level: 80, source: 'assessment-verified', assessmentId: 'assess_5' },
          ],
        },
      ],
    ],
  });
  const resB = await resolveUserQuizEligibility(mockDbB, 'user_all_mastered');
  assert.equal(resB.emptyReason, 'ALL_GAPS_RESOLVED');
  assert.equal(resB.eligibleSkills.length, 0);
  assert.equal(resB.benchmarkMetSkills.length, 5);
});

// =========================================================================
// 2. Controller Security & Eligibility Enforcement
// =========================================================================

test('Controller - Rejects starting quiz for unrelated or benchmark-met skills, allows positive gaps', async () => {
  const mockDb = createMockDb({
    users: [
      [
        'user_fe_student',
        {
          selectedCareerId: 'frontend-developer',
          // Only React is demonstrated in resume, Tailwind CSS is benchmark met
          extractedSkills: [
            { name: 'React', level: 45, source: 'resume-inferred', confidence: 'high' },
          ],
          assessedSkills: [
            { name: 'Tailwind CSS', level: 85, source: 'assessment-verified', assessmentId: 'assess_tw' },
          ],
        },
      ],
    ],
  });
  setDbForTesting(mockDb);

  // Attempt 1: Start unrelated skill outside career benchmark (e.g. Docker) -> 403 SKILL_NOT_ELIGIBLE
  let status1 = 0;
  let error1 = null;
  const res1 = {
    status(c) {
      status1 = c;
      return this;
    },
    json(d) {
      error1 = d;
    },
  };
  await startQuiz(
    { user: { uid: 'user_fe_student' }, body: { skillName: 'Docker' } },
    res1,
    () => {}
  );
  assert.equal(status1, 403);
  assert.equal(error1?.error?.code, 'SKILL_NOT_ELIGIBLE');

  // Attempt 2: Start benchmark-met skill (Tailwind CSS, gap = 0) -> 400 BENCHMARK_TARGET_ACHIEVED
  let status2 = 0;
  let error2 = null;
  const res2 = {
    status(c) {
      status2 = c;
      return this;
    },
    json(d) {
      error2 = d;
    },
  };
  await startQuiz(
    { user: { uid: 'user_fe_student' }, body: { skillName: 'Tailwind CSS' } },
    res2,
    () => {}
  );
  assert.equal(status2, 400);
  assert.equal(error2?.error?.code, 'BENCHMARK_TARGET_ACHIEVED');

  // Attempt 3: Start benchmark skill absent from resume (TypeScript, positive gap) -> Succeeds 201
  let status3 = 0;
  let data3 = null;
  const res3 = {
    status(c) {
      status3 = c;
      return this;
    },
    json(d) {
      data3 = d;
    },
  };
  await startQuiz(
    { user: { uid: 'user_fe_student' }, body: { skillName: 'TypeScript' } },
    res3,
    () => {}
  );
  assert.equal(status3, 201);
  assert.ok(data3?.data?.attemptId);
  assert.equal(data3.data.skillName, 'TypeScript');
  assert.equal(data3.data.questions.length, 5);
  // Answer keys must be hidden before submission
  for (const q of data3.data.questions) {
    assert.equal('correctOption' in q, false);
    assert.equal('explanation' in q, false);
  }

  // Attempt 4: Start eligible skill with resume evidence (React) -> Succeeds 201
  let status4 = 0;
  let data4 = null;
  const res4 = {
    status(c) {
      status4 = c;
      return this;
    },
    json(d) {
      data4 = d;
    },
  };
  await startQuiz(
    { user: { uid: 'user_fe_student' }, body: { skillName: 'React' } },
    res4,
    () => {}
  );
  assert.equal(status4, 201);
  assert.ok(data4?.data?.attemptId);
  assert.equal(data4.data.skillName, 'React');
});

// =========================================================================
// 3. Firestore Undefined Bug Fix & Submission Tests
// =========================================================================

test('Firestore Schema Fix - Submission saves with ZERO undefined values in assessedSkills', async () => {
  const reactQuestions = getSkillQuizQuestions('React');
  const attemptId = 'quiz_test_nofirestore_error';

  const mockDb = createMockDb({
    users: [
      [
        'user_test_submit',
        {
          selectedCareerId: 'frontend-developer',
          extractedSkills: [{ name: 'React', level: 30, source: 'resume-inferred' }],
          // Previously had undefined category bug
          assessedSkills: [],
        },
      ],
    ],
    quizzes: [
      [
        attemptId,
        {
          id: attemptId,
          userId: 'user_test_submit',
          skillName: 'React',
          category: 'Frontend',
          status: 'in_progress',
          questions: reactQuestions,
        },
      ],
    ],
  });
  setDbForTesting(mockDb);

  const answers = reactQuestions.map((q) => ({
    questionId: q.id,
    selectedOption: q.correctOption,
  }));

  let statusCode = 0;
  let jsonResult = null;
  const res = {
    status(c) {
      statusCode = c;
      return this;
    },
    json(d) {
      jsonResult = d;
    },
  };

  // If any undefined value exists, createMockDb throws Firestore error
  await submitQuiz(
    { user: { uid: 'user_test_submit' }, body: { attemptId, answers } },
    res,
    () => {}
  );

  assert.equal(statusCode, 200);
  assert.equal(jsonResult.data.overallScore, 100);

  // Check user doc in mockDb
  const updatedUser = mockDb._store.users.get('user_test_submit');
  assert.ok(updatedUser);
  assert.equal(updatedUser.assessedSkills.length, 1);
  const savedSkill = updatedUser.assessedSkills[0];
  assert.equal('category' in savedSkill, true);
  assert.equal(savedSkill.category, 'Frontend');
  assert.notEqual(savedSkill.category, undefined);

  // Practice evidence must be stamped 'practice-checkpoint' (not 'assessment-verified')
  assert.equal(savedSkill.source, 'practice-checkpoint');
  assert.notEqual(savedSkill.source, 'assessment-verified');

  // Practice stats must also be tracked
  assert.ok(updatedUser.practiceQuizStats?.react);
  assert.equal(updatedUser.practiceQuizStats.react.latestScore, 100);
  assert.equal(updatedUser.practiceQuizStats.react.passed, true);
});

// =========================================================================
// 4. Diagnostic Assessment Protection
// =========================================================================

test('Scoring Policy - Practice quiz NEVER overwrites Phase 7 diagnostic assessment records', () => {
  const existingAssessed = [
    {
      name: 'React',
      level: 70,
      source: 'assessment-verified',
      assessmentId: 'assess_diag_fullstack_01',
      assessedAt: '2026-10-01T00:00:00.000Z',
      category: 'Frontend',
    },
  ];

  // Even if user gets 100% on practice quiz
  const result = applyQuizEvidenceUpdate(existingAssessed, {
    skillName: 'React',
    totalCorrect: 5,
    totalQuestions: 5,
    attemptId: 'quiz_practice_001',
    category: 'Frontend',
  });

  // Diagnostic record remains authoritative and untouched
  assert.equal(result.updatedAssessedSkills.length, 1);
  const react = result.updatedAssessedSkills[0];
  assert.equal(react.level, 70);
  assert.equal(react.assessmentId, 'assess_diag_fullstack_01');
  assert.equal(result.preservedExisting, true);
});

test('Sanitizer - sanitizeAssessedSkillsList purges any undefined keys from all items', () => {
  const malformed = [
    { name: 'React', level: 50, category: undefined, source: undefined },
    { name: 'SQL', level: 80, category: 'Database', source: 'assessment-verified' },
    null,
    { invalid: true },
  ];

  const clean = sanitizeAssessedSkillsList(malformed);
  assert.equal(clean.length, 2);
  assert.equal('category' in clean[0], false);
  assert.equal(clean[0].source, 'practice-checkpoint');
  assert.equal(clean[1].source, 'assessment-verified');
  assert.equal(clean[1].category, 'Database');
});

// =========================================================================
// 5. Phase 7 Diagnostic Regression Check
// =========================================================================

test('Regression Check - Diagnostic questions remain intact for all 5 careers', () => {
  for (const cid of Object.keys(CAREER_BENCHMARKS)) {
    const qList = getQuestionsForCareer(cid);
    assert.equal(qList.length, 15);
  }
});

// =========================================================================
// 6. Career Switching & Timestamp Normalization Tests
// =========================================================================

test('Career Switching - Switching to Data Analyst prevents starting quiz for previous career skill (React)', async () => {
  const mockDb = createMockDb({
    users: [
      [
        'user_switched_da',
        {
          selectedCareerId: 'data-analyst',
          extractedSkills: [
            { name: 'React', level: 60, source: 'resume-inferred', confidence: 'high' },
          ],
        },
      ],
    ],
  });
  setDbForTesting(mockDb);

  const eligibility = await resolveUserQuizEligibility(mockDb, 'user_switched_da');
  assert.equal(eligibility.careerId, 'data-analyst');
  assert.equal(eligibility.careerName, 'Data Analyst');

  // React is NOT part of Data Analyst benchmark
  const eligibleNames = eligibility.eligibleSkills.map((s) => s.skillName);
  assert.equal(eligibleNames.includes('React'), false);
  assert.ok(eligibleNames.includes('SQL'));
  assert.ok(eligibleNames.includes('Python'));

  // Attempting to start React quiz under Data Analyst MUST return 403 SKILL_NOT_ELIGIBLE
  let status = 0;
  let error = null;
  const res = {
    status(c) {
      status = c;
      return this;
    },
    json(d) {
      error = d;
    },
  };
  await startQuiz(
    { user: { uid: 'user_switched_da' }, body: { skillName: 'React' } },
    res,
    () => {}
  );
  assert.equal(status, 403);
  assert.equal(error?.error?.code, 'SKILL_NOT_ELIGIBLE');
});

test('Timestamp Normalization - Firestore Timestamp objects determine latest attempt and preserve bestScore', async () => {
  // Mock Firestore Timestamp object with .toDate()
  const createFirestoreTimestamp = (isoString) => {
    const d = new Date(isoString);
    return {
      toDate: () => d,
      seconds: Math.floor(d.getTime() / 1000),
      nanoseconds: (d.getTime() % 1000) * 1e6,
    };
  };

  const tsEarlier = createFirestoreTimestamp('2026-10-20T10:00:00.000Z');
  const tsLater = createFirestoreTimestamp('2026-10-21T15:30:00.000Z');

  // Attempt 1: earlier timestamp, higher score (80%)
  // Attempt 2: later timestamp, lower score (40%)
  const mockDb = createMockDb({
    users: [
      ['user_ts_test', { selectedCareerId: 'frontend-developer' }],
    ],
    quizzes: [
      [
        'quiz_att_1_earlier',
        {
          id: 'quiz_att_1_earlier',
          userId: 'user_ts_test',
          skillName: 'React',
          overallScore: 80,
          totalCorrect: 4,
          totalQuestions: 5,
          passed: true,
          status: 'completed',
          completedAt: tsEarlier,
        },
      ],
      [
        'quiz_att_2_later',
        {
          id: 'quiz_att_2_later',
          userId: 'user_ts_test',
          skillName: 'React',
          overallScore: 40,
          totalCorrect: 2,
          totalQuestions: 5,
          passed: false,
          status: 'completed',
          completedAt: tsLater,
        },
      ],
    ],
  });

  const eligibility = await resolveUserQuizEligibility(mockDb, 'user_ts_test');
  const reactSkill = eligibility.eligibleSkills.find((s) => s.skillName === 'React');
  assert.ok(reactSkill);
  assert.ok(reactSkill.practiceStats);

  // Latest attempt is determined by timestamp (Attempt 2: 40%)
  assert.equal(reactSkill.practiceStats.latestScore, 40);
  assert.equal(reactSkill.practiceStats.latestCorrect, 2);
  assert.equal(reactSkill.practiceStats.passed, false);
  assert.equal(reactSkill.practiceStats.lastAttemptId, 'quiz_att_2_later');
  assert.equal(reactSkill.practiceStats.lastAttemptAt, '2026-10-21T15:30:00.000Z');

  // Best score remains highest recorded score (Attempt 1: 80%)
  assert.equal(reactSkill.practiceStats.bestScore, 80);

  // Total attempts count is 2
  assert.equal(reactSkill.practiceStats.attemptsCount, 2);
});

test('Timestamp Normalization - Raw serialized timestamps, JS Date, ISO string, missing dates, and equal tie-breakers', async () => {
  const rawTimestamp = { _seconds: 1729500000, _nanoseconds: 0 }; // ~2024-10-21
  const jsDate = new Date('2026-10-22T08:00:00.000Z');
  const isoString = '2026-10-22T12:00:00.000Z';

  const mockDb = createMockDb({
    users: [
      ['user_ts_edge', { selectedCareerId: 'data-analyst' }],
    ],
    quizzes: [
      // SQL attempt 1: raw serialized object
      [
        'q_sql_raw',
        {
          id: 'q_sql_raw',
          userId: 'user_ts_edge',
          skillName: 'SQL',
          overallScore: 60,
          status: 'completed',
          completedAt: rawTimestamp,
        },
      ],
      // SQL attempt 2: JS Date instance
      [
        'q_sql_date',
        {
          id: 'q_sql_date',
          userId: 'user_ts_edge',
          skillName: 'SQL',
          overallScore: 100,
          status: 'completed',
          completedAt: jsDate,
        },
      ],
      // SQL attempt 3: ISO String (latest)
      [
        'q_sql_iso',
        {
          id: 'q_sql_iso',
          userId: 'user_ts_edge',
          skillName: 'SQL',
          overallScore: 80,
          status: 'completed',
          completedAt: isoString,
        },
      ],
      // Python attempt with missing timestamp
      [
        'q_py_missing_time',
        {
          id: 'q_py_missing_time',
          userId: 'user_ts_edge',
          skillName: 'Python',
          overallScore: 70,
          status: 'completed',
          completedAt: null,
        },
      ],
      // Python attempt with identical timestamp tie-breaker
      [
        'q_py_same_time_a',
        {
          id: 'q_py_same_time_a',
          userId: 'user_ts_edge',
          skillName: 'Python',
          overallScore: 50,
          status: 'completed',
          completedAt: '2026-10-22T00:00:00.000Z',
        },
      ],
      [
        'q_py_same_time_b',
        {
          id: 'q_py_same_time_b',
          userId: 'user_ts_edge',
          skillName: 'Python',
          overallScore: 90,
          status: 'completed',
          completedAt: '2026-10-22T00:00:00.000Z',
        },
      ],
    ],
  });

  const eligibility = await resolveUserQuizEligibility(mockDb, 'user_ts_edge');

  // SQL: 3 attempts, latest is ISO string (80%), best is JS Date (100%)
  const sql = eligibility.eligibleSkills.find((s) => s.skillName === 'SQL');
  assert.ok(sql?.practiceStats);
  assert.equal(sql.practiceStats.attemptsCount, 3);
  assert.equal(sql.practiceStats.bestScore, 100);
  assert.equal(sql.practiceStats.latestScore, 80);
  assert.equal(sql.practiceStats.lastAttemptAt, isoString);
  assert.equal(sql.practiceStats.lastAttemptId, 'q_sql_iso');

  // Python: 3 attempts, handles null date gracefully and breaks tie deterministically
  const py = eligibility.eligibleSkills.find((s) => s.skillName === 'Python');
  assert.ok(py?.practiceStats);
  assert.equal(py.practiceStats.attemptsCount, 3);
  assert.equal(py.practiceStats.bestScore, 90);
  assert.equal(py.practiceStats.lastAttemptId, 'q_py_same_time_b');
});
