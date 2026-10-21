/**
 * Canonical Career Benchmark Datasets (Phase 8).
 *
 * Defines the official 5 career tracks and their core benchmark skills:
 * - full-stack-developer: React, Node.js, PostgreSQL, REST APIs, System Design
 * - frontend-developer: TypeScript, React, Tailwind CSS, Web Vitals, UI/UX
 * - data-analyst: SQL, Python, PowerBI, Statistics, Data Modeling
 * - python-developer: Python, FastAPI, AsyncIO, Docker, PostgreSQL
 * - ai-ml-engineer: PyTorch, LLM APIs, Prompt Eng, Vector DBs, RAG
 *
 * Every benchmark skill has a standardized required level of 80 (0–100 scale).
 */

export const BENCHMARK_REQUIRED_LEVEL = 80;

export const CAREER_BENCHMARKS = {
  'full-stack-developer': {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    category: 'Engineering',
    description: 'Master modern frontend and backend frameworks, relational databases, and secure REST APIs.',
    skills: [
      { name: 'React', category: 'Frontend', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Node.js', category: 'Backend', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'PostgreSQL', category: 'Database', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'REST APIs', category: 'Backend Architecture', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'System Design', category: 'Architecture', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
    ],
  },
  'frontend-developer': {
    id: 'frontend-developer',
    name: 'Frontend Developer',
    category: 'Interface',
    description: 'Specialize in responsive interfaces, modern component architecture, state management, and web performance.',
    skills: [
      { name: 'TypeScript', category: 'Languages', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'React', category: 'Frontend', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Tailwind CSS', category: 'Styling', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Web Vitals', category: 'Performance', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'UI/UX', category: 'Design Systems', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
    ],
  },
  'data-analyst': {
    id: 'data-analyst',
    name: 'Data Analyst',
    category: 'Analytics',
    description: 'Analyze data trends, write performant SQL queries, and construct actionable visual dashboards.',
    skills: [
      { name: 'SQL', category: 'Database', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Python', category: 'Languages', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'PowerBI', category: 'Business Intelligence', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Statistics', category: 'Mathematics', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Data Modeling', category: 'Architecture', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
    ],
  },
  'python-developer': {
    id: 'python-developer',
    name: 'Python Developer',
    category: 'Backend',
    description: 'Develop backend automation services, data pipelines, asynchronous APIs, and server-side utilities.',
    skills: [
      { name: 'Python', category: 'Languages', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'FastAPI', category: 'Web Frameworks', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'AsyncIO', category: 'Concurrency', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Docker', category: 'DevOps', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'PostgreSQL', category: 'Database', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
    ],
  },
  'ai-ml-engineer': {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    category: 'Intelligence',
    description: 'Design machine learning workflows, fine-tune models, and integrate generative AI APIs and vector search.',
    skills: [
      { name: 'PyTorch', category: 'Deep Learning', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'LLM APIs', category: 'Generative AI', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Prompt Eng', category: 'AI Engineering', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'Vector DBs', category: 'Vector Search', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
      { name: 'RAG', category: 'Information Retrieval', requiredLevel: BENCHMARK_REQUIRED_LEVEL },
    ],
  },
};

/**
 * Retrieves benchmark dataset for a given career ID.
 * Returns null if careerId is not recognized.
 *
 * @param {string} careerId
 * @returns {object|null}
 */
export function getCareerBenchmark(careerId) {
  if (!careerId || typeof careerId !== 'string') return null;
  return CAREER_BENCHMARKS[careerId.trim()] || null;
}

/**
 * Returns whether a career ID is recognized in the benchmark catalog.
 *
 * @param {string} careerId
 * @returns {boolean}
 */
export function isValidCareerId(careerId) {
  return Boolean(getCareerBenchmark(careerId));
}

export default {
  BENCHMARK_REQUIRED_LEVEL,
  CAREER_BENCHMARKS,
  getCareerBenchmark,
  isValidCareerId,
};
