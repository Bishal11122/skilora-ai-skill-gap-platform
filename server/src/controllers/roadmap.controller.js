import { FieldValue } from 'firebase-admin/firestore';
import { db as defaultDb } from '../config/firebaseAdmin.js';
import { getCareerBenchmark } from '../data/careerBenchmarks.js';
import { calculateSkillGaps } from '../services/skillGapEngine.service.js';
import { buildPersonalizedRoadmap } from '../services/roadmap.service.js';

let activeDb = undefined;

/**
 * Returns active Firestore database instance, with support for test injection.
 * @internal
 */
export function getDb() {
  if (activeDb !== undefined) {
    return activeDb;
  }
  return defaultDb;
}

/**
 * Allows injecting a mock Firestore DB instance for offline unit/integration testing.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * GET /api/roadmap
 * Retrieves the authenticated user's active learning roadmap.
 */
export async function getRoadmap(req, res, next) {
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
          message: 'A target career must be selected before viewing or generating a roadmap.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    const savedRoadmap = userData.roadmap;

    // Check if saved roadmap matches currently selected career
    if (savedRoadmap && savedRoadmap.careerId === selectedCareerId) {
      return res.status(200).json({
        data: {
          roadmap: savedRoadmap,
          hasRoadmap: true,
          canGenerate: false,
        },
      });
    }

    // Check if roadmap for this career was previously saved in roadmapsByCareer
    if (userData.roadmapsByCareer && userData.roadmapsByCareer[selectedCareerId]) {
      const careerRoadmap = userData.roadmapsByCareer[selectedCareerId];
      return res.status(200).json({
        data: {
          roadmap: careerRoadmap,
          hasRoadmap: true,
          canGenerate: false,
        },
      });
    }

    // No roadmap yet, or career was changed
    return res.status(200).json({
      data: {
        roadmap: null,
        hasRoadmap: false,
        canGenerate: true,
        careerId: selectedCareerId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/roadmap/generate
 * Generates (or regenerates) a personalized learning roadmap based on priority skill gaps.
 */
export async function generateRoadmap(req, res, next) {
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
          message: 'A target career must be selected before generating a roadmap.',
          code: 'CAREER_NOT_SELECTED',
        },
      });
    }

    const benchmark = getCareerBenchmark(selectedCareerId);
    if (!benchmark) {
      return res.status(400).json({
        error: {
          message: `No skill benchmark configured for career: ${selectedCareerId}`,
          code: 'CAREER_NOT_SUPPORTED',
        },
      });
    }

    // Resolve career display name
    let careerName = benchmark.name;
    try {
      const careerRef = db.collection('careers').doc(selectedCareerId);
      const careerSnap = await careerRef.get();
      if (careerSnap.exists) {
        careerName = careerSnap.data()?.name || benchmark.name;
      }
    } catch {
      // Non-blocking fallback
    }

    // Calculate real-time skill gaps from user's current evidence
    const assessedSkills = Array.isArray(userData.assessedSkills) ? userData.assessedSkills : [];
    const extractedSkills = Array.isArray(userData.extractedSkills) ? userData.extractedSkills : [];

    const gapResult = calculateSkillGaps({
      benchmarkSkills: benchmark.skills,
      assessedSkills,
      extractedSkills,
    });

    // Build personalized roadmap (Groq AI with seamless deterministic fallback)
    const roadmap = await buildPersonalizedRoadmap({
      careerId: selectedCareerId,
      careerName,
      skillGaps: gapResult.skillGaps,
    });

    // Save to Firestore under user document and persist by career
    const updates = {
      roadmap,
      [`roadmapsByCareer.${selectedCareerId}`]: roadmap,
      roadmapGeneratedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
    };

    await userRef.update(updates);

    return res.status(201).json({
      data: {
        roadmap,
        isNew: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/roadmap/milestones/:order
 * Updates a milestone's completion status or individual subtopic completion.
 */
export async function updateMilestoneStatus(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const order = parseInt(req.params.order, 10);
    if (!Number.isInteger(order) || order < 1 || order > 5) {
      return res.status(400).json({
        error: {
          message: 'Milestone order must be an integer between 1 and 5.',
          code: 'INVALID_MILESTONE_ORDER',
        },
      });
    }

    const { status, topicIndex, topicCompleted } = req.body || {};

    const validStatuses = ['not-started', 'in-progress', 'completed'];
    if (status !== undefined && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: {
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
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
    const roadmap = userData.roadmap;

    if (!roadmap || !Array.isArray(roadmap.milestones)) {
      return res.status(404).json({
        error: { message: 'No active roadmap found for user.', code: 'ROADMAP_NOT_FOUND' },
      });
    }

    const milestoneIdx = roadmap.milestones.findIndex((m) => m.order === order);
    if (milestoneIdx === -1) {
      return res.status(404).json({
        error: { message: `Milestone #${order} not found in roadmap.`, code: 'MILESTONE_NOT_FOUND' },
      });
    }

    const milestone = { ...roadmap.milestones[milestoneIdx] };

    // Update single topic if specified
    if (
      typeof topicIndex === 'number' &&
      Array.isArray(milestone.topics) &&
      topicIndex >= 0 &&
      topicIndex < milestone.topics.length
    ) {
      const isCompleted = typeof topicCompleted === 'boolean' ? topicCompleted : true;
      milestone.topics = milestone.topics.map((t, idx) =>
        idx === topicIndex ? { ...t, completed: isCompleted } : t
      );

      // Automatically sync milestone status based on topics
      const allTopicsDone = milestone.topics.every((t) => t.completed);
      const someTopicsDone = milestone.topics.some((t) => t.completed);

      if (allTopicsDone) {
        milestone.status = 'completed';
      } else if (someTopicsDone) {
        milestone.status = 'in-progress';
      } else {
        milestone.status = 'not-started';
      }
    }

    // Explicit status update
    if (status !== undefined) {
      milestone.status = status;
      if (status === 'completed' && Array.isArray(milestone.topics)) {
        milestone.topics = milestone.topics.map((t) => ({ ...t, completed: true }));
      } else if (status === 'not-started' && Array.isArray(milestone.topics)) {
        milestone.topics = milestone.topics.map((t) => ({ ...t, completed: false }));
      }
    }

    // Replace milestone in array
    const updatedMilestones = [...roadmap.milestones];
    updatedMilestones[milestoneIdx] = milestone;

    // Recalculate summary metrics
    const completedCount = updatedMilestones.filter((m) => m.status === 'completed').length;
    const progressPercentage = Math.round((100 * completedCount) / updatedMilestones.length);

    const updatedRoadmap = {
      ...roadmap,
      summary: {
        ...roadmap.summary,
        completedMilestones: completedCount,
        progressPercentage,
      },
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    };

    const careerKey = roadmap.careerId || userData.selectedCareerId;
    const updates = {
      roadmap: updatedRoadmap,
      updatedAt: FieldValue.serverTimestamp ? FieldValue.serverTimestamp() : new Date().toISOString(),
    };
    if (careerKey) {
      updates[`roadmapsByCareer.${careerKey}`] = updatedRoadmap;
    }

    await userRef.update(updates);

    return res.status(200).json({
      data: {
        roadmap: updatedRoadmap,
      },
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getRoadmap,
  generateRoadmap,
  updateMilestoneStatus,
  getDb,
  setDbForTesting,
};
