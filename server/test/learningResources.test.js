import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAllResources,
  getResourcesForSkill,
  validateResource,
  LEARNING_RESOURCES,
  RESOURCE_TYPES,
  DIFFICULTY_LEVELS,
} from '../src/data/learningResources.js';
import {
  getRoadmapCuratedResources,
  queryCatalogResources,
  rankResourcesForMilestone,
} from '../src/services/resource.service.js';
import {
  getRoadmapResources,
  getCatalogResources,
  getSkillResources,
  setDbForTesting,
} from '../src/controllers/resource.controller.js';
import { CAREER_BENCHMARKS } from '../src/data/careerBenchmarks.js';
import { normalizeSkillName } from '../src/services/skillGapEngine.service.js';

// ============================================================================
// 1. Catalog Data Integrity & URL Validation Tests
// ============================================================================

test('Learning Resources - All catalog items have valid, non-empty fields and real HTTPS/HTTP URLs', () => {
  const all = getAllResources();
  assert.ok(all.length >= 30, `Expected at least 30 curated resources, got ${all.length}`);

  for (const item of all) {
    assert.ok(validateResource(item), `Validation failed for resource: ${item.id}`);
    assert.ok(item.id.startsWith('res_'), `ID must start with res_: ${item.id}`);
    assert.ok(item.title.length > 3, `Title too short: ${item.id}`);
    assert.ok(item.provider.length > 2, `Provider missing: ${item.id}`);
    assert.ok(item.description.length > 10, `Description too short: ${item.id}`);
    assert.ok(RESOURCE_TYPES.includes(item.type), `Invalid type ${item.type} for ${item.id}`);
    assert.ok(DIFFICULTY_LEVELS.includes(item.level), `Invalid level ${item.level} for ${item.id}`);
    assert.equal(item.pricing, 'free', `All standard resources must be free: ${item.id}`);

    // Verify valid URL parsing
    let parsedUrl;
    assert.doesNotThrow(() => {
      parsedUrl = new URL(item.url);
    }, `Invalid URL format for ${item.id}: ${item.url}`);
    assert.ok(['http:', 'https:'].includes(parsedUrl.protocol), `Must be http/https for ${item.id}`);
  }
});

test('Learning Resources - 100% coverage for all benchmark skills across all 5 career tracks', () => {
  const careers = Object.keys(CAREER_BENCHMARKS);
  assert.equal(careers.length, 5);

  const missingSkills = [];

  for (const careerId of careers) {
    const career = CAREER_BENCHMARKS[careerId];
    for (const bSkill of career.skills) {
      const resources = getResourcesForSkill(bSkill.name);
      if (resources.length === 0) {
        missingSkills.push(`${careerId} -> ${bSkill.name}`);
      }
    }
  }

  assert.deepEqual(
    missingSkills,
    [],
    `The following benchmark skills lack curated resources: ${missingSkills.join(', ')}`
  );
});

// ============================================================================
// 2. Resource Service Tests
// ============================================================================

test('Resource Service - Connects to roadmap milestones preserving priority order', () => {
  const mockRoadmap = {
    careerId: 'full-stack-developer',
    careerName: 'Full Stack Developer',
    summary: { topPrioritySkill: 'Node.js' },
    milestones: [
      {
        order: 1,
        skillName: 'Node.js',
        priorityRank: 1,
        gapClassification: 'High Gap',
        currentLevel: 10,
        requiredLevel: 80,
        gap: 70,
        learningObjective: 'Master async event loop',
        estimatedDuration: '3-4 weeks',
        status: 'not-started',
      },
      {
        order: 2,
        skillName: 'React',
        priorityRank: 2,
        gapClassification: 'Medium Gap',
        currentLevel: 55,
        requiredLevel: 80,
        gap: 25,
        learningObjective: 'Master hooks and state',
        estimatedDuration: '2 weeks',
        status: 'not-started',
      },
    ],
  };

  const result = getRoadmapCuratedResources({ roadmap: mockRoadmap });

  assert.equal(result.careerId, 'full-stack-developer');
  assert.equal(result.milestonesWithResources.length, 2);

  // Milestone 1 must strictly be first
  assert.equal(result.milestonesWithResources[0].milestoneOrder, 1);
  assert.equal(result.milestonesWithResources[0].skillName, 'Node.js');
  assert.ok(result.milestonesWithResources[0].resources.length > 0);
  assert.equal(result.milestonesWithResources[0].resources[0].milestoneOrder, 1);

  // Milestone 2 must strictly be second
  assert.equal(result.milestonesWithResources[1].milestoneOrder, 2);
  assert.equal(result.milestonesWithResources[1].skillName, 'React');
});

test('Resource Service - Ranks beginner resources first for low scores / high gaps', () => {
  const resources = getResourcesForSkill('React');
  assert.ok(resources.length >= 2);

  const beginnerMilestone = { currentLevel: 15, gap: 65 };
  const rankedBeginner = rankResourcesForMilestone(resources, beginnerMilestone);
  assert.equal(rankedBeginner[0].level, 'beginner');

  const advancedMilestone = { currentLevel: 75, gap: 5 };
  const rankedAdvanced = rankResourcesForMilestone(resources, advancedMilestone);
  const hasIntermediateOrAdvanced = ['intermediate', 'advanced'].includes(rankedAdvanced[0].level);
  assert.ok(hasIntermediateOrAdvanced, 'High scoring student should see intermediate/advanced resource first');
});

test('Resource Service - Filters by level, type, and keyword search', () => {
  // Query all beginner documentation
  const filtered = queryCatalogResources({ level: 'beginner', type: 'documentation' });
  assert.ok(filtered.length > 0);
  for (const item of filtered) {
    assert.equal(item.level, 'beginner');
    assert.equal(item.type, 'documentation');
  }

  // Search by text
  const searchResults = queryCatalogResources({ search: 'event loop' });
  assert.ok(searchResults.length > 0);
  assert.ok(searchResults.some((r) => r.skillKey === 'nodejs'));
});

// ============================================================================
// 3. Controller Tests
// ============================================================================

test('Controller GET /api/resources - Returns 409 if career is not selected', async () => {
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

    const req = { user: { uid: 'user1' }, query: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await getRoadmapResources(req, res, () => {});

    assert.equal(statusCode, 409);
    assert.equal(jsonBody.error.code, 'CAREER_NOT_SELECTED');
  } finally {
    setDbForTesting(undefined);
  }
});

test('Controller GET /api/resources - Returns resources grouped by roadmap milestones', async () => {
  const mockDb = {
    collection: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({
            uid: 'user1',
            selectedCareerId: 'full-stack-developer',
            roadmap: {
              careerId: 'full-stack-developer',
              careerName: 'Full Stack Developer',
              summary: { topPrioritySkill: 'Node.js' },
              milestones: [
                {
                  order: 1,
                  skillName: 'Node.js',
                  priorityRank: 1,
                  gapClassification: 'High Gap',
                  currentLevel: 10,
                  requiredLevel: 80,
                  gap: 70,
                  learningObjective: 'Master async event loop',
                  estimatedDuration: '3-4 weeks',
                  status: 'not-started',
                },
                {
                  order: 2,
                  skillName: 'React',
                  priorityRank: 2,
                  gapClassification: 'Medium Gap',
                  currentLevel: 50,
                  requiredLevel: 80,
                  gap: 30,
                  learningObjective: 'Master components',
                  estimatedDuration: '2 weeks',
                  status: 'not-started',
                },
              ],
            },
          }),
        }),
      }),
    }),
  };

  setDbForTesting(mockDb);

  try {
    let statusCode = 0;
    let jsonBody = null;

    const req = { user: { uid: 'user1' }, query: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (data) => { jsonBody = data; } };
      },
    };

    await getRoadmapResources(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.ok(jsonBody.data);
    assert.equal(jsonBody.data.careerId, 'full-stack-developer');
    assert.ok(jsonBody.data.milestonesWithResources.length >= 2);
    assert.equal(jsonBody.data.milestonesWithResources[0].skillName, 'Node.js');
    assert.ok(jsonBody.data.allRecommendedResources.length > 0);
  } finally {
    setDbForTesting(undefined);
  }
});

test('Controller GET /api/resources/catalog - Returns all global resources with total count', async () => {
  let statusCode = 0;
  let jsonBody = null;

  const req = { query: {} };
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: (data) => { jsonBody = data; } };
    },
  };

  await getCatalogResources(req, res, () => {});

  assert.equal(statusCode, 200);
  assert.ok(jsonBody.data.total >= 30);
  assert.ok(Array.isArray(jsonBody.data.resources));
});

test('Controller GET /api/resources/skill/:skillName - Returns resources for specific skill', async () => {
  let statusCode = 0;
  let jsonBody = null;

  const req = { params: { skillName: 'React' } };
  const res = {
    status: (code) => {
      statusCode = code;
      return { json: (data) => { jsonBody = data; } };
    },
  };

  await getSkillResources(req, res, () => {});

  assert.equal(statusCode, 200);
  assert.equal(jsonBody.data.skillName, 'React');
  assert.ok(jsonBody.data.total >= 2);
});
