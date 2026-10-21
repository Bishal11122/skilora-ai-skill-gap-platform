import {
  getAllResources,
  getResourcesForSkill,
  RESOURCE_TYPES,
  DIFFICULTY_LEVELS,
} from '../data/learningResources.js';
import { normalizeSkillName } from './skillGapEngine.service.js';

/**
 * Ranks resources for a specific milestone according to student's current proficiency:
 * - High gap (score < 35 or not assessed): Beginner > Intermediate > Advanced
 * - Medium gap (score 35 - 64): Intermediate > Beginner > Advanced
 * - Small gap (score >= 65): Advanced > Intermediate > Beginner
 *
 * @param {Array<object>} resources
 * @param {object} milestone
 * @returns {Array<object>}
 */
export function rankResourcesForMilestone(resources, milestone) {
  const currentScore = typeof milestone.currentLevel === 'number' ? milestone.currentLevel : 0;

  const weights = currentScore < 35
    ? { beginner: 3, intermediate: 2, advanced: 1 }
    : currentScore < 65
    ? { intermediate: 3, beginner: 2, advanced: 1 }
    : { advanced: 3, intermediate: 2, beginner: 1 };

  return resources.slice().sort((a, b) => {
    const weightA = weights[a.level] || 0;
    const weightB = weights[b.level] || 0;
    if (weightB !== weightA) return weightB - weightA;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Connects curated learning resources to a user's active learning roadmap.
 * Organizes resources by milestone in strict priority order (Milestone #1 first).
 *
 * @param {object} params
 * @param {object} params.roadmap - User's active roadmap with ordered milestones
 * @param {object} [params.filters] - Optional filters: { level, type, skill, search }
 * @returns {object} Structured resource report
 */
export function getRoadmapCuratedResources({ roadmap, filters = {} }) {
  if (!roadmap || !Array.isArray(roadmap.milestones)) {
    return {
      totalResources: 0,
      milestonesWithResources: [],
      allRecommendedResources: [],
    };
  }

  const { level, type, skill, search } = filters;
  const normSkillFilter = skill ? normalizeSkillName(skill) : null;
  const searchLower = search ? search.trim().toLowerCase() : null;

  const milestonesWithResources = [];
  const allRecommendedResources = [];

  // Iterate over milestones in existing priority order (#1 to #5)
  roadmap.milestones.forEach((milestone) => {
    const normKey = normalizeSkillName(milestone.skillName);

    // If specific skill filter requested, skip non-matching
    if (normSkillFilter && normKey !== normSkillFilter) {
      return;
    }

    let skillResources = getResourcesForSkill(milestone.skillName);

    // Apply level filter if provided
    if (level && DIFFICULTY_LEVELS.includes(level.toLowerCase())) {
      skillResources = skillResources.filter((r) => r.level === level.toLowerCase());
    }

    // Apply type filter if provided
    if (type && RESOURCE_TYPES.includes(type.toLowerCase())) {
      skillResources = skillResources.filter((r) => r.type === type.toLowerCase());
    }

    // Apply search query filter if provided
    if (searchLower) {
      skillResources = skillResources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.provider.toLowerCase().includes(searchLower) ||
          r.topic.toLowerCase().includes(searchLower)
      );
    }

    const ranked = rankResourcesForMilestone(skillResources, milestone);

    const enrichedResources = ranked.map((r) => ({
      ...r,
      milestoneOrder: milestone.order,
      priorityRank: milestone.priorityRank,
      gapClassification: milestone.gapClassification,
      gap: milestone.gap,
    }));

    milestonesWithResources.push({
      milestoneOrder: milestone.order,
      skillName: milestone.skillName,
      priorityRank: milestone.priorityRank,
      gapClassification: milestone.gapClassification,
      currentLevel: milestone.currentLevel,
      requiredLevel: milestone.requiredLevel,
      gap: milestone.gap,
      learningObjective: milestone.learningObjective,
      estimatedDuration: milestone.estimatedDuration,
      status: milestone.status,
      resourceCount: enrichedResources.length,
      resources: enrichedResources,
    });

    allRecommendedResources.push(...enrichedResources);
  });

  return {
    careerId: roadmap.careerId,
    careerName: roadmap.careerName,
    topPrioritySkill: roadmap.summary?.topPrioritySkill || (roadmap.milestones[0]?.skillName ?? ''),
    totalResources: allRecommendedResources.length,
    milestonesWithResources,
    allRecommendedResources,
  };
}

/**
 * Searches and filters the entire global resource catalog.
 *
 * @param {object} [filters]
 * @returns {Array<object>}
 */
export function queryCatalogResources(filters = {}) {
  let list = getAllResources();
  const { level, type, skill, search } = filters;

  if (skill) {
    const key = normalizeSkillName(skill);
    list = list.filter((r) => r.skillKey === key);
  }

  if (level && DIFFICULTY_LEVELS.includes(level.toLowerCase())) {
    list = list.filter((r) => r.level === level.toLowerCase());
  }

  if (type && RESOURCE_TYPES.includes(type.toLowerCase())) {
    list = list.filter((r) => r.type === type.toLowerCase());
  }

  if (search) {
    const s = search.trim().toLowerCase();
    list = list.filter(
      (r) =>
        r.title.toLowerCase().includes(s) ||
        r.description.toLowerCase().includes(s) ||
        r.provider.toLowerCase().includes(s) ||
        r.skillName.toLowerCase().includes(s)
    );
  }

  return list;
}

export default {
  getRoadmapCuratedResources,
  queryCatalogResources,
  rankResourcesForMilestone,
};
