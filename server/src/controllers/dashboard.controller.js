import { db as defaultDb } from '../config/firebaseAdmin.js';
import { getDashboardAnalytics } from '../services/dashboardAnalytics.service.js';

let activeDb = undefined;

/**
 * Returns active Firestore database instance with support for unit test injection.
 * @internal
 */
export function getDb() {
  if (activeDb !== undefined) {
    return activeDb;
  }
  return defaultDb;
}

/**
 * Injects a mock Firestore DB instance for unit testing.
 * @internal
 */
export function setDbForTesting(mockDb) {
  activeDb = mockDb;
}

/**
 * GET /api/dashboard/analytics
 * Returns comprehensive authenticated dashboard analytics and progress reporting (Phase 12).
 */
export async function getDashboardData(req, res, next) {
  try {
    const db = getDb();
    if (!db) {
      return res.status(503).json({
        error: { message: 'Database service is not configured', code: 'DB_UNAVAILABLE' },
      });
    }

    const analytics = await getDashboardAnalytics(db, req.user.uid);

    return res.status(200).json({
      data: analytics,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: {
          message: error.message,
          code: error.code || 'DASHBOARD_ERROR',
        },
      });
    }
    next(error);
  }
}

export default {
  getDb,
  setDbForTesting,
  getDashboardData,
};
