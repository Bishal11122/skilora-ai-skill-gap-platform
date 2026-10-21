import test from 'node:test';
import assert from 'node:assert/strict';
import {
  userProfileSchema,
  accountDeletionSchema,
} from '../src/validators/user.validator.js';
import {
  updateMyProfile,
  updateMyCareer,
  deleteMyAccount,
  setDbForTesting as setUserDbForTesting,
  setAdminAuthForTesting as setUserAuthForTesting,
} from '../src/controllers/user.controller.js';
import {
  getRoadmap,
  updateMilestoneStatus,
  setDbForTesting as setRoadmapDbForTesting,
} from '../src/controllers/roadmap.controller.js';
import { getDashboardAnalytics } from '../src/services/dashboardAnalytics.service.js';
import { setSupabaseClientForTesting } from '../src/services/supabaseStorage.service.js';
import { calculateSkillGaps } from '../src/services/skillGapEngine.service.js';
import { CAREER_BENCHMARKS } from '../src/data/careerBenchmarks.js';
import { applyQuizEvidenceUpdate, QUIZ_MAX_STANDALONE_PROFICIENCY } from '../src/services/quizScoringPolicy.js';

// In-memory mock database factory for isolated test execution
function createMockDb(initialData = {}) {
  const store = {
    users: new Map(),
    resumes: new Map(),
    assessments: new Map(),
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
      store[colName].set(docId, { ...data });
      return { id: docId };
    },
    async update(data) {
      const existing = store[colName].get(docId) || {};
      store[colName].set(docId, { ...existing, ...data });
      return { id: docId };
    },
    async delete() {
      store[colName].delete(docId);
      return { id: docId };
    },
    async listCollections() {
      return [];
    },
  });

  return {
    _store: store,
    collection(colName) {
      if (!store[colName]) {
        store[colName] = new Map();
      }
      return {
        doc(docId) {
          return makeDocRef(colName, docId);
        },
        where(field, op, val) {
          const runWhere = () => {
            const all = Array.from(store[colName]?.entries() || []);
            const matches = all.filter(([id, d]) => d[field] === val);
            const docs = matches.map(([id, d]) => ({
              id,
              ref: makeDocRef(colName, id),
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
            where(f2, op2, v2) {
              const runChained = () => {
                const all = Array.from(store[colName]?.entries() || []);
                const matches = all.filter(([id, d]) => d[field] === val && d[f2] === v2);
                const docs = matches.map(([id, d]) => ({
                  id,
                  ref: makeDocRef(colName, id),
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
                async get() {
                  return runChained();
                },
              };
            },
            async get() {
              return runWhere();
            },
          };
        },
      };
    },
  };
}

// Mock HTTP response builder
function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(payload) {
      res.body = payload;
      return res;
    },
  };
  return res;
}

// ---------------------------------------------------------------------------
// 1. Profile Update Validation and Ownership
// ---------------------------------------------------------------------------

test('Profile Validator - Validates standard display names', () => {
  const validNames = ['Jane Doe', 'Dev Guru', 'A B', 'Alex-Rivera'];
  for (const name of validNames) {
    const res = userProfileSchema.safeParse({ displayName: name });
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.data.displayName, name);
  }
});

test('Profile Validator - Rejects empty, too short, or too long names', () => {
  assert.strictEqual(userProfileSchema.safeParse({ displayName: '' }).success, false);
  assert.strictEqual(userProfileSchema.safeParse({ displayName: ' ' }).success, false);
  assert.strictEqual(userProfileSchema.safeParse({ displayName: 'A' }).success, false);
  assert.strictEqual(userProfileSchema.safeParse({ displayName: 'x'.repeat(61) }).success, false);
});

test('Profile Validator - Strictly rejects foreign fields and client ID manipulation', () => {
  const malformed = {
    displayName: 'Hacker',
    uid: 'attacker-123',
    email: 'hacked@example.com',
    role: 'admin',
  };
  const res = userProfileSchema.safeParse(malformed);
  assert.strictEqual(res.success, false);
  assert.match(res.error.issues[0].message, /Unrecognized key/);
});

test('Profile Controller - Updates profile for authenticated user only', async () => {
  const mockDb = createMockDb({
    users: [
      [
        'user-1',
        {
          uid: 'user-1',
          displayName: 'Old Name',
          email: 'user1@example.com',
          createdAt: new Date(),
        },
      ],
      [
        'user-2',
        {
          uid: 'user-2',
          displayName: 'Target User',
          email: 'user2@example.com',
          createdAt: new Date(),
        },
      ],
    ],
  });

  setUserDbForTesting(mockDb);

  const req = {
    user: { uid: 'user-1' },
    validatedBody: { displayName: 'Updated Name' },
  };
  const res = createMockRes();

  await updateMyProfile(req, res, () => {});

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.data.displayName, 'Updated Name');

  // Verify other user document was NOT touched
  const user2Doc = await mockDb.collection('users').doc('user-2').get();
  assert.strictEqual(user2Doc.data().displayName, 'Target User');
});

// ---------------------------------------------------------------------------
// 2. Progress Persistence Across Reloads and Reconstructed Service State
// ---------------------------------------------------------------------------

test('Progress Persistence - Milestone status and topic checklist persist across calls', async () => {
  const initialRoadmap = {
    careerId: 'full-stack-developer',
    summary: { totalMilestones: 2, completedMilestones: 0, progressPercentage: 0 },
    milestones: [
      {
        order: 1,
        skillName: 'React',
        status: 'not-started',
        topics: [
          { title: 'Hooks', completed: false },
          { title: 'Context', completed: false },
        ],
      },
      {
        order: 2,
        skillName: 'Node.js',
        status: 'not-started',
        topics: [{ title: 'Express', completed: false }],
      },
    ],
  };

  const mockDb = createMockDb({
    users: [
      [
        'learner-100',
        {
          uid: 'learner-100',
          selectedCareerId: 'full-stack-developer',
          roadmap: initialRoadmap,
        },
      ],
    ],
  });

  setRoadmapDbForTesting(mockDb);

  // Step 1: User completes topic 0 of milestone 1
  const req1 = {
    user: { uid: 'learner-100' },
    params: { order: '1' },
    body: { topicIndex: 0, topicCompleted: true },
  };
  const res1 = createMockRes();
  await updateMilestoneStatus(req1, res1, () => {});

  assert.strictEqual(res1.statusCode, 200);
  assert.strictEqual(res1.body.data.roadmap.milestones[0].topics[0].completed, true);
  assert.strictEqual(res1.body.data.roadmap.milestones[0].status, 'in-progress');

  // Step 2: Simulate page refresh / re-login with clean controller getRoadmap call
  const req2 = { user: { uid: 'learner-100' } };
  const res2 = createMockRes();
  await getRoadmap(req2, res2, () => {});

  assert.strictEqual(res2.statusCode, 200);
  const reloaded = res2.body.data.roadmap;
  assert.strictEqual(reloaded.milestones[0].topics[0].completed, true);
  assert.strictEqual(reloaded.milestones[0].status, 'in-progress');

  // Step 3: Complete remaining topic in milestone 1 -> should become 'completed'
  const req3 = {
    user: { uid: 'learner-100' },
    params: { order: '1' },
    body: { topicIndex: 1, topicCompleted: true },
  };
  const res3 = createMockRes();
  await updateMilestoneStatus(req3, res3, () => {});

  assert.strictEqual(res3.body.data.roadmap.milestones[0].status, 'completed');
  assert.strictEqual(res3.body.data.roadmap.summary.completedMilestones, 1);
  assert.strictEqual(res3.body.data.roadmap.summary.progressPercentage, 50);

  // Step 4: Unchecking all topics in milestone 1 transitions back to 'not-started'
  const req4 = {
    user: { uid: 'learner-100' },
    params: { order: '1' },
    body: { topicIndex: 0, topicCompleted: false },
  };
  const res4 = createMockRes();
  await updateMilestoneStatus(req4, res4, () => {});
  const req5 = {
    user: { uid: 'learner-100' },
    params: { order: '1' },
    body: { topicIndex: 1, topicCompleted: false },
  };
  const res5 = createMockRes();
  await updateMilestoneStatus(req5, res5, () => {});

  assert.strictEqual(res5.body.data.roadmap.milestones[0].status, 'not-started');
});

test('Progress Persistence - Reflected accurately in Dashboard analytics', async () => {
  const initialRoadmap = {
    careerId: 'full-stack-developer',
    summary: { totalMilestones: 2, completedMilestones: 1, progressPercentage: 50 },
    milestones: [
      {
        order: 1,
        skillName: 'React',
        status: 'completed',
        topics: [
          { title: 'Hooks', completed: true },
          { title: 'Context', completed: true },
        ],
      },
      {
        order: 2,
        skillName: 'Node.js',
        status: 'in-progress',
        topics: [
          { title: 'Express', completed: true },
          { title: 'Auth', completed: false },
        ],
      },
    ],
  };

  const mockDb = createMockDb({
    users: [
      [
        'learner-dash',
        {
          uid: 'learner-dash',
          selectedCareerId: 'full-stack-developer',
          roadmap: initialRoadmap,
        },
      ],
    ],
    careers: [
      ['full-stack-developer', { name: 'Full Stack Developer', active: true }],
    ],
  });

  const analytics = await getDashboardAnalytics(mockDb, 'learner-dash');
  assert.strictEqual(analytics.roadmapProgress.hasRoadmap, true);
  assert.strictEqual(analytics.roadmapProgress.totalMilestones, 2);
  assert.strictEqual(analytics.roadmapProgress.completedMilestones, 1);
  assert.strictEqual(analytics.roadmapProgress.inProgressMilestones, 1);
  assert.strictEqual(analytics.roadmapProgress.totalTopics, 4);
  assert.strictEqual(analytics.roadmapProgress.completedTopics, 3);
  assert.strictEqual(analytics.roadmapProgress.topicsCompletionPercentage, 75);
});

// ---------------------------------------------------------------------------
// 3. Career Switching Without Historical Data Loss
// ---------------------------------------------------------------------------

test('Career Switching - Preserves historical assessments, quiz attempts, resumes, and roadmap progress', async () => {
  const originalRoadmap = {
    careerId: 'full-stack-developer',
    summary: { totalMilestones: 2, completedMilestones: 1, progressPercentage: 50 },
    milestones: [{ order: 1, skillName: 'React', status: 'completed' }],
  };

  const mockDb = createMockDb({
    users: [
      [
        'career-switcher',
        {
          uid: 'career-switcher',
          selectedCareerId: 'full-stack-developer',
          selectedCareerAt: '2025-01-01T00:00:00Z',
          extractedSkills: [{ skillName: 'JavaScript', level: 60, source: 'resume-inferred' }],
          assessedSkills: [{ skillName: 'React', level: 75, source: 'assessment-verified' }],
          lastAssessmentId: 'assess_123',
          lastAssessedAt: '2025-01-02T00:00:00Z',
          roadmap: originalRoadmap,
          roadmapsByCareer: {
            'full-stack-developer': originalRoadmap,
          },
        },
      ],
    ],
    careers: [
      ['full-stack-developer', { name: 'Full Stack Developer', active: true }],
      ['data-analyst', { name: 'Data Analyst', active: true }],
    ],
    resumes: [
      [
        'career-switcher',
        {
          userId: 'career-switcher',
          storagePath: 'career-switcher/resume.pdf',
          fileName: 'resume.pdf',
        },
      ],
    ],
    assessments: [
      ['assess_123', { userId: 'career-switcher', careerId: 'full-stack-developer', score: 75 }],
    ],
    quizzes: [
      ['quiz_abc', { userId: 'career-switcher', skillName: 'React', overallScore: 60, status: 'completed' }],
    ],
  });

  setUserDbForTesting(mockDb);
  setRoadmapDbForTesting(mockDb);

  // Switch career to Data Analyst
  const req = {
    user: { uid: 'career-switcher' },
    validatedBody: { careerId: 'data-analyst' },
  };
  const res = createMockRes();
  await updateMyCareer(req, res, () => {});

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.data.selectedCareerId, 'data-analyst');

  // Verify historical user data is completely intact in DB
  const userDoc = (await mockDb.collection('users').doc('career-switcher').get()).data();
  assert.strictEqual(userDoc.extractedSkills.length, 1);
  assert.strictEqual(userDoc.assessedSkills.length, 1);
  assert.strictEqual(userDoc.lastAssessmentId, 'assess_123');
  assert.ok(userDoc.roadmapsByCareer['full-stack-developer']);

  // Verify resume, assessments, and quizzes are NOT deleted
  const resumeDoc = await mockDb.collection('resumes').doc('career-switcher').get();
  assert.strictEqual(resumeDoc.exists, true);

  const assessDocs = await mockDb.collection('assessments').where('userId', '==', 'career-switcher').get();
  assert.strictEqual(assessDocs.docs.length, 1);

  const quizDocs = await mockDb.collection('quizzes').where('userId', '==', 'career-switcher').get();
  assert.strictEqual(quizDocs.docs.length, 1);

  // Switch back to Full Stack Developer: Roadmap is restored from roadmapsByCareer!
  const reqSwitchBack = {
    user: { uid: 'career-switcher' },
    validatedBody: { careerId: 'full-stack-developer' },
  };
  const resSwitchBack = createMockRes();
  await updateMyCareer(reqSwitchBack, resSwitchBack, () => {});
  assert.strictEqual(resSwitchBack.body.data.selectedCareerId, 'full-stack-developer');

  const roadmapReq = { user: { uid: 'career-switcher' } };
  const roadmapRes = createMockRes();
  await getRoadmap(roadmapReq, roadmapRes, () => {});
  assert.strictEqual(roadmapRes.statusCode, 200);
  assert.strictEqual(roadmapRes.body.data.hasRoadmap, true);
  assert.strictEqual(roadmapRes.body.data.roadmap.careerId, 'full-stack-developer');
  assert.strictEqual(roadmapRes.body.data.roadmap.milestones[0].status, 'completed');
});

// ---------------------------------------------------------------------------
// 4. Diagnostic Assessment vs Practice Quiz Boundaries
// ---------------------------------------------------------------------------

test('Assessment Boundary - Assessment-verified evidence strictly overrides resume and cannot be degraded by quizzes', () => {
  const benchmark = CAREER_BENCHMARKS['full-stack-developer'];
  assert.ok(benchmark);

  // 1. Skill Gap Engine Precedence: assessment-verified strictly overrides resume-inferred
  const gapResult = calculateSkillGaps({
    benchmarkSkills: benchmark.skills,
    assessedSkills: [
      { name: 'React', level: 75, source: 'assessment-verified', assessedAt: '2025-01-01T00:00:00Z' },
    ],
    extractedSkills: [
      { name: 'React', level: 90, source: 'resume-inferred', confidence: 'high' },
    ],
  });

  const reactGap = gapResult.skillGaps.find((g) => g.name === 'React');
  assert.ok(reactGap);
  assert.strictEqual(reactGap.currentLevel, 75);
  assert.strictEqual(reactGap.evidenceSource, 'assessment-verified');

  // 2. Practice Quiz Ceiling: Standalone quizzes are strictly capped at 60/100
  assert.strictEqual(QUIZ_MAX_STANDALONE_PROFICIENCY, 60);

  // 3. Quiz Evidence Merging: Existing Phase 7 diagnostic evidence (level 75) is NEVER degraded by quizzes
  const existingAssessed = [
    {
      name: 'React',
      level: 75,
      source: 'assessment-verified',
      assessmentId: 'assess_initial_123',
      assessedAt: '2025-01-01T00:00:00Z',
    },
  ];

  const quizResult = applyQuizEvidenceUpdate(existingAssessed, {
    skillName: 'React',
    totalCorrect: 5, // 100% on quiz (demonstrated 60)
    totalQuestions: 5,
    attemptId: 'quiz_attempt_456',
  });

  assert.strictEqual(quizResult.preservedExisting, true);
  assert.strictEqual(quizResult.finalLevel, 75);
  assert.strictEqual(quizResult.updatedAssessedSkills[0].level, 75);
  assert.strictEqual(quizResult.updatedAssessedSkills[0].assessmentId, 'assess_initial_123');
  assert.strictEqual(quizResult.updatedAssessedSkills[0].source, 'assessment-verified');
});

// ---------------------------------------------------------------------------
// 5. Account Deletion Validation, Authorization, and Explicit Confirmation
// ---------------------------------------------------------------------------

test('Account Deletion Validator - Accepts DELETE and DELETE_MY_ACCOUNT', () => {
  assert.strictEqual(accountDeletionSchema.safeParse({ confirmation: 'DELETE' }).success, true);
  assert.strictEqual(accountDeletionSchema.safeParse({ confirmation: 'DELETE_MY_ACCOUNT' }).success, true);
});

test('Account Deletion Validator - Rejects vague, lower-case, or empty confirmation', () => {
  assert.strictEqual(accountDeletionSchema.safeParse({ confirmation: 'delete' }).success, false);
  assert.strictEqual(accountDeletionSchema.safeParse({ confirmation: 'yes' }).success, false);
  assert.strictEqual(accountDeletionSchema.safeParse({ confirmation: '' }).success, false);
  assert.strictEqual(accountDeletionSchema.safeParse({}).success, false);
});

test('Account Deletion Validator - Strictly rejects unknown fields', () => {
  const res = accountDeletionSchema.safeParse({
    confirmation: 'DELETE',
    targetUserId: 'other-user',
  });
  assert.strictEqual(res.success, false);
  assert.match(res.error.issues[0].message, /Unrecognized key/);
});

test('Account Deletion - Enforces recent authentication (rejects stale tokens > 900s)', async () => {
  const mockDb = createMockDb();
  setUserDbForTesting(mockDb);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const staleAuthTime = nowSeconds - 1000; // 1000s ago (> 900s)

  const req = {
    user: { uid: 'user-stale', authTime: staleAuthTime },
    validatedBody: { confirmation: 'DELETE' },
  };
  const res = createMockRes();

  await deleteMyAccount(req, res, () => {});

  assert.strictEqual(res.statusCode, 401);
  assert.strictEqual(res.body.error.code, 'RECENT_AUTH_REQUIRED');
});

// ---------------------------------------------------------------------------
// 6. Cleanup of Owned Firestore Records & Resume Files
// ---------------------------------------------------------------------------

test('Account Deletion - Completely removes user-owned data without touching other users or shared data', async () => {
  let deletedStoragePath = null;
  setSupabaseClientForTesting({
    storage: {
      from: () => ({
        remove: async (paths) => {
          deletedStoragePath = paths[0];
          return { error: null };
        },
      }),
    },
  });

  let deletedAuthUid = null;
  const mockAuth = {
    deleteUser: async (uid) => {
      deletedAuthUid = uid;
    },
  };
  setUserAuthForTesting(mockAuth);

  const mockDb = createMockDb({
    users: [
      ['victim-uid', { uid: 'victim-uid', displayName: 'Victim User' }],
      ['innocent-uid', { uid: 'innocent-uid', displayName: 'Innocent User' }],
    ],
    resumes: [
      ['victim-uid', { userId: 'victim-uid', storagePath: 'victim-uid/my-resume.pdf' }],
      ['innocent-uid', { userId: 'innocent-uid', storagePath: 'innocent-uid/their-resume.pdf' }],
    ],
    assessments: [
      ['assess-1', { userId: 'victim-uid', score: 80 }],
      ['assess-2', { userId: 'victim-uid', score: 70 }],
      ['assess-3', { userId: 'innocent-uid', score: 90 }],
    ],
    quizzes: [
      ['quiz-1', { userId: 'victim-uid', skillName: 'React' }],
      ['quiz-2', { userId: 'victim-uid', skillName: 'Node' }],
      ['quiz-3', { userId: 'innocent-uid', skillName: 'Python' }],
    ],
    careers: [
      ['full-stack-developer', { name: 'Full Stack Developer', active: true }],
    ],
  });

  setUserDbForTesting(mockDb);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const req = {
    user: { uid: 'victim-uid', authTime: nowSeconds - 60 },
    validatedBody: { confirmation: 'DELETE' },
  };
  const res = createMockRes();

  await deleteMyAccount(req, res, () => {});

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.data.deleted.profile, true);
  assert.strictEqual(res.body.data.deleted.resume, true);
  assert.strictEqual(res.body.data.deleted.assessmentsCount, 2);
  assert.strictEqual(res.body.data.deleted.quizzesCount, 2);
  assert.strictEqual(res.body.data.deleted.auth, true);

  // Verify storage deletion occurred for victim's path
  assert.strictEqual(deletedStoragePath, 'victim-uid/my-resume.pdf');
  assert.strictEqual(deletedAuthUid, 'victim-uid');

  // Verify victim is deleted from DB
  const victimUserDoc = await mockDb.collection('users').doc('victim-uid').get();
  assert.strictEqual(victimUserDoc.exists, false);

  const victimResumeDoc = await mockDb.collection('resumes').doc('victim-uid').get();
  assert.strictEqual(victimResumeDoc.exists, false);

  const victimAssessDocs = await mockDb.collection('assessments').where('userId', '==', 'victim-uid').get();
  assert.strictEqual(victimAssessDocs.empty, true);

  const victimQuizDocs = await mockDb.collection('quizzes').where('userId', '==', 'victim-uid').get();
  assert.strictEqual(victimQuizDocs.empty, true);

  // CRITICAL PROTECTION CHECKS: Innocent user data must remain 100% intact!
  const innocentUserDoc = await mockDb.collection('users').doc('innocent-uid').get();
  assert.strictEqual(innocentUserDoc.exists, true);
  assert.strictEqual(innocentUserDoc.data().displayName, 'Innocent User');

  const innocentResumeDoc = await mockDb.collection('resumes').doc('innocent-uid').get();
  assert.strictEqual(innocentResumeDoc.exists, true);

  const innocentAssessDocs = await mockDb.collection('assessments').where('userId', '==', 'innocent-uid').get();
  assert.strictEqual(innocentAssessDocs.docs.length, 1);

  const innocentQuizDocs = await mockDb.collection('quizzes').where('userId', '==', 'innocent-uid').get();
  assert.strictEqual(innocentQuizDocs.docs.length, 1);

  // Shared benchmarks must NEVER be deleted
  const careerBenchmarkDoc = await mockDb.collection('careers').doc('full-stack-developer').get();
  assert.strictEqual(careerBenchmarkDoc.exists, true);
});

// ---------------------------------------------------------------------------
// 7. Partial Deletion Failures and Truthful Error Reporting
// ---------------------------------------------------------------------------

test('Partial Deletion - Reports 207 Multi-Status with detailed errors if storage cleanup fails', async () => {
  // Inject mock Supabase client that returns an error
  setSupabaseClientForTesting({
    storage: {
      from: () => ({
        remove: async () => ({ error: { message: 'Supabase storage gateway timeout' } }),
      }),
    },
  });

  const mockAuth = { deleteUser: async () => {} };
  setUserAuthForTesting(mockAuth);

  const mockDb = createMockDb({
    users: [['user-partial', { uid: 'user-partial' }]],
    resumes: [['user-partial', { userId: 'user-partial', storagePath: 'user-partial/res.pdf' }]],
  });

  setUserDbForTesting(mockDb);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const req = {
    user: { uid: 'user-partial', authTime: nowSeconds - 30 },
    validatedBody: { confirmation: 'DELETE' },
  };
  const res = createMockRes();

  await deleteMyAccount(req, res, () => {});

  assert.strictEqual(res.statusCode, 207);
  assert.strictEqual(res.body.error.code, 'PARTIAL_DELETION_FAILURE');
  assert.strictEqual(res.body.error.details.profileDeleted, true);
  assert.strictEqual(res.body.error.details.storageFileDeleted, false);
  assert.ok(res.body.error.details.errors.some((e) => e.includes('Storage file deletion failed')));
});
