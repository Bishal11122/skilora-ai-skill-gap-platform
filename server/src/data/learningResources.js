import { normalizeSkillName } from '../services/skillGapEngine.service.js';

/**
 * Valid resource types and difficulty levels.
 */
export const RESOURCE_TYPES = ['documentation', 'tutorial', 'interactive', 'course', 'guide'];
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];

/**
 * Comprehensive Catalog of Vetted, 100% Free Learning Resources.
 * Mapped to canonical skills across all 5 Skilora career benchmark tracks.
 */
export const LEARNING_RESOURCES = [
  // ==========================================
  // React
  // ==========================================
  {
    id: 'res_react_official_docs',
    skillKey: 'react',
    skillName: 'React',
    topic: 'React Core & JSX Components',
    title: 'Describing the UI & Quick Start',
    provider: 'React.dev (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://react.dev/learn',
    description: 'The official interactive React documentation explaining components, props, conditional rendering, and pure functions.',
    estimatedTime: '2 hours',
  },
  {
    id: 'res_react_hooks_reference',
    skillKey: 'react',
    skillName: 'React',
    topic: 'State Management & Custom Hooks',
    title: 'Built-in React Hooks API Reference',
    provider: 'React.dev (Official)',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://react.dev/reference/react',
    description: 'Comprehensive official API reference covering useState, useReducer, useEffect, useMemo, and useCallback rules.',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_react_mdn_tutorial',
    skillKey: 'react',
    skillName: 'React',
    topic: 'Side Effects & Data Fetching',
    title: 'Getting Started with React Web Development',
    provider: 'MDN Web Docs',
    type: 'tutorial',
    level: 'beginner',
    pricing: 'free',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Client-side_frameworks/React_overview',
    description: 'Pragmatic step-by-step tutorial building a full React application with state, events, and component trees.',
    estimatedTime: '4 hours',
  },

  // ==========================================
  // Node.js
  // ==========================================
  {
    id: 'res_nodejs_event_loop',
    skillKey: 'nodejs',
    skillName: 'Node.js',
    topic: 'Event Loop & Non-Blocking I/O',
    title: 'The Node.js Event Loop, Timers, and process.nextTick()',
    provider: 'Nodejs.org (Official)',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
    description: 'Authoritative guide from Node.js core team explaining libuv phases, task queues, and non-blocking asynchronous execution.',
    estimatedTime: '1 hour',
  },
  {
    id: 'res_nodejs_api_docs',
    skillKey: 'nodejs',
    skillName: 'Node.js',
    topic: 'Modules & Environment Configuration',
    title: 'Node.js Core API Reference & ES Modules',
    provider: 'Nodejs.org (Official)',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://nodejs.org/docs/latest/api/',
    description: 'Official API documentation for streams, buffers, file system operations, and ECMAScript module imports.',
    estimatedTime: 'Reference',
  },
  {
    id: 'res_nodejs_express_mdn',
    skillKey: 'nodejs',
    skillName: 'Node.js',
    topic: 'HTTP Core & Express.js Architecture',
    title: 'Express/Node.js Server-Side Website Programming',
    provider: 'MDN Web Docs',
    type: 'tutorial',
    level: 'beginner',
    pricing: 'free',
    url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs',
    description: 'Modular hands-on course covering Express routing, middleware, asynchronous controller design, and deployment.',
    estimatedTime: '5 hours',
  },

  // ==========================================
  // PostgreSQL
  // ==========================================
  {
    id: 'res_postgres_official_tutorial',
    skillKey: 'postgresql',
    skillName: 'PostgreSQL',
    topic: 'Relational Schema Design & Constraints',
    title: 'PostgreSQL Official Tutorial & SQL Language',
    provider: 'PostgreSQL.org (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.postgresql.org/docs/current/tutorial.html',
    description: 'Foundational official tutorial introducing tables, relational joins, schema constraints, and transaction control.',
    estimatedTime: '2 hours',
  },
  {
    id: 'res_postgres_exercises',
    skillKey: 'postgresql',
    skillName: 'PostgreSQL',
    topic: 'Advanced SQL Queries & Joins',
    title: 'PostgreSQL Interactive Practice Exercises',
    provider: 'PGExercises',
    type: 'interactive',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://pgexercises.com/',
    description: 'Online hands-on sandbox testing SQL aggregations, window functions, recursive CTEs, and joins against real schemas.',
    estimatedTime: '4 hours',
  },
  {
    id: 'res_postgres_dataguide',
    skillKey: 'postgresql',
    skillName: 'PostgreSQL',
    topic: 'Indexing & Performance Tuning',
    title: 'PostgreSQL Indexing & Performance Architecture',
    provider: 'Prisma Data Guide',
    type: 'guide',
    level: 'advanced',
    pricing: 'free',
    url: 'https://www.prisma.io/dataguide/postgresql',
    description: 'Deep architectural walkthrough of B-tree vs GIN indexes, query planning, EXPLAIN ANALYZE, and connection pool sizing.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // REST APIs
  // ==========================================
  {
    id: 'res_rest_http_mdn',
    skillKey: 'restapis',
    skillName: 'REST APIs',
    topic: 'HTTP Protocols & REST Idempotence',
    title: 'HTTP Request Methods, Status Codes & Headers',
    provider: 'MDN Web Docs',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods',
    description: 'Complete specification of HTTP methods, safe/idempotent verb semantics, and structured 2xx/4xx/5xx status codes.',
    estimatedTime: '1.5 hours',
  },
  {
    id: 'res_rest_design_tutorial',
    skillKey: 'restapis',
    skillName: 'REST APIs',
    topic: 'Request Validation & Sanitization',
    title: 'RESTful API Architecture & URI Design Principles',
    provider: 'RESTful API Tutorial',
    type: 'tutorial',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://restfulapi.net/',
    description: 'Best practices for REST resource naming, statelessness, payload validation, and Richardson Maturity Model levels.',
    estimatedTime: '2 hours',
  },
  {
    id: 'res_rest_msft_guidelines',
    skillKey: 'restapis',
    skillName: 'REST APIs',
    topic: 'Pagination, Filtering & Rate Limiting',
    title: 'Microsoft REST API Guidelines & Design Patterns',
    provider: 'Microsoft Open Source',
    type: 'guide',
    level: 'advanced',
    pricing: 'free',
    url: 'https://github.com/microsoft/api-guidelines',
    description: 'Industry-standard enterprise guidelines covering error response payloads, cursor pagination, and deprecation protocols.',
    estimatedTime: '3 hours',
  },

  // ==========================================
  // System Design
  // ==========================================
  {
    id: 'res_sysdesign_primer',
    skillKey: 'systemdesign',
    skillName: 'System Design',
    topic: 'Client-Server Architecture & Load Balancing',
    title: 'The System Design Primer',
    provider: 'Donne Martin (Open Source)',
    type: 'course',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://github.com/donnemartin/system-design-primer',
    description: 'Premier open-source curriculum covering horizontal scaling, load balancers, caching, microservices, and CAP theorem.',
    estimatedTime: '10 hours',
  },
  {
    id: 'res_sysdesign_aws_arch',
    skillKey: 'systemdesign',
    skillName: 'System Design',
    topic: 'Database Scaling & Replication',
    title: 'Scalable Architecture & High Availability Patterns',
    provider: 'AWS Architecture Center',
    type: 'guide',
    level: 'advanced',
    pricing: 'free',
    url: 'https://aws.amazon.com/architecture/',
    description: 'Real-world reference architectures for read-replicas, multi-region failover, caching layers, and fault-tolerant microservices.',
    estimatedTime: '4 hours',
  },

  // ==========================================
  // TypeScript
  // ==========================================
  {
    id: 'res_ts_handbook',
    skillKey: 'typescript',
    skillName: 'TypeScript',
    topic: 'Types, Interfaces & Type Aliases',
    title: 'The TypeScript Official Handbook',
    provider: 'TypeScriptLang.org (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    description: 'The official handbook guiding you through static types, structural typing, unions, and object shape interfaces.',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_ts_generics_totaltraining',
    skillKey: 'typescript',
    skillName: 'TypeScript',
    topic: 'Generics & Function Signatures',
    title: 'TypeScript Generics & Utility Types Tutorial',
    provider: 'Total TypeScript',
    type: 'interactive',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://www.totaltypescript.com/tutorials',
    description: 'Interactive exercises mastering type narrowing, mapped types, conditional types, and reusable generics.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // Tailwind CSS
  // ==========================================
  {
    id: 'res_tailwind_docs',
    skillKey: 'tailwindcss',
    skillName: 'Tailwind CSS',
    topic: 'Utility-First Fundamentals & Box Model',
    title: 'Tailwind CSS Documentation & Utility-First Philosophy',
    provider: 'TailwindCSS.com (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://tailwindcss.com/docs/utility-first',
    description: 'Learn utility-first styling, flexbox/grid alignments, responsive variants, and arbitrary value patterns.',
    estimatedTime: '2 hours',
  },
  {
    id: 'res_tailwind_dark_mode',
    skillKey: 'tailwindcss',
    skillName: 'Tailwind CSS',
    topic: 'Dark Mode & Component Token Abstractions',
    title: 'Responsive Design & Dark Mode System Tokens',
    provider: 'TailwindCSS.com (Official)',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://tailwindcss.com/docs/dark-mode',
    description: 'Implementing class-based dark mode, custom color themes, and CSS custom property integration.',
    estimatedTime: '1 hour',
  },

  // ==========================================
  // Web Vitals
  // ==========================================
  {
    id: 'res_webvitals_learn',
    skillKey: 'webvitals',
    skillName: 'Web Vitals',
    topic: 'Core Web Vitals Measurement',
    title: 'Learn Core Web Vitals & Real User Monitoring',
    provider: 'web.dev by Google',
    type: 'course',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://web.dev/explore/learn-core-web-vitals',
    description: 'Google guide defining Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_webvitals_optimize_lcp',
    skillKey: 'webvitals',
    skillName: 'Web Vitals',
    topic: 'Asset & Image Optimization',
    title: 'Optimize Largest Contentful Paint (LCP)',
    provider: 'web.dev by Google',
    type: 'guide',
    level: 'advanced',
    pricing: 'free',
    url: 'https://web.dev/articles/optimize-lcp',
    description: 'Advanced techniques for preloading critical assets, fetch priority hints, server-side caching, and font-display.',
    estimatedTime: '1.5 hours',
  },

  // ==========================================
  // UI/UX
  // ==========================================
  {
    id: 'res_uiux_a11y_w3c',
    skillKey: 'uiux',
    skillName: 'UI/UX',
    topic: 'WCAG 2.1 Accessibility Guidelines',
    title: 'W3C WAI Web Accessibility Tutorials & Guidance',
    provider: 'W3C Web Accessibility Initiative',
    type: 'guide',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.w3.org/WAI/tutorials/',
    description: 'Authoritative accessibility standards for page structure, forms, navigation, color contrast, and assistive technologies.',
    estimatedTime: '2.5 hours',
  },
  {
    id: 'res_uiux_design_systems',
    skillKey: 'uiux',
    skillName: 'UI/UX',
    topic: 'Color Contrast & Visual Hierarchy',
    title: 'Material Design 3 Principles & Design Tokens',
    provider: 'Google Material Design',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://m3.material.io/',
    description: 'Design system fundamentals covering typography scales, dynamic color palettes, micro-interactions, and visual weight.',
    estimatedTime: '3 hours',
  },

  // ==========================================
  // SQL
  // ==========================================
  {
    id: 'res_sql_bolt',
    skillKey: 'sql',
    skillName: 'SQL',
    topic: 'Data Filtering, Aggregation & Grouping',
    title: 'SQLBolt - Interactive Lessons in Relational Queries',
    provider: 'SQLBolt',
    type: 'interactive',
    level: 'beginner',
    pricing: 'free',
    url: 'https://sqlbolt.com/',
    description: 'Interactive in-browser exercises teaching SELECT, WHERE, JOIN, GROUP BY, and schema updates with real feedback.',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_sql_mode_analytics',
    skillKey: 'sql',
    skillName: 'SQL',
    topic: 'Analytical Window Functions',
    title: 'Advanced Analytical SQL Tutorial for Data Analysis',
    provider: 'Mode Analytics',
    type: 'tutorial',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://mode.com/sql-tutorial/',
    description: 'Covers window functions (ROW_NUMBER, RANK, NTILE), CTEs, self-joins, and performance tuning for analytical workloads.',
    estimatedTime: '4 hours',
  },

  // ==========================================
  // Python
  // ==========================================
  {
    id: 'res_python_official_tutorial',
    skillKey: 'python',
    skillName: 'Python',
    topic: 'Python Data Structures & List Comprehensions',
    title: 'The Python Tutorial (Official Python 3 Docs)',
    provider: 'Python.org (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://docs.python.org/3/tutorial/index.html',
    description: 'The standard introduction to Python data structures, control flow, modules, object orientation, and standard libraries.',
    estimatedTime: '4 hours',
  },
  {
    id: 'res_python_realpython_advanced',
    skillKey: 'python',
    skillName: 'Python',
    topic: 'Object-Oriented Architecture & Dunder Methods',
    title: 'Python OOP and Advanced Language Features',
    provider: 'Real Python',
    type: 'tutorial',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://realpython.com/',
    description: 'In-depth tutorials covering generators, decorators, magic methods, context managers, and type annotations.',
    estimatedTime: '3 hours',
  },

  // ==========================================
  // PowerBI
  // ==========================================
  {
    id: 'res_powerbi_ms_learn',
    skillKey: 'powerbi',
    skillName: 'PowerBI',
    topic: 'Power Query & ETL Transformations',
    title: 'Microsoft Learn: Get Started with Power BI',
    provider: 'Microsoft Learn',
    type: 'course',
    level: 'beginner',
    pricing: 'free',
    url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    description: 'Official free learning path for Power Query, star schema data modeling, report visualizations, and KPI dashboards.',
    estimatedTime: '5 hours',
  },
  {
    id: 'res_powerbi_dax_guide',
    skillKey: 'powerbi',
    skillName: 'PowerBI',
    topic: 'DAX Formulas & Calculated Measures',
    title: 'The Definitive DAX Function Guide & Reference',
    provider: 'DAX.guide',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://dax.guide/',
    description: 'Complete technical reference for CALCULATE, FILTER, ALL, and time-intelligence expressions in Data Analysis Expressions.',
    estimatedTime: 'Reference',
  },

  // ==========================================
  // Statistics
  // ==========================================
  {
    id: 'res_stats_khan_academy',
    skillKey: 'statistics',
    skillName: 'Statistics',
    topic: 'Descriptive Statistics & Distributions',
    title: 'Statistics and Probability Course',
    provider: 'Khan Academy',
    type: 'course',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.khanacademy.org/math/statistics-probability',
    description: 'Foundational course covering variance, normal distributions, central limit theorem, and probability principles.',
    estimatedTime: '6 hours',
  },
  {
    id: 'res_stats_openintro',
    skillKey: 'statistics',
    skillName: 'Statistics',
    topic: 'Hypothesis Testing & p-Values',
    title: 'OpenIntro Statistics: Hypothesis Testing & Inference',
    provider: 'OpenIntro (Open Source)',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://www.openintro.org/book/os/',
    description: 'Rigorous open textbook on two-sample t-tests, ANOVA, p-values, linear regression, and statistical significance.',
    estimatedTime: '4 hours',
  },

  // ==========================================
  // Data Modeling
  // ==========================================
  {
    id: 'res_datamodel_kimball',
    skillKey: 'datamodeling',
    skillName: 'Data Modeling',
    topic: 'Dimensional Modeling (Kimball Methodology)',
    title: 'Kimball Group Dimensional Modeling Techniques',
    provider: 'Kimball Group',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/',
    description: 'The definitive architectural reference for fact tables, dimension tables, conformed dimensions, and star schemas.',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_datamodel_agile',
    skillKey: 'datamodeling',
    skillName: 'Data Modeling',
    topic: 'Conceptual, Logical & Physical ERDs',
    title: 'Data Modeling 101: Normalization & ERD Best Practices',
    provider: 'Agile Data',
    type: 'tutorial',
    level: 'beginner',
    pricing: 'free',
    url: 'http://www.agiledata.org/essays/dataModeling101.html',
    description: 'Practical introduction to entity-relationship modeling, relational normalization (1NF-3NF), and denormalization trade-offs.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // FastAPI
  // ==========================================
  {
    id: 'res_fastapi_tutorial',
    skillKey: 'fastapi',
    skillName: 'FastAPI',
    topic: 'Routing & Request Serialization',
    title: 'FastAPI Tutorial - User Guide (Official)',
    provider: 'FastAPI.tiangolo.com (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    description: 'The official interactive tutorial covering Pydantic models, query parameters, dependency injection, and automatic OpenAPI docs.',
    estimatedTime: '3 hours',
  },
  {
    id: 'res_fastapi_advanced',
    skillKey: 'fastapi',
    skillName: 'FastAPI',
    topic: 'Security & OAuth2 Bearer Tokens',
    title: 'FastAPI Advanced Security & Middleware Guide',
    provider: 'FastAPI.tiangolo.com (Official)',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://fastapi.tiangolo.com/advanced/',
    description: 'Advanced patterns for JWT authentication, database connection pooling, background tasks, and CORS configuration.',
    estimatedTime: '2.5 hours',
  },

  // ==========================================
  // AsyncIO
  // ==========================================
  {
    id: 'res_asyncio_python_docs',
    skillKey: 'asyncio',
    skillName: 'AsyncIO',
    topic: 'Event Loop & Coroutines Fundamentals',
    title: 'Python AsyncIO - Asynchronous I/O Official Library',
    provider: 'Python.org (Official)',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://docs.python.org/3/library/asyncio.html',
    description: 'Official Python standard library documentation detailing coroutines, event loops, tasks, and synchronization primitives.',
    estimatedTime: '2.5 hours',
  },
  {
    id: 'res_asyncio_realpython_walkthrough',
    skillKey: 'asyncio',
    skillName: 'AsyncIO',
    topic: 'Task Scheduling & Gather',
    title: 'Async IO in Python: A Complete Walkthrough',
    provider: 'Real Python',
    type: 'tutorial',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://realpython.com/async-io-python/',
    description: 'Hands-on practical guide building concurrent web scrapers and non-blocking task queues with asyncio.gather().',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // Docker
  // ==========================================
  {
    id: 'res_docker_get_started',
    skillKey: 'docker',
    skillName: 'Docker',
    topic: 'Docker Architecture & Container Lifecycle',
    title: 'Docker Official Getting Started Guide',
    provider: 'Docker.com (Official)',
    type: 'tutorial',
    level: 'beginner',
    pricing: 'free',
    url: 'https://docs.docker.com/get-started/',
    description: 'Official introduction to containerizing applications, writing Dockerfiles, and managing image layers.',
    estimatedTime: '2.5 hours',
  },
  {
    id: 'res_docker_compose_best_practices',
    skillKey: 'docker',
    skillName: 'Docker',
    topic: 'Docker Compose Multi-Container Stacks',
    title: 'Dockerfile Best Practices & Multi-Stage Builds',
    provider: 'Docker.com (Official)',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/',
    description: 'Writing secure, minimal multi-stage images, managing volume persistence, and configuring Docker Compose stacks.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // PyTorch
  // ==========================================
  {
    id: 'res_pytorch_blitz',
    skillKey: 'pytorch',
    skillName: 'PyTorch',
    topic: 'Tensors, Autograd & GPU Hardware',
    title: 'Deep Learning with PyTorch: A 60 Minute Blitz',
    provider: 'PyTorch.org (Official)',
    type: 'tutorial',
    level: 'beginner',
    pricing: 'free',
    url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    description: 'Official fast-track tutorial on PyTorch tensors, autograd differentiation, neural network modules, and training classifiers.',
    estimatedTime: '1.5 hours',
  },
  {
    id: 'res_pytorch_nn_tutorials',
    skillKey: 'pytorch',
    skillName: 'PyTorch',
    topic: 'Training Loops & Optimization',
    title: 'PyTorch Model Training & Evaluation Recipes',
    provider: 'PyTorch.org (Official)',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://pytorch.org/tutorials/',
    description: 'Step-by-step recipes for learning rate schedulers, custom loss functions, checkpointing, and GPU acceleration.',
    estimatedTime: '3 hours',
  },

  // ==========================================
  // LLM APIs
  // ==========================================
  {
    id: 'res_llm_groq_quickstart',
    skillKey: 'llmapis',
    skillName: 'LLM APIs',
    topic: 'LLM Client Setup & Token Economics',
    title: 'Groq Cloud API Documentation & Quickstart',
    provider: 'Groq Cloud (Official)',
    type: 'documentation',
    level: 'beginner',
    pricing: 'free',
    url: 'https://console.groq.com/docs/quickstart',
    description: 'Official documentation for invoking ultra-low latency Llama models, streaming completions, and setting temperature.',
    estimatedTime: '1 hour',
  },
  {
    id: 'res_llm_json_mode',
    skillKey: 'llmapis',
    skillName: 'LLM APIs',
    topic: 'Structured JSON Mode & Function Calling',
    title: 'Structured Outputs & JSON Mode with LLMs',
    provider: 'DAIR.AI Prompt Engineering Guide',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://www.promptingguide.ai/',
    description: 'Master schema-constrained generation, function calling protocols, and error handling for generative AI APIs.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // Prompt Eng
  // ==========================================
  {
    id: 'res_prompt_guide_dair',
    skillKey: 'prompteng',
    skillName: 'Prompt Eng',
    topic: 'System Framing & Persona Directives',
    title: 'Prompt Engineering Guide (DAIR.AI)',
    provider: 'DAIR.AI',
    type: 'course',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.promptingguide.ai/',
    description: 'Comprehensive open-source course covering zero-shot, few-shot, chain-of-thought, and system persona structuring.',
    estimatedTime: '4 hours',
  },
  {
    id: 'res_prompt_injection_defense',
    skillKey: 'prompteng',
    skillName: 'Prompt Eng',
    topic: 'Prompt Injection Defense & Guardrails',
    title: 'Defensive Prompting & Adversarial Robustness',
    provider: 'Learn Prompting',
    type: 'guide',
    level: 'advanced',
    pricing: 'free',
    url: 'https://learnprompting.org/',
    description: 'Techniques for untrusted user input demarcation, indirect prompt injection mitigation, and guardrail enforcement.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // Vector DBs
  // ==========================================
  {
    id: 'res_vectordb_pinecone_intro',
    skillKey: 'vectordbs',
    skillName: 'Vector DBs',
    topic: 'Embedding Models & Distance Metrics',
    title: 'What is a Vector Database? Architecture & Search',
    provider: 'Pinecone Learning Center',
    type: 'guide',
    level: 'beginner',
    pricing: 'free',
    url: 'https://www.pinecone.io/learn/vector-database/',
    description: 'Introduction to high-dimensional embeddings, cosine similarity vs euclidean distance, and vector indexing algorithms.',
    estimatedTime: '1.5 hours',
  },
  {
    id: 'res_vectordb_chroma_docs',
    skillKey: 'vectordbs',
    skillName: 'Vector DBs',
    topic: 'Vector Database Operations',
    title: 'Chroma Open-Source Vector Database Documentation',
    provider: 'Chroma Core Docs',
    type: 'documentation',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://docs.trychroma.com/',
    description: 'How to embed, store, query, and filter collections with metadata in an open-source vector store.',
    estimatedTime: '2 hours',
  },

  // ==========================================
  // RAG (Retrieval-Augmented Generation)
  // ==========================================
  {
    id: 'res_rag_huggingface_overview',
    skillKey: 'rag',
    skillName: 'RAG',
    topic: 'Document Ingestion & Chunking Strategies',
    title: 'Retrieval Augmented Generation: Concepts & Ingestion',
    provider: 'Hugging Face Blog',
    type: 'guide',
    level: 'intermediate',
    pricing: 'free',
    url: 'https://huggingface.co/blog/ray-rag',
    description: 'Architectural overview of chunking, dense retrieval pipelines, bi-encoders, and context injection into generative prompts.',
    estimatedTime: '2 hours',
  },
  {
    id: 'res_rag_langchain_scratch',
    skillKey: 'rag',
    skillName: 'RAG',
    topic: 'Re-Ranking & Context Compression',
    title: 'RAG From Scratch: Indexing, Retrieval, and Generation',
    provider: 'LangChain AI (Open Source)',
    type: 'course',
    level: 'advanced',
    pricing: 'free',
    url: 'https://github.com/langchain-ai/rag-from-scratch',
    description: 'Comprehensive repository covering multi-query retrieval, re-ranking with cross-encoders, and hallucination reduction.',
    estimatedTime: '4 hours',
  },
];

/**
 * Validates whether a resource object has all mandatory fields.
 *
 * @param {object} res
 * @returns {boolean}
 */
export function validateResource(res) {
  if (!res || typeof res !== 'object') return false;
  if (!res.id || typeof res.id !== 'string') return false;
  if (!res.skillKey || typeof res.skillKey !== 'string') return false;
  if (!res.skillName || typeof res.skillName !== 'string') return false;
  if (!res.title || typeof res.title !== 'string') return false;
  if (!res.provider || typeof res.provider !== 'string') return false;
  if (!RESOURCE_TYPES.includes(res.type)) return false;
  if (!DIFFICULTY_LEVELS.includes(res.level)) return false;
  if (!res.url || typeof res.url !== 'string' || !res.url.startsWith('http')) return false;
  return true;
}

/**
 * Retrieves all curated learning resources.
 *
 * @returns {Array<object>}
 */
export function getAllResources() {
  return LEARNING_RESOURCES.filter(validateResource);
}

/**
 * Retrieves curated resources for a specific skill name.
 *
 * @param {string} skillName
 * @returns {Array<object>}
 */
export function getResourcesForSkill(skillName) {
  const normKey = normalizeSkillName(skillName);
  if (!normKey) return [];
  return getAllResources().filter((r) => r.skillKey === normKey);
}

export default {
  RESOURCE_TYPES,
  DIFFICULTY_LEVELS,
  LEARNING_RESOURCES,
  validateResource,
  getAllResources,
  getResourcesForSkill,
};
