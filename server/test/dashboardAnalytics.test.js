import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardAnalytics } from '../src/services/dashboardAnalytics.service.js';
import {
  getDashboardData,
  setDbForTesting,
} from '../src/controllers/dashboard.controller.js';
import { CAREER_BENCHMARKS } from '../src/data/careerBenchmarks.js';

// Helper to construct an in-memory mock Firestore instance
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
      store[colName].set(docId, { ...data });
      return { id: docId };
    },
    async update(data) {
      const existing = store[colName].get(docId) || {};
      store[colName].set(docId, { ...existing, ...data });
      return { id: docId };
    },
  });

  return {
    collection(colName) {
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

test('Dashboard Analytics: throws when userId or db missing', async () => {
  await assert.rejects(
    () => getDashboardAnalytics(null, 'user_1'),
    /Database or userId missing/
  );
  await assert.rejects(
    () => getDashboardAnalytics({}, null),
    /Database or userId missing/
  );
});

test('Dashboard Analytics: throws 404 if user profile does not exist', async () => {
  const db = createMockDb();
  await assert.rejects(
    () => getDashboardAnalytics(db, 'non_existent_user'),
    (err) => err.statusCode === 404 && err.code === 'USER_NOT_FOUND'
  );
});

test('Dashboard Analytics: handles user with no selected career safely', async () => {
  const db = createMockDb({
    users: [
      [
        'user_no_career',
        {
          email: 'nocareer@test.com',
          displayName: 'No Career User',
          selectedCareerId: null,
        },
      ],
    ],
  });

  const res = await getDashboardAnalytics(db, 'user_no_career');
  assert.equal(res.hasCareer, false);
  assert.equal(res.careerId, null);
  assert.equal(res.readinessPercentage, 0);
  assert.equal(res.skillsSummary.totalBenchmarkSkills, 0);
  assert.equal(res.diagnosticAssessment.isCompleted, false);
  assert.equal(res.roadmapProgress.hasRoadmap, false);
  assert.equal(res.roadmapProgress.totalMilestones, 0);
  assert.equal(res.roadmapProgress.completedTopics, 0);
  assert.equal(res.practiceStats.totalAttempts, 0);
  assert.equal(res.nextAction.type, 'SELECT_CAREER');
  assert.equal(res.nextAction.actionUrl, '/career');
});

test('Dashboard Analytics: calculates readiness, skill gaps, and unassessed counts correctly', async () => {
  const db = createMockDb({
    users: [
      [
        'user_fe',
        {
          email: 'frontend@test.com',
          selectedCareerId: 'frontend-developer',
          assessedSkills: [
            // TypeScript at 80 (benchmark met)
            { name: 'TypeScript', category: 'Languages', level: 80, source: 'assessment-verified' },
            // React at 60 (gap of 20)
            { name: 'React', category: 'Frontend', level: 60, source: 'assessment-verified' },
            // Tailwind CSS at 40 (gap of 40)
            { name: 'Tailwind CSS', category: 'Styling', level: 40, source: 'assessment-verified' },
            // Web Vitals & UI/UX not in assessedSkills -> Not yet assessed
          ],
          lastAssessmentId: 'assess_123',
          lastAssessedAt: new Date('2026-03-01T10:00:00Z'),
        },
      ],
    ],
  });

  const analytics = await getDashboardAnalytics(db, 'user_fe');

  assert.equal(analytics.hasCareer, true);
  assert.equal(analytics.careerId, 'frontend-developer');
  assert.equal(analytics.careerName, 'Frontend Developer');

  // Benchmark has 5 skills: TypeScript, React, Tailwind CSS, Web Vitals, UI/UX
  assert.equal(analytics.skillsSummary.totalBenchmarkSkills, 5);
  // TypeScript = 80 -> at benchmark (gap <= 0)
  assert.equal(analytics.skillsSummary.atBenchmarkCount, 1);
  // React (60), Tailwind CSS (40), Web Vitals (0), UI/UX (0) have positive gaps
  assert.equal(analytics.skillsSummary.remainingGapsCount, 4);
  // Web Vitals and UI/UX have no evidence -> not assessed
  assert.equal(analytics.skillsSummary.notAssessedCount, 2);

  // Diagnostic assessment status
  assert.equal(analytics.diagnosticAssessment.isCompleted, true);
  assert.equal(analytics.diagnosticAssessment.lastAssessmentId, 'assess_123');
  assert.equal(analytics.diagnosticAssessment.assessedSkillsCount, 3);
  assert.equal(analytics.diagnosticAssessment.averageDiagnosticScore, 60); // (80 + 60 + 40) / 3 = 60

  // Visual comparison list contains all 5 benchmark skills with targetLevel 80
  assert.equal(analytics.skillGaps.length, 5);
  for (const sk of analytics.skillGaps) {
    assert.equal(sk.requiredLevel, 80);
    assert.equal(typeof sk.gap, 'number');
    assert.ok(['small', 'medium', 'high'].includes(sk.classificationCode));
  }

  // The highest priority gap should have priorityRank 1
  const firstPrio = analytics.skillGaps[0];
  assert.equal(firstPrio.priorityRank, 1);
});

test('Dashboard Analytics: accurately aggregates roadmap milestones and topics progress', async () => {
  const db = createMockDb({
    users: [
      [
        'user_roadmap',
        {
          selectedCareerId: 'frontend-developer',
          roadmap: {
            careerId: 'frontend-developer',
            generatedAt: '2026-03-01T00:00:00Z',
            milestones: [
              {
                order: 1,
                skillName: 'React',
                status: 'completed',
                priority: 'High',
                learningObjective: 'Master advanced React hooks and state',
                topics: [
                  { title: 'Advanced Hooks', completed: true },
                  { title: 'Concurrent Mode', completed: true },
                ],
              },
              {
                order: 2,
                skillName: 'Tailwind CSS',
                status: 'in-progress',
                priority: 'High',
                learningObjective: 'Design production components',
                topics: [
                  { title: 'Responsive Design', completed: true },
                  { title: 'Custom Themes', completed: false },
                  { title: 'Design Tokens', completed: false },
                ],
              },
              {
                order: 3,
                skillName: 'Web Vitals',
                status: 'not-started',
                priority: 'Medium',
                learningObjective: 'Diagnose and optimize LCP, CLS, INP',
                topics: [
                  { title: 'LCP Optimization', completed: false },
                  { title: 'INP Profiling', completed: false },
                ],
              },
            ],
          },
        },
      ],
    ],
  });

  const res = await getDashboardAnalytics(db, 'user_roadmap');
  const rm = res.roadmapProgress;

  assert.equal(rm.hasRoadmap, true);
  assert.equal(rm.totalMilestones, 3);
  assert.equal(rm.completedMilestones, 1);
  assert.equal(rm.inProgressMilestones, 1);
  assert.equal(rm.notStartedMilestones, 1);

  // Topics: 2 in m1, 3 in m2, 2 in m3 = 7 total topics
  assert.equal(rm.totalTopics, 7);
  // Completed topics: 2 in m1 + 1 in m2 = 3 completed topics
  assert.equal(rm.completedTopics, 3);
  // topicsCompletionPercentage: round((3/7)*100) = 43%
  assert.equal(rm.topicsCompletionPercentage, 43);

  // Active milestone should be in-progress milestone (Tailwind CSS)
  assert.equal(rm.activeMilestone.order, 2);
  assert.equal(rm.activeMilestone.skillName, 'Tailwind CSS');
  assert.equal(rm.activeMilestone.status, 'in-progress');
});

test('Dashboard Analytics: calculates practice quiz attempts, latest score, and best score accurately', async () => {
  const db = createMockDb({
    users: [
      [
        'user_quizzes',
        {
          selectedCareerId: 'data-analyst',
          practiceQuizStats: {
            totalAttempts: 3,
            bySkill: {
              SQL: {
                attempts: 2,
                latestScore: 50,
                bestScore: 60,
                lastAttemptAt: '2026-03-05T12:00:00Z',
              },
              Python: {
                attempts: 1,
                latestScore: 40,
                bestScore: 40,
                lastAttemptAt: '2026-03-04T12:00:00Z',
              },
            },
          },
        },
      ],
    ],
    quizzes: [
      [
        'q1',
        {
          userId: 'user_quizzes',
          skillName: 'SQL',
          status: 'completed',
          overallScore: 60,
          completedAt: new Date('2026-03-01T10:00:00Z'),
        },
      ],
      [
        'q2',
        {
          userId: 'user_quizzes',
          skillName: 'SQL',
          status: 'completed',
          overallScore: 50,
          completedAt: new Date('2026-03-05T12:00:00Z'),
        },
      ],
      [
        'q3',
        {
          userId: 'user_quizzes',
          skillName: 'Python',
          status: 'completed',
          overallScore: 40,
          completedAt: new Date('2026-03-04T12:00:00Z'),
        },
      ],
    ],
  });

  const res = await getDashboardAnalytics(db, 'user_quizzes');
  const pq = res.practiceStats;

  assert.equal(pq.totalAttempts, 3);
  assert.equal(pq.skillsPracticedCount, 2);
  assert.equal(pq.bestOverallScore, 60);
  assert.equal(pq.averageLatestScore, 45); // (50 + 40) / 2 = 45

  // Check SQL skill stats
  const sqlStats = pq.skillStats.find((s) => s.skillName === 'SQL');
  assert.ok(sqlStats);
  assert.equal(sqlStats.attemptsCount, 2);
  assert.equal(sqlStats.latestScore, 50);
  assert.equal(sqlStats.bestScore, 60);

  // Check Python skill stats
  const pyStats = pq.skillStats.find((s) => s.skillName === 'Python');
  assert.ok(pyStats);
  assert.equal(pyStats.attemptsCount, 1);
  assert.equal(pyStats.latestScore, 40);
  assert.equal(pyStats.bestScore, 40);
});

test('Dashboard Analytics: distinguishes practice-checkpoint from diagnostic assessment', async () => {
  const db = createMockDb({
    users: [
      [
        'user_practice_only',
        {
          selectedCareerId: 'frontend-developer',
          // Only practice evidence, no formal diagnostic assessment completed
          assessedSkills: [
            {
              name: 'React',
              level: 60,
              source: 'practice-checkpoint',
              assessmentId: 'practice_react_1',
            },
          ],
        },
      ],
    ],
  });

  const res = await getDashboardAnalytics(db, 'user_practice_only');
  // Diagnostic is NOT completed because evidence is only from practice checkpoint
  assert.equal(res.diagnosticAssessment.isCompleted, false);
  assert.equal(res.diagnosticAssessment.lastAssessmentId, null);
  // But React still has evidence in skill comparison
  const reactSkill = res.skillGaps.find((s) => s.name === 'React');
  assert.ok(reactSkill);
  assert.equal(reactSkill.currentLevel, 60);
  assert.equal(reactSkill.hasEvidence, true);
  assert.equal(reactSkill.evidenceSource, 'practice-checkpoint');
});

test('Dashboard Analytics: isolates data between distinct users', async () => {
  const db = createMockDb({
    users: [
      [
        'user_alice',
        {
          selectedCareerId: 'frontend-developer',
          assessedSkills: [
            { name: 'React', level: 75, source: 'assessment-verified', assessmentId: 'assess_alice' },
          ],
          lastAssessmentId: 'assess_alice',
        },
      ],
      [
        'user_bob',
        {
          selectedCareerId: 'data-analyst',
          assessedSkills: [
            { name: 'SQL', level: 50, source: 'assessment-verified', assessmentId: 'assess_bob' },
          ],
          lastAssessmentId: 'assess_bob',
        },
      ],
    ],
    quizzes: [
      [
        'q_alice',
        {
          userId: 'user_alice',
          skillName: 'React',
          status: 'completed',
          overallScore: 75,
          completedAt: new Date(),
        },
      ],
      [
        'q_bob',
        {
          userId: 'user_bob',
          skillName: 'SQL',
          status: 'completed',
          overallScore: 90,
          completedAt: new Date(),
        },
      ],
    ],
  });

  const aliceAnalytics = await getDashboardAnalytics(db, 'user_alice');
  const bobAnalytics = await getDashboardAnalytics(db, 'user_bob');

  // Alice is frontend developer
  assert.equal(aliceAnalytics.careerId, 'frontend-developer');
  assert.equal(aliceAnalytics.practiceStats.totalAttempts, 1);
  assert.equal(aliceAnalytics.practiceStats.skillStats[0].skillName, 'React');
  assert.equal(aliceAnalytics.diagnosticAssessment.lastAssessmentId, 'assess_alice');
  assert.ok(aliceAnalytics.skillGaps.every((s) => ['TypeScript', 'React', 'Tailwind CSS', 'Web Vitals', 'UI/UX'].includes(s.name)));

  // Bob is data analyst
  assert.equal(bobAnalytics.careerId, 'data-analyst');
  assert.equal(bobAnalytics.practiceStats.totalAttempts, 1);
  assert.equal(bobAnalytics.practiceStats.skillStats[0].skillName, 'SQL');
  assert.equal(bobAnalytics.diagnosticAssessment.lastAssessmentId, 'assess_bob');
  assert.ok(bobAnalytics.skillGaps.every((s) => ['SQL', 'Python', 'PowerBI', 'Statistics', 'Data Modeling'].includes(s.name)));
});

test('Dashboard Controller: getDashboardData returns 200 with data payload', async () => {
  const db = createMockDb({
    users: [
      [
        'user_ctrl',
        {
          selectedCareerId: 'frontend-developer',
          assessedSkills: [],
        },
      ],
    ],
  });

  setDbForTesting(db);

  const req = {
    user: { uid: 'user_ctrl' },
  };

  let statusCode = null;
  let responseBody = null;

  const res = {
    status(code) {
      statusCode = code;
      return {
        json(body) {
          responseBody = body;
          return body;
        },
      };
    },
  };

  await getDashboardData(req, res, () => {});

  assert.equal(statusCode, 200);
  assert.ok(responseBody.data);
  assert.equal(responseBody.data.hasCareer, true);
  assert.equal(responseBody.data.careerId, 'frontend-developer');

  // Reset test db
  setDbForTesting(undefined);
});

test('Dashboard Controller: handles 404 when user not found', async () => {
  const db = createMockDb({ users: [] });
  setDbForTesting(db);

  const req = {
    user: { uid: 'ghost_user' },
  };

  let statusCode = null;
  let responseBody = null;

  const res = {
    status(code) {
      statusCode = code;
      return {
        json(body) {
          responseBody = body;
          return body;
        },
      };
    },
  };

  await getDashboardData(req, res, () => {});

  assert.equal(statusCode, 404);
  assert.equal(responseBody.error.code, 'USER_NOT_FOUND');

  // Reset test db
  setDbForTesting(undefined);
});
