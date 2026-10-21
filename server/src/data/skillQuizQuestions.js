import { normalizeSkillName } from '../services/skillGapEngine.service.js';

/**
 * Curated Question Bank for Skill-Specific Quizzes (Phase 11).
 *
 * Covers all 22 canonical benchmark skills across all 5 Skillora AI career tracks.
 * Exactly 5 high-quality, practical multiple-choice questions per skill.
 *
 * Each question has:
 * - id: unique string identifier
 * - skill: canonical skill name
 * - topic: specific subtopic tested
 * - question: unambiguous question prompt
 * - options: 4 distinct choices (strings)
 * - correctOption: 0-indexed integer (0..3)
 * - explanation: clear pedagogical explanation for post-submission review
 */
export const SKILL_QUIZ_BANK = {
  // 1. React
  react: [
    {
      id: 'quiz_react_01',
      skill: 'React',
      topic: 'Component Lifecycle & Side Effects',
      question: 'When does the cleanup function returned by `useEffect` execute?',
      options: [
        'Only when the component unmounts from the DOM.',
        'Before the component re-runs the effect on the next render, and when it unmounts.',
        'Immediately after the initial DOM paint before children render.',
        'Whenever any state variable inside the component changes, regardless of dependencies.',
      ],
      correctOption: 1,
      explanation: 'React runs the returned cleanup function before executing the effect again on a subsequent render with changed dependencies, as well as when the component unmounts.',
    },
    {
      id: 'quiz_react_02',
      skill: 'React',
      topic: 'State Management & Immutability',
      question: 'How should you update an array in React state to ensure proper re-rendering?',
      options: [
        'Use `array.push(newItem)` and call `setState(array)`.',
        'Directly reassign the array index: `array[0] = newItem`.',
        'Create a new array copy using the spread operator: `setState([...prevArray, newItem])`.',
        'Call `array.splice(0, 0, newItem)` followed by `forceUpdate()`.',
      ],
      correctOption: 2,
      explanation: 'React relies on reference equality (`Object.is`) to detect state changes. Creating a new array with the spread operator returns a new reference, ensuring React triggers a re-render.',
    },
    {
      id: 'quiz_react_03',
      skill: 'React',
      topic: 'Performance Optimization',
      question: 'What is the primary difference between `useMemo` and `useCallback` in React?',
      options: [
        '`useMemo` caches a calculated value; `useCallback` caches a function definition.',
        '`useMemo` runs asynchronously; `useCallback` runs synchronously.',
        '`useMemo` is exclusively for server components; `useCallback` is for client components.',
        '`useMemo` creates an immutable ref; `useCallback` triggers re-renders on dependency changes.',
      ],
      correctOption: 0,
      explanation: '`useMemo(() => fn(), deps)` caches the computed return value of a function, whereas `useCallback(fn, deps)` caches the function definition itself between renders.',
    },
    {
      id: 'quiz_react_04',
      skill: 'React',
      topic: 'Context API & Prop Drilling',
      question: 'What performance drawback can occur when using a single large React Context for all application state?',
      options: [
        'Context values cannot be read inside custom hooks.',
        'Any component consuming the context re-renders whenever any property of the context value changes.',
        'The Context API disables React concurrent rendering mode.',
        'Context values are lost whenever a user navigates between routes.',
      ],
      correctOption: 1,
      explanation: 'When a context value object changes, all components that call `useContext` for that context will re-render, even if they only rely on a property that did not change.',
    },
    {
      id: 'quiz_react_05',
      skill: 'React',
      topic: 'Refs & DOM Interaction',
      question: 'Why should `useRef` be preferred over component state when storing values like timer IDs or mutable DOM elements?',
      options: [
        '`useRef` automatically cleans up resources when a timer fires.',
        'Updating a ref object (`ref.current = value`) does not trigger a component re-render.',
        '`useRef` forces an immediate synchronous re-render with the latest DOM node.',
        '`useRef` values persist across browser tab refreshes automatically.',
      ],
      correctOption: 1,
      explanation: 'Mutating `ref.current` is a side-effect that does not trigger a component re-render, making it ideal for transient data like interval handles and direct DOM node references.',
    },
  ],

  // 2. Node.js
  nodejs: [
    {
      id: 'quiz_nodejs_01',
      skill: 'Node.js',
      topic: 'Event Loop & Asynchronous Architecture',
      question: 'Which phase of the Node.js event loop executes callbacks scheduled by `setImmediate()`?',
      options: [
        'Timers phase',
        'Poll phase',
        'Check phase',
        'Close callbacks phase',
      ],
      correctOption: 2,
      explanation: '`setImmediate()` callbacks are executed in the "Check" phase of the event loop, immediately following the "Poll" phase.',
    },
    {
      id: 'quiz_nodejs_02',
      skill: 'Node.js',
      topic: 'Streams & Backpressure',
      question: 'What issue occurs if a readable stream produces data significantly faster than a writable stream can consume it without flow control?',
      options: [
        'CPU starvation leading to instantaneous thread termination.',
        'Memory bloat as unconsumed chunks accumulate in the buffer, causing high memory usage.',
        'The stream automatically serializes data to disk without notifying the application.',
        'Node.js throws an uncatchable `ERR_STREAM_OVERFLOW` exception.',
      ],
      correctOption: 1,
      explanation: 'Without backpressure management (such as utilizing `.pipe()` or `pipeline()`), data accumulates in RAM buffers, creating severe memory spikes and potential out-of-memory crashes.',
    },
    {
      id: 'quiz_nodejs_03',
      skill: 'Node.js',
      topic: 'Process & Microtasks',
      question: 'How does `process.nextTick()` differ from `Promise.resolve().then()` in Node.js?',
      options: [
        '`process.nextTick()` callbacks run before Promise microtasks at the transition of each phase.',
        '`process.nextTick()` runs on a separate worker thread pool via libuv.',
        '`Promise.then()` callbacks run immediately before any I/O callbacks, skipping nextTick.',
        '`process.nextTick()` can only be called from inside native C++ addons.',
      ],
      correctOption: 0,
      explanation: 'The `nextTickQueue` is prioritized over standard Promise microtask queues; Node.js resolves all `process.nextTick` callbacks before processing other microtasks.',
    },
    {
      id: 'quiz_nodejs_04',
      skill: 'Node.js',
      topic: 'Cluster & Multi-threading',
      question: 'What is the primary mechanism the Node.js `cluster` module uses to scale across multiple CPU cores?',
      options: [
        'Spawning lightweight green threads within a single V8 isolate.',
        'Forking child processes that share server ports via master process IPC.',
        'Compiling JavaScript JIT bytecode into native multithreaded machine code.',
        'Delegating incoming TCP socket connections to the operating system kernel epoll exclusively.',
      ],
      correctOption: 1,
      explanation: 'The `cluster` module forks child processes running isolated V8 instances that share the same listening TCP port through IPC handles managed by the master process.',
    },
    {
      id: 'quiz_nodejs_05',
      skill: 'Node.js',
      topic: 'Buffer & Binary Handling',
      question: 'Why should `Buffer.alloc(size)` be preferred over `Buffer.allocUnsafe(size)` for processing user input?',
      options: [
        '`Buffer.alloc` initializes allocated memory with zeros, preventing sensitive residual data leaks.',
        '`Buffer.allocUnsafe` limits buffer capacity to 1024 bytes.',
        '`Buffer.allocUnsafe` throws a deprecation error in modern Node.js versions.',
        '`Buffer.alloc` compresses binary strings automatically using gzip.',
      ],
      correctOption: 0,
      explanation: '`Buffer.allocUnsafe()` allocates uninitialized memory that may contain sensitive data previously stored in that RAM segment. `Buffer.alloc()` zeroes the memory securely.',
    },
  ],

  // 3. PostgreSQL
  postgresql: [
    {
      id: 'quiz_postgresql_01',
      skill: 'PostgreSQL',
      topic: 'Indexing & Performance',
      question: 'Which index type is default in PostgreSQL and best suited for equality and range queries (`<`, `<=`, `=`, `>=`, `>`)?',
      options: ['Hash index', 'B-Tree index', 'GIN index', 'BRIN index'],
      correctOption: 1,
      explanation: 'B-Tree is the default PostgreSQL index type and self-balances sorted keys to provide logarithmic time lookups for equality and range filters.',
    },
    {
      id: 'quiz_postgresql_02',
      skill: 'PostgreSQL',
      topic: 'Transactions & ACID',
      question: 'In PostgreSQL, which default transaction isolation level prevents dirty reads but allows non-repeatable reads?',
      options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
      correctOption: 1,
      explanation: 'PostgreSQL defaults to "Read Committed". A query inside a transaction only sees data committed before the query began, preventing dirty reads.',
    },
    {
      id: 'quiz_postgresql_03',
      skill: 'PostgreSQL',
      topic: 'Query Optimization & EXPLAIN',
      question: 'What does `EXPLAIN ANALYZE` do in PostgreSQL that standard `EXPLAIN` does not?',
      options: [
        'It translates SQL queries into procedural PL/pgSQL functions.',
        'It actually executes the query to return real runtime metrics alongside planner estimates.',
        'It automatically adds missing indexes to optimize the scanned tables.',
        'It checks the query for syntax errors without querying the disk.',
      ],
      correctOption: 1,
      explanation: '`EXPLAIN ANALYZE` executes the statement (so be cautious with mutations!) and shows actual execution times and row counts alongside the planner estimated costs.',
    },
    {
      id: 'quiz_postgresql_04',
      skill: 'PostgreSQL',
      topic: 'JSONB & Semi-Structured Data',
      question: 'Why is `JSONB` generally preferred over `JSON` in PostgreSQL for production querying?',
      options: [
        '`JSONB` stores data in a parsed binary format that supports indexing and faster lookups.',
        '`JSONB` retains exact whitespace and duplicate object keys.',
        '`JSONB` can store unlimited file uploads directly in table rows.',
        '`JSONB` does not require valid JSON syntax on insertion.',
      ],
      correctOption: 0,
      explanation: '`JSONB` parses JSON into a decomposed binary format upon storage. While slightly slower to insert, it supports GIN indexing and much faster processing.',
    },
    {
      id: 'quiz_postgresql_05',
      skill: 'PostgreSQL',
      topic: 'Vacuuming & MVCC',
      question: 'What is the primary function of PostgreSQL VACUUM in an MVCC architecture?',
      options: [
        'To flush the Write-Ahead Log (WAL) to cold cloud storage.',
        'To reclaim disk space occupied by dead row tuples created by UPDATE and DELETE operations.',
        'To restart the database daemon without dropping active connections.',
        'To re-encrypt tablespaces using updated cryptographic keys.',
      ],
      correctOption: 1,
      explanation: 'Because PostgreSQL MVCC creates new row versions on updates, deleted or superseded rows remain on disk as dead tuples until VACUUM marks their space as reusable.',
    },
  ],

  // 4. REST APIs
  restapis: [
    {
      id: 'quiz_restapis_01',
      skill: 'REST APIs',
      topic: 'HTTP Methods & Idempotency',
      question: 'Which of the following HTTP methods is defined as idempotent according to the HTTP specification?',
      options: ['POST', 'PATCH', 'PUT', 'CONNECT'],
      correctOption: 2,
      explanation: 'PUT is idempotent: executing multiple identical PUT requests with the same payload must produce the identical server state as executing it once.',
    },
    {
      id: 'quiz_restapis_02',
      skill: 'REST APIs',
      topic: 'HTTP Status Codes',
      question: 'Which HTTP status code should a REST API return when a request is syntactically valid, but business logic prevents execution (e.g. duplicate email)?',
      options: ['400 Bad Request', '409 Conflict', '422 Unprocessable Entity', '500 Internal Server Error'],
      correctOption: 1,
      explanation: '409 Conflict indicates the request could not be processed because of a conflict in the current state of the resource, such as uniqueness constraint collisions.',
    },
    {
      id: 'quiz_restapis_03',
      skill: 'REST APIs',
      topic: 'Pagination & API Design',
      question: 'Why is cursor-based pagination preferred over offset-based pagination (`OFFSET / LIMIT`) for rapidly changing datasets?',
      options: [
        'Cursor pagination eliminates skipped or duplicate items caused by insertions/deletions during traversal.',
        'Cursor pagination returns data in XML rather than JSON.',
        'Cursor pagination requires no database indexes.',
        'Cursor pagination allows clients to jump directly to arbitrary page numbers instantly.',
      ],
      correctOption: 0,
      explanation: 'Offset pagination shifts when new records are added or deleted, causing clients to see duplicate or missing records. Cursor pagination references a stable record identifier or timestamp.',
    },
    {
      id: 'quiz_restapis_04',
      skill: 'REST APIs',
      topic: 'Security & Rate Limiting',
      question: 'Which standard HTTP response headers communicate rate limit status to clients?',
      options: [
        '`X-Cache-Status` and `Age`',
        '`RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset`',
        '`Authorization` and `WWW-Authenticate`',
        '`Content-Security-Policy` and `Strict-Transport-Security`',
      ],
      correctOption: 1,
      explanation: 'Standard IETF rate-limiting headers convey total quota (`RateLimit-Limit`), remaining requests (`RateLimit-Remaining`), and cooldown timestamp (`RateLimit-Reset`).',
    },
    {
      id: 'quiz_restapis_05',
      skill: 'REST APIs',
      topic: 'Authentication & Tokens',
      question: 'What is the main security reason to store authentication JWTs in HttpOnly SameSite cookies rather than localStorage?',
      options: [
        'HttpOnly cookies are inaccessible to clientside JavaScript, protecting them from XSS exfiltration.',
        'LocalStorage has a strict 100-byte storage limit.',
        'HttpOnly cookies encrypt all SQL database connections automatically.',
        'LocalStorage cannot send Authorization headers across HTTPS.',
      ],
      correctOption: 0,
      explanation: 'HttpOnly cookies cannot be read or stolen by malicious JavaScript running in the browser, providing strong defense against Cross-Site Scripting (XSS) token theft.',
    },
  ],

  // 5. System Design
  systemdesign: [
    {
      id: 'quiz_systemdesign_01',
      skill: 'System Design',
      topic: 'Scalability & Caching',
      question: 'In a Cache-Aside (Lazy Loading) pattern, what steps does the application take on a read request?',
      options: [
        'Writes to cache first, then an asynchronous worker updates the database.',
        'Checks cache; if hit, returns data. If miss, reads from DB, writes to cache, and returns data.',
        'Always reads from database directly and flushes the entire cache.',
        'Replicates the database log directly into the cache engine without application code.',
      ],
      correctOption: 1,
      explanation: 'In Cache-Aside, the application attempts to read from cache first. On a cache miss, it reads from the primary database, populates the cache with the record, and returns the result.',
    },
    {
      id: 'quiz_systemdesign_02',
      skill: 'System Design',
      topic: 'CAP Theorem & Distributed Systems',
      question: 'According to the CAP Theorem, in the presence of a network partition (P), what trade-off must a distributed system make?',
      options: [
        'Choose between Encryption or Compression.',
        'Choose between Consistency (C) or Availability (A).',
        'Choose between Latency or Storage capacity.',
        'Choose between Relational integrity or Document flexibility.',
      ],
      correctOption: 1,
      explanation: 'Network partitions are inevitable in real-world distributed networks. When a partition occurs, the system must choose between returning consistent data or remaining available for writes/reads.',
    },
    {
      id: 'quiz_systemdesign_03',
      skill: 'System Design',
      topic: 'Load Balancing',
      question: 'What is the primary benefit of Consistent Hashing when distributing keys across a cluster of caching nodes?',
      options: [
        'When a node is added or removed, only `K / N` keys need to be remapped on average.',
        'It guarantees zero network latency for all cross-region traffic.',
        'It eliminates the need for hash functions entirely.',
        'It automatically encrypts all memory buffers in transit.',
      ],
      correctOption: 0,
      explanation: 'Standard modulo hashing (`hash(key) % N`) causes almost all keys to remap when node count `N` changes. Consistent hashing maps keys to a ring, minimizing key redistribution to `1/N`.',
    },
    {
      id: 'quiz_systemdesign_04',
      skill: 'System Design',
      topic: 'Message Queues & Decoupling',
      question: 'Why are asynchronous message brokers (e.g. RabbitMQ, Kafka) introduced between microservices?',
      options: [
        'To enforce strict synchronous RPC timing constraints.',
        'To decouple service lifecycles, smooth traffic spikes, and provide reliable message buffers.',
        'To eliminate the need for primary databases.',
        'To convert binary payloads into plain HTML.',
      ],
      correctOption: 1,
      explanation: 'Message queues buffer incoming bursts of work, decouple producer and consumer execution lifecycles, and prevent downstream service outages from cascading upstream.',
    },
    {
      id: 'quiz_systemdesign_05',
      skill: 'System Design',
      topic: 'Database Sharding',
      question: 'What is a "hot spot" problem in database horizontal sharding?',
      options: [
        'Physical server hardware overheating due to poor ventilation.',
        'A disproportionate amount of read/write traffic hitting a single shard due to uneven partition key distribution.',
        'Database connections expiring prematurely due to aggressive keepalive timeouts.',
        'Memory leaks caused by running unindexed full-table joins.',
      ],
      correctOption: 1,
      explanation: 'A hot spot occurs when a poorly chosen shard key (such as timestamps or celebrity user IDs) routes the vast majority of requests to one partition, bottlenecking the entire cluster.',
    },
  ],

  // 6. TypeScript
  typescript: [
    {
      id: 'quiz_typescript_01',
      skill: 'TypeScript',
      topic: 'Types vs Interfaces',
      question: 'Which feature is supported by TypeScript `interface` but NOT by a `type` alias?',
      options: [
        'Declaration merging (defining the same identifier across multiple declarations).',
        'Union type combinations (`A | B`).',
        'Primitive type aliasing (`type Name = string`).',
        'Tuple representations (`[number, string]`).',
      ],
      correctOption: 0,
      explanation: 'Interfaces support declaration merging: if multiple interfaces with the same name are declared, their fields merge into one. Type aliases throw duplicate identifier errors.',
    },
    {
      id: 'quiz_typescript_02',
      skill: 'TypeScript',
      topic: 'Generics & Constraints',
      question: 'What does `<T extends { id: string }>` specify in a generic TypeScript function definition?',
      options: [
        'Type `T` must be exactly `{ id: string }` and cannot have any other properties.',
        'Type `T` can be any type as long as it has at least a property `id` of type `string`.',
        'Type `T` is converted into a string identifier at runtime.',
        'Type `T` is an optional parameter that defaults to string.',
      ],
      correctOption: 1,
      explanation: 'The `extends` keyword in generic type parameter constraints enforces structural compatibility: `T` must possess at least the specified properties.',
    },
    {
      id: 'quiz_typescript_03',
      skill: 'TypeScript',
      topic: 'Utility Types',
      question: 'What does the utility type `Record<K, T>` construct?',
      options: [
        'An array of tuple pairs containing keys `K` and values `T`.',
        'An object type whose property keys are `K` and whose property values are `T`.',
        'A read-only snapshot of database table rows.',
        'A Promise resolving to an object of type `T`.',
      ],
      correctOption: 1,
      explanation: '`Record<K, T>` constructs an object type with property keys of type `K` and values of type `T`.',
    },
    {
      id: 'quiz_typescript_04',
      skill: 'TypeScript',
      topic: 'Type Narrowing & Guards',
      question: 'Which custom type guard return signature correctly informs TypeScript compiler that a variable `pet` is a `Dog`?',
      options: [
        '`function isDog(pet: Animal): Dog`',
        '`function isDog(pet: Animal): pet is Dog`',
        '`function isDog(pet: Animal): boolean as Dog`',
        '`function isDog(pet: Animal): typeof Dog`',
      ],
      correctOption: 1,
      explanation: 'Type predicate syntax `param is Type` instructs the TypeScript compiler to narrow the argument variable type within subsequent conditional execution branches.',
    },
    {
      id: 'quiz_typescript_05',
      skill: 'TypeScript',
      topic: 'Compiler Configuration & Strict Mode',
      question: 'What does the `noImplicitAny` compiler flag enforce in `tsconfig.json`?',
      options: [
        'Disallows using the `any` keyword anywhere in source code.',
        'Raises an error on expressions and declarations where TypeScript is forced to infer `any` implicitly.',
        'Replaces all `any` types with `unknown` during transpilation.',
        'Forbids importing untyped third-party JavaScript libraries.',
      ],
      correctOption: 1,
      explanation: '`noImplicitAny` raises compile-time errors whenever TypeScript cannot infer a specific type and would otherwise fall back silently to the permissive `any` type.',
    },
  ],

  // 7. Tailwind CSS
  tailwindcss: [
    {
      id: 'quiz_tailwindcss_01',
      skill: 'Tailwind CSS',
      topic: 'Utility-First Architecture',
      question: 'What is the primary architectural purpose of Tailwind utility classes over traditional BEM CSS?',
      options: [
        'To write scoped styling directly in markup without inventing arbitrary class names or bloated style sheets.',
        'To bundle CSS inside JavaScript runtime memory objects.',
        'To avoid using standard CSS properties like flexbox and grid.',
        'To automate server-side HTML rendering speed.',
      ],
      correctOption: 0,
      explanation: 'Tailwind provides composable low-level utility classes directly within markup, eliminating class-naming fatigue and keeping CSS bundle sizes constant even as apps grow.',
    },
    {
      id: 'quiz_tailwindcss_02',
      skill: 'Tailwind CSS',
      topic: 'Responsive Breakpoints',
      question: 'In Tailwind CSS, how does the mobile-first breakpoint modifier `md:flex` work?',
      options: [
        'Applies `display: flex` only on medium-sized screens and larger (`min-width: 768px`).',
        'Applies `display: flex` only on screens smaller than 768px.',
        'Applies `display: flex` exclusively on native mobile operating systems.',
        'Toggles flexbox on and off based on device orientation.',
      ],
      correctOption: 0,
      explanation: 'Tailwind uses mobile-first CSS media queries (`min-width`). `md:flex` applies on medium viewports (`768px` by default) and wider unless overridden by a larger breakpoint.',
    },
    {
      id: 'quiz_tailwindcss_03',
      skill: 'Tailwind CSS',
      topic: 'Arbitrary Values',
      question: 'How do you apply an arbitrary custom top margin of 17 pixels in Tailwind CSS without modifying configuration?',
      options: ['`mt-[17px]`', '`margin-top: 17px`', '`mt-17px`', '`custom-mt(17)`'],
      correctOption: 0,
      explanation: 'Tailwind supports arbitrary values using square bracket notation (e.g. `mt-[17px]`), generating the specific utility rule on-demand.',
    },
    {
      id: 'quiz_tailwindcss_04',
      skill: 'Tailwind CSS',
      topic: 'Dark Mode Strategy',
      question: 'When configuring Tailwind with the `selector` (or `class`) dark mode strategy, how is dark mode activated?',
      options: [
        'By adding a `dark` class to an ancestor element such as `<html>` or `<body>`.',
        'By checking the operating system battery level via Web APIs.',
        'By importing a separate `dark.css` stylesheet in `<head>`.',
        'By toggling CSS filter inversion on root SVG elements.',
      ],
      correctOption: 0,
      explanation: 'With class/selector dark mode, Tailwind activates `dark:` utility variants when a parent element in the DOM tree has the `dark` class applied.',
    },
    {
      id: 'quiz_tailwindcss_05',
      skill: 'Tailwind CSS',
      topic: 'Directives & Layering',
      question: 'What is the purpose of the `@layer components` directive in Tailwind CSS?',
      options: [
        'To declare reusable multi-utility component classes with appropriate CSS cascade precedence.',
        'To import React functional components into static CSS.',
        'To minify JavaScript modules during Webpack builds.',
        'To prevent browser CSS caching.',
      ],
      correctOption: 0,
      explanation: 'The `@layer components` directive tells Tailwind to position custom component classes in the components bucket so utility classes can still override them in markup.',
    },
  ],

  // 8. Web Vitals
  webvitals: [
    {
      id: 'quiz_webvitals_01',
      skill: 'Web Vitals',
      topic: 'Largest Contentful Paint (LCP)',
      question: 'What does Largest Contentful Paint (LCP) measure in Google Core Web Vitals?',
      options: [
        'The render time of the largest image or text block visible within the viewport.',
        'The total time required to download all JavaScript bundle assets.',
        'The delay before a user can first click an interactive input.',
        'The count of DOM mutations triggered during scroll operations.',
      ],
      correctOption: 0,
      explanation: 'LCP measures perceived page loading speed by recording when the largest image or text block in the viewport has completed rendering. Good LCP is under 2.5 seconds.',
    },
    {
      id: 'quiz_webvitals_02',
      skill: 'Web Vitals',
      topic: 'Cumulative Layout Shift (CLS)',
      question: 'What is the most common cause of poor Cumulative Layout Shift (CLS)?',
      options: [
        'Images or advertising iframes loaded without explicit `width` and `height` aspect ratio dimensions.',
        'Using CSS variables instead of inline hex colors.',
        'Serving WebP images instead of PNG.',
        'Having more than 3 external font files.',
      ],
      correctOption: 0,
      explanation: 'When images or dynamic banners lack explicit dimensions, the browser cannot reserve layout space before downloading them, causing content to violently jump down when loaded.',
    },
    {
      id: 'quiz_webvitals_03',
      skill: 'Web Vitals',
      topic: 'Interaction to Next Paint (INP)',
      question: 'What does Interaction to Next Paint (INP) measure?',
      options: [
        'Overall page responsiveness by assessing user interaction latency throughout the full page lifecycle.',
        'The time from initial HTML byte to first network socket creation.',
        'The duration of CSS animation keyframe transitions.',
        'The memory consumption of browser GPU shaders.',
      ],
      correctOption: 0,
      explanation: 'INP measures responsiveness by recording the longest latency between user inputs (clicks, keypresses, taps) and the visual frame update presented to the screen.',
    },
    {
      id: 'quiz_webvitals_04',
      skill: 'Web Vitals',
      topic: 'Resource Hints & Optimization',
      question: 'How does `<link rel="preload" as="image" href="...">` improve LCP for a hero background image?',
      options: [
        'It tells the browser to fetch critical hero image assets with high priority before discovering them in CSS.',
        'It compresses the hero image file on client GPUs.',
        'It converts PNG files into WebP format in memory.',
        'It hides the hero image until all web fonts are loaded.',
      ],
      correctOption: 0,
      explanation: 'Preloading informs the browser preload scanner to request the critical image asset immediately, preventing fetch delays caused by deep CSS parser discovery.',
    },
    {
      id: 'quiz_webvitals_05',
      skill: 'Web Vitals',
      topic: 'Long Tasks & Main Thread',
      question: 'What defines a "Long Task" on the browser main thread according to Web Performance standards?',
      options: [
        'Any task that executes continuously for more than 50 milliseconds.',
        'Any HTTP request that takes more than 1 second to return headers.',
        'Any CSS file containing more than 500 rules.',
        'Any JavaScript file larger than 1 megabyte.',
      ],
      correctOption: 0,
      explanation: 'A task running on the main thread for over 50ms is classified as a Long Task because it blocks user input handling, causing dropped animation frames and poor INP scores.',
    },
  ],

  // 9. UI/UX
  uiux: [
    {
      id: 'quiz_uiux_01',
      skill: 'UI/UX',
      topic: 'Visual Hierarchy & Typography',
      question: 'What is the primary purpose of visual hierarchy in modern SaaS interfaces?',
      options: [
        'To guide the user attention naturally toward primary actions and critical information without visual confusion.',
        'To maximize the total number of colorful buttons on a single view.',
        'To force all text elements to have the exact same font size and weight.',
        'To fill every pixel of whitespace with promotional widgets.',
      ],
      correctOption: 0,
      explanation: 'Visual hierarchy uses contrast, scale, spacing, and weight to guide the eye through content in order of importance, making next actions intuitive and reducing cognitive load.',
    },
    {
      id: 'quiz_uiux_02',
      skill: 'UI/UX',
      topic: 'Accessibility (a11y) & Contrast',
      question: 'According to WCAG AA guidelines, what is the minimum contrast ratio required for normal body text against its background?',
      options: ['3:1', '4.5:1', '7:1', '10:1'],
      correctOption: 1,
      explanation: 'WCAG 2.1 Level AA mandates a contrast ratio of at least 4.5:1 for normal text (under 18pt or 14pt bold) to ensure readability for users with moderate visual impairments.',
    },
    {
      id: 'quiz_uiux_03',
      skill: 'UI/UX',
      topic: 'Form Design & Error Prevention',
      question: 'Which pattern provides the best user experience when validating user inputs in forms?',
      options: [
        'Inline validation feedback displayed after user blurs or completes an input field.',
        'Displaying error alerts immediately on the first keystroke before typing finishes.',
        'Hiding the submit button until all fields are valid without indicating which field failed.',
        'Clearing all input fields whenever validation fails.',
      ],
      correctOption: 0,
      explanation: 'Validating on blur (or after meaningful pause) gives users the opportunity to finish typing before seeing feedback, avoiding premature jarring error messages.',
    },
    {
      id: 'quiz_uiux_04',
      skill: 'UI/UX',
      topic: 'Progressive Disclosure',
      question: 'What is the core principle of "Progressive Disclosure" in UX design?',
      options: [
        'Presenting only essential information initially, while revealing complex details or advanced controls on demand.',
        'Disclosing all database schemas to end users upon login.',
        'Showing all application features on the home page simultaneously.',
        'Delaying user authentication until after payment processing.',
      ],
      correctOption: 0,
      explanation: 'Progressive disclosure keeps interfaces uncluttered and easy to learn by deferring advanced options to secondary views, expandable sections, or tooltips.',
    },
    {
      id: 'quiz_uiux_05',
      skill: 'UI/UX',
      topic: 'Empty States & Guidance',
      question: 'What should an effective empty state provide when a user visits a newly created account dashboard?',
      options: [
        'A blank blank screen with no text.',
        'A clear explanation of what will live there, paired with an obvious primary call-to-action to create or import first data.',
        'A modal popup blocking navigation until credit card details are entered.',
        'A 404 Not Found error page.',
      ],
      correctOption: 1,
      explanation: 'An effective empty state educates users about the value of the feature and provides an immediate, frictionless CTA to get started (e.g. "Upload your first resume").',
    },
  ],

  // 10. SQL
  sql: [
    {
      id: 'quiz_sql_01',
      skill: 'SQL',
      topic: 'Joins & Relational Algebra',
      question: 'What is the key difference between an `INNER JOIN` and a `LEFT JOIN` in SQL?',
      options: [
        '`INNER JOIN` returns only matching rows from both tables; `LEFT JOIN` returns all rows from the left table and matched rows from the right table.',
        '`INNER JOIN` modifies table schemas; `LEFT JOIN` creates read-only views.',
        '`LEFT JOIN` is only supported on indexed primary keys.',
        '`INNER JOIN` sorts output rows alphabetically; `LEFT JOIN` sorts chronologically.',
      ],
      correctOption: 0,
      explanation: 'An `INNER JOIN` discards rows that do not have matches in both tables, whereas `LEFT JOIN` preserves every row from the left table, filling missing right-side columns with NULL.',
    },
    {
      id: 'quiz_sql_02',
      skill: 'SQL',
      topic: 'Aggregation & Filtering',
      question: 'When should `HAVING` be used instead of `WHERE` in an SQL query?',
      options: [
        'To filter grouped rows based on aggregate function calculations (e.g. `COUNT(*) > 5`).',
        'To filter rows before they enter table joins.',
        'To perform pattern matching using regular expressions.',
        'To limit the total number of records returned to the client.',
      ],
      correctOption: 0,
      explanation: '`WHERE` filters individual rows before grouping takes place. `HAVING` filters aggregated group records produced by `GROUP BY`.',
    },
    {
      id: 'quiz_sql_03',
      skill: 'SQL',
      topic: 'Window Functions',
      question: 'What does `ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC)` calculate?',
      options: [
        'A unique sequential integer rank for each employee within their specific department ordered by salary.',
        'The total salary expenditure for each department.',
        'The total count of departments in the company.',
        'The average salary of all employees across the entire database.',
      ],
      correctOption: 0,
      explanation: 'Window function `PARTITION BY` divides rows into groups (departments) and assigns a sequential integer `ROW_NUMBER()` starting at 1 within each group ordered by salary.',
    },
    {
      id: 'quiz_sql_04',
      skill: 'SQL',
      topic: 'Subqueries & CTEs',
      question: 'What is a Common Table Expression (CTE) defined with the `WITH` clause primarily used for?',
      options: [
        'Creating modular, readable temporary result sets that can be referenced in the main query.',
        'Permanently writing indexes to the database hard disk.',
        'Disabling database transactions for faster bulk imports.',
        'Compressing table columns into binary blobs.',
      ],
      correctOption: 0,
      explanation: 'CTEs (`WITH cte_name AS (...)`) structure complex queries into readable, composable steps and support recursive data structure traversal.',
    },
    {
      id: 'quiz_sql_05',
      skill: 'SQL',
      topic: 'Transactions & Concurrency',
      question: 'What does the SQL command `ROLLBACK` accomplish during a transaction?',
      options: [
        'Aborts the current transaction and undoes all modifications made since the transaction started.',
        'Restores the database to its initial installation state.',
        'Re-executes the last failed query with elevated administrator privileges.',
        'Deletes the oldest backup snapshot from disk.',
      ],
      correctOption: 0,
      explanation: '`ROLLBACK` cancels the transaction block, reverting all uncommitted inserts, updates, or deletes back to the prior consistent database state.',
    },
  ],

  // 11. Python
  python: [
    {
      id: 'quiz_python_01',
      skill: 'Python',
      topic: 'Memory & Data Structures',
      question: 'In Python, what happens when you pass a list to a function and modify it inside with `.append()`?',
      options: [
        'The original list outside the function is modified because Python passes object references.',
        'A `CopyOnWriteError` is raised by the runtime.',
        'Python creates an isolated copy; the outside list remains unchanged.',
        'The function returns a new tuple containing the appended item.',
      ],
      correctOption: 0,
      explanation: 'In Python, arguments are passed by assignment (object reference). Because lists are mutable, in-place methods like `.append()` alter the underlying object referenced in the caller scope.',
    },
    {
      id: 'quiz_python_02',
      skill: 'Python',
      topic: 'Generators & Iteration',
      question: 'What is the primary memory advantage of using a generator expression with `yield` instead of a list comprehension?',
      options: [
        'Generators compute items lazily on demand, using constant memory regardless of dataset size.',
        'Generators compile Python code to C++ binaries.',
        'Generators automatically parallelize iteration across all CPU cores.',
        'Generators cache all previous items in disk swap space.',
      ],
      correctOption: 0,
      explanation: 'Generators produce values one-at-a-time using `yield` and preserve execution state, avoiding allocating memory for the entire collection upfront.',
    },
    {
      id: 'quiz_python_03',
      skill: 'Python',
      topic: 'Decorators & Closures',
      question: 'What is a Python decorator at its core?',
      options: [
        'A callable that takes another function as an argument and extends or alters its behavior without modifying source code.',
        'A graphical user interface widget library.',
        'A compiler flag that enables strict typing.',
        'A syntax shortcut for creating multi-threaded classes.',
      ],
      correctOption: 0,
      explanation: 'A decorator is a higher-order function that accepts a target function, wraps it inside an inner function closure, and returns the wrapper callable.',
    },
    {
      id: 'quiz_python_04',
      skill: 'Python',
      topic: 'Concurrency & GIL',
      question: 'What is the Global Interpreter Lock (GIL) in CPython?',
      options: [
        'A mutex mechanism that prevents multiple native threads from executing Python bytecodes simultaneously.',
        'A security sandbox that disables file system writes in production.',
        'A database lock that protects SQLite connections from deadlocks.',
        'An encryption layer that protects source code files on disk.',
      ],
      correctOption: 0,
      explanation: 'The CPython GIL is a mutex that prevents race conditions in memory management by ensuring only one thread executes Python bytecode at any given moment.',
    },
    {
      id: 'quiz_python_05',
      skill: 'Python',
      topic: 'Context Managers',
      question: 'Which dunder methods must an object implement to support the `with` statement in Python?',
      options: [
        '`__enter__` and `__exit__`',
        '`__open__` and `__close__`',
        '`__start__` and `__stop__`',
        '`__init__` and `__del__`',
      ],
      correctOption: 0,
      explanation: 'Context managers require `__enter__()` to establish resources and `__exit__()` to guarantee resource cleanup even if exceptions occur inside the `with` block.',
    },
  ],

  // 12. PowerBI
  powerbi: [
    {
      id: 'quiz_powerbi_01',
      skill: 'PowerBI',
      topic: 'DAX & Calculated Columns vs Measures',
      question: 'What is the fundamental difference between a Calculated Column and a Measure in DAX?',
      options: [
        'Calculated Columns are evaluated row-by-row during data refresh and stored in memory; Measures are calculated dynamically on the fly based on report filter context.',
        'Calculated Columns can only contain numbers; Measures can only contain text.',
        'Measures permanently increase data file size on disk; Calculated Columns do not.',
        'Calculated Columns cannot be used in visual charts.',
      ],
      correctOption: 0,
      explanation: 'Calculated columns consume RAM because values are stored in table rows upon refresh. Measures calculate aggregations dynamically in response to slicers and visual filters.',
    },
    {
      id: 'quiz_powerbi_02',
      skill: 'PowerBI',
      topic: 'DAX Filter Context',
      question: 'What does the DAX function `CALCULATE(SUM(Sales[Amount]), ALL(Regions))` do?',
      options: [
        'Computes total sales amount while removing any user filters applied to the `Regions` table or column.',
        'Deletes the `Regions` table from the data model.',
        'Filters sales to only include regions with above-average sales.',
        'Multiplies sales amount by the total count of regions.',
      ],
      correctOption: 0,
      explanation: '`CALCULATE` modifies filter context. When paired with `ALL()`, it clears existing filters from the specified column, making it ideal for calculating totals and percentages.',
    },
    {
      id: 'quiz_powerbi_03',
      skill: 'PowerBI',
      topic: 'Data Modeling & Star Schema',
      question: 'Why is a Star Schema recommended over a normalized 3NF snowflake schema in Power BI VertiPaq engine?',
      options: [
        'It minimizes join complexity, boosting compression and in-memory columnar query performance.',
        'It eliminates the need for primary keys.',
        'It allows importing tables without defining column data types.',
        'It bypasses DAX calculation limits.',
      ],
      correctOption: 0,
      explanation: 'VertiPaq columnar engine compresses and queries star schemas (central fact table surrounded by dimension tables) with optimal speed and simplified relationship paths.',
    },
    {
      id: 'quiz_powerbi_04',
      skill: 'PowerBI',
      topic: 'Power Query & M Language',
      question: 'What is Query Folding in Power Query?',
      options: [
        'The ability of Power Query to translate transformation steps into a single SQL query executed directly on the source database server.',
        'A feature that minimizes window size when editing dashboards.',
        'A compression algorithm that zips CSV files before loading.',
        'The process of converting wide tables into narrow key-value rows.',
      ],
      correctOption: 0,
      explanation: 'Query folding pushes data transformation steps (filtering, joins, grouping) back to the source database engine, drastically reducing network transmission and local memory load.',
    },
    {
      id: 'quiz_powerbi_05',
      skill: 'PowerBI',
      topic: 'Row-Level Security (RLS)',
      question: 'How does Row-Level Security (RLS) restrict data access in Power BI?',
      options: [
        'By applying DAX filter expressions to roles, limiting which data rows assigned users can view in published reports.',
        'By password-protecting individual visual charts.',
        'By encrypting table columns with unique asymmetric keys for each employee.',
        'By hiding pages in report navigation.',
      ],
      correctOption: 0,
      explanation: 'RLS uses DAX filter rules assigned to security roles (e.g. `[Country] = "Canada"`) to restrict which rows a user can see in reports based on their user identity.',
    },
  ],

  // 13. Statistics
  statistics: [
    {
      id: 'quiz_statistics_01',
      skill: 'Statistics',
      topic: 'Descriptive Measures & Skewness',
      question: 'If a dataset is heavily right-skewed (positively skewed), what is the typical relationship between the mean, median, and mode?',
      options: [
        'Mean > Median > Mode',
        'Mode > Median > Mean',
        'Mean = Median = Mode',
        'Median > Mean > Mode',
      ],
      correctOption: 0,
      explanation: 'In right-skewed distributions, extreme high outliers pull the Mean upward toward the right tail, so Mean > Median > Mode.',
    },
    {
      id: 'quiz_statistics_02',
      skill: 'Statistics',
      topic: 'Hypothesis Testing & P-Values',
      question: 'What does a p-value of 0.03 mean when testing a null hypothesis at an alpha level of 0.05?',
      options: [
        'There is a 3% probability of observing data this extreme if the null hypothesis is true; reject the null hypothesis.',
        'There is a 97% probability that the null hypothesis is true.',
        'The alternative hypothesis is proven true with 100% certainty.',
        'The sample size was too small to draw conclusions.',
      ],
      correctOption: 0,
      explanation: 'Because p (0.03) < alpha (0.05), we reject the null hypothesis: assuming the null hypothesis were true, such extreme results would occur only 3% of the time.',
    },
    {
      id: 'quiz_statistics_03',
      skill: 'Statistics',
      topic: 'Central Limit Theorem (CLT)',
      question: 'What does the Central Limit Theorem state regarding the sampling distribution of sample means?',
      options: [
        'As sample size increases, the distribution of sample means approaches a normal distribution, regardless of the underlying population shape.',
        'All populations become normally distributed when observed over time.',
        'The variance of a sample is always identical to the population variance.',
        'Outliers automatically cancel out when data is standardized.',
      ],
      correctOption: 0,
      explanation: 'The CLT guarantees that the sampling distribution of the mean will be approximately normal given a sufficiently large sample size (typically n >= 30), regardless of population distribution.',
    },
    {
      id: 'quiz_statistics_04',
      skill: 'Statistics',
      topic: 'Type I and Type II Errors',
      question: 'What constitutes a Type I error in statistical hypothesis testing?',
      options: [
        'Rejecting a true null hypothesis (false positive).',
        'Failing to reject a false null hypothesis (false negative).',
        'Using an incorrect formula to compute standard deviation.',
        'Selecting an unrepresentative sample from the target population.',
      ],
      correctOption: 0,
      explanation: 'A Type I error is a false positive: detecting an effect or difference that does not actually exist and wrongly rejecting a true null hypothesis.',
    },
    {
      id: 'quiz_statistics_05',
      skill: 'Statistics',
      topic: 'Correlation vs Causation',
      question: 'What does a Pearson correlation coefficient of r = 0.85 between two variables X and Y indicate?',
      options: [
        'A strong positive linear association between X and Y, but not proof of causal relationship.',
        'Variable X causes variable Y to increase 85% of the time.',
        '85% of data points fall exactly on the regression line.',
        'The variables have identical standard deviations.',
      ],
      correctOption: 0,
      explanation: 'Pearson correlation measures linear association strength. A high correlation (0.85) indicates that as X increases, Y tends to increase, but correlation does not imply causation.',
    },
  ],

  // 14. Data Modeling
  datamodeling: [
    {
      id: 'quiz_datamodeling_01',
      skill: 'Data Modeling',
      topic: 'Normalization & 3NF',
      question: 'What condition must a database schema satisfy to achieve Third Normal Form (3NF)?',
      options: [
        'It must be in 2NF and have no transitive dependencies between non-key attributes.',
        'It must combine all tables into a single wide denormalized table.',
        'Every column must store JSON arrays.',
        'All primary keys must be composite keys.',
      ],
      correctOption: 0,
      explanation: '3NF requires that all non-key attributes depend only on the primary key, the whole primary key, and nothing but the primary key (no transitive dependencies: A -> B -> C).',
    },
    {
      id: 'quiz_datamodeling_02',
      skill: 'Data Modeling',
      topic: 'Fact vs Dimension Tables',
      question: 'In dimensional data modeling, what do Fact tables typically contain?',
      options: [
        'Quantitative numerical measurements (metrics) alongside foreign keys to dimension tables.',
        'Descriptive attributes like employee names and product categories.',
        'Database configuration parameters and user credentials.',
        'Server access log files.',
      ],
      correctOption: 0,
      explanation: 'Fact tables record business events (e.g. sales transactions) containing numerical metrics (amount, quantity) paired with foreign keys linking to surrounding descriptive dimension tables.',
    },
    {
      id: 'quiz_datamodeling_03',
      skill: 'Data Modeling',
      topic: 'Slowly Changing Dimensions (SCD)',
      question: 'How does an SCD Type 2 handle an update to a dimension record (e.g. customer address change)?',
      options: [
        'It creates a new row with a new surrogate key, marking previous records with an effective end date or active flag.',
        'It overwrites the existing row, discarding history.',
        'It adds a new column to the table for every address change.',
        'It rejects the update if historical sales exist.',
      ],
      correctOption: 0,
      explanation: 'SCD Type 2 preserves complete historical tracking by creating a new record version with start/end validity dates, enabling point-in-time historical reporting.',
    },
    {
      id: 'quiz_datamodeling_04',
      skill: 'Data Modeling',
      topic: 'Surrogate Keys',
      question: 'Why are surrogate keys (such as auto-incrementing integers or UUIDs) preferred over natural business keys as primary keys?',
      options: [
        'They shield database relationships from business changes (e.g. passport number formats or email address renames).',
        'They eliminate the need to index foreign key columns.',
        'They compress table rows to zero bytes.',
        'They automatically enforce database encryption.',
      ],
      correctOption: 0,
      explanation: 'Natural keys (like emails or SSNs) can change or contain sensitive personal data. Surrogate keys provide stable, immutable, performant identifiers for relational joins.',
    },
    {
      id: 'quiz_datamodeling_05',
      skill: 'Data Modeling',
      topic: 'Granularity',
      question: 'What does "grain" represent in dimensional data modeling?',
      options: [
        'The exact level of detail represented by a single row in a fact table.',
        'The physical sector size of the database hard drive.',
        'The number of indexes attached to a table.',
        'The memory buffer allocated for table scans.',
      ],
      correctOption: 0,
      explanation: 'The grain defines what an individual row in a table represents (e.g. "one row per item scanned at a retail checkout" vs "one row per daily store summary").',
    },
  ],

  // 15. FastAPI
  fastapi: [
    {
      id: 'quiz_fastapi_01',
      skill: 'FastAPI',
      topic: 'Dependency Injection & Async Endpoints',
      question: 'How is dependency injection implemented in FastAPI route handler functions?',
      options: [
        'Using the `Depends()` parameter in route signature declarations.',
        'By decorating handler functions with `@inject`.',
        'By importing global variables from a central container file.',
        'By creating custom middleware for each parameter.',
      ],
      correctOption: 0,
      explanation: 'FastAPI features a powerful dependency injection system using `Depends(dependency_callable)` in route arguments to provide db sessions, security scopes, and services.',
    },
    {
      id: 'quiz_fastapi_02',
      skill: 'FastAPI',
      topic: 'Pydantic Validation',
      question: 'What happens when a client sends an invalid request body payload to a FastAPI endpoint with a Pydantic model?',
      options: [
        'FastAPI automatically returns a 422 Unprocessable Entity error with detailed field-level validation issues.',
        'FastAPI crashes with an uncaught Python TypeError.',
        'FastAPI strips the invalid fields and proceeds with null values.',
        'FastAPI forwards the request to an external fallback proxy.',
      ],
      correctOption: 0,
      explanation: 'FastAPI leverages Pydantic for request parsing. When validation fails, it intercepts the error and returns a structured 422 HTTP response detailing exactly which fields failed.',
    },
    {
      id: 'quiz_fastapi_03',
      skill: 'FastAPI',
      topic: 'Background Tasks',
      question: 'How should you schedule a lightweight fire-and-forget task (such as sending a welcome email) in FastAPI?',
      options: [
        'Add `background_tasks: BackgroundTasks` to the endpoint and call `background_tasks.add_task(send_email)`.',
        'Call `os.fork()` inside the route function.',
        'Create a daemon thread that sleeps for 5 seconds.',
        'Run the task synchronously inside the route return statement.',
      ],
      correctOption: 0,
      explanation: 'FastAPI provides built-in `BackgroundTasks` to queue functions that run after returning the HTTP response, without blocking client response times.',
    },
    {
      id: 'quiz_fastapi_04',
      skill: 'FastAPI',
      topic: 'Async vs Sync Handlers',
      question: 'What happens when you declare a regular synchronous route function (`def endpoint():`) in FastAPI instead of `async def`?',
      options: [
        'FastAPI runs it in an external threadpool so it does not block the main async event loop.',
        'FastAPI throws a compile-time syntax exception.',
        'It blocks all other incoming network requests completely.',
        'FastAPI compiles the Python code into WebAssembly.',
      ],
      correctOption: 0,
      explanation: 'When defined with standard `def`, FastAPI executes the endpoint within an external threadpool, safely isolating blocking I/O calls from stalling the main event loop.',
    },
    {
      id: 'quiz_fastapi_05',
      skill: 'FastAPI',
      topic: 'OpenAPI & Swagger Documentation',
      question: 'Where does FastAPI automatically serve interactive Swagger UI documentation by default?',
      options: ['`/docs`', '`/api/swagger`', '`/spec.html`', '`/openapi.json`'],
      correctOption: 0,
      explanation: 'FastAPI inspects route signatures and Pydantic models to generate an OpenAPI specification and hosts interactive Swagger UI at `/docs` (and ReDoc at `/redoc`).',
    },
  ],

  // 16. AsyncIO
  asyncio: [
    {
      id: 'quiz_asyncio_01',
      skill: 'AsyncIO',
      topic: 'Event Loop & Coroutines',
      question: 'What is returned when you call an `async def` function in Python without `await`?',
      options: [
        'A coroutine object that has not started execution yet.',
        'The final resolved return value.',
        'A background thread handle.',
        'A boolean indicating if the function is valid.',
      ],
      correctOption: 0,
      explanation: 'Calling an `async def` function creates and returns a coroutine object. It must be awaited or scheduled on the event loop (e.g. `create_task`) to actually execute.',
    },
    {
      id: 'quiz_asyncio_02',
      skill: 'AsyncIO',
      topic: 'Concurrent Execution & Gather',
      question: 'What is the function of `asyncio.gather(*aws)` in Python?',
      options: [
        'Runs awaitable objects concurrently on the event loop and returns an aggregated list of their results in order.',
        'Distributes coroutines across multiple physical servers.',
        'Forces coroutines to execute in strictly serialized sequential order.',
        'Cancels all coroutines if one takes more than 100 milliseconds.',
      ],
      correctOption: 0,
      explanation: '`asyncio.gather` schedules multiple awaitables concurrently, waiting until all complete and returning their results in the order they were provided.',
    },
    {
      id: 'quiz_asyncio_03',
      skill: 'AsyncIO',
      topic: 'Blocking Calls & Event Loop Stalling',
      question: 'Why is calling `time.sleep(5)` hazardous inside an `async def` coroutine in an async application?',
      options: [
        'It synchronously blocks the entire OS thread, halting the event loop and preventing all other concurrent coroutines from executing for 5 seconds.',
        'It throws an unhandled `AsyncSleepException`.',
        'It causes the Python garbage collector to crash.',
        'It drops all active TCP socket connections immediately.',
      ],
      correctOption: 0,
      explanation: '`time.sleep()` is blocking. In a single-threaded async event loop, blocking the thread prevents the loop from processing any other coroutines. `await asyncio.sleep(5)` must be used instead.',
    },
    {
      id: 'quiz_asyncio_04',
      skill: 'AsyncIO',
      topic: 'Task Cancellation',
      question: 'How do you handle graceful cancellation of an asyncio Task?',
      options: [
        'Catch `asyncio.CancelledError` inside the coroutine and execute cleanup actions before re-raising or returning.',
        'Call `task.terminate()` from another thread.',
        'Restart the Python interpreter process.',
        'Set `task.cancelled = True` as an attribute.',
      ],
      correctOption: 0,
      explanation: 'When `task.cancel()` is called, an `asyncio.CancelledError` is injected into the coroutine at its next `await` point, allowing `try...finally` or `except` cleanup blocks to run.',
    },
    {
      id: 'quiz_asyncio_05',
      skill: 'AsyncIO',
      topic: 'Synchronization Primitives',
      question: 'Which synchronization primitive is designed to limit the number of simultaneous concurrent coroutines accessing a shared resource (e.g. rate-limited external API)?',
      options: ['`asyncio.Semaphore`', '`asyncio.Event`', '`asyncio.Condition`', '`asyncio.Queue`'],
      correctOption: 0,
      explanation: 'An `asyncio.Semaphore(value)` maintains an internal counter, permitting up to `value` concurrent coroutines to acquire the lock before blocking subsequent requests.',
    },
  ],

  // 17. Docker
  docker: [
    {
      id: 'quiz_docker_01',
      skill: 'Docker',
      topic: 'Containerization vs Virtual Machines',
      question: 'What is the primary difference between a Docker container and a traditional Virtual Machine (VM)?',
      options: [
        'Containers share the host operating system kernel and isolate processes; VMs run a complete guest OS on top of a hypervisor.',
        'Containers require hardware virtualization support (VT-x); VMs do not.',
        'VMs start up in milliseconds; containers take minutes to boot.',
        'Containers can only run Python applications.',
      ],
      correctOption: 0,
      explanation: 'Containers leverage host kernel namespaces and cgroups to isolate processes with minimal overhead, whereas VMs virtualize hardware and run heavy guest operating systems.',
    },
    {
      id: 'quiz_docker_02',
      skill: 'Docker',
      topic: 'Multi-Stage Builds',
      question: 'What is the main benefit of utilizing multi-stage builds in a Dockerfile?',
      options: [
        'Minimizing final production image size by separating build tools/compilers from runtime environments.',
        'Allowing a single container to run multiple operating systems concurrently.',
        'Automatically publishing images to Docker Hub during build.',
        'Enabling live reload of source code in production containers.',
      ],
      correctOption: 0,
      explanation: 'Multi-stage builds use multiple `FROM` instructions, allowing artifacts compiled in builder stages to be copied into a lean runtime base image without carrying build dependencies.',
    },
    {
      id: 'quiz_docker_03',
      skill: 'Docker',
      topic: 'Layer Caching Optimization',
      question: 'Why should `COPY package.json package-lock.json ./` and `RUN npm install` precede `COPY . .` in a Node.js Dockerfile?',
      options: [
        'To leverage Docker layer caching so dependencies are only reinstalled when dependency manifests change, speeding up rebuilds.',
        'Because npm throws an error if application source code is present before installation.',
        'To ensure source files are encrypted by the Docker build engine.',
        'To reduce RAM usage during container execution.',
      ],
      correctOption: 0,
      explanation: 'Docker caches layers based on file modifications. Copying dependency files first allows Docker to reuse the cached `RUN npm install` layer as long as dependencies have not changed.',
    },
    {
      id: 'quiz_docker_04',
      skill: 'Docker',
      topic: 'Volume Persistence',
      question: 'What happens to data stored inside a container writable layer when the container is deleted without volumes?',
      options: [
        'The data is permanently lost with the container writable layer.',
        'The data is automatically archived in host `/var/log/docker`.',
        'Docker syncs the data to the base image automatically.',
        'The host operating system prompts to restore the deleted files.',
      ],
      correctOption: 0,
      explanation: 'Container writable layers are ephemeral. When a container is removed, all state written outside mounted Docker volumes or bind mounts is permanently destroyed.',
    },
    {
      id: 'quiz_docker_05',
      skill: 'Docker',
      topic: 'Security & Non-Root Execution',
      question: 'Why is it considered a major security risk to run containerized application processes as root (`UID 0`)?',
      options: [
        'If a container breakout vulnerability occurs, the attacker gains root privileges on the host operating system.',
        'The Linux kernel throttles root network packets to 100 KB/s.',
        'Docker images with root users cannot be pushed to private registries.',
        'Root processes cannot bind to ports below 1024.',
      ],
      correctOption: 0,
      explanation: 'Processes running as root inside a container share the host kernel root namespace. Any container breakout exploit grants immediate root-level compromise of the host system.',
    },
  ],

  // 18. PyTorch
  pytorch: [
    {
      id: 'quiz_pytorch_01',
      skill: 'PyTorch',
      topic: 'Tensors & Autograd',
      question: 'In PyTorch, what flag must be set to `True` on a Tensor to track operations and enable automatic gradient computation?',
      options: ['`requires_grad`', '`track_history`', '`is_gradient`', '`autograd_mode`'],
      correctOption: 0,
      explanation: 'Setting `tensor.requires_grad = True` tells PyTorch to record every mathematical operation on that tensor in a directed acyclic graph for backpropagation.',
    },
    {
      id: 'quiz_pytorch_02',
      skill: 'PyTorch',
      topic: 'Training Loops & Zeroing Gradients',
      question: 'Why must `optimizer.zero_grad()` be called at the beginning of each training step in PyTorch?',
      options: [
        'PyTorch accumulates gradients by default on subsequent `backward()` calls.',
        'To reset model weights back to random initialization.',
        'To flush CUDA GPU VRAM memory buffers.',
        'To prevent learning rate decay from triggering early.',
      ],
      correctOption: 0,
      explanation: 'Because gradients accumulate in `.grad` buffers to support multi-step gradient accumulation, failing to call `optimizer.zero_grad()` compounds gradients from prior batches.',
    },
    {
      id: 'quiz_pytorch_03',
      skill: 'PyTorch',
      topic: 'Inference Mode & torch.no_grad()',
      question: 'What is the primary benefit of wrapping model evaluation inside `with torch.no_grad():`?',
      options: [
        'It disables gradient calculation, significantly reducing memory consumption and speeding up inference.',
        'It prevents the model from generating random numbers.',
        'It converts floating point tensors to integers.',
        'It compiles the neural network to TorchScript bytecode.',
      ],
      correctOption: 0,
      explanation: '`torch.no_grad()` deactivates autograd history tracking, eliminating the computational overhead and memory storage of activation graphs during validation or inference.',
    },
    {
      id: 'quiz_pytorch_04',
      skill: 'PyTorch',
      topic: 'nn.Module Architecture',
      question: 'Which method must every custom neural network subclass of `torch.nn.Module` implement?',
      options: ['`forward()`', '`backward()`', '`train_step()`', '`predict()`'],
      correctOption: 0,
      explanation: 'Subclasses of `nn.Module` must define the `forward(*inputs)` method, which specifies the computation pipeline executed when the module is invoked on input tensors.',
    },
    {
      id: 'quiz_pytorch_05',
      skill: 'PyTorch',
      topic: 'DataLoaders & Batching',
      question: 'What is the role of `num_workers` in a PyTorch `DataLoader`?',
      options: [
        'Specifies how many subprocesses to use for asynchronous data loading and preprocessing from disk to RAM.',
        'Defines the number of GPU devices used for distributed training.',
        'Sets the number of epochs to train the model.',
        'Controls the batch size of incoming tensors.',
      ],
      correctOption: 0,
      explanation: '`num_workers > 0` enables multi-process data loading, allowing background CPU workers to fetch and transform upcoming batches while the GPU executes training.',
    },
  ],

  // 19. LLM APIs
  llmapis: [
    {
      id: 'quiz_llmapis_01',
      skill: 'LLM APIs',
      topic: 'Inference Parameters',
      question: 'What effect does increasing the `temperature` parameter (e.g. from 0.1 to 0.9) have on LLM API completions?',
      options: [
        'It flattens the probability distribution over tokens, yielding more creative and diverse responses.',
        'It speeds up API token streaming throughput.',
        'It strictly guarantees 100% factual accuracy.',
        'It increases the maximum output token limit of the model.',
      ],
      correctOption: 0,
      explanation: 'Lower temperature concentrates probability on the top tokens (making output deterministic), while higher temperature flattens distribution, increasing randomness and creative variation.',
    },
    {
      id: 'quiz_llmapis_02',
      skill: 'LLM APIs',
      topic: 'Structured Outputs & JSON Mode',
      question: 'How do modern LLM APIs guarantee that model completions strictly adhere to a required JSON schema?',
      options: [
        'By utilizing constrained decoding algorithms (grammar-based sampling) during token generation.',
        'By running regex replacement on the generated raw text string after generation finishes.',
        'By prompting the model in all capital letters.',
        'By converting user queries into SQL insert statements.',
      ],
      correctOption: 0,
      explanation: 'Constrained decoding forces the model tokenizer at each step to only sample tokens that are syntactically valid according to the compiled context-free grammar or JSON schema.',
    },
    {
      id: 'quiz_llmapis_03',
      skill: 'LLM APIs',
      topic: 'Tokenization & Context Limits',
      question: 'In Large Language Model APIs, what roughly is a "token"?',
      options: [
        'A sequence of characters (averaging ~4 English characters or ~0.75 words) representing subword fragments in the model vocabulary.',
        'A cryptographic session key generated for user authentication.',
        'A single row in an external vector database.',
        'One second of audio or visual processing time.',
      ],
      correctOption: 0,
      explanation: 'Tokens are subword units processed by BPE/SentencePiece tokenizers. In English, 100 tokens correspond to approximately 75 words.',
    },
    {
      id: 'quiz_llmapis_04',
      skill: 'LLM APIs',
      topic: 'Rate Limiting & Backoff',
      question: 'What is the recommended strategy when an LLM API returns HTTP status `429 Too Many Requests`?',
      options: [
        'Implement exponential backoff with jitter before retrying the failed request.',
        'Immediately flood the API with simultaneous concurrent retries.',
        'Permanently delete the user account to prevent further traffic.',
        'Downgrade HTTPS connections to unencrypted HTTP.',
      ],
      correctOption: 0,
      explanation: 'Exponential backoff with randomized jitter prevents retry storms and thunder herd problems, giving the provider capacity to recover before retrying.',
    },
    {
      id: 'quiz_llmapis_05',
      skill: 'LLM APIs',
      topic: 'Function Calling / Tool Use',
      question: 'When an LLM initiates a Tool/Function Call in response to a user prompt, what does the API actually return to the application?',
      options: [
        'A structured response indicating the tool name and argument JSON string for the application to execute.',
        'The direct result of executing the code on the model provider server.',
        'An error stating that the model is incapable of answering directly.',
        'A raw URL to an external website.',
      ],
      correctOption: 0,
      explanation: 'The model returns structured intent: tool name and validated arguments. The client application executes the tool locally (e.g. database query) and feeds the output back to the model.',
    },
  ],

  // 20. Prompt Eng
  prompteng: [
    {
      id: 'quiz_prompteng_01',
      skill: 'Prompt Eng',
      topic: 'Few-Shot Prompting',
      question: 'What distinguishes "Few-Shot Prompting" from "Zero-Shot Prompting"?',
      options: [
        'Few-shot provides high-quality input-output exemplars within the prompt context before requesting the completion.',
        'Few-shot limits the prompt to fewer than 5 words.',
        'Few-shot fine-tunes model weights on remote GPU clusters.',
        'Few-shot disables system message directives.',
      ],
      correctOption: 0,
      explanation: 'Few-shot prompting conditions the model by demonstrating desired patterns, schemas, or styles using contextual exemplar input/output pairs directly in the prompt.',
    },
    {
      id: 'quiz_prompteng_02',
      skill: 'Prompt Eng',
      topic: 'Chain-of-Thought (CoT)',
      question: 'Why does Chain-of-Thought (CoT) prompting improve reasoning accuracy on complex arithmetic or multi-step logic tasks?',
      options: [
        'It prompts the model to generate intermediate reasoning steps before arriving at a final answer, allocating more compute tokens to the problem.',
        'It increases the model parameters dynamically during inference.',
        'It connects the model directly to the Wolfram Alpha API.',
        'It disables temperature sampling.',
      ],
      correctOption: 0,
      explanation: 'Autoregressive models predict one token at a time. Breaking reasoning into explicit sequential steps allows subsequent tokens to attend to previous intermediate deductions.',
    },
    {
      id: 'quiz_prompteng_03',
      skill: 'Prompt Eng',
      topic: 'Prompt Injection Defense',
      question: 'Which technique helps protect LLM pipelines against Direct Prompt Injection from untrusted user inputs?',
      options: [
        'Delimiting untrusted user inputs with clear XML or markdown tags (e.g. `<user_input>`) and instructing the model never to follow commands inside.',
        'Encoding all user prompts in Base64 before sending.',
        'Asking the user to promise not to inject adversarial prompts.',
        'Running prompts exclusively with temperature set to 1.0.',
      ],
      correctOption: 0,
      explanation: 'Delimiting untrusted data with structured boundaries (e.g. `<user_query>`) combined with explicit system framing establishes clear context boundaries between instructions and data.',
    },
    {
      id: 'quiz_prompteng_04',
      skill: 'Prompt Eng',
      topic: 'System vs User Directives',
      question: 'What is the role of the `system` message in conversational LLM architectures?',
      options: [
        'Setting foundational behavioral guidelines, tone, constraints, and operational boundaries for the assistant.',
        'Storing the user credit card number.',
        'Specifying which GPU server the model runs on.',
        'Translating English prompts into binary machine code.',
      ],
      correctOption: 0,
      explanation: 'System prompts establish high-priority persistent guardrails, personas, and behavioral constraints that govern how the model responds across the conversation.',
    },
    {
      id: 'quiz_prompteng_05',
      skill: 'Prompt Eng',
      topic: 'Hallucination Mitigation',
      question: 'Which prompt strategy is most effective at reducing factual hallucinations when generating answers from provided documentation?',
      options: [
        'Explicitly instructing the model to rely solely on the provided context and say "I do not know" if the answer is not contained therein.',
        'Increasing temperature to 1.0 to encourage creative guessing.',
        'Removing all system constraints.',
        'Asking the question multiple times in the same prompt.',
      ],
      correctOption: 0,
      explanation: 'Instructing models to anchor exclusively to reference text and providing a graceful out ("If the information is absent, state that you cannot answer") drastically curbs false assertions.',
    },
  ],

  // 21. Vector DBs
  vectordbs: [
    {
      id: 'quiz_vectordbs_01',
      skill: 'Vector DBs',
      topic: 'Embeddings & High-Dimensional Vectors',
      question: 'What does a text embedding vector generated by a model represent mathematically?',
      options: [
        'A high-dimensional dense numerical array capturing the semantic meaning of the text.',
        'An MD5 hash of the character string.',
        'A compressed JPEG preview of the text font.',
        'The alphabetical rank of words in the sentence.',
      ],
      correctOption: 0,
      explanation: 'Embeddings map text into a continuous high-dimensional vector space (e.g. 768 or 1536 dimensions) where semantically similar texts are positioned geometrically close together.',
    },
    {
      id: 'quiz_vectordbs_02',
      skill: 'Vector DBs',
      topic: 'Distance Metrics',
      question: 'Why is Cosine Similarity frequently used over Euclidean Distance for comparing normalized text embeddings?',
      options: [
        'It measures the angle between vectors, capturing semantic orientation independent of vector magnitude or text length.',
        'It is limited to 2-dimensional vectors.',
        'It produces negative distance values.',
        'It requires no matrix multiplication.',
      ],
      correctOption: 0,
      explanation: 'Cosine similarity assesses the cosine of the angle between two vectors, focusing strictly on semantic direction rather than scale variations in embedding length.',
    },
    {
      id: 'quiz_vectordbs_03',
      skill: 'Vector DBs',
      topic: 'Approximate Nearest Neighbor (ANN) & HNSW',
      question: 'What is the primary advantage of Hierarchical Navigable Small World (HNSW) indexing in vector databases?',
      options: [
        'Sub-linear logarithmic search time for finding nearest neighbors across millions of vectors without performing an exhaustive scan.',
        'Lossless compression of vector dimensions down to 1 byte.',
        'Automatic translation of embeddings between different AI models.',
        'Eliminating the need for vector storage in RAM.',
      ],
      correctOption: 0,
      explanation: 'Exhaustive k-NN (`O(N)`) becomes prohibitively slow on massive vector catalogs. HNSW creates multi-layered geometric graphs to achieve logarithmic `O(log N)` approximate retrieval.',
    },
    {
      id: 'quiz_vectordbs_04',
      skill: 'Vector DBs',
      topic: 'Metadata Filtering & Hybrid Search',
      question: 'What is the difference between pre-filtering and post-filtering when querying vector databases with metadata constraints?',
      options: [
        'Pre-filtering narrows the candidate space before vector similarity calculation; post-filtering searches all vectors first and filters results afterwards.',
        'Pre-filtering only works on integer values; post-filtering only works on strings.',
        'Post-filtering is always faster than pre-filtering.',
        'Pre-filtering alters the embedding coordinates in memory.',
      ],
      correctOption: 0,
      explanation: 'Pre-filtering limits the search universe to documents matching metadata (e.g. `userId = 123`) before running ANN, guaranteeing that returned top-k vectors satisfy metadata rules.',
    },
    {
      id: 'quiz_vectordbs_05',
      skill: 'Vector DBs',
      topic: 'Index Quantization',
      question: 'What is Product Quantization (PQ) in high-scale vector databases?',
      options: [
        'A lossy vector compression technique that reduces RAM usage by mapping high-dimensional vectors to compact centroid codes.',
        'A licensing model for enterprise vector databases.',
        'A method for encrypting vector embeddings at rest.',
        'A tool for batch uploading documents via gRPC.',
      ],
      correctOption: 0,
      explanation: 'Product Quantization breaks vectors into sub-vectors and clusters them into centroids, drastically cutting RAM footprint (often by 70-95%) with minor impact on recall.',
    },
  ],

  // 22. RAG
  rag: [
    {
      id: 'quiz_rag_01',
      skill: 'RAG',
      topic: 'RAG Architecture & Pipeline',
      question: 'What are the core steps of a standard Retrieval-Augmented Generation (RAG) pipeline?',
      options: [
        'Embed user query -> Retrieve relevant document chunks from vector store -> Inject chunks into prompt -> Generate LLM completion.',
        'Fine-tune model weights on user queries -> Compile model -> Deploy to web server.',
        'Translate query to SQL -> Drop database tables -> Restore from backup.',
        'Scrape the entire web -> Train a new foundation model from scratch.',
      ],
      correctOption: 0,
      explanation: 'RAG retrieves authoritative relevant text chunks from an external knowledge store based on semantic query similarity and injects them into the context window for the LLM to ground its response.',
    },
    {
      id: 'quiz_rag_02',
      skill: 'RAG',
      topic: 'Chunking Strategies & Overlap',
      question: 'Why is "chunk overlap" used when splitting documents into segments for RAG embeddings?',
      options: [
        'To prevent semantic meaning from being severed when concepts span across chunk boundaries.',
        'To duplicate database storage capacity.',
        'To ensure chunk lengths are divisible by 8.',
        'To trick search engines into higher SEO ranking.',
      ],
      correctOption: 0,
      explanation: 'Chunk overlap maintains continuity of ideas and sentence context across split boundaries, ensuring queries matching boundary topics can retrieve complete semantic information.',
    },
    {
      id: 'quiz_rag_03',
      skill: 'RAG',
      topic: 'Reranking & Cross-Encoders',
      question: 'What is the role of a Reranker (such as Cohere Rerank or BGE-Reranker) in a two-stage RAG pipeline?',
      options: [
        'It performs a computationally intensive cross-encoder evaluation on the top candidate chunks to accurately sort them by true relevance before prompt injection.',
        'It converts markdown documents into PDF files.',
        'It translates non-English chunks into English.',
        'It deletes duplicate chunks from the vector database.',
      ],
      correctOption: 0,
      explanation: 'First-stage vector search quickly retrieves a broad pool (e.g. top 25 chunks). A cross-encoder reranker then deeply evaluates query-chunk interactions to pick the most relevant top 3-5.',
    },
    {
      id: 'quiz_rag_04',
      skill: 'RAG',
      topic: 'Lost in the Middle Phenomenon',
      question: 'What is the "Lost in the Middle" phenomenon observed in LLM context windows during RAG retrieval?',
      options: [
        'LLMs tend to recall information positioned at the very beginning or end of long context prompts significantly better than information in the middle.',
        'Vector databases randomly lose records stored at median indexes.',
        'Network sockets timeout midway through large streaming responses.',
        'Tokenizers fail to decode middle-range Unicode characters.',
      ],
      correctOption: 0,
      explanation: 'Research demonstrates attention degradation for information placed in the middle of extensive context inputs; placing high-relevance chunks near the edges improves extraction reliability.',
    },
    {
      id: 'quiz_rag_05',
      skill: 'RAG',
      topic: 'Evaluation Metrics (RAGAS)',
      question: 'What does "Faithfulness" measure in RAG evaluation frameworks (such as RAGAS)?',
      options: [
        'Whether all claims made in the generated answer can be directly inferred from the retrieved context without hallucination.',
        'The user satisfaction rating measured via survey buttons.',
        'The speed at which the vector database returned similarity results.',
        'The grammatical correctness of the source documents.',
      ],
      correctOption: 0,
      explanation: 'Faithfulness assesses grounding: it measures whether the answer contains only facts directly supported by the retrieved context chunks, identifying hallucinations.',
    },
  ],
};

/**
 * Retrieves the curated quiz questions for a skill name.
 * Performs canonical normalization for robust matching.
 *
 * @param {string} skillName
 * @returns {Array<object>}
 */
export function getSkillQuizQuestions(skillName) {
  if (!skillName || typeof skillName !== 'string') return [];
  const key = normalizeSkillName(skillName);
  return SKILL_QUIZ_BANK[key] || [];
}

/**
 * Strips correctOption and explanation so answer keys are never sent to the client.
 *
 * @param {Array<object>} questions
 * @returns {Array<object>}
 */
export function sanitizeSkillQuizQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map((q) => ({
    id: q.id,
    skill: q.skill,
    topic: q.topic,
    question: q.question,
    options: q.options,
  }));
}

/**
 * Server-side grading of user answers against canonical question records.
 *
 * @param {string} skillName
 * @param {Array<{ questionId: string, selectedOption: number }>} answers
 * @param {Array<object>} [customQuestions] - Optional questions array (e.g. from session)
 * @returns {object} Graded report with total, correct, breakdown, and explanations
 */
export function gradeSkillQuizSubmission(skillName, answers, customQuestions = null) {
  const canonicalQuestions = Array.isArray(customQuestions) && customQuestions.length > 0
    ? customQuestions
    : getSkillQuizQuestions(skillName);

  if (canonicalQuestions.length === 0) {
    throw new Error(`No question benchmark found for skill: "${skillName}"`);
  }

  const answerMap = new Map();
  if (Array.isArray(answers)) {
    for (const a of answers) {
      if (a && typeof a.questionId === 'string') {
        answerMap.set(a.questionId, a.selectedOption);
      }
    }
  }

  let totalCorrect = 0;
  const questionResponses = [];

  for (const q of canonicalQuestions) {
    const userSelected = answerMap.has(q.id) ? answerMap.get(q.id) : null;
    const isCorrect = userSelected === q.correctOption;

    if (isCorrect) {
      totalCorrect += 1;
    }

    questionResponses.push({
      questionId: q.id,
      topic: q.topic,
      question: q.question,
      options: q.options,
      selectedOption: userSelected !== null ? userSelected : -1,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const totalQuestions = canonicalQuestions.length;
  const percentage = Math.round((totalCorrect / totalQuestions) * 100);
  const passed = percentage >= 70; // 70%+ threshold (e.g. 4/5 or 5/5)

  return {
    skillName,
    totalQuestions,
    totalCorrect,
    percentage,
    passed,
    questionResponses,
  };
}

/**
 * Returns list of all available quiz skills with their questions count.
 */
export function getAvailableQuizSkills() {
  return Object.keys(SKILL_QUIZ_BANK).map((key) => {
    const list = SKILL_QUIZ_BANK[key];
    const first = list[0];
    return {
      key,
      skillName: first.skill,
      totalQuestions: list.length,
      topics: Array.from(new Set(list.map((q) => q.topic))),
    };
  });
}

export default {
  SKILL_QUIZ_BANK,
  getSkillQuizQuestions,
  sanitizeSkillQuizQuestions,
  gradeSkillQuizSubmission,
  getAvailableQuizSkills,
};
