import { db, isAdminConfigured } from '../config/firebaseAdmin.js';
import { CAREER_BENCHMARKS } from '../data/careerBenchmarks.js';

function getFallbackCareers() {
  return Object.values(CAREER_BENCHMARKS).map((career) => ({
    id: career.id,
    name: career.name,
    category: career.category,
    description: career.description,
    skills: career.skills.map((s) => (typeof s === 'string' ? s : s.name)),
    active: true,
  }));
}

/**
 * GET /api/careers
 * Retrieves list of active career paths from Firestore `careers` collection.
 * If collection is empty, unconfigured, or unreachable, falls back to canonical
 * CAREER_BENCHMARKS so the career selection page is always resilient.
 */
export async function getCareers(req, res, next) {
  try {
    if (isAdminConfigured && db) {
      try {
        const snapshot = await db.collection('careers').where('active', '==', true).get();

        if (!snapshot.empty) {
          const careers = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              category: data.category || '',
              description: data.description || '',
              skills: Array.isArray(data.skills) ? data.skills : [],
              active: Boolean(data.active),
            };
          });

          return res.status(200).json({
            data: careers,
          });
        }
      } catch (firestoreError) {
        console.warn(
          '[getCareers] Firestore query failed, falling back to canonical benchmarks:',
          firestoreError.message
        );
      }
    }

    return res.status(200).json({
      data: getFallbackCareers(),
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getCareers,
};

