import { db } from '../config/firebaseAdmin.js';

/**
 * GET /api/careers
 * Retrieves list of active career paths from Firestore `careers` collection.
 * If collection is empty, returns an empty array [] without error.
 */
export async function getCareers(req, res, next) {
  try {
    const snapshot = await db.collection('careers').where('active', '==', true).get();

    if (snapshot.empty) {
      return res.status(200).json({
        data: [],
      });
    }

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
  } catch (error) {
    next(error);
  }
}

export default {
  getCareers,
};
