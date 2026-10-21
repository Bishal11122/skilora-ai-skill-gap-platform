import { z } from 'zod';
import { getGroqClient, GroqServiceError } from './groq.service.js';
import { GROQ_MODEL, isGroqConfigured } from '../config/env.js';
import { normalizeSkillName } from './skillGapEngine.service.js';

/**
 * Standard benchmark curriculum database for the 5 official career tracks.
 * Used for deterministic roadmap generation and reliable fallbacks.
 */
export const BENCHMARK_CURRICULUM = {
  // 1. Full Stack Developer
  'full-stack-developer': {
    react: {
      defaultObjective: 'Master modern component-based UI engineering, custom hooks, and state management in React.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'React Core & JSX Components', description: 'Functional components, props interfaces, and virtual DOM reconciliation.' },
        { title: 'State Management & Custom Hooks', description: 'useState, useReducer, and building reusable custom lifecycle hooks.' },
        { title: 'Side Effects & Data Fetching', description: 'useEffect synchronization patterns, cleanup, and async data fetching.' },
        { title: 'Performance Optimization', description: 'React.memo, useMemo, useCallback, and dynamic code splitting.' },
      ],
    },
    nodejs: {
      defaultObjective: 'Master asynchronous server-side JavaScript, event-driven I/O, and modular backend architectures.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Event Loop & Non-Blocking I/O', description: 'Understanding libuv, call stack, microtask queue, and buffer streams.' },
        { title: 'Modules & Environment Configuration', description: 'ES modules, npm package management, and zero-leak environment configurations.' },
        { title: 'HTTP Core & Express.js Architecture', description: 'Building modular routing, middleware pipelines, and centralized error handling.' },
        { title: 'Process Management & Security', description: 'Cluster module basics, Helmet security headers, and graceful process shutdowns.' },
      ],
    },
    postgresql: {
      defaultObjective: 'Design relational database schemas, execute complex queries, and maintain ACID transactional integrity.',
      durations: { high: '3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Relational Schema Design & Constraints', description: 'Primary keys, foreign keys, normalization (1NF-3NF), and schema migrations.' },
        { title: 'Advanced SQL Queries & Joins', description: 'Inner, outer, cross joins, subqueries, and window analytical functions.' },
        { title: 'Indexing & Performance Tuning', description: 'B-tree vs hash indexes, EXPLAIN ANALYZE, and query plan optimization.' },
        { title: 'Transactions & Connection Pooling', description: 'ACID isolation levels, row locking, and pg pool connection management.' },
      ],
    },
    restapis: {
      defaultObjective: 'Architect, document, and secure production-ready RESTful web services with strict validation.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'HTTP Protocols & REST Idempotence', description: 'Standard verb semantics (GET, POST, PUT, PATCH, DELETE) and correct status codes.' },
        { title: 'Request Validation & Sanitization', description: 'Server-side input validation schemas with Zod and content-type enforcement.' },
        { title: 'Authentication & JWT Security', description: 'Bearer tokens, token verification middleware, and role-based access control.' },
        { title: 'Pagination, Filtering & Rate Limiting', description: 'Cursor/offset pagination standards, query filtering, and rate limit protections.' },
      ],
    },
    systemdesign: {
      defaultObjective: 'Learn scalable system architecture principles, caching strategies, and distributed service design.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Client-Server Architecture & Load Balancing', description: 'Horizontal scaling, reverse proxies (Nginx), and load-balancing algorithms.' },
        { title: 'Caching Strategies with In-Memory Stores', description: 'Cache-aside, write-through patterns, and Redis cache invalidation.' },
        { title: 'Database Scaling & Replication', description: 'Read replicas, write masters, connection pooling, and sharding principles.' },
        { title: 'Microservices & Event-Driven Patterns', description: 'Decoupled services, message queues (pub/sub), and resilient failure modes.' },
      ],
    },
  },

  // 2. Frontend Developer
  'frontend-developer': {
    typescript: {
      defaultObjective: 'Build type-safe frontend web applications with static analysis, generics, and strict compiler configs.',
      durations: { high: '3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Types, Interfaces & Type Aliases', description: 'Primitive types, structural typing, object shapes, and interface extension.' },
        { title: 'Union, Intersection & Mapped Types', description: 'Discriminated unions, type narrowing, keyof, and utility types (Partial, Pick).' },
        { title: 'Generics & Function Signatures', description: 'Generic functions, constraints, and typing React component props and hooks.' },
        { title: 'Compiler Configuration & Strict Mode', description: 'tsconfig options, noImplicitAny, and typing third-party JavaScript libraries.' },
      ],
    },
    react: {
      defaultObjective: 'Master responsive component architecture, state management, and modern React design patterns.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Component Composition & Props Design', description: 'Container vs presentational patterns and compound component structures.' },
        { title: 'State Architecture & Context API', description: 'Local vs global state boundaries, context providers, and avoiding unnecessary renders.' },
        { title: 'Custom Hook Design Patterns', description: 'Extracting reusable browser APIs, debouncing, and event listeners into hooks.' },
        { title: 'Render Performance & Profiling', description: 'React DevTools profiling, virtualized lists, and memory leak mitigation.' },
      ],
    },
    tailwindcss: {
      defaultObjective: 'Construct scalable design systems and fluid responsive interfaces using utility-first CSS.',
      durations: { high: '2 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'Utility-First Fundamentals & Box Model', description: 'Margin, padding, flexbox, and CSS grid layout utilities.' },
        { title: 'Responsive Breakpoints & Fluid Design', description: 'Mobile-first breakpoint variants and responsive typography scaling.' },
        { title: 'Theme Configuration & CSS Variables', description: 'Extending colors, font stacks, and linking with HSL CSS custom properties.' },
        { title: 'Dark Mode & Component Token Abstractions', description: 'System vs class-based dark mode toggling and semantic style tokens.' },
      ],
    },
    webvitals: {
      defaultObjective: 'Optimize Core Web Vitals (LCP, INP, CLS) and critical rendering path performance.',
      durations: { high: '2-3 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'Core Web Vitals Measurement', description: 'Understanding Largest Contentful Paint, Interaction to Next Paint, and Cumulative Layout Shift.' },
        { title: 'Asset & Image Optimization', description: 'WebP/AVIF formats, responsive srcset, modern decoding, and fetch priority hints.' },
        { title: 'Bundle Splitting & Critical CSS', description: 'Tree-shaking, dynamic import boundaries, and inlining critical above-the-fold styles.' },
        { title: 'Font Loading & Layout Stability', description: 'font-display swap, size-adjust fallback overrides, and preventing CLS reflows.' },
      ],
    },
    uiux: {
      defaultObjective: 'Apply human-centered design principles, WCAG accessibility, and cohesive micro-interactions.',
      durations: { high: '2 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'WCAG 2.1 Accessibility Guidelines', description: 'Semantic HTML5, ARIA landmarks, keyboard tab navigation, and focus rings.' },
        { title: 'Color Contrast & Visual Hierarchy', description: 'AAA/AA color contrast ratios, typographic scale, and scannable visual weights.' },
        { title: 'Form UX & Validation Feedback', description: 'Inline validation states, accessible error messages, and assisted input controls.' },
        { title: 'Micro-Interactions & Reduced Motion', description: 'Subtle transitions, hover states, and honoring prefers-reduced-motion queries.' },
      ],
    },
  },

  // 3. Data Analyst
  'data-analyst': {
    sql: {
      defaultObjective: 'Write performant SQL queries, analytical window functions, and multi-table joins for business reporting.',
      durations: { high: '3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Data Filtering, Aggregation & Grouping', description: 'WHERE, HAVING, GROUP BY, and multi-column aggregate metrics.' },
        { title: 'Complex Joins & Subqueries', description: 'Self-joins, full outer joins, correlated subqueries, and EXISTS operations.' },
        { title: 'Analytical Window Functions', description: 'ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, and running cumulative totals.' },
        { title: 'Common Table Expressions (CTEs)', description: 'Recursive CTEs, readability structuring, and temp view performance.' },
      ],
    },
    python: {
      defaultObjective: 'Use Python, Pandas, and NumPy for exploratory data analysis, data cleaning, and automated reporting.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Python Data Structures & List Comprehensions', description: 'Lists, dictionaries, sets, lambda expressions, and file I/O operations.' },
        { title: 'NumPy Arrays & Vectorized Computation', description: 'Array broadcasting, indexing, numerical slicing, and statistical functions.' },
        { title: 'Pandas DataFrames & Cleaning', description: 'Handling missing values, deduplication, string parsing, and type conversions.' },
        { title: 'Data Aggregation & Merging', description: 'GroupBy pipelines, pivot tables, multi-index operations, and joining DataFrames.' },
      ],
    },
    powerbi: {
      defaultObjective: 'Build interactive visual reports, DAX calculated measures, and executive business dashboards.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Power Query & ETL Transformations', description: 'Connecting data sources, pivoting, unpivoting, and cleaning column types.' },
        { title: 'Data Modeling & Relationship Cardinality', description: 'Star schema architecture, 1-to-many relationships, and cross-filter direction.' },
        { title: 'DAX Formulas & Calculated Measures', description: 'CALCULATE, FILTER, ALL, RELATED, and time intelligence expressions.' },
        { title: 'Visual Dashboard Design & Storytelling', description: 'Selecting appropriate chart types, drill-down interactions, and slicers.' },
      ],
    },
    statistics: {
      defaultObjective: 'Apply descriptive and inferential statistics to validate business hypotheses and understand variance.',
      durations: { high: '3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Descriptive Statistics & Distributions', description: 'Mean, median, mode, variance, standard deviation, and skewness.' },
        { title: 'Probability Distributions', description: 'Normal distribution, Z-scores, Central Limit Theorem, and binomial distribution.' },
        { title: 'Hypothesis Testing & p-Values', description: 'Null vs alternative hypotheses, two-sample t-tests, ANOVA, and significance levels.' },
        { title: 'Correlation & Linear Regression', description: 'Pearson/Spearman coefficients, R-squared variance, and multiple regression models.' },
      ],
    },
    datamodeling: {
      defaultObjective: 'Design robust dimensional models, data warehouses, and ETL transformation pipelines.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Conceptual, Logical & Physical ERDs', description: 'Entities, attributes, cardinality, and normalization vs denormalization.' },
        { title: 'Dimensional Modeling (Kimball Methodology)', description: 'Fact tables, dimension tables, degenerate dimensions, and conformed dimensions.' },
        { title: 'Slowly Changing Dimensions (SCD)', description: 'Implementing SCD Type 1 (overwrite), Type 2 (historical tracking), and Type 3.' },
        { title: 'Data Quality & Validation Frameworks', description: 'Constraint validation, schema drift detection, and data lineage tracking.' },
      ],
    },
  },

  // 4. Python Developer
  'python-developer': {
    python: {
      defaultObjective: 'Master advanced Python paradigms, generators, decorators, and memory-efficient idioms.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Object-Oriented Architecture & Dunder Methods', description: 'Inheritance, abstract base classes, dataclasses, and magic methods (__repr__, __enter__).' },
        { title: 'Iterators, Generators & Memory Efficiency', description: 'Building custom iterables, yield statements, and memory profiling.' },
        { title: 'Decorators & Functional Programming', description: 'Higher-order functions, parameterized decorators, and functools.wraps.' },
        { title: 'Packaging, Virtual Environments & Typing', description: 'Type hinting with typing/Pydantic, pyproject.toml, and virtualenv management.' },
      ],
    },
    fastapi: {
      defaultObjective: 'Develop high-performance asynchronous RESTful APIs with automated validation and documentation.',
      durations: { high: '3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Routing & Request Serialization', description: 'Path parameters, query parameters, Pydantic BaseModel validation, and responses.' },
        { title: 'Dependency Injection System', description: 'Using Depends() for database sessions, authentication, and reusable services.' },
        { title: 'Security & OAuth2 Bearer Tokens', description: 'Password hashing, JWT generation, and token authentication middleware.' },
        { title: 'Testing & OpenAPI Integration', description: 'Writing integration tests with TestClient (httpx) and customizing Swagger docs.' },
      ],
    },
    asyncio: {
      defaultObjective: 'Harness non-blocking asynchronous programming, coroutines, and concurrent task execution.',
      durations: { high: '2-3 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'Event Loop & Coroutines Fundamentals', description: 'async def, await semantics, and understanding cooperative multitasking.' },
        { title: 'Task Scheduling & Gather', description: 'asyncio.create_task, asyncio.gather, asyncio.as_completed, and timeouts.' },
        { title: 'Async Context Managers & Iterators', description: 'Building __aenter__ and __aexit__ for async connection lifecycle control.' },
        { title: 'Concurrency Safety & Synchronization', description: 'asyncio.Lock, asyncio.Semaphore, and avoiding event loop blocking.' },
      ],
    },
    docker: {
      defaultObjective: 'Containerize Python services with multi-stage builds and reliable orchestration.',
      durations: { high: '2 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'Docker Architecture & Container Lifecycle', description: 'Images, containers, daemon, CLI commands, and volume persistence.' },
        { title: 'Dockerfile Optimization for Python', description: 'Non-root user execution, caching pip dependencies, and minimal base images.' },
        { title: 'Docker Compose Multi-Container Stacks', description: 'Orchestrating web API, PostgreSQL database, and Redis cache locally.' },
        { title: 'Networking & Environment Secrets', description: 'Bridge networks, service discovery, and secure environment variable injection.' },
      ],
    },
    postgresql: {
      defaultObjective: 'Manage asynchronous relational data persistence using asyncpg and SQLAlchemy ORM.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Async SQLAlchemy 2.0 Models', description: 'AsyncSession, mapped_column, declarative base, and async relationships.' },
        { title: 'Database Migrations with Alembic', description: 'Generating migration scripts, revision history, and running safe upgrades.' },
        { title: 'Complex Queries & Transaction Isolation', description: 'Eager vs lazy loading, selectinload, transactions, and savepoints.' },
        { title: 'Connection Pooling & Asyncpg Drivers', description: 'Pool sizing, statement caching, and handling database connection recovery.' },
      ],
    },
  },

  // 5. AI/ML Engineer
  'ai-ml-engineer': {
    pytorch: {
      defaultObjective: 'Build, train, and evaluate deep learning models with custom PyTorch tensor operations.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Tensors, Autograd & GPU Hardware', description: 'Tensor operations, broadcasting, gradients with backward(), and CUDA devices.' },
        { title: 'Neural Network Modules (nn.Module)', description: 'Defining forward passes, linear layers, activations, and parameter initialization.' },
        { title: 'Training Loops & Optimization', description: 'Loss functions, optimizers (AdamW), learning rate schedulers, and validation loops.' },
        { title: 'Model Checkpointing & Evaluation', description: 'Saving state dicts, torch.no_grad() inference, and calculating F1/loss metrics.' },
      ],
    },
    llmapis: {
      defaultObjective: 'Integrate Large Language Model APIs with structured outputs, streaming, and error resilience.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'LLM Client Setup & Token Economics', description: 'API keys, parameter tuning (temperature, top_p), and calculating token budgets.' },
        { title: 'Structured JSON Mode & Function Calling', description: 'Forcing schema-guaranteed JSON completions and tool invocation patterns.' },
        { title: 'Streaming Completions & UI Updates', description: 'Server-Sent Events (SSE), async stream processing, and progressive render.' },
        { title: 'Rate Limiting & Fallback Retries', description: 'Exponential backoff, jitter, multi-provider failover, and timeout handling.' },
      ],
    },
    prompteng: {
      defaultObjective: 'Engineer robust prompts, few-shot examples, system personas, and prompt injection defenses.',
      durations: { high: '2 weeks', medium: '1-2 weeks', small: '1 week' },
      topics: [
        { title: 'System Framing & Persona Directives', description: 'Context boundaries, role instructions, and deterministic behavior constraints.' },
        { title: 'Few-Shot & Chain-of-Thought Prompting', description: 'Providing high-quality exemplar pairs and step-by-step reasoning triggers.' },
        { title: 'Prompt Injection Defense & Guardrails', description: 'Untrusted user delimiters, input sanitization, and output validation.' },
        { title: 'Evaluation & Prompt Regression Testing', description: 'Building test suites to measure hallucination rates and format compliance.' },
      ],
    },
    vectordbs: {
      defaultObjective: 'Store, index, and query high-dimensional vector embeddings for low-latency similarity search.',
      durations: { high: '2-3 weeks', medium: '2 weeks', small: '1 week' },
      topics: [
        { title: 'Embedding Models & Distance Metrics', description: 'Generating dense vector representations, Cosine similarity, and Euclidean distance.' },
        { title: 'Vector Indexing Algorithms', description: 'Approximate Nearest Neighbor (ANN), HNSW graph indexing, and IVF partitions.' },
        { title: 'Vector Database Operations', description: 'CRUD operations on vectors, upserting metadata, and namespace partitioning.' },
        { title: 'Metadata Filtering & Hybrid Search', description: 'Combining dense semantic vectors with sparse BM25 keyword filtering.' },
      ],
    },
    rag: {
      defaultObjective: 'Architect production-grade Retrieval-Augmented Generation pipelines with re-ranking and citations.',
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: 'Document Ingestion & Chunking Strategies', description: 'Fixed-size, recursive character, and semantic boundary chunking with overlap.' },
        { title: 'Retrieval & Context Assembly', description: 'Top-k document retrieval, relevance thresholding, and prompt synthesis.' },
        { title: 'Re-Ranking & Context Compression', description: 'Cross-encoder re-ranking models and removing irrelevant retrieved tokens.' },
        { title: 'Grounding & Hallucination Mitigation', description: 'Source attribution, quote verification, and fallback when context is absent.' },
      ],
    },
  },
};

/**
 * Zod schema for validating AI-generated roadmap responses from Groq.
 */
const aiRoadmapMilestoneSchema = z.object({
  skillName: z.string().trim().min(1),
  learningObjective: z.string().trim().min(10).max(350),
  estimatedDuration: z.string().trim().min(3).max(60),
  topics: z.array(
    z.object({
      title: z.string().trim().min(3).max(120),
      description: z.string().trim().min(10).max(350),
    })
  ).min(2).max(6),
});

const aiRoadmapResponseSchema = z.object({
  milestones: z.array(aiRoadmapMilestoneSchema).min(5).max(5),
});

/**
 * Resolves curriculum metadata for a skill from the static catalog.
 */
function getCurriculumMeta(careerId, skillName) {
  const normCareer = (careerId || '').trim().toLowerCase();
  const normSkill = normalizeSkillName(skillName);

  const careerCatalog = BENCHMARK_CURRICULUM[normCareer] || {};
  return (
    careerCatalog[normSkill] || {
      defaultObjective: `Build comprehensive competency in ${skillName} aligned with industry standards.`,
      durations: { high: '3-4 weeks', medium: '2-3 weeks', small: '1-2 weeks' },
      topics: [
        { title: `${skillName} Core Fundamentals`, description: `Understand core concepts, syntax, and foundational patterns of ${skillName}.` },
        { title: `Practical Application & Projects`, description: `Apply ${skillName} to real-world scenarios and integration workflows.` },
        { title: `Advanced Topics & Best Practices`, description: `Master performance, debugging, and production design patterns for ${skillName}.` },
      ],
    }
  );
}

/**
 * Generates a deterministic, curriculum-aligned roadmap from priority-ranked skill gaps.
 * Guarantees zero side-effects and runs purely in memory.
 *
 * @param {object} params
 * @param {string} params.careerId
 * @param {string} params.careerName
 * @param {Array<object>} params.skillGaps - Ordered from Phase 8 priority ranking
 * @returns {object} Roadmap document
 */
export function generateDeterministicRoadmap({ careerId, careerName, skillGaps = [] }) {
  if (!Array.isArray(skillGaps) || skillGaps.length === 0) {
    throw new Error('Skill gaps array is required to generate a roadmap.');
  }

  let totalWeeks = 0;

  const milestones = skillGaps.map((gapItem, index) => {
    const meta = getCurriculumMeta(careerId, gapItem.name);
    const classification = gapItem.classificationCode || 'medium';
    const duration = meta.durations[classification] || '2-3 weeks';

    // Parse week approximation for summary
    const weekMatch = duration.match(/(\d+)/);
    const weeksParsed = weekMatch ? parseInt(weekMatch[1], 10) : 2;
    totalWeeks += weeksParsed;

    const topics = meta.topics.map((t) => ({
      title: t.title,
      description: t.description,
      completed: false,
    }));

    return {
      order: index + 1,
      skillName: gapItem.name,
      category: gapItem.category || undefined,
      priorityRank: gapItem.priorityRank || index + 1,
      gapClassification: gapItem.classification || 'Medium Gap',
      currentLevel: gapItem.currentLevel !== undefined ? gapItem.currentLevel : null,
      requiredLevel: gapItem.requiredLevel || 80,
      gap: gapItem.gap !== undefined ? gapItem.gap : 0,
      evidenceSource: gapItem.evidenceSource || 'none',
      learningObjective: meta.defaultObjective,
      estimatedDuration: duration,
      status: 'not-started',
      topics,
    };
  });

  const now = new Date().toISOString();
  const topPrioritySkill = milestones.length > 0 ? milestones[0].skillName : '';

  return {
    careerId,
    careerName,
    generatedAt: now,
    source: 'deterministic-fallback',
    summary: {
      totalMilestones: milestones.length,
      completedMilestones: 0,
      progressPercentage: 0,
      totalEstimatedWeeks: totalWeeks,
      topPrioritySkill,
    },
    milestones,
  };
}

/**
 * Attempts to generate a personalized roadmap using the Groq Cloud API.
 * Returns null if Groq is unconfigured or if generation fails.
 *
 * @param {object} params
 * @param {string} params.careerId
 * @param {string} params.careerName
 * @param {Array<object>} params.skillGaps
 * @param {string} [params.model]
 * @returns {Promise<object|null>} AI-generated roadmap or null on failure
 */
export async function generateRoadmapWithGroq({ careerId, careerName, skillGaps = [], model }) {
  const client = getGroqClient();
  if (!client) {
    return null;
  }

  const modelToUse = (model || process.env.GROQ_MODEL || GROQ_MODEL || 'llama-3.3-70b-versatile').trim();

  // Prepare safe summary of the 5 priority skills
  const skillsContext = skillGaps
    .map(
      (s, idx) =>
        `#${idx + 1} Skill: "${s.name}" (Current Level: ${
          s.currentLevel !== null ? s.currentLevel : '0 [Not Assessed]'
        }/100, Required Benchmark: ${s.requiredLevel}/100, Gap: ${s.gap}, Priority: ${s.classification})`
    )
    .join('\n');

  const systemPrompt = `You are an expert technical curriculum designer for the educational platform Skillora AI.
Your task is to generate a personalized learning roadmap for a student aiming to become a: "${careerName}".

The student has 5 benchmark skills, ordered from highest priority gap (#1) to lowest (#5).
For each of the 5 skills, generate:
1. "skillName": EXACT name of the skill as provided.
2. "learningObjective": A concrete, 1-2 sentence learning objective customized to bridge the gap between their current level and the required 80/100 benchmark.
3. "estimatedDuration": An estimated study duration (e.g. "3-4 weeks", "2 weeks", "1-2 weeks").
4. "topics": An ordered array of 3 to 4 sequential study topics. Each topic must have:
   - "title": Concise topic name (e.g. "Event Loop & Non-Blocking I/O")
   - "description": 1-2 sentence explanation of what to learn.

CRITICAL DIRECTIVES:
- Maintain the EXACT sequence of the 5 provided skills (Milestone 1 must address Skill #1, Milestone 2 Skill #2, etc.).
- Never omit, rename, or reorder any of the 5 benchmark skills.
- Return ONLY a valid JSON object matching the requested schema.`;

  const userPrompt = `Generate a personalized learning roadmap for target career: "${careerName}".

Skills and Gap Analysis (Ordered by Priority):
${skillsContext}

Respond strictly with valid JSON matching:
{
  "milestones": [
    {
      "skillName": "Exact Skill Name",
      "learningObjective": "Custom objective...",
      "estimatedDuration": "2-3 weeks",
      "topics": [
        {
          "title": "Topic Title",
          "description": "Topic description..."
        }
      ]
    }
  ]
}`;

  try {
    const completion = await client.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 3500,
    });

    const rawContent = completion?.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      return null;
    }

    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

    const parsedJson = JSON.parse(cleaned.trim());
    const validated = aiRoadmapResponseSchema.safeParse(parsedJson);

    if (!validated.success) {
      return null;
    }

    // Merge AI generated objectives and topics with our verified skill gap metrics
    let totalWeeks = 0;
    const aiMilestonesMap = new Map();

    validated.data.milestones.forEach((m) => {
      aiMilestonesMap.set(normalizeSkillName(m.skillName), m);
    });

    const milestones = skillGaps.map((gapItem, index) => {
      const canonicalKey = normalizeSkillName(gapItem.name);
      const aiData = aiMilestonesMap.get(canonicalKey);
      const fallbackMeta = getCurriculumMeta(careerId, gapItem.name);

      const classification = gapItem.classificationCode || 'medium';
      const duration = aiData?.estimatedDuration || fallbackMeta.durations[classification] || '2-3 weeks';

      const weekMatch = duration.match(/(\d+)/);
      const weeksParsed = weekMatch ? parseInt(weekMatch[1], 10) : 2;
      totalWeeks += weeksParsed;

      const topics = (aiData?.topics && aiData.topics.length >= 2 ? aiData.topics : fallbackMeta.topics).map((t) => ({
        title: t.title,
        description: t.description,
        completed: false,
      }));

      return {
        order: index + 1,
        skillName: gapItem.name,
        category: gapItem.category || undefined,
        priorityRank: gapItem.priorityRank || index + 1,
        gapClassification: gapItem.classification || 'Medium Gap',
        currentLevel: gapItem.currentLevel !== undefined ? gapItem.currentLevel : null,
        requiredLevel: gapItem.requiredLevel || 80,
        gap: gapItem.gap !== undefined ? gapItem.gap : 0,
        evidenceSource: gapItem.evidenceSource || 'none',
        learningObjective: aiData?.learningObjective || fallbackMeta.defaultObjective,
        estimatedDuration: duration,
        status: 'not-started',
        topics,
      };
    });

    const now = new Date().toISOString();
    const topPrioritySkill = milestones.length > 0 ? milestones[0].skillName : '';

    return {
      careerId,
      careerName,
      generatedAt: now,
      source: 'ai-generated',
      modelUsed: modelToUse,
      summary: {
        totalMilestones: milestones.length,
        completedMilestones: 0,
        progressPercentage: 0,
        totalEstimatedWeeks: totalWeeks,
        topPrioritySkill,
      },
      milestones,
    };
  } catch (err) {
    // Graceful error recovery: return null so orchestrator seamlessly switches to deterministic fallback
    return null;
  }
}

/**
 * Master orchestrator that generates a personalized learning roadmap.
 * Attempts AI generation with Groq, falling back to deterministic curriculum on any failure.
 *
 * @param {object} params
 * @param {string} params.careerId
 * @param {string} params.careerName
 * @param {Array<object>} params.skillGaps
 * @param {object} [params.options]
 * @returns {Promise<object>} Guaranteed valid 5-milestone roadmap
 */
export async function buildPersonalizedRoadmap({ careerId, careerName, skillGaps = [], options = {} }) {
  if (isGroqConfigured() || getGroqClient()) {
    try {
      const aiResult = await generateRoadmapWithGroq({
        careerId,
        careerName,
        skillGaps,
        model: options.model,
      });

      if (aiResult) {
        return aiResult;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  return generateDeterministicRoadmap({
    careerId,
    careerName,
    skillGaps,
  });
}

export default {
  BENCHMARK_CURRICULUM,
  generateDeterministicRoadmap,
  generateRoadmapWithGroq,
  buildPersonalizedRoadmap,
};
