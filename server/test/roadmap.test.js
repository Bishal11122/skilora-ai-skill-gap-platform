import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateDeterministicRoadmap,
  generateRoadmapWithGroq,
  buildPersonalizedRoadmap,
  BENCHMARK_CURRICULUM,
} from '../src/services/roadmap.service.js';
import {
  setGroqClientForTesting,
} from '../src/services/groq.service.js';
import {
  getRoadmap,
  generateRoadmap,
  updateMilestoneStatus,
  setDbForTesting,
} from '../src/controllers/roadmap.controller.js';
import { calculateSkillGaps } from '../src/services/skillGapEngine.service.js';
import { CAREER_BENCHMARKS } from '../src/data/careerBenchmarks.js';

// Sample mock skill gaps in priority order
const sampleSkillGaps = [
  {
    priorityRank: 1,
    name: 'Node.js',
    requiredLevel: 80,
    currentLevel: 20,
    effectiveLevel: 20,
    gap: 60,
    classification: 'High Gap',
    classificationCode: 'high',
    evidenceSource: 'resume-inferred',
  },
  {
    priorityRank: 2,
    name: 'PostgreSQL',
    requiredLevel: 80,
    currentLevel: null,
    effectiveLevel: 0,
    gap: 80,
    classification: 'High Gap',
    classificationCode: 'high',
    evidenceSource: 'none',
  },
  {
    priorityRank: 3,
    name: 'System Design',
    requiredLevel: 80,
    currentLevel: 50,
    effectiveLevel: 50,
    gap: 30,
    classification: 'Medium Gap',
    classificationCode: 'medium',
    evidenceSource: 'assessment-verified',
  },
  {
    priorityRank: 4,
    name: 'React',
    requiredLevel: 80,
    currentLevel: 65,
    effectiveLevel: 65,
    gap: 15,
    classification: 'Medium Gap',
    classificationCode: 'medium',
    evidenceSource: 'resume-inferred',
  },
  {
    priorityRank: 5,
    name: 'REST APIs',
    requiredLevel: 80,
    currentLevel: 75,
    effectiveLevel: 75,
    gap: 5,
    classification: 'Small Gap',
    classificationCode: 'small',
    evidenceSource: 'assessment-verified',
  },
];

test('Deterministic Roadmap - Generates 5 ordered milestones matching priority ranking', () => {
  const result = generateDeterministicRoadmap({
    careerId: 'full-stack-developer',
    careerName: 'Full Stack Developer',
    skillGaps: sampleSkillGaps,
  });

  assert.equal(result.careerId, 'full-stack-developer');
  assert.equal(result.careerName, 'Full Stack Developer');
  assert.equal(result.source, 'deterministic-fallback');
  assert.equal(result.milestones.length, 5);

  // Milestone 1 must strictly be the top priority skill
  assert.equal(result.milestones[0].order, 1);
  assert.equal(result.milestones[0].skillName, 'Node.js');
  assert.equal(result.milestones[0].gap, 60);
  assert.equal(result.milestones[0].gapClassification, 'High Gap');
  assert.equal(result.milestones[0].status, 'not-started');
  assert.ok(result.milestones[0].learningObjective.length > 10);
  assert.ok(result.milestones[0].topics.length >= 3);

  // Milestone 5 must strictly be the lowest priority skill
  assert.equal(result.milestones[4].order, 5);
  assert.equal(result.milestones[4].skillName, 'REST APIs');
  assert.equal(result.milestones[4].gap, 5);

  // Summary checks
  assert.equal(result.summary.totalMilestones, 5);
  assert.equal(result.summary.completedMilestones, 0);
  assert.equal(result.summary.progressPercentage, 0);
  assert.equal(result.summary.topPrioritySkill, 'Node.js');
  assert.ok(result.summary.totalEstimatedWeeks > 0);
});

test('Deterministic Roadmap - Supports all 5 active career tracks', () => {
  const careers = Object.keys(CAREER_BENCHMARKS);
  assert.equal(careers.length, 5);

  for (const careerId of careers) {
    const benchmark = CAREER_BENCHMARKS[careerId];
    const gaps = calculateSkillGaps({ benchmarkSkills: benchmark.skills });

    const roadmap = generateDeterministicRoadmap({
      careerId,
      careerName: benchmark.name,
      skillGaps: gaps.skillGaps,
    });

    assert.equal(roadmap.milestones.length, 5);
    for (let i = 0; i < 5; i++) {
      assert.equal(roadmap.milestones[i].order, i + 1);
      assert.ok(roadmap.milestones[i].skillName);
      assert.ok(roadmap.milestones[i].learningObjective);
      assert.ok(roadmap.milestones[i].topics.length >= 2);
    }
  }
});

test('Groq Roadmap Generator - Generates customized roadmap with valid mock client', async () => {
  const mockGroqResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            milestones: [
              {
                skillName: 'Node.js',
                learningObjective: 'Master asynchronous event loop architecture and high-throughput streams.',
                estimatedDuration: '3-4 weeks',
                topics: [
                  { title: 'Advanced Event Loop', description: 'Deep dive into libuv and phase queues.' },
                  { title: 'Streams & Pipelines', description: 'Transform streams and memory backpressure.' },
                ],
              },
              {
                skillName: 'PostgreSQL',
                learningObjective: 'Design optimized database schemas with index tuning.',
                estimatedDuration: '3 weeks',
                topics: [
                  { title: 'Schema Optimization', description: 'Indexes, query plans, and EXPLAIN ANALYZE.' },
                  { title: 'ACID Transactions', description: 'Row locking and isolation levels.' },
                ],
              },
              {
                skillName: 'System Design',
                learningObjective: 'Design distributed architectures with caching.',
                estimatedDuration: '2 weeks',
                topics: [
                  { title: 'Load Balancing', description: 'Nginx, reverse proxies, and health checks.' },
                  { title: 'Caching Layers', description: 'Redis cache-aside implementation.' },
                ],
              },
              {
                skillName: 'React',
                learningObjective: 'Refine state management and custom hooks.',
                estimatedDuration: '2 weeks',
                topics: [
                  { title: 'Custom Hook Design', description: 'Extracting stateful business logic.' },
                  { title: 'React Performance', description: 'Code splitting and Profiler API.' },
                ],
              },
              {
                skillName: 'REST APIs',
                learningObjective: 'Polish API security and pagination.',
                estimatedDuration: '1 week',
                topics: [
                  { title: 'Security Headers', description: 'CORS, Helmet, and rate limiting.' },
                  { title: 'Pagination Standards', description: 'Cursor vs offset pagination.' },
                ],
              },
            ],
          }),
        },
      },
    ],
  };

  const mockClient = {
    chat: {
      completions: {
        create: async () => mockGroqResponse,
      },
    },
  };

  setGroqClientForTesting(mockClient);

  try {
    const aiRoadmap = await generateRoadmapWithGroq({
      careerId: 'full-stack-developer',
      careerName: 'Full Stack Developer',
      skillGaps: sampleSkillGaps,
    });

    assert.ok(aiRoadmap);
    assert.equal(aiRoadmap.source, 'ai-generated');
    assert.equal(aiRoadmap.milestones.length, 5);
    assert.equal(aiRoadmap.milestones[0].skillName, 'Node.js');
    assert.equal(aiRoadmap.milestones[0].learningObjective, 'Master asynchronous event loop architecture and high-throughput streams.');
    assert.equal(aiRoadmap.milestones[0].gap, 60);
  } finally {
    setGroqClientForTesting(null);
  }
});

test('Master Orchestrator - Falls back seamlessly to deterministic roadmap when Groq fails', async () => {
  const failingMockClient = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('Groq 500 internal server error');
        },
      },
    },
  };

  setGroqClientForTesting(failingMockClient);

  try {
    const roadmap = await buildPersonalizedRoadmap({
      careerId: 'full-stack-developer',
      careerName: 'Full Stack Developer',
      skillGaps: sampleSkillGaps,
    });

    assert.ok(roadmap);
    assert.equal(roadmap.source, 'deterministic-fallback');
    assert.equal(roadmap.milestones.length, 5);
    assert.equal(roadmap.milestones[0].skillName, 'Node.js');
  } finally {
    setGroqClientForTesting(null);
  }
});

// ============================================================================
// Controller Tests
// ============================================================================

test('Controller GET /api/roadmap - Returns 409 if user has not selected a career', async () => {
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({ uid: 'user1', selectedCareerId: null }),
        }),
      }),
    }),
  };

  setDbForTesting(mockDb);

  try {
    let statusCode = 0;
    let jsonBody = null;

    const req = { user: { uid: 'user1' } };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await getRoadmap(req, res, () => {});

    assert.equal(statusCode, 409);
    assert.equal(jsonBody.error.code, 'CAREER_NOT_SELECTED');
  } finally {
    setDbForTesting(undefined);
  }
});

test('Controller GET /api/roadmap - Returns hasRoadmap: false when none exists', async () => {
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({ uid: 'user1', selectedCareerId: 'full-stack-developer', roadmap: null }),
        }),
      }),
    }),
  };

  setDbForTesting(mockDb);

  try {
    let statusCode = 0;
    let jsonBody = null;

    const req = { user: { uid: 'user1' } };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await getRoadmap(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.equal(jsonBody.data.hasRoadmap, false);
    assert.equal(jsonBody.data.canGenerate, true);
  } finally {
    setDbForTesting(undefined);
  }
});

test('Controller POST /api/roadmap/generate - Generates and saves roadmap in Firestore', async () => {
  let savedData = null;

  const mockDb = {
    collection: (col) => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({
            uid: 'user1',
            selectedCareerId: 'full-stack-developer',
            assessedSkills: [{ name: 'React', level: 70, assessedAt: '2026-10-01' }],
            extractedSkills: [{ name: 'Node.js', level: 30, confidence: 'high' }],
          }),
        }),
        update: async (data) => {
          savedData = data;
        },
      }),
    }),
  };

  const fastMockGroq = {
    chat: {
      completions: {
        create: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  milestones: [
                    { skillName: 'PostgreSQL', learningObjective: 'Master SQL schema design.', estimatedDuration: '3 weeks', topics: [{ title: 'Schemas', description: 'Design' }, { title: 'Queries', description: 'SQL' }] },
                    { skillName: 'System Design', learningObjective: 'Master distributed systems.', estimatedDuration: '3 weeks', topics: [{ title: 'Load Balancing', description: 'Nginx' }, { title: 'Caching', description: 'Redis' }] },
                    { skillName: 'REST APIs', learningObjective: 'Master REST endpoints.', estimatedDuration: '2 weeks', topics: [{ title: 'Verbs', description: 'HTTP' }, { title: 'Auth', description: 'JWT' }] },
                    { skillName: 'Node.js', learningObjective: 'Master async backend.', estimatedDuration: '2 weeks', topics: [{ title: 'Event Loop', description: 'libuv' }, { title: 'Express', description: 'Routing' }] },
                    { skillName: 'React', learningObjective: 'Master frontend components.', estimatedDuration: '2 weeks', topics: [{ title: 'Hooks', description: 'State' }, { title: 'Props', description: 'Component' }] },
                  ],
                }),
              },
            },
          ],
        }),
      },
    },
  };

  setGroqClientForTesting(fastMockGroq);
  setDbForTesting(mockDb);

  try {
    let statusCode = 0;
    let jsonBody = null;

    const req = { user: { uid: 'user1' } };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await generateRoadmap(req, res, () => {});

    assert.equal(statusCode, 201);
    assert.ok(jsonBody.data.roadmap);
    assert.equal(jsonBody.data.roadmap.milestones.length, 5);
    assert.ok(savedData);
    assert.ok(savedData.roadmap);
  } finally {
    setGroqClientForTesting(null);
    setDbForTesting(undefined);
  }
});

test('Controller PATCH /api/roadmap/milestones/:order - Updates milestone status and recalculates progress', async () => {
  const initialRoadmap = generateDeterministicRoadmap({
    careerId: 'full-stack-developer',
    careerName: 'Full Stack Developer',
    skillGaps: sampleSkillGaps,
  });

  let savedData = null;

  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({
            uid: 'user1',
            selectedCareerId: 'full-stack-developer',
            roadmap: initialRoadmap,
          }),
        }),
        update: async (data) => {
          savedData = data;
        },
      }),
    }),
  };

  setDbForTesting(mockDb);

  try {
    let statusCode = 0;
    let jsonBody = null;

    const req = {
      user: { uid: 'user1' },
      params: { order: '1' },
      body: { status: 'completed' },
    };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await updateMilestoneStatus(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.equal(jsonBody.data.roadmap.milestones[0].status, 'completed');
    assert.equal(jsonBody.data.roadmap.summary.completedMilestones, 1);
    assert.equal(jsonBody.data.roadmap.summary.progressPercentage, 20); // 1 of 5 = 20%
    assert.ok(savedData);
  } finally {
    setDbForTesting(undefined);
  }
});

test('Controller PATCH /api/roadmap/milestones/:order - Rejects invalid order values', async () => {
  let statusCode = 0;
  let jsonBody = null;

  const req = {
    user: { uid: 'user1' },
    params: { order: '99' },
    body: { status: 'completed' },
  };
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: (data) => { jsonBody = data; } };
    },
  };

  const mockDb = { collection: () => ({ doc: () => ({}) }) };
  setDbForTesting(mockDb);

  try {
    await updateMilestoneStatus(req, res, () => {});
    assert.equal(statusCode, 400);
    assert.equal(jsonBody.error.code, 'INVALID_MILESTONE_ORDER');
  } finally {
    setDbForTesting(undefined);
  }
});
