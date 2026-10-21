import { db as defaultDb } from '../config/firebaseAdmin.js';
import { getCareerBenchmark } from '../data/careerBenchmarks.js';
import { calculateSkillGaps } from '../services/skillGapEngine.service.js';
import { generateDeterministicRoadmap } from '../services/roadmap.service.js';
import {
  getRoadmapCuratedResources,
  queryCatalogResources,
} from '../services/resource.service.js';
import { getResourcesForSkill } from '../data/learningResources.js';

let activeDb = undefined;

export function getDb() {
  if (activeDb !== undefined) {
    return activeDb;
  }
  return defaultDb;
}

export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * GET /api/resources
 * Retrieves curated learning resources linked to the authenticated user's roadmap milestones,
 * strictly prioritized from highest to lowest skill gap.
 */
export async function getRoadmapResources(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const userRef = db.collection('users').doc(req.user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({
        error: { message: 'User profile not found', code: 'USER_NOT_FOUND' },
      });
    }

    const userData = userSnap.data();
    const selectedCareerId = userData.selectedCareerId;

    if (!selectedCareerId) {
      return res.status(409).json({
        error: {
          message: 'A target career must be selected before accessing learning resources.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    let roadmap = userData.roadmap;

    // If roadmap is absent or career changed, build in-memory prioritized roadmap
    if (!roadmap || roadmap.careerId !== selectedCareerId) {
      const benchmark = getCareerBenchmark(selectedCareerId);
      if (!benchmark) {
        return res.status(400).json({
          error: {
            message: `No skill benchmark configured for career: ${selectedCareerId}`,
            code: 'CAREER_NOT_SUPPORTED',
          },
        });
      }

      const assessedSkills = Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [];
      const extractedSkills = Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [];

      const gapResult = calculateSkillGaps({
        benchmarkSkills: benchmark.skills,
        assessedSkills,
        extractedSkills,
      });

      roadmap = generateDeterministicRoadmap({
        careerId: selectedCareerId,
        careerName: benchmark.name,
        skillGaps: gapResult.skillGaps,
      });
    }

    const { level, type, skill, search } = req.query;
    const result = getRoadmapCuratedResources({
      roadmap,
      filters: { level, type, skill, search },
    });

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/resources/catalog
 * Retrieves resources from the global catalog with optional filters.
 */
export async function getCatalogResources(req, res, next) {
  try {
    const { level, type, skill, search } = req.query;
    const resources = queryCatalogResources({ level, type, skill, search });

    return res.status(200).json({
      data: {
        total: resources.length,
        resources,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/resources/skill/:skillName
 * Retrieves resources for a specific skill by name.
 */
export async function getSkillResources(req, res, next) {
  try {
    const { skillName } = req.params;
    const resources = getResourcesForSkill(skillName);

    return res.status(200).json({
      data: {
        skillName,
        total: resources.length,
        resources,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getRoadmapResources,
  getCatalogResources,
  getSkillResources,
  getDb,
  setDbForTesting,
};
