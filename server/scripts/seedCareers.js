import '../src/config/env.js';
import { db, isAdminConfigured } from '../src/config/firebaseAdmin.js';

/**
 * One-time idempotent seed script to populate the Firestore `careers` collection.
 * Uses Firestore document set({ ... }, { merge: true }) so it is safe to execute multiple times.
 *
 * DO NOT RUN AUTOMATICALLY: The project owner executes this script manually.
 * Command: node server/scripts/seedCareers.js
 */

const CAREERS = [
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Engineering',
    description: 'Master modern frontend and backend frameworks, relational databases, and secure REST APIs.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'REST APIs', 'System Design'],
    active: true,
  },
  {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Interface',
    description: 'Specialize in responsive interfaces, modern component architecture, state management, and web performance.',
    skills: ['TypeScript', 'React', 'Tailwind CSS', 'Web Vitals', 'UI/UX'],
    active: true,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Analytics',
    description: 'Analyze data trends, write performant SQL queries, and construct actionable visual dashboards.',
    skills: ['SQL', 'Python', 'PowerBI', 'Statistics', 'Data Modeling'],
    active: true,
  },
  {
    id: 'python-developer',
    name: 'Python Developer',
    category: 'Backend',
    description: 'Develop backend automation services, data pipelines, asynchronous APIs, and server-side utilities.',
    skills: ['Python', 'FastAPI', 'AsyncIO', 'Docker', 'PostgreSQL'],
    active: true,
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    category: 'Intelligence',
    description: 'Design machine learning workflows, fine-tune models, and integrate generative AI APIs and vector search.',
    skills: ['PyTorch', 'LLM APIs', 'Prompt Eng', 'Vector DBs', 'RAG'],
    active: true,
  },
];

async function seedCareers() {
  if (!isAdminConfigured || !db) {
    console.error('[seedCareers] Error: Firebase Admin SDK is not configured. Check server/.env.');
    process.exit(1);
  }

  console.log(`[seedCareers] Starting idempotent seed for ${CAREERS.length} careers...`);

  try {
    const batch = db.batch();

    for (const career of CAREERS) {
      const { id, ...data } = career;
      const docRef = db.collection('careers').doc(id);
      batch.set(
        docRef,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
    console.log('[seedCareers] Successfully seeded careers collection in Firestore:');
    CAREERS.forEach((c) => console.log(`  ✔ ${c.id} (${c.name})`));
    process.exit(0);
  } catch (error) {
    console.error('[seedCareers] Failed to seed careers:', error.message);
    process.exit(1);
  }
}

seedCareers();
