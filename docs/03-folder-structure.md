# Proposed Folder Structure

**Project Name:** AI-Powered Skill Gap Analysis & Personalized Learning Platform  
**Degree:** Bachelor of Computer Applications (BCA) — AIML, 5th Semester  
**College:** JNCT Professional University, Bhopal  
**Authors:** Bishal Sharma, Lakshya Deep  
**Tagline:** Resume → AI → Skills → Learning → Career  
**Project Status:** Phase 7 complete (Diagnostic Skill Assessment & Scoring Verification)

> **Note for Developers:** This document defines the actual project architecture implemented through Phase 7. The `client/` and `server/` structures reflect the verified code base.

---

## 1. Top-Level Repository Structure

```
skill-gap-platform/
├── docs/                   # Architectural blueprints, requirements, scoring, and workflow documentation
├── client/                 # React frontend application built with Vite and Tailwind CSS
├── server/                 # Node.js and Express REST API backend with Firebase Admin and Groq SDK
├── .gitignore              # Files, secrets, and directories excluded from Git tracking
└── README.md               # Project summary, author credentials, setup guidelines, and phase status
```

- **`docs/`** — Contains project specifications, system architecture, folder layouts, scoring rules, and team workflow.
- **`client/`** — Houses the single-page web application running in the user's browser.
- **`server/`** — Houses the backend REST API handling authentication verification, AI prompts, and database access.

---

## 2. Client Structure (`client/`)

```
client/
├── public/                 # Static assets like favicon, images, and public web manifest
├── src/                    # Source code for the React client application
│   ├── assets/             # Images, logos, and vector illustrations used throughout the UI
│   ├── components/         # Reusable UI building blocks across multiple screens
│   │   ├── auth/           # Route guards (ProtectedRoute, GuestRoute)
│   │   ├── common/         # Generic UI primitives like buttons, badges, modals, and spinners
│   │   ├── ui/             # Design-system components (Button, Badge, Card, Container, Navbar, Logo)
│   │   └── dashboard/      # Visualization widgets and metric cards
│   ├── contexts/           # React Context providers for ThemeContext and AuthContext
│   ├── hooks/              # Custom React hooks (useAuth, useTheme)
│   ├── layouts/            # Layout wrappers (PublicLayout)
│   ├── pages/              # Main route views corresponding to user workflow steps
│   │   ├── LandingPage.jsx         # Public overview and value proposition
│   │   ├── LoginPage.jsx           # Guest sign-in with email & password
│   │   ├── RegisterPage.jsx        # Guest registration with validation
│   │   ├── ForgotPasswordPage.jsx  # Password reset dispatch
│   │   ├── DashboardPage.jsx       # Student profile & setup checklist (Steps 1, 2, 3)
│   │   ├── CareerSelectionPage.jsx # Target career role selector
│   │   ├── ResumeUploadPage.jsx    # Supabase resume storage & Groq AI skill extraction
│   │   ├── AssessmentPage.jsx      # Phase 7: Timed diagnostic assessment runner & verified review
│   │   ├── SetupCheck.jsx          # Live system diagnostic verification
│   │   └── NotFoundPage.jsx        # 404 catch-all view
│   ├── services/           # HTTP API client functions (api.js with getAuth, postAuth, uploadAuth, deleteAuth)
│   ├── App.jsx             # Root React component defining client-side routes via React Router
│   ├── main.jsx            # Vite entry point rendering the React application to the DOM
│   └── index.css           # Global stylesheet containing design tokens, CSS variables, and base styles
├── .env.example            # Sample template for frontend environment variables (Firebase public config)
├── package.json            # Frontend dependencies (React, Vite, Tailwind CSS, Lucide, Recharts, Zod)
└── vite.config.js          # Vite build tool and development server configuration
```

### Key Client Highlights (Phase 7):
- **`src/pages/AssessmentPage.jsx`** — Manages the 3 diagnostic states: Overview, Active Assessment Runner (with server-synchronized timer, 15-question jump navigator, and confirmation modal), and Verified Results (with `assessment-verified` tags and review accordion).
- **`src/components/ui/Navbar.jsx`** — Provides authenticated access to `/assessment` across desktop and mobile menus.
- **`src/pages/DashboardPage.jsx`** — Integrates Step 3 into "Your Learning Setup" and displays verified competency cards.

---

## 3. Server Structure (`server/`)

```
server/
├── src/                    # Source code for the Express REST API backend
│   ├── config/             # Backend configuration, Firebase Admin setup, Supabase client, and env.js
│   ├── controllers/        # Request handlers implementing business logic
│   │   ├── auth.controller.js        # Health and session verification
│   │   ├── user.controller.js        # User profile, career selection, and assessed skills
│   │   ├── career.controller.js      # Benchmark career catalog retrieval
│   │   ├── resume.controller.js      # Resume storage & Groq AI extraction handlers
│   │   └── assessment.controller.js  # Phase 7: Assessment session lifecycle, timer, and atomic submission
│   ├── middleware/         # Express middlewares (authenticate.js for Firebase ID tokens, error handlers)
│   ├── routes/             # Express router definitions mapping API endpoints to controllers
│   │   ├── index.js                  # Master API router mounting sub-routes
│   │   ├── user.routes.js            # User profile endpoints
│   │   ├── career.routes.js          # Career benchmark endpoints
│   │   ├── resume.routes.js          # Resume management & AI extraction routes
│   │   └── assessment.routes.js      # Phase 7: Diagnostic assessment routes (/status, /start, /submit, /result)
│   ├── services/           # Integration services for Groq Cloud API, Supabase Storage, and PDF/DOCX parsing
│   │   ├── groq.service.js           # Groq Cloud API integration for structured JSON skill extraction
│   │   ├── supabaseStorage.service.js# Private object storage in resumes bucket
│   │   └── resumeParser.service.js   # PDF and DOCX text extraction
│   ├── validators/         # Zod schemas for request validation
│   │   ├── user.validator.js         # User update and career selection schemas
│   │   ├── resume.validator.js       # File signature and consent schemas
│   │   └── assessment.validator.js   # Phase 7: Assessment submission schema validation
│   ├── data/               # Static benchmark datasets & question banks
│   │   ├── careerBenchmarks.js       # 5 career benchmark profiles with 5 skills each
│   │   └── diagnosticQuestions.js    # Phase 7: 75 deterministic questions across 5 careers, sanitization & grading
│   ├── utils/              # Helper utilities (textSanitizer.js)
│   └── app.js              # Express application setup, middleware configuration, and router mounting
├── test/                   # Automated backend test suite (Node.js test runner)
│   ├── careerSelection.test.js       # Career selection validation tests
│   ├── fileSignature.test.js         # File signature and upload validation tests
│   ├── groqSkillExtraction.test.js   # Groq AI extraction unit & mock tests
│   ├── resumeParsing.test.js         # PDF/DOCX parsing tests
│   ├── supabaseStorage.test.js       # Supabase private storage tests
│   └── assessment.test.js            # Phase 7: 12 tests covering question bank, timer, transactions, and grading
├── uploads/                # Temporary local directory for in-flight resume processing (never tracked in Git)
├── .env.example            # Template for backend secrets (PORT, GROQ_API_KEY, GROQ_MODEL, etc.)
├── package.json            # Server dependencies (Express, groq-sdk, firebase-admin, multer, cors, dotenv, zod)
└── server.js               # Server entry point that initializes ports and begins listening for requests
```

### Key Server Highlights (Phase 7):
- **`src/data/diagnosticQuestions.js`** — Deterministic question bank containing 15 questions per career for all 5 careers, sanitization utility `sanitizeQuestionsForClient()`, and grading utility `gradeAssessmentSubmission()`.
- **`src/controllers/assessment.controller.js`** — Enforces user ownership, 10-minute server timer (+ 15s grace), duplicate prevention, and atomic Cloud Firestore transactions for submission persistence.
- **`src/validators/assessment.validator.js`** — Validates submission payload structure and option indices (`0..3`).
- **`test/assessment.test.js`** — 12 automated unit and integration tests verifying question bank coverage, answer key stripping, integer score rounding, timer deadlines, and atomic concurrency handling.
