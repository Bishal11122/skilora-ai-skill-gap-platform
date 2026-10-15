# Proposed Folder Structure

**Project Name:** AI-Powered Skill Gap Analysis & Personalized Learning Platform  
**Degree:** Bachelor of Computer Applications (BCA) — AIML, 5th Semester  
**College:** JNCT Professional University, Bhopal  
**Authors:** Bishal Sharma, Lakshya Deep  
**Tagline:** Resume → AI → Skills → Learning → Career  
**Project Status:** Phase 1 complete (Specification & Architecture)

> **Note for Developers:** This document defines the planned project architecture. In accordance with Phase 1 rules, the `client/` and `server/` directories will be scaffolded in subsequent phases.

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

## 2. Proposed Client Structure (`client/`)

```
client/
├── public/                 # Static assets like favicon, images, and public web manifest
├── src/                    # Source code for the React client application
│   ├── assets/             # Images, logos, and vector illustrations used throughout the UI
│   ├── components/         # Reusable UI building blocks across multiple screens
│   │   ├── common/         # Generic UI primitives like buttons, badges, modals, and spinners
│   │   ├── layout/         # Structural components such as Navbar, Footer, and Sidebar
│   │   ├── dashboard/      # Recharts visualizations, metric cards, and progress summaries
│   │   ├── roadmap/        # Step-by-step roadmap timeline cards and topic items
│   │   └── quiz/           # Quiz question cards, timer bar, option selectors, and feedback panels
│   ├── context/            # React Context providers for global authentication state and user session
│   ├── hooks/              # Custom React hooks for authentication, API calls, and local storage
│   ├── pages/              # Main route views corresponding to user workflow steps
│   ├── services/           # HTTP API client functions communicating with the Express backend
│   ├── config/             # Client-side Firebase configuration and environment variable bindings
│   ├── types/              # TypeScript / JSDoc / Zod schemas and validation rules
│   ├── utils/              # Helper functions for mathematical formatting, dates, and scoring labels
│   ├── App.jsx             # Root React component defining client-side routes via React Router
│   ├── main.jsx            # Vite entry point rendering the React application to the DOM
│   └── index.css           # Global stylesheet containing Tailwind CSS directives and base styles
├── .env.example            # Sample template for frontend environment variables (e.g. Firebase public config)
├── package.json            # Frontend dependencies (React, Vite, Tailwind CSS, Lucide, Recharts, Zod)
├── postcss.config.js       # PostCSS configuration file for Tailwind CSS processing
├── tailwind.config.js      # Tailwind CSS design system configuration, color palette, and extensions
└── vite.config.js          # Vite build tool and development server configuration
```

### Folder Purposes (Client):
- **`public/`** — Stores static public files served directly without processing by Vite.
- **`src/assets/`** — Stores media assets such as project graphics, icons, and illustrations.
- **`src/components/common/`** — Contains reusable base UI widgets (e.g., Button, Modal, Card, Input).
- **`src/components/layout/`** — Contains high-level layout containers (Navbar, Footer, MainLayout).
- **`src/components/dashboard/`** — Contains dashboard-specific widgets and Recharts visual components.
- **`src/components/roadmap/`** — Contains timeline and roadmap step list components.
- **`src/components/quiz/`** — Contains quiz runner components and interactive question cards.
- **`src/context/`** — Provides global React context for tracking current authenticated user state.
- **`src/hooks/`** — Encapsulates reusable UI and data-fetching logic into custom React hooks.
- **`src/pages/`** — Contains full page views (Landing, Login, CareerSelect, ResumeUpload, Assessment, Dashboard).
- **`src/services/`** — Manages outgoing fetch/Axios requests to backend endpoints with Firebase token headers.
- **`src/config/`** — Initializes Firebase client SDK using public configuration keys.
- **`src/types/`** — Stores Zod validation schemas for forms and structured data models.
- **`src/utils/`** — Houses pure utility helper functions such as percentage calculations and text formatting.

---

## 3. Proposed Server Structure (`server/`)

```
server/
├── src/                    # Source code for the Express REST API backend
│   ├── config/             # Backend configuration, Firebase Admin setup, and environment variables
│   ├── controllers/        # Request handlers implementing business logic for each route
│   ├── middleware/         # Express middlewares for Firebase ID token verification and error handling
│   ├── routes/             # Express router definitions mapping API endpoints to controllers
│   ├── services/           # Integration services for the Groq Cloud API, Firestore, and file parsers
│   ├── data/               # Static benchmark datasets (predefined career skills and benchmark levels)
│   ├── utils/              # Helper utilities for calculations, prompt formatting, and response sanitization
│   └── app.js              # Express application setup, middleware configuration, and router mounting
├── uploads/                # Temporary local directory for in-flight resume processing (never tracked in Git)
├── .env.example            # Template for backend secrets (PORT, GROQ_API_KEY, GROQ_MODEL, etc.)
├── package.json            # Server dependencies (Express, groq-sdk, firebase-admin, multer, cors, dotenv)
└── server.js               # Server entry point that initializes ports and begins listening for requests
```

### Folder Purposes (Server):
- **`src/config/`** — Initializes Firebase Admin SDK credentials and validates required environment variables.
- **`src/controllers/`** — Processes incoming HTTP requests, validates input, calls services, and sends responses.
- **`src/middleware/`** — Inspects Firebase bearer tokens to verify user identity before reaching controllers.
- **`src/routes/`** — Groups REST API endpoints by module (auth, careers, resume, assessment, roadmap, quizzes).
- **`src/services/`** — Contains specialized service modules for Groq AI prompting, Firestore queries, and resume parsing.

- **`src/data/`** — Stores career profiles, benchmark levels, and standard skill taxonomies.
- **`src/utils/`** — Houses mathematical scoring formulas, gap classification functions, and input sanitizers.
- **`uploads/`** — Acts as a short-lived scratch folder for handling file streams during resume text extraction.
