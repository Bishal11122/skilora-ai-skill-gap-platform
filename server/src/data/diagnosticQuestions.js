/**
 * Deterministic Question Bank for Diagnostic Skill Assessment (Phase 7).
 *
 * Covers all 5 active career tracks with exactly 15 questions per career:
 * 5 benchmark skills per career x 3 questions per skill = 15 questions.
 *
 * Each question has:
 * - id: unique string
 * - careerId: career identifier
 * - skill: exact matching benchmark skill name
 * - category: conceptual category
 * - question: unambiguous question prompt
 * - options: 4 distinct strings
 * - correctOption: index (0, 1, 2, or 3)
 * - explanation: clear rationale explaining the correct answer
 */

export const QUESTION_BANK = {
  'full-stack-developer': [
    // Skill 1: React (3 questions)
    {
      id: 'fs_react_01',
      careerId: 'full-stack-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'Which React Hook should be used to perform side effects such as data fetching or subscriptions?',
      options: ['useState', 'useEffect', 'useMemo', 'useRef'],
      correctOption: 1,
      explanation: 'useEffect is designed specifically for orchestrating side effects including API requests, subscriptions, and DOM mutations in functional components.',
    },
    {
      id: 'fs_react_02',
      careerId: 'full-stack-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'Why should you avoid directly mutating component state in React (e.g., `state.count = 5`)?',
      options: [
        'Direct mutation does not trigger a component re-render.',
        'JavaScript throws a runtime syntax error on object mutation.',
        'It causes the component to immediately unmount.',
        'React state properties are sealed read-only by default in the browser engine.',
      ],
      correctOption: 0,
      explanation: 'React relies on shallow identity comparisons of state objects to determine when to schedule a reconciliation and re-render. Direct mutation bypasses setter functions, preventing updates from rendering.',
    },
    {
      id: 'fs_react_03',
      careerId: 'full-stack-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'What is the primary purpose of the `useCallback` hook in React?',
      options: [
        'To cache the return value of an expensive calculation.',
        'To return a memoized version of a callback function between renders.',
        'To dispatch asynchronous actions to an external Redux store.',
        'To synchronously run callbacks before DOM painting occurs.',
      ],
      correctOption: 1,
      explanation: 'useCallback returns a memoized callback instance that only changes if one of its dependencies changes, preventing unnecessary re-renders of optimized child components.',
    },

    // Skill 2: Node.js (3 questions)
    {
      id: 'fs_node_01',
      careerId: 'full-stack-developer',
      skill: 'Node.js',
      category: 'Backend',
      question: 'How does the Node.js event loop handle asynchronous I/O operations without blocking the main execution thread?',
      options: [
        'By creating a new operating system process for each incoming HTTP connection.',
        'By delegating non-blocking operations to libuv and executing completion callbacks on the event loop phases.',
        'By automatically compiling JavaScript code into multi-threaded C++ binaries.',
        'By executing code synchronously in strict FIFO order until memory is exhausted.',
      ],
      correctOption: 1,
      explanation: 'Node.js uses libuv to handle async I/O off the main thread. When operations complete, their associated callbacks are queued and processed in specific phases of the single-threaded event loop.',
    },
    {
      id: 'fs_node_02',
      careerId: 'full-stack-developer',
      skill: 'Node.js',
      category: 'Backend',
      question: 'What is the key advantage of using Node.js Streams (`stream.Readable` / `stream.Writable`) over loading full file buffers into memory?',
      options: [
        'Streams encrypt file content automatically with AES-256.',
        'Streams process data in chunks without requiring the entire dataset to reside in RAM.',
        'Streams convert asynchronous code into synchronous execution.',
        'Streams prevent all possible disk read errors.',
      ],
      correctOption: 1,
      explanation: 'Streams allow processing data piece by piece as chunks arrive, maintaining a low and predictable memory footprint regardless of total file or payload size.',
    },
    {
      id: 'fs_node_03',
      careerId: 'full-stack-developer',
      skill: 'Node.js',
      category: 'Backend',
      question: 'In Express middleware `(req, res, next) => { ... }`, what happens if you neither send a response nor call `next()`?',
      options: [
        'Express immediately returns an HTTP 500 error.',
        'The client request hangs indefinitely until a server timeout occurs.',
        'The next route handler in the chain is executed automatically.',
        'The Node.js process terminates immediately with an unhandled exception.',
      ],
      correctOption: 1,
      explanation: 'If a middleware function neither closes the HTTP request-response cycle (e.g. res.json()) nor passes control to next(), the request remains open until socket timeout.',
    },

    // Skill 3: PostgreSQL (3 questions)
    {
      id: 'fs_postgres_01',
      careerId: 'full-stack-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'What ACID property guarantees that all SQL operations within a transaction either completely succeed or completely roll back?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctOption: 0,
      explanation: 'Atomicity ensures that a transaction is treated as an indivisible unit of work: either all modifications are committed or none take effect.',
    },
    {
      id: 'fs_postgres_02',
      careerId: 'full-stack-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'When should you create a B-Tree index on a PostgreSQL table column?',
      options: [
        'On columns that are constantly updated but never used in WHERE or JOIN clauses.',
        'On high-cardinality columns frequently queried with equality or range filters.',
        'Exclusively on large text columns containing unstructured Markdown bodies.',
        'On every column in the table regardless of query patterns.',
      ],
      correctOption: 1,
      explanation: 'B-Tree indexes provide logarithmic O(log N) lookup speeds and excel on columns regularly filtered with equality (=) or range (<, <=, >, >=, BETWEEN) operations.',
    },
    {
      id: 'fs_postgres_03',
      careerId: 'full-stack-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'In PostgreSQL, what is the key difference between `INNER JOIN` and `LEFT JOIN`?',
      options: [
        'INNER JOIN returns only matching rows from both tables; LEFT JOIN returns all rows from the left table plus matches from the right table.',
        'INNER JOIN operates on primary keys only; LEFT JOIN operates on foreign keys only.',
        'LEFT JOIN is always faster because it does not examine matching keys.',
        'INNER JOIN returns NULLs when no match is found; LEFT JOIN deletes non-matching rows.',
      ],
      correctOption: 0,
      explanation: 'INNER JOIN preserves rows only when the join condition matches in both tables. LEFT JOIN retains all records from the left table and populates NULL for right-table columns when no match exists.',
    },

    // Skill 4: REST APIs (3 questions)
    {
      id: 'fs_rest_01',
      careerId: 'full-stack-developer',
      skill: 'REST APIs',
      category: 'Architecture',
      question: 'Which HTTP method should be used according to REST conventions to replace an existing resource document completely?',
      options: ['GET', 'POST', 'PUT', 'PATCH'],
      correctOption: 2,
      explanation: 'PUT is idempotent and replaces the entire target resource with the uploaded payload, whereas PATCH is used for partial updates.',
    },
    {
      id: 'fs_rest_02',
      careerId: 'full-stack-developer',
      skill: 'REST APIs',
      category: 'Architecture',
      question: 'What is the appropriate HTTP status code to return when a request fails client-side authentication due to missing or expired credentials?',
      options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      correctOption: 1,
      explanation: 'HTTP 401 Unauthorized indicates that the request lacks valid authentication credentials. (403 Forbidden is used when credentials are valid but permissions are insufficient).',
    },
    {
      id: 'fs_rest_03',
      careerId: 'full-stack-developer',
      skill: 'REST APIs',
      category: 'Architecture',
      question: 'What does it mean for an HTTP method (such as GET or DELETE) to be "idempotent"?',
      options: [
        'Making multiple identical requests produces the same server state as making a single request.',
        'The method must always return data in under 100 milliseconds.',
        'The method cannot accept query parameters or request headers.',
        'The method can only be executed by authenticated administrators.',
      ],
      correctOption: 0,
      explanation: 'An idempotent HTTP method is one where the side-effects of making N identical requests are the same as making a single request.',
    },

    // Skill 5: System Design (3 questions)
    {
      id: 'fs_sysdesign_01',
      careerId: 'full-stack-developer',
      skill: 'System Design',
      category: 'Architecture',
      question: 'What is the primary difference between horizontal scaling and vertical scaling?',
      options: [
        'Horizontal scaling adds more machine instances; vertical scaling upgrades RAM and CPU on existing machines.',
        'Horizontal scaling adds more database indexes; vertical scaling normalizes schema tables.',
        'Horizontal scaling only works on serverless functions; vertical scaling only works on bare-metal.',
        'Horizontal scaling increases network bandwidth; vertical scaling increases disk speed.',
      ],
      correctOption: 0,
      explanation: 'Horizontal scaling (scaling out) increases capacity by adding more compute nodes to a cluster. Vertical scaling (scaling up) upgrades the hardware capacity (CPU, RAM, storage) of a single server.',
    },
    {
      id: 'fs_sysdesign_02',
      careerId: 'full-stack-developer',
      skill: 'System Design',
      category: 'Architecture',
      question: 'In distributed systems architecture, what role does a Reverse Proxy (such as Nginx or Envoy) fulfill?',
      options: [
        'It translates SQL queries into NoSQL document collections.',
        'It terminates client SSL/TLS, balances traffic across backend servers, and routes requests.',
        'It automatically executes unit tests on production database instances.',
        'It stores user passwords directly in browser local storage.',
      ],
      correctOption: 1,
      explanation: 'A reverse proxy sits in front of web servers and forwards client requests, providing load balancing, TLS termination, caching, and security isolation.',
    },
    {
      id: 'fs_sysdesign_03',
      careerId: 'full-stack-developer',
      skill: 'System Design',
      category: 'Architecture',
      question: 'Why are in-memory caches (such as Redis) positioned between backend API servers and primary relational databases?',
      options: [
        'To reduce query latency for frequently read, slow-changing datasets and alleviate database read pressure.',
        'To replace all durable database storage and eliminate SQL entirely.',
        'To encrypt network sockets automatically across all client devices.',
        'To prevent client browsers from caching static CSS stylesheets.',
      ],
      correctOption: 0,
      explanation: 'In-memory caches store frequently requested data in RAM with sub-millisecond retrieval speeds, shielding relational databases from redundant read queries.',
    },
  ],

  'frontend-developer': [
    // Skill 1: TypeScript (3 questions)
    {
      id: 'fe_ts_01',
      careerId: 'frontend-developer',
      skill: 'TypeScript',
      category: 'Languages',
      question: 'What is the main advantage of TypeScript `unknown` over `any`?',
      options: [
        '`unknown` enforces type narrowing or type assertions before properties or methods can be accessed.',
        '`unknown` converts values into strings at compile time.',
        '`unknown` can only hold primitive numbers and booleans.',
        '`unknown` executes runtime validation schemas automatically without JavaScript code.',
      ],
      correctOption: 0,
      explanation: '`unknown` is the type-safe counterpart of `any`. TypeScript disallows arbitrary property access or method invocations on `unknown` until you prove its type through type narrowing.',
    },
    {
      id: 'fe_ts_02',
      careerId: 'frontend-developer',
      skill: 'TypeScript',
      category: 'Languages',
      question: 'How do you define a type where all properties of interface `User` become optional?',
      options: ['Partial<User>', 'Required<User>', 'Readonly<User>', 'Omit<User, any>'],
      correctOption: 0,
      explanation: 'The built-in utility type `Partial<T>` constructs a type with all properties of T set to optional (`?`).',
    },
    {
      id: 'fe_ts_03',
      careerId: 'frontend-developer',
      skill: 'TypeScript',
      category: 'Languages',
      question: 'In TypeScript, what is a "discriminated union"?',
      options: [
        'A union of object types that share a common literal property used by the compiler to narrow types.',
        'A union of numbers and strings that causes compile-time errors.',
        'A generic function that rejects null and undefined arguments.',
        'A TypeScript feature that enables multi-threading in Web Workers.',
      ],
      correctOption: 0,
      explanation: 'A discriminated union uses a shared discriminant property with literal types (e.g. `{ kind: "success" } | { kind: "error" }`) so switch or if blocks narrow types safely.',
    },

    // Skill 2: React (3 questions)
    {
      id: 'fe_react_01',
      careerId: 'frontend-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'Why should stable, unique identifiers be used for the `key` prop when rendering lists in React?',
      options: [
        'Keys help React identify which items have changed, been added, or been removed during reconciliation.',
        'Keys prevent CSS styles from leaking between list items.',
        'Keys automatically bind click event listeners to each DOM element.',
        'Keys are required by the HTML5 specification for `<ul>` elements.',
      ],
      correctOption: 0,
      explanation: 'React uses keys to match existing Virtual DOM nodes with updated nodes during reconciliation. Using index keys or unstable IDs leads to component state corruption and suboptimal DOM updates.',
    },
    {
      id: 'fe_react_02',
      careerId: 'frontend-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'What is the purpose of React Error Boundaries?',
      options: [
        'To catch JavaScript errors anywhere in their child component tree and display a fallback UI without crashing the entire app.',
        'To catch syntax errors in server-side API endpoints before deployment.',
        'To validate form input fields before the user submits them.',
        'To prevent memory leaks when establishing WebSockets.',
      ],
      correctOption: 0,
      explanation: 'Error boundaries are React components that catch JavaScript errors anywhere in their child component tree during rendering, in lifecycle methods, and in constructors.',
    },
    {
      id: 'fe_react_03',
      careerId: 'frontend-developer',
      skill: 'React',
      category: 'Frontend',
      question: 'When should `React.memo` be applied to a functional component?',
      options: [
        'When the component renders frequently with the exact same props and rendering logic is computationally heavy.',
        'On every single component in an application by default.',
        'Only on root components directly mounted by ReactDOM.',
        'Whenever a component contains an HTML form element.',
      ],
      correctOption: 0,
      explanation: 'React.memo is a higher-order component that skips re-rendering if props are shallowly unchanged. Applying it indiscriminately adds unnecessary comparison overhead to simple components.',
    },

    // Skill 3: Tailwind CSS (3 questions)
    {
      id: 'fe_tailwind_01',
      careerId: 'frontend-developer',
      skill: 'Tailwind CSS',
      category: 'Styling',
      question: 'What is the core architectural philosophy of Tailwind CSS?',
      options: [
        'Utility-first CSS, composing low-level utility classes directly in markup rather than writing custom CSS files.',
        'Writing scoped SASS preprocessor mixins inside separate .scss files.',
        'Injecting inline style attributes with JavaScript strings on every DOM element.',
        'Generating atomic CSS exclusively at runtime in the browser.',
      ],
      correctOption: 0,
      explanation: 'Tailwind CSS provides low-level utility classes (like `flex`, `pt-4`, `text-center`) that let you build bespoke designs directly in HTML/JSX without naming arbitrary CSS classes.',
    },
    {
      id: 'fe_tailwind_02',
      careerId: 'frontend-developer',
      skill: 'Tailwind CSS',
      category: 'Styling',
      question: 'In Tailwind CSS responsive design, what breakpoint does `md:flex` represent by default?',
      options: [
        'Applies `display: flex` at viewport widths of 768px and wider (min-width: 768px).',
        'Applies `display: flex` only on viewports narrower than 768px (max-width: 768px).',
        'Applies `display: flex` exclusively to medium pixel-density (retina) screens.',
        'Applies `display: flex` only in dark mode.',
      ],
      correctOption: 0,
      explanation: 'Tailwind is mobile-first: unprefixed utilities apply everywhere, while responsive prefixes like `md:` apply at min-width 768px and above.',
    },
    {
      id: 'fe_tailwind_03',
      careerId: 'frontend-developer',
      skill: 'Tailwind CSS',
      category: 'Styling',
      question: 'How do you configure and apply dark mode styles in Tailwind CSS?',
      options: [
        'By prefixing utilities with `dark:`, such as `dark:bg-gray-900 dark:text-white`.',
        'By wrapping every component in an HTML `<dark>` tag.',
        'By modifying CSS `@media print` rules.',
        'Tailwind does not support dark mode styling.',
      ],
      correctOption: 0,
      explanation: 'Tailwind supports dark mode out-of-the-box using the `dark:` variant modifier, which triggers either via system media preferences or class-based strategies.',
    },

    // Skill 4: Web Vitals (3 questions)
    {
      id: 'fe_vitals_01',
      careerId: 'frontend-developer',
      skill: 'Web Vitals',
      category: 'Performance',
      question: 'What user experience aspect does Largest Contentful Paint (LCP) measure?',
      options: [
        'Perceived loading speed: the time it takes for the main content of a page to render on screen.',
        'Visual stability: how much page elements shift unexpectedly during render.',
        'Input responsiveness: how quickly the page reacts to user clicks.',
        'SSL handshake duration between browser and server.',
      ],
      correctOption: 0,
      explanation: 'LCP measures perceived load performance. An LCP under 2.5 seconds indicates a good user experience where the primary hero block or image renders quickly.',
    },
    {
      id: 'fe_vitals_02',
      careerId: 'frontend-developer',
      skill: 'Web Vitals',
      category: 'Performance',
      question: 'What causes poor Cumulative Layout Shift (CLS) on a webpage?',
      options: [
        'Images or ad banners rendered without explicit `width` and `height` aspect ratio dimensions.',
        'Serving pre-compressed Gzip or Brotli static assets.',
        'Minifying JavaScript and CSS bundles before deployment.',
        'Using responsive SVG icons instead of PNG bitmaps.',
      ],
      correctOption: 0,
      explanation: 'When images, embeds, or ads load without reserved dimensional aspect ratios, the browser dynamically reflows content, causing sudden layout shifts that penalize CLS.',
    },
    {
      id: 'fe_vitals_03',
      careerId: 'frontend-developer',
      skill: 'Web Vitals',
      category: 'Performance',
      question: 'Which Core Web Vital replaced First Input Delay (FID) to evaluate page responsiveness throughout the entire user lifecycle?',
      options: [
        'Interaction to Next Paint (INP)',
        'Time to First Byte (TTFB)',
        'First Contentful Paint (FCP)',
        'Speed Index (SI)',
      ],
      correctOption: 0,
      explanation: 'INP (Interaction to Next Paint) assesses overall page responsiveness by measuring the latency of all user interactions (clicks, taps, keypresses) throughout the session.',
    },

    // Skill 5: UI/UX (3 questions)
    {
      id: 'fe_uiux_01',
      careerId: 'frontend-developer',
      skill: 'UI/UX',
      category: 'Design & A11y',
      question: 'What is the minimum WCAG 2.1 AA contrast ratio required for normal body text against its background?',
      options: ['4.5:1', '3:1', '7:1', '1.5:1'],
      correctOption: 0,
      explanation: 'WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt or 14pt bold).',
    },
    {
      id: 'fe_uiux_02',
      careerId: 'frontend-developer',
      skill: 'UI/UX',
      category: 'Design & A11y',
      question: 'Why should interactive elements (buttons, links, inputs) retain visible `:focus-visible` outline rings?',
      options: [
        'To provide keyboard-only and screen reader users a clear visual indicator of where navigation focus is currently located.',
        'It is required by browser CSS engines to trigger JavaScript event delegation.',
        'It prevents mobile touchscreen devices from zooming.',
        'Focus outlines automatically center text inside buttons.',
      ],
      correctOption: 0,
      explanation: 'Visible focus indicators are an accessibility necessity for keyboard navigators who rely on the tab key to know which interactive element is currently focused.',
    },
    {
      id: 'fe_uiux_03',
      careerId: 'frontend-developer',
      skill: 'UI/UX',
      category: 'Design & A11y',
      question: 'What is the purpose of ARIA landmark roles (`role="main"`, `role="navigation"`, `<nav>`, `<header>`) in semantic HTML?',
      options: [
        'They enable assistive technologies to understand the structure of the page and allow users to jump quickly between sections.',
        'They accelerate CSS selector evaluation in the rendering pipeline.',
        'They automatically translate web content into other languages.',
        'They encrypt form input data before submission.',
      ],
      correctOption: 0,
      explanation: 'Landmark roles provide programmatic navigational regions that screen readers and assistive tools use to navigate complex layouts efficiently.',
    },
  ],

  'data-analyst': [
    // Skill 1: SQL (3 questions)
    {
      id: 'da_sql_01',
      careerId: 'data-analyst',
      skill: 'SQL',
      category: 'Data Querying',
      question: 'What is the fundamental difference between `WHERE` and `HAVING` clauses in SQL?',
      options: [
        '`WHERE` filters rows before grouping; `HAVING` filters aggregated groups after `GROUP BY`.',
        '`WHERE` can only be used on string columns; `HAVING` can only be used on numeric columns.',
        '`WHERE` requires an index; `HAVING` does not.',
        '`HAVING` sorts data; `WHERE` deletes rows.',
      ],
      correctOption: 0,
      explanation: '`WHERE` filters individual rows prior to any aggregation. `HAVING` filters the aggregate results generated by a `GROUP BY` clause.',
    },
    {
      id: 'da_sql_02',
      careerId: 'data-analyst',
      skill: 'SQL',
      category: 'Data Querying',
      question: 'Which SQL window function assigns a unique sequential integer to rows within a partition starting from 1 with no ties?',
      options: ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'NTILE()'],
      correctOption: 0,
      explanation: '`ROW_NUMBER()` outputs a unique integer starting at 1 for every row in the partition. `RANK()` and `DENSE_RANK()` assign identical numbers to tied values.',
    },
    {
      id: 'da_sql_03',
      careerId: 'data-analyst',
      skill: 'SQL',
      category: 'Data Querying',
      question: 'What is a Common Table Expression (CTE) in SQL?',
      options: [
        'A temporary named result set defined using the `WITH` clause that exists only during query execution.',
        'A permanent physical table stored on disk across server reboots.',
        'A column constraint that rejects duplicate foreign key values.',
        'A trigger that executes whenever an UPDATE statement occurs.',
      ],
      correctOption: 0,
      explanation: 'A CTE is a temporary named result set defined within a `WITH` query that simplifies complex joins, subqueries, and recursive operations.',
    },

    // Skill 2: Python (3 questions)
    {
      id: 'da_py_01',
      careerId: 'data-analyst',
      skill: 'Python',
      category: 'Analytics',
      question: 'In the Pandas library, what method is used to inspect missing (null/NaN) values across a DataFrame?',
      options: ['df.isna().sum()', 'df.dropna().count()', 'df.describe()', 'df.filter_nulls()'],
      correctOption: 0,
      explanation: '`df.isna().sum()` (or `df.isnull().sum()`) returns the total count of null/NaN values per column, making it a standard first step in data cleaning.',
    },
    {
      id: 'da_py_02',
      careerId: 'data-analyst',
      skill: 'Python',
      category: 'Analytics',
      question: 'What is the key advantage of NumPy ndarrays over standard Python lists for numerical data manipulation?',
      options: [
        'NumPy arrays store elements in contiguous memory blocks and support vectorized C-speed operations.',
        'NumPy arrays can store unlimited arbitrary Python object types without memory overhead.',
        'Python lists cannot hold numbers greater than 1,000,000.',
        'NumPy arrays automatically convert data into SQL tables.',
      ],
      correctOption: 0,
      explanation: 'NumPy arrays are homogeneous contiguous memory structures that leverage SIMD and optimized C libraries, executing calculations orders of magnitude faster than Python list loops.',
    },
    {
      id: 'da_py_03',
      careerId: 'data-analyst',
      skill: 'Python',
      category: 'Analytics',
      question: 'In Pandas, how do you compute aggregated statistics (e.g. mean sales) grouped by a categorical column (e.g. region)?',
      options: [
        "df.groupby('region')['sales'].mean()",
        "df.split('region').mean('sales')",
        "df.aggregate('sales').filter('region')",
        "df.pivot_table('sales', index='all')",
      ],
      correctOption: 0,
      explanation: '`df.groupby(\'region\')[\'sales\'].mean()` applies the split-apply-combine strategy to calculate average sales per region.',
    },

    // Skill 3: PowerBI (3 questions)
    {
      id: 'da_pbi_01',
      careerId: 'data-analyst',
      skill: 'PowerBI',
      category: 'Business Intelligence',
      question: 'What formula language is used in Power BI to create custom calculated measures and columns?',
      options: ['DAX (Data Analysis Expressions)', 'M (Power Query Formula Language)', 'VBA', 'TypeScript'],
      correctOption: 0,
      explanation: 'DAX (Data Analysis Expressions) is the formula and query language used in Power BI, Analysis Services, and Power Pivot for calculating measures and dynamic aggregations.',
    },
    {
      id: 'da_pbi_02',
      careerId: 'data-analyst',
      skill: 'PowerBI',
      category: 'Business Intelligence',
      question: 'In Power BI DAX, what is the fundamental difference between a Calculated Column and a Measure?',
      options: [
        'Calculated columns are computed row-by-row during data refresh and stored in memory; measures are calculated dynamically at query time based on filter context.',
        'Measures consume disk space permanently; calculated columns do not consume memory.',
        'Calculated columns can only return text; measures can only return integers.',
        'Measures cannot be used in charts or visuals.',
      ],
      correctOption: 0,
      explanation: 'Calculated columns evaluate on each row during model load and increase data model size in RAM. Measures compute dynamically on the fly reflecting visual filters and slicers.',
    },
    {
      id: 'da_pbi_03',
      careerId: 'data-analyst',
      skill: 'PowerBI',
      category: 'Business Intelligence',
      question: 'What is the purpose of Power Query (M Language) in the Power BI workflow?',
      options: [
        'ETL: Extracting, transforming, cleaning, and shaping data before it enters the reporting model.',
        'Styling UI dashboards with custom CSS themes.',
        'Hosting web servers for real-time live video streaming.',
        'Generating machine learning neural network weights.',
      ],
      correctOption: 0,
      explanation: 'Power Query handles data ingestion and ETL tasks (filtering, merging, pivoting, type conversions) before loading cleaned data into the analytical model.',
    },

    // Skill 4: Statistics (3 questions)
    {
      id: 'da_stat_01',
      careerId: 'data-analyst',
      skill: 'Statistics',
      category: 'Quantitative Analysis',
      question: 'When analyzing a dataset with extreme outliers (such as household income), why is the median preferred over the mean as a measure of central tendency?',
      options: [
        'The median is resistant to extreme outliers; the mean is heavily skewed by extreme values.',
        'The median can only be calculated for small sample sizes under 30.',
        'The mean always equals zero in financial datasets.',
        'The median requires the data to follow a standard normal bell curve.',
      ],
      correctOption: 0,
      explanation: 'The median represents the 50th percentile (middle value) and is a robust statistic unaffected by skewness or extreme values, whereas the mean incorporates all magnitudes directly.',
    },
    {
      id: 'da_stat_02',
      careerId: 'data-analyst',
      skill: 'Statistics',
      category: 'Quantitative Analysis',
      question: 'In hypothesis testing, what does a p-value of 0.03 indicate when the significance threshold (alpha) is 0.05?',
      options: [
        'There is statistically significant evidence to reject the null hypothesis (p < 0.05).',
        'The null hypothesis is proven with 97% certainty.',
        'The experiment failed and must be repeated.',
        'There is a 3% probability that the alternative hypothesis is false.',
      ],
      correctOption: 0,
      explanation: 'When the p-value is less than the significance level alpha (0.03 < 0.05), we reject the null hypothesis because the observed outcome is unlikely to have occurred by random chance alone.',
    },
    {
      id: 'da_stat_03',
      careerId: 'data-analyst',
      skill: 'Statistics',
      category: 'Quantitative Analysis',
      question: 'What does a Pearson correlation coefficient of -0.85 indicate about two variables?',
      options: [
        'A strong negative linear relationship: as one variable increases, the other variable tends to decrease.',
        'No linear correlation whatsoever.',
        'A strong positive relationship with an 85% probability of causal connection.',
        'The variables are identical and redundant.',
      ],
      correctOption: 0,
      explanation: 'Pearson r ranges from -1 to +1. A value of -0.85 denotes a strong negative linear association where increases in X correspond reliably to decreases in Y.',
    },

    // Skill 5: Data Modeling (3 questions)
    {
      id: 'da_dm_01',
      careerId: 'data-analyst',
      skill: 'Data Modeling',
      category: 'Data Architecture',
      question: 'In dimensional data modeling for analytics (Star Schema), what distinguishes Fact tables from Dimension tables?',
      options: [
        'Fact tables contain quantitative metrics and foreign keys; Dimension tables contain descriptive attributes providing context.',
        'Fact tables store historical backups; Dimension tables store active users only.',
        'Dimension tables can only contain numerical columns.',
        'Fact tables are strictly normalized to 5th Normal Form (5NF).',
      ],
      correctOption: 0,
      explanation: 'In dimensional modeling, Fact tables store numeric measurements and events (sales amount, quantity, timestamps) along with foreign keys referencing Dimension tables (customer name, store region, product category).',
    },
    {
      id: 'da_dm_02',
      careerId: 'data-analyst',
      skill: 'Data Modeling',
      category: 'Data Architecture',
      question: 'What is the primary benefit of Third Normal Form (3NF) in transactional database design?',
      options: [
        'It eliminates data redundancy and prevents insertion, update, and deletion anomalies.',
        'It makes read queries execute faster by duplicating columns across tables.',
        'It removes primary keys from all relational tables.',
        'It limits databases to a maximum of 3 tables.',
      ],
      correctOption: 0,
      explanation: '3NF ensures every non-key attribute depends strictly on the primary key, whole key, and nothing but the key, eliminating redundant data and update anomalies.',
    },
    {
      id: 'da_dm_03',
      careerId: 'data-analyst',
      skill: 'Data Modeling',
      category: 'Data Architecture',
      question: 'What is a Slowly Changing Dimension (SCD Type 2) used for in data warehousing?',
      options: [
        'To track historical changes over time by creating a new record with effective date timestamps whenever attributes change.',
        'To overwrite old values directly without keeping historical records.',
        'To delete historical transactions older than 30 days.',
        'To compress database files on disk.',
      ],
      correctOption: 0,
      explanation: 'SCD Type 2 preserves historical changes by inserting a new row with valid start/end dates or version flags, enabling accurate point-in-time historical reporting.',
    },
  ],

  'python-developer': [
    // Skill 1: Python (3 questions)
    {
      id: 'py_core_01',
      careerId: 'python-developer',
      skill: 'Python',
      category: 'Core Language',
      question: 'What is the behavior and advantage of a Python generator function using the `yield` statement?',
      options: [
        'It produces items one at a time on demand (lazy evaluation), maintaining minimal memory overhead for large sequences.',
        'It executes functions asynchronously across multiple CPU cores.',
        'It compiles Python code into native x86 machine instructions.',
        'It permanently stores all sequence items in a disk file.',
      ],
      correctOption: 0,
      explanation: 'Generators yield values iteratively on demand without constructing the complete collection in RAM, providing lazy evaluation and optimal memory efficiency.',
    },
    {
      id: 'py_core_02',
      careerId: 'python-developer',
      skill: 'Python',
      category: 'Core Language',
      question: 'In Python, what is the purpose of the `__init__` method in a class definition?',
      options: [
        'It is the constructor initializer method invoked automatically when a new class instance is created.',
        'It destroys objects when garbage collection occurs.',
        'It converts class instances into JSON strings.',
        'It prevents subclasses from inheriting parent methods.',
      ],
      correctOption: 0,
      explanation: '`__init__` is Python’s instance initializer method called immediately after a new object is instantiated to set initial attributes.',
    },
    {
      id: 'py_core_03',
      careerId: 'python-developer',
      skill: 'Python',
      category: 'Core Language',
      question: 'What is the Global Interpreter Lock (GIL) in standard CPython?',
      options: [
        'A mutex mechanism that allows only one native thread to execute Python bytecode at a time.',
        'A cryptographic library for hashing passwords.',
        'A file lock that prevents concurrent write operations to sqlite3 databases.',
        'A network firewall built into the Python standard library.',
      ],
      correctOption: 0,
      explanation: 'The CPython GIL is a thread synchronization lock that prevents multiple native threads from executing Python bytecodes concurrently, safeguarding thread-unsafe memory management.',
    },

    // Skill 2: FastAPI (3 questions)
    {
      id: 'py_fastapi_01',
      careerId: 'python-developer',
      skill: 'FastAPI',
      category: 'Backend Framework',
      question: 'What underlying library does FastAPI leverage for request data validation and schema definitions?',
      options: ['Pydantic', 'Marshmallow', 'Cerberus', 'Django ORM'],
      correctOption: 0,
      explanation: 'FastAPI is built on Pydantic, using standard Python type annotations to perform automatic request validation, type casting, and serialization.',
    },
    {
      id: 'py_fastapi_02',
      careerId: 'python-developer',
      skill: 'FastAPI',
      category: 'Backend Framework',
      question: 'How do you inject reusable dependencies (e.g., database sessions or auth checks) into FastAPI path operations?',
      options: [
        'By declaring parameters with `Depends(dependency_function)`.',
        'By using global Python variables across modules.',
        'By importing middleware manually inside each route function body.',
        'By subclassing the FastAPI application class.',
      ],
      correctOption: 0,
      explanation: 'FastAPI provides a built-in Dependency Injection system via `Depends(...)`, handling shared setup/teardown (like database sessions) automatically.',
    },
    {
      id: 'py_fastapi_03',
      careerId: 'python-developer',
      skill: 'FastAPI',
      category: 'Backend Framework',
      question: 'What automatic documentation interfaces does FastAPI provide out-of-the-box at `/docs` and `/redoc`?',
      options: [
        'Swagger UI and ReDoc interactive OpenAPI documentation.',
        'Markdown static file documentation only.',
        'Sphinx documentation requiring manual compilation.',
        'Raw unformatted JSON dumps with no visual UI.',
      ],
      correctOption: 0,
      explanation: 'FastAPI automatically generates an OpenAPI schema and serves interactive Swagger UI (`/docs`) and ReDoc (`/redoc`) web interfaces without extra configuration.',
    },

    // Skill 3: AsyncIO (3 questions)
    {
      id: 'py_async_01',
      careerId: 'python-developer',
      skill: 'AsyncIO',
      category: 'Concurrency',
      question: 'What keywords are used in Python 3.5+ to define and pause execution of an asynchronous coroutine?',
      options: ['async def and await', 'def and yield from', 'thread and join', 'defer and wait'],
      correctOption: 0,
      explanation: 'Coroutines are declared with `async def` and pause non-blockingly using `await` while waiting for another awaitable or async I/O operation.',
    },
    {
      id: 'py_async_02',
      careerId: 'python-developer',
      skill: 'AsyncIO',
      category: 'Concurrency',
      question: 'What happens if you execute a CPU-intensive, long-running calculation or synchronous `time.sleep(10)` inside an async function on the main event loop?',
      options: [
        'It blocks the entire event loop, freezing all concurrent requests and coroutines.',
        'AsyncIO automatically spawns a background thread to prevent blocking.',
        'Python throws an AsyncBlockedException.',
        'The calculation is automatically optimized by the CPython JIT compiler.',
      ],
      correctOption: 0,
      explanation: 'AsyncIO operates on a cooperative single-threaded event loop. Blocking synchronous operations halt the loop and stall all other pending tasks until the synchronous call returns.',
    },
    {
      id: 'py_async_03',
      careerId: 'python-developer',
      skill: 'AsyncIO',
      category: 'Concurrency',
      question: 'Which `asyncio` function runs multiple coroutines concurrently and collects their results in order?',
      options: ['asyncio.gather(*tasks)', 'asyncio.run_parallel()', 'asyncio.fork()', 'asyncio.chain()'],
      correctOption: 0,
      explanation: '`asyncio.gather(*aws)` schedules multiple awaitable objects concurrently on the event loop and returns a list of their returned values once all complete.',
    },

    // Skill 4: Docker (3 questions)
    {
      id: 'py_docker_01',
      careerId: 'python-developer',
      skill: 'Docker',
      category: 'DevOps & Containers',
      question: 'What is the primary architectural difference between a Docker container and a traditional Virtual Machine (VM)?',
      options: [
        'Containers share the host OS kernel and isolate processes in user space; VMs emulate full hardware and run a complete guest OS.',
        'Containers require specialized hardware chips; VMs run on standard CPUs.',
        'Containers cannot run Python applications.',
        'VMs are always faster to start up than Docker containers.',
      ],
      correctOption: 0,
      explanation: 'Docker containers share the host kernel via cgroups and namespaces, resulting in lightweight, fast-starting processes that consume far less memory than VMs running complete guest operating systems.',
    },
    {
      id: 'py_docker_02',
      careerId: 'python-developer',
      skill: 'Docker',
      category: 'DevOps & Containers',
      question: 'Why are Multi-Stage Builds used in production Dockerfiles?',
      options: [
        'To separate the build environment from the final runtime image, resulting in dramatically smaller and more secure images.',
        'To allow multiple containers to share the same IP address.',
        'To automatically push images to Docker Hub during compilation.',
        'To bypass all Dockerfile caching mechanisms.',
      ],
      correctOption: 0,
      explanation: 'Multi-stage builds allow developers to compile assets, install heavy build toolchains in early stages, and copy only the final artifacts into a lean minimal production base image.',
    },
    {
      id: 'py_docker_03',
      careerId: 'python-developer',
      skill: 'Docker',
      category: 'DevOps & Containers',
      question: 'In a `docker-compose.yml` file, what is the purpose of the `depends_on` attribute?',
      options: [
        'It expresses startup order dependencies between services (e.g. starting the database before the backend app).',
        'It automatically updates base Docker images from the internet.',
        'It compiles Python wheels before running tests.',
        'It merges multiple container filesystems into a single ZIP file.',
      ],
      correctOption: 0,
      explanation: '`depends_on` controls the order in which container services start up and shut down, ensuring infrastructure services (like PostgreSQL) start before dependent services (like web APIs).',
    },

    // Skill 5: PostgreSQL (3 questions)
    {
      id: 'py_pg_01',
      careerId: 'python-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'In Python database libraries like SQLAlchemy or asyncpg, what is the role of a Connection Pool?',
      options: [
        'It maintains a cache of open database connections for reuse, avoiding the high latency of establishing new TCP/TLS connections on every request.',
        'It stores SQL query results in browser cookies.',
        'It converts PostgreSQL tables into CSV files on local disk.',
        'It automatically creates foreign key constraints.',
      ],
      correctOption: 0,
      explanation: 'Connection pooling maintains an active pool of open database sockets. Applications borrow and return connections quickly, avoiding the overhead of connection handshakes on every HTTP query.',
    },
    {
      id: 'py_pg_02',
      careerId: 'python-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'What security risk occurs when raw user inputs are formatted directly into SQL query strings (e.g. `f"SELECT * FROM users WHERE email = \'{input}\'"`)?',
      options: [
        'SQL Injection (SQLi), allowing attackers to bypass authentication or extract/modify database records.',
        'Cross-Site Scripting (XSS).',
        'Cross-Origin Resource Sharing (CORS) failure.',
        'Database memory overflow crashes.',
      ],
      correctOption: 0,
      explanation: 'Concatenating untrusted user input directly into SQL queries opens critical SQL Injection vulnerabilities. Parameterized queries or prepared statements must always be used.',
    },
    {
      id: 'py_pg_03',
      careerId: 'python-developer',
      skill: 'PostgreSQL',
      category: 'Database',
      question: 'What database tool is commonly paired with SQLAlchemy in Python projects to manage schema migrations across versions?',
      options: ['Alembic', 'Celery', 'Gunicorn', 'Pytest'],
      correctOption: 0,
      explanation: 'Alembic is the standard database migration tool for SQLAlchemy, enabling developers to write, generate, and execute automated schema upgrade and downgrade scripts.',
    },
  ],

  'ai-ml-engineer': [
    // Skill 1: PyTorch (3 questions)
    {
      id: 'aiml_torch_01',
      careerId: 'ai-ml-engineer',
      skill: 'PyTorch',
      category: 'Deep Learning',
      question: 'What PyTorch engine automatically calculates gradients for neural network backpropagation during the backward pass?',
      options: ['Autograd', 'TorchVision', 'TorchScript', 'ONNX'],
      correctOption: 0,
      explanation: 'Autograd is PyTorch’s automatic differentiation engine that records operations on tensors in a directed acyclic graph (DAG) and computes gradients via `.backward()`.',
    },
    {
      id: 'aiml_torch_02',
      careerId: 'ai-ml-engineer',
      skill: 'PyTorch',
      category: 'Deep Learning',
      question: 'Why is `optimizer.zero_grad()` called before executing the backward pass (`loss.backward()`) during model training?',
      options: [
        'By default, PyTorch accumulates gradients in tensor buffers; zeroing resets them before each optimization step.',
        'To reset the learning rate of the optimizer to zero.',
        'To delete unused tensors from GPU VRAM.',
        'To prevent model weights from changing during inference.',
      ],
      correctOption: 0,
      explanation: 'In PyTorch, gradients accumulate by default across backward calls. Invoking `optimizer.zero_grad()` clears the gradients so new gradients for the current batch are computed cleanly.',
    },
    {
      id: 'aiml_torch_03',
      careerId: 'ai-ml-engineer',
      skill: 'PyTorch',
      category: 'Deep Learning',
      question: 'What context manager should be used during PyTorch inference to reduce memory consumption and speed up forward passes?',
      options: ['torch.no_grad()', 'torch.train()', 'torch.autograd.set_detect_anomaly(True)', 'torch.cuda.synchronize()'],
      correctOption: 0,
      explanation: 'Wrapping inference in `with torch.no_grad():` disables Autograd graph construction, saving substantial GPU memory and accelerating forward computation.',
    },

    // Skill 2: LLM APIs (3 questions)
    {
      id: 'aiml_llm_01',
      careerId: 'ai-ml-engineer',
      skill: 'LLM APIs',
      category: 'Generative AI',
      question: 'In Large Language Model generation, what does lowering the `temperature` parameter (e.g. from 0.9 to 0.1) achieve?',
      options: [
        'It makes outputs more deterministic, focused, and repeatable by concentrating probability mass on top tokens.',
        'It makes the model respond in all lowercase letters.',
        'It reduces the cost of tokens by 50%.',
        'It prevents the model from generating Markdown formatting.',
      ],
      correctOption: 0,
      explanation: 'Temperature scales the logits before softmax. Lower temperatures sharpen the distribution, favoring the highest-probability tokens for deterministic and structured outputs.',
    },
    {
      id: 'aiml_llm_02',
      careerId: 'ai-ml-engineer',
      skill: 'LLM APIs',
      category: 'Generative AI',
      question: 'What is the function of the `system` message role in chat completion API requests (e.g. Groq, OpenAI)?',
      options: [
        'To set overarching behavioral instructions, personas, safety guidelines, and output formatting rules for the conversation.',
        'To send binary image files to the model.',
        'To provide the user’s real-time microphone input.',
        'To bypass all API rate limits.',
      ],
      correctOption: 0,
      explanation: 'The system message guides model behavior, establishing instructions, constraints, and personas that the model adheres to throughout the generation process.',
    },
    {
      id: 'aiml_llm_03',
      careerId: 'ai-ml-engineer',
      skill: 'LLM APIs',
      category: 'Generative AI',
      question: 'What does "Structured Outputs" (e.g. `response_format: { type: "json_object" }` or JSON Schema) guarantee when interacting with an LLM API?',
      options: [
        'The model response is strictly conformant, parseable JSON according to the specified schema.',
        'The response is automatically translated into SQL.',
        'The model cannot make factual mistakes.',
        'The API call will never throw HTTP 429 rate limit errors.',
      ],
      correctOption: 0,
      explanation: 'Structured outputs constrain token generation during decoding, guaranteeing that the model produces syntactically valid JSON matching target schema definitions.',
    },

    // Skill 3: Prompt Eng (3 questions)
    {
      id: 'aiml_prompt_01',
      careerId: 'ai-ml-engineer',
      skill: 'Prompt Eng',
      category: 'Generative AI',
      question: 'What is the "Few-Shot Prompting" technique?',
      options: [
        'Providing the model with a few high-quality input-output demonstration examples within the prompt before the target query.',
        'Limiting the model to generating only three words at a time.',
        'Prompting the model with random dictionary words.',
        'Calling the API repeatedly until a successful response is returned.',
      ],
      correctOption: 0,
      explanation: 'Few-shot prompting conditions the model by embedding explicit examples of the desired task in the prompt context, guiding it to mirror the desired format and reasoning.',
    },
    {
      id: 'aiml_prompt_02',
      careerId: 'ai-ml-engineer',
      skill: 'Prompt Eng',
      category: 'Generative AI',
      question: 'What core vulnerability is mitigated by wrapping untrusted user input inside XML/delimiter tags and providing negative behavioral directives in system instructions?',
      options: [
        'Prompt Injection and jailbreaking attacks.',
        'Cross-Site Request Forgery (CSRF).',
        'Buffer overflow vulnerabilities in CPython.',
        'Server DNS resolution timeouts.',
      ],
      correctOption: 0,
      explanation: 'Clear data delimiters (e.g. `<untrusted_content>`) combined with negative directives instruct the model to treat external content strictly as passive data rather than executable instructions.',
    },
    {
      id: 'aiml_prompt_03',
      careerId: 'ai-ml-engineer',
      skill: 'Prompt Eng',
      category: 'Generative AI',
      question: 'What is Chain-of-Thought (CoT) prompting designed to improve in foundation models?',
      options: [
        'Complex multi-step reasoning, mathematical derivation, and logical deduction.',
        'Token generation speed and throughput.',
        'Audio speech synthesis clarity.',
        'Model GPU memory utilization.',
      ],
      correctOption: 0,
      explanation: 'Chain-of-Thought prompting encourages the model to generate intermediate reasoning steps before arriving at a final answer, substantially boosting accuracy on complex logic tasks.',
    },

    // Skill 4: Vector DBs (3 questions)
    {
      id: 'aiml_vectordb_01',
      careerId: 'ai-ml-engineer',
      skill: 'Vector DBs',
      category: 'Vector Search',
      question: 'What mathematical similarity metric measures the cosine of the angle between two embedding vectors regardless of their magnitude?',
      options: ['Cosine Similarity', 'Euclidean Distance (L2)', 'Manhattan Distance (L1)', 'Hamming Distance'],
      correctOption: 0,
      explanation: 'Cosine similarity evaluates directional alignment: a value of 1 indicates parallel vectors (high semantic similarity), 0 indicates orthogonality, and -1 indicates opposite direction.',
    },
    {
      id: 'aiml_vectordb_02',
      careerId: 'ai-ml-engineer',
      skill: 'Vector DBs',
      category: 'Vector Search',
      question: 'Why do Vector Databases use Approximate Nearest Neighbor (ANN) indexing (such as HNSW or IVF) instead of exact brute-force search?',
      options: [
        'Brute-force O(N) comparisons do not scale to millions of high-dimensional vectors; ANN achieves sub-linear O(log N) retrieval with minimal loss in recall.',
        'Brute-force search causes database corruption on SSDs.',
        'ANN algorithms reduce vector embeddings to single-digit integers.',
        'Exact search is mathematically impossible on digital computers.',
      ],
      correctOption: 0,
      explanation: 'Comparing a query vector against every record in high-dimensional space is computationally prohibitive at scale. ANN indexes like HNSW provide fast, sub-linear semantic retrieval.',
    },
    {
      id: 'aiml_vectordb_03',
      careerId: 'ai-ml-engineer',
      skill: 'Vector DBs',
      category: 'Vector Search',
      question: 'What is an "embedding vector" in the context of semantic search and vector databases?',
      options: [
        'A high-dimensional numerical array generated by a neural model that captures the semantic meaning of text or media.',
        'An HTML tag used to embed YouTube videos in web pages.',
        'A binary encryption key used to sign JSON Web Tokens.',
        'A foreign key column connecting relational database tables.',
      ],
      correctOption: 0,
      explanation: 'Embeddings are dense numerical representations in semantic vector space where concepts with similar meanings map to geometrically proximate vectors.',
    },

    // Skill 5: RAG (3 questions)
    {
      id: 'aiml_rag_01',
      careerId: 'ai-ml-engineer',
      skill: 'RAG',
      category: 'Information Retrieval',
      question: 'What does the acronym RAG stand for in modern AI application architecture?',
      options: [
        'Retrieval-Augmented Generation',
        'Recursive Autoencoding Gradient',
        'Relational Attribute Gateway',
        'Realtime Asynchronous Gradient',
      ],
      correctOption: 0,
      explanation: 'RAG stands for Retrieval-Augmented Generation: retrieving external factual context from a knowledge base and passing it into an LLM prompt to generate grounded, up-to-date answers.',
    },
    {
      id: 'aiml_rag_02',
      careerId: 'ai-ml-engineer',
      skill: 'RAG',
      category: 'Information Retrieval',
      question: 'Why is document "chunking" (splitting text into smaller passages with overlap) necessary in a RAG pipeline?',
      options: [
        'To ensure retrieved contexts fit within LLM context window limits and maintain high semantic signal-to-noise ratio.',
        'Because vector databases can only store a maximum of 100 characters per record.',
        'To convert PDF documents into image formats.',
        'Chunking is an optional styling choice that has no effect on retrieval quality.',
      ],
      correctOption: 0,
      explanation: 'Chunking breaks long documents into focused passages. Small, semantically cohesive chunks yield precise embeddings that match query vectors and fit neatly into the model’s context window.',
    },
    {
      id: 'aiml_rag_03',
      careerId: 'ai-ml-engineer',
      skill: 'RAG',
      category: 'Information Retrieval',
      question: 'What is the primary role of a "Reranker" model (such as Cohere Rerank or BGE-Reranker) in an advanced RAG architecture?',
      options: [
        'To score and re-order the top-K retrieved candidate documents using cross-attention, improving the relevance of context presented to the LLM.',
        'To delete documents from the vector database automatically.',
        'To translate user queries into SQL statements.',
        'To compress PDF documents for faster network download.',
      ],
      correctOption: 0,
      explanation: 'Bi-encoder vector search is fast but coarse. A cross-encoder reranker computes deep query-document interaction scores, reordering top candidates so only the most pertinent passages are fed to the generator.',
    },
  ],
};

/**
 * Returns the 15 canonical diagnostic questions for a given careerId.
 * Throws an error if the careerId is not recognized.
 *
 * @param {string} careerId
 * @returns {Array<object>}
 */
export function getQuestionsForCareer(careerId) {
  if (!careerId || typeof careerId !== 'string') {
    throw new Error('careerId is required and must be a string');
  }

  const normalized = careerId.trim().toLowerCase();
  const questions = QUESTION_BANK[normalized];

  if (!questions || !Array.isArray(questions)) {
    throw new Error(`No diagnostic questions configured for career: "${careerId}"`);
  }

  return questions;
}

/**
 * Sanitizes questions for client delivery.
 * CRITICAL SECURITY GUARANTEE:
 * Completely strips `correctOption` and `explanation` so answer keys never leak before submission.
 *
 * @param {Array<object>} questions
 * @returns {Array<object>}
 */
export function sanitizeQuestionsForClient(questions) {
  if (!Array.isArray(questions)) return [];

  return questions.map((q) => ({
    id: q.id,
    careerId: q.careerId,
    skill: q.skill,
    category: q.category,
    question: q.question,
    options: [...q.options],
  }));
}

/**
 * Grades user-submitted answers against the canonical question bank.
 *
 * Scoring Rules:
 * - per-skill score = Math.round((correct / 3) * 100)
 * - overall score = Math.round((totalCorrect / 15) * 100)
 * - Returns detailed review with isCorrect, correctOption, and explanation
 *
 * @param {string} careerId
 * @param {Array<{ questionId: string, selectedOption: number }>} userAnswers
 * @returns {{
 *   overallScore: number,
 *   totalCorrect: number,
 *   totalQuestions: number,
 *   skillScores: Array<{ name: string, category: string, questionsTotal: number, questionsCorrect: number, score: number, level: number, source: 'assessment-verified' }>,
 *   questionResponses: Array<{ questionId: string, skill: string, selectedOption: number, correctOption: number, isCorrect: boolean, explanation: string }>
 * }}
 */
export function gradeAssessmentSubmission(careerId, userAnswers) {
  const canonicalQuestions = getQuestionsForCareer(careerId);
  const questionsMap = new Map(canonicalQuestions.map((q) => [q.id, q]));

  // Map user answers for fast lookup
  const userAnswersMap = new Map();
  if (Array.isArray(userAnswers)) {
    for (const ans of userAnswers) {
      if (ans && ans.questionId) {
        userAnswersMap.set(ans.questionId, ans.selectedOption);
      }
    }
  }

  // Group by skill
  const skillStats = new Map();
  const questionResponses = [];
  let totalCorrect = 0;

  for (const q of canonicalQuestions) {
    if (!skillStats.has(q.skill)) {
      skillStats.set(q.skill, {
        name: q.skill,
        category: q.category,
        questionsTotal: 0,
        questionsCorrect: 0,
      });
    }

    const stats = skillStats.get(q.skill);
    stats.questionsTotal += 1;

    const userSelected = userAnswersMap.has(q.id) ? userAnswersMap.get(q.id) : null;
    const isCorrect = userSelected === q.correctOption;

    if (isCorrect) {
      stats.questionsCorrect += 1;
      totalCorrect += 1;
    }

    questionResponses.push({
      questionId: q.id,
      skill: q.skill,
      selectedOption: userSelected !== null ? userSelected : -1,
      correctOption: q.correctOption,
      isCorrect,
      explanation: q.explanation,
    });
  }

  const totalQuestions = canonicalQuestions.length; // 15
  const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

  const skillScores = Array.from(skillStats.values()).map((stat) => {
    const score = Math.round((stat.questionsCorrect / stat.questionsTotal) * 100);
    return {
      name: stat.name,
      category: stat.category,
      questionsTotal: stat.questionsTotal,
      questionsCorrect: stat.questionsCorrect,
      score,
      level: score,
      source: 'assessment-verified',
    };
  });

  return {
    overallScore,
    totalCorrect,
    totalQuestions,
    skillScores,
    questionResponses,
  };
}

export default {
  QUESTION_BANK,
  getQuestionsForCareer,
  sanitizeQuestionsForClient,
  gradeAssessmentSubmission,
};
