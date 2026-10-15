import test from 'node:test';
import assert from 'node:assert/strict';
import {
  QUESTION_BANK,
  getQuestionsForCareer,
  sanitizeQuestionsForClient,
  gradeAssessmentSubmission,
} from '../src/data/diagnosticQuestions.js';
import {
  assessmentAnswerItemSchema,
  submitAssessmentSchema,
} from '../src/validators/assessment.validator.js';
import {
  startAssessment,
  submitAssessment,
  getAssessmentStatus,
  getAssessmentResult,
  setDbForTesting,
} from '../src/controllers/assessment.controller.js';

const CAREERS = [
  'full-stack-developer',
  'frontend-developer',
  'data-analyst',
  'python-developer',
  'ai-ml-engineer',
];

// --- 1. Question Bank Integrity Tests ---

test('Question Bank - Covers all 5 careers with exactly 15 questions each', () => {
  for (const careerId of CAREERS) {
    const questions = getQuestionsForCareer(careerId);
    assert.equal(Array.isArray(questions), true);
    assert.equal(questions.length, 15, `Career ${careerId} must have exactly 15 questions`);

    const skillsCount = new Map();
    const seenIds = new Set();

    for (const q of questions) {
      assert.ok(q.id && typeof q.id === 'string', 'Question must have a non-empty string ID');
      assert.equal(seenIds.has(q.id), false, `Duplicate question ID detected: ${q.id}`);
      seenIds.add(q.id);

      assert.equal(q.careerId, careerId);
      assert.ok(q.skill && typeof q.skill === 'string', 'Question must specify a skill');
      assert.ok(q.category && typeof q.category === 'string', 'Question must specify a category');
      assert.ok(q.question && typeof q.question === 'string', 'Question prompt must be a non-empty string');
      assert.equal(Array.isArray(q.options), true, 'Options must be an array');
      assert.equal(q.options.length, 4, 'Each question must have exactly 4 choices');

      // All 4 options must be non-empty distinct strings
      const distinctOptions = new Set(q.options);
      assert.equal(distinctOptions.size, 4, `Question ${q.id} has duplicate choices`);
      for (const opt of q.options) {
        assert.ok(opt && typeof opt === 'string' && opt.trim().length > 0);
      }

      assert.equal(typeof q.correctOption, 'number', 'correctOption must be a number');
      assert.ok(Number.isInteger(q.correctOption), 'correctOption must be an integer');
      assert.ok(q.correctOption >= 0 && q.correctOption <= 3, 'correctOption must be 0, 1, 2, or 3');

      assert.ok(q.explanation && typeof q.explanation === 'string' && q.explanation.trim().length > 10,
        `Question ${q.id} must have a detailed explanation`
      );

      skillsCount.set(q.skill, (skillsCount.get(q.skill) || 0) + 1);
    }

    // Exactly 5 benchmark skills with 3 questions each
    assert.equal(skillsCount.size, 5, `Career ${careerId} must have exactly 5 benchmark skills`);
    for (const [skill, count] of skillsCount.entries()) {
      assert.equal(count, 3, `Skill "${skill}" in ${careerId} must have exactly 3 questions`);
    }
  }
});

test('Question Bank - Rejects unknown or invalid career IDs', () => {
  assert.throws(() => getQuestionsForCareer('non-existent-career'), /No diagnostic questions configured/);
  assert.throws(() => getQuestionsForCareer(''), /careerId is required/);
  assert.throws(() => getQuestionsForCareer(null), /careerId is required/);
});

// --- 2. Answer Key Stripping Tests ---

test('Answer Key Stripping - Never exposes correctOption or explanation in client payload', () => {
  for (const careerId of CAREERS) {
    const rawQuestions = getQuestionsForCareer(careerId);
    const sanitized = sanitizeQuestionsForClient(rawQuestions);

    assert.equal(sanitized.length, 15);

    for (let i = 0; i < sanitized.length; i++) {
      const s = sanitized[i];
      const r = rawQuestions[i];

      assert.equal(s.id, r.id);
      assert.equal(s.careerId, r.careerId);
      assert.equal(s.skill, r.skill);
      assert.equal(s.category, r.category);
      assert.equal(s.question, r.question);
      assert.deepEqual(s.options, r.options);

      // SECURITY CRITICAL: Must be completely stripped
      assert.equal('correctOption' in s, false, `Security leak: correctOption exposed in question ${s.id}`);
      assert.equal('explanation' in s, false, `Security leak: explanation exposed in question ${s.id}`);
    }
  }
});

// --- 3. Server-Side Grading Engine Tests ---

test('Grading Engine - 100% correct answers produces overall score 100 and per-skill 100', () => {
  const careerId = 'full-stack-developer';
  const questions = getQuestionsForCareer(careerId);
  const answers = questions.map((q) => ({
    questionId: q.id,
    selectedOption: q.correctOption,
  }));

  const result = gradeAssessmentSubmission(careerId, answers);

  assert.equal(result.overallScore, 100);
  assert.equal(result.totalCorrect, 15);
  assert.equal(result.totalQuestions, 15);
  assert.equal(result.skillScores.length, 5);

  for (const skill of result.skillScores) {
    assert.equal(skill.questionsTotal, 3);
    assert.equal(skill.questionsCorrect, 3);
    assert.equal(skill.score, 100);
    assert.equal(skill.level, 100);
    assert.equal(skill.source, 'assessment-verified');
  }

  assert.equal(result.questionResponses.length, 15);
  for (const resp of result.questionResponses) {
    assert.equal(resp.isCorrect, true);
    assert.ok(resp.explanation && resp.explanation.length > 0);
  }
});

test('Grading Engine - 0% correct answers produces overall score 0 and per-skill 0', () => {
  const careerId = 'full-stack-developer';
  const questions = getQuestionsForCareer(careerId);
  // Pick incorrect options
  const answers = questions.map((q) => ({
    questionId: q.id,
    selectedOption: (q.correctOption + 1) % 4,
  }));

  const result = gradeAssessmentSubmission(careerId, answers);

  assert.equal(result.overallScore, 0);
  assert.equal(result.totalCorrect, 0);
  assert.equal(result.totalQuestions, 15);

  for (const skill of result.skillScores) {
    assert.equal(skill.questionsTotal, 3);
    assert.equal(skill.questionsCorrect, 0);
    assert.equal(skill.score, 0);
    assert.equal(skill.level, 0);
    assert.equal(skill.source, 'assessment-verified');
  }

  for (const resp of result.questionResponses) {
    assert.equal(resp.isCorrect, false);
  }
});

test('Grading Engine - Correct integer rounding per documented scoring rules', () => {
  const careerId = 'frontend-developer';
  const questions = getQuestionsForCareer(careerId);

  // Group questions by skill
  const bySkill = new Map();
  for (const q of questions) {
    if (!bySkill.has(q.skill)) bySkill.set(q.skill, []);
    bySkill.get(q.skill).push(q);
  }

  const skills = Array.from(bySkill.keys());
  // Skill 0 (TypeScript): 3 of 3 correct -> 100
  // Skill 1 (React): 2 of 3 correct -> round(2/3 * 100) = 67
  // Skill 2 (Tailwind CSS): 1 of 3 correct -> round(1/3 * 100) = 33
  // Skill 3 (Web Vitals): 2 of 3 correct -> round(2/3 * 100) = 67
  // Skill 4 (UI/UX): 3 of 3 correct -> 100
  // Total correct: 3 + 2 + 1 + 2 + 3 = 11 / 15 -> round(11/15 * 100) = 73

  const answers = [];
  const correctCounts = [3, 2, 1, 2, 3];

  skills.forEach((skillName, idx) => {
    const qList = bySkill.get(skillName);
    const count = correctCounts[idx];
    qList.forEach((q, qIdx) => {
      if (qIdx < count) {
        answers.push({ questionId: q.id, selectedOption: q.correctOption });
      } else {
        answers.push({ questionId: q.id, selectedOption: (q.correctOption + 1) % 4 });
      }
    });
  });

  const result = gradeAssessmentSubmission(careerId, answers);

  assert.equal(result.totalCorrect, 11);
  assert.equal(result.overallScore, 73); // round(11/15 * 100) = round(73.333...) = 73

  const tsSkill = result.skillScores.find((s) => s.name === skills[0]);
  assert.equal(tsSkill.score, 100);

  const reactSkill = result.skillScores.find((s) => s.name === skills[1]);
  assert.equal(reactSkill.score, 67); // round(2/3 * 100) = 67

  const tailwindSkill = result.skillScores.find((s) => s.name === skills[2]);
  assert.equal(tailwindSkill.score, 33); // round(1/3 * 100) = 33
});

// --- 4. Zod Validation Tests ---

test('Validator - Rejects invalid answer payloads', () => {
  // Missing assessmentId
  const r1 = submitAssessmentSchema.safeParse({
    answers: [{ questionId: 'q1', selectedOption: 1 }],
  });
  assert.equal(r1.success, false);

  // Empty assessmentId
  const r2 = submitAssessmentSchema.safeParse({
    assessmentId: '   ',
    answers: [{ questionId: 'q1', selectedOption: 1 }],
  });
  assert.equal(r2.success, false);

  // Empty answers array
  const r3 = submitAssessmentSchema.safeParse({
    assessmentId: 'assess_123',
    answers: [],
  });
  assert.equal(r3.success, false);

  // Invalid selectedOption > 3
  const r4 = assessmentAnswerItemSchema.safeParse({
    questionId: 'q1',
    selectedOption: 4,
  });
  assert.equal(r4.success, false);

  // Invalid selectedOption < 0
  const r5 = assessmentAnswerItemSchema.safeParse({
    questionId: 'q1',
    selectedOption: -1,
  });
  assert.equal(r5.success, false);

  // Non-integer selectedOption
  const r6 = assessmentAnswerItemSchema.safeParse({
    questionId: 'q1',
    selectedOption: 1.5,
  });
  assert.equal(r6.success, false);

  // Unknown extra field rejected by strict()
  const r7 = submitAssessmentSchema.safeParse({
    assessmentId: 'assess_123',
    answers: [{ questionId: 'q1', selectedOption: 1 }],
    extraField: 'hacker',
  });
  assert.equal(r7.success, false);
});

// --- 5. Controller Unit Tests with Mock Database ---

function createMockDb(initialState = {}) {
  const store = {
    users: new Map(initialState.users || []),
    careers: new Map(initialState.careers || []),
    assessments: new Map(initialState.assessments || []),
  };

  const db = {
    collection(colName) {
      const colMap = store[colName] || new Map();
      store[colName] = colMap;

      return {
        doc(docId) {
          return {
            id: docId,
            async get() {
              const data = colMap.get(docId);
              return {
                id: docId,
                exists: Boolean(data),
                data: () => (data ? { ...data } : undefined),
              };
            },
            async set(data) {
              colMap.set(docId, { ...data });
            },
            async update(data) {
              const existing = colMap.get(docId) || {};
              colMap.set(docId, { ...existing, ...data });
            },
          };
        },
        where(field, op, val) {
          return {
            where(f2, op2, val2) {
              return {
                limit(n) {
                  return {
                    async get() {
                      const matches = [];
                      for (const [id, data] of colMap.entries()) {
                        if (data[field] === val && data[f2] === val2) {
                          matches.push({
                            id,
                            ref: db.collection(colName).doc(id),
                            data: () => ({ ...data }),
                          });
                          if (matches.length >= n) break;
                        }
                      }
                      return {
                        empty: matches.length === 0,
                        docs: matches,
                      };
                    },
                  };
                },
              };
            },
            limit(n) {
              return {
                async get() {
                  const matches = [];
                  for (const [id, data] of colMap.entries()) {
                    if (data[field] === val) {
                      matches.push({
                        id,
                        ref: db.collection(colName).doc(id),
                        data: () => ({ ...data }),
                      });
                      if (matches.length >= n) break;
                    }
                  }
                  return {
                    empty: matches.length === 0,
                    docs: matches,
                  };
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

  return db;
}

test('Controller - Start Assessment creates session with server-enforced deadline', async () => {
  const mockDb = createMockDb({
    users: [
      ['user_1', { selectedCareerId: 'full-stack-developer' }],
    ],
    careers: [
      ['full-stack-developer', { name: 'Full Stack Developer' }],
    ],
  });

  setDbForTesting(mockDb);

  try {
    const req = { user: { uid: 'user_1' } };
    let statusSent = 0;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
      },
    };

    await startAssessment(req, res, () => {});

    assert.equal(statusSent, 201);
    assert.ok(jsonSent?.data?.assessmentId);
    assert.equal(jsonSent.data.careerId, 'full-stack-developer');
    assert.equal(jsonSent.data.timeLimitSeconds, 600);
    assert.equal(jsonSent.data.questions.length, 15);

    // Verify answers were stripped
    assert.equal('correctOption' in jsonSent.data.questions[0], false);
    assert.equal('explanation' in jsonSent.data.questions[0], false);

    // Verify saved in Firestore
    const saved = mockDb._store.assessments.get(jsonSent.data.assessmentId);
    assert.ok(saved);
    assert.equal(saved.status, 'in_progress');
    assert.equal(saved.userId, 'user_1');
    assert.ok(saved.deadline);
  } finally {
    setDbForTesting(null);
  }
});

test('Controller - Enforces ownership: unauthorized user cannot submit or read', async () => {
  const mockDb = createMockDb({
    assessments: [
      [
        'assess_1',
        {
          id: 'assess_1',
          userId: 'legit_user',
          careerId: 'full-stack-developer',
          status: 'in_progress',
          timeLimitSeconds: 600,
          deadline: new Date(Date.now() + 600000).toISOString(),
        },
      ],
    ],
  });

  setDbForTesting(mockDb);

  try {
    // Malicious caller attempting to submit another user's assessment
    const req = {
      user: { uid: 'attacker_user' },
      body: {
        assessmentId: 'assess_1',
        answers: [{ questionId: 'fs_react_01', selectedOption: 1 }],
      },
    };

    let statusSent = 0;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
      },
    };

    await submitAssessment(req, res, () => {});

    assert.equal(statusSent, 403);
    assert.equal(jsonSent?.error?.code, 'FORBIDDEN');
  } finally {
    setDbForTesting(null);
  }
});

test('Controller - Duplicate submission protection rejects already completed assessments', async () => {
  const mockDb = createMockDb({
    assessments: [
      [
        'assess_done',
        {
          id: 'assess_done',
          userId: 'user_1',
          careerId: 'full-stack-developer',
          status: 'completed',
          overallScore: 80,
        },
      ],
    ],
  });

  setDbForTesting(mockDb);

  try {
    const req = {
      user: { uid: 'user_1' },
      body: {
        assessmentId: 'assess_done',
        answers: [{ questionId: 'fs_react_01', selectedOption: 1 }],
      },
    };

    let statusSent = 0;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
      },
    };

    await submitAssessment(req, res, () => {});

    assert.equal(statusSent, 409);
    assert.equal(jsonSent?.error?.code, 'ALREADY_SUBMITTED');
  } finally {
    setDbForTesting(null);
  }
});

test('Controller - Server-side timer deadline rejects late submissions', async () => {
  // Deadline was 5 minutes ago
  const expiredDeadline = new Date(Date.now() - 300000).toISOString();

  const mockDb = createMockDb({
    assessments: [
      [
        'assess_expired',
        {
          id: 'assess_expired',
          userId: 'user_1',
          careerId: 'full-stack-developer',
          status: 'in_progress',
          deadline: expiredDeadline,
        },
      ],
    ],
  });

  setDbForTesting(mockDb);

  try {
    const req = {
      user: { uid: 'user_1' },
      body: {
        assessmentId: 'assess_expired',
        answers: [{ questionId: 'fs_react_01', selectedOption: 1 }],
      },
    };

    let statusSent = 0;
    let jsonSent = null;
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
      },
    };

    await submitAssessment(req, res, () => {});

    assert.equal(statusSent, 400);
    assert.equal(jsonSent?.error?.code, 'ASSESSMENT_TIMEOUT');
    assert.match(jsonSent?.error?.message, /expired/i);
  } finally {
    setDbForTesting(null);
  }
});

test('Controller - Concurrent submission protection with atomic transaction simulation', async () => {
  let transactionCallCount = 0;
  const mockDb = createMockDb({
    users: [['user_1', {}]],
    assessments: [
      [
        'assess_concurrent',
        {
          id: 'assess_concurrent',
          userId: 'user_1',
          careerId: 'full-stack-developer',
          status: 'in_progress',
          deadline: new Date(Date.now() + 600000).toISOString(),
        },
      ],
    ],
  });

  // Wrap runTransaction to simulate atomic concurrency check
  const originalRunTransaction = mockDb.runTransaction;
  mockDb.runTransaction = async function (updateFn) {
    transactionCallCount++;
    return originalRunTransaction.call(this, updateFn);
  };

  setDbForTesting(mockDb);

  try {
    const questions = getQuestionsForCareer('full-stack-developer');
    const answers = questions.map((q) => ({ questionId: q.id, selectedOption: q.correctOption }));

    const makeReq = () => ({
      user: { uid: 'user_1' },
      body: {
        assessmentId: 'assess_concurrent',
        answers,
      },
    });

    const makeRes = () => {
      const resObj = {
        statusCode: 0,
        body: null,
        status(c) {
          resObj.statusCode = c;
          return resObj;
        },
        json(j) {
          resObj.body = j;
          return resObj;
        },
      };
      return resObj;
    };

    // First submission
    const res1 = makeRes();
    await submitAssessment(makeReq(), res1, () => {});
    assert.equal(res1.statusCode, 200);
    assert.equal(res1.body?.data?.overallScore, 100);

    // Second (concurrent or repeat) submission
    const res2 = makeRes();
    await submitAssessment(makeReq(), res2, () => {});
    assert.equal(res2.statusCode, 409);
    assert.equal(res2.body?.error?.code, 'ALREADY_SUBMITTED');

    assert.equal(transactionCallCount, 2);
  } finally {
    setDbForTesting(null);
  }
});
