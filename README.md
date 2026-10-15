# AI-Powered Skill Gap Analysis & Personalized Learning Platform

> **Tagline:** Resume → AI → Skills → Learning → Career  
> **Main Idea:** "Our system helps students know what to learn and how to learn it."

A minor project submitted in partial fulfilment of the requirements for the degree of **Bachelor of Computer Applications (BCA) — AIML (5th Semester)**, JNCT Professional University, Bhopal.

**Authors:**
- Bishal Sharma
- Lakshya Deep

---

## Project Status

**Status: Phase 7 complete**
*(Firebase Authentication, target career selection, private Supabase Storage resume management, in-memory PDF/DOCX text extraction pipeline, AI Skill Extraction via Groq Cloud API, and Diagnostic Skill Assessment & Scoring Verification with 56 verified backend tests.)*

---

## Available Application Routes

- **`/`** — Public Landing Page (Hero, 7 feature cards, 9-step workflow, 5 career paths, and final CTA).
- **`/login`** — Sign In (Guest route with email & password authentication).
- **`/register`** — Registration (Guest route with Zod validation, Firebase user creation, and backend profile generation).
- **`/forgot-password`** — Password Reset (Guest route dispatching password recovery instructions via Firebase Auth).
- **`/dashboard`** — User Profile & Setup Dashboard (Protected route displaying profile, active career, resume status, and verified competencies).
- **`/career`** — Career Selection (Protected route with keyboard-operable radio cards, benchmark skills, and confirmation).
- **`/resume`** — Resume Upload, Storage & AI Skill Extraction (Protected route with drag-drop, consent, replace, delete, and Groq AI analysis).
- **`/assessment`** — Diagnostic Skill Assessment (Protected route with 10-minute server timer, 15-question evaluator across career benchmark skills, and verified score review).
- **`/setup-check`** — System Health Check (Live API verification endpoint).
- **`*`** — 404 Catch-All Page Not Found.

---

## Backend API Endpoints

- **`GET /api/health`** — Public API health status.
- **`GET /api/users/me`** — Protected: Retrieves current authenticated user profile from Cloud Firestore (`users/{uid}`).
- **`POST /api/users/me`** — Protected: Idempotently creates user profile document `{ uid, displayName, email, createdAt, updatedAt }`.
- **`PATCH /api/users/me`** — Protected: Updates user `displayName` with Zod validation.
- **`PUT /api/users/me/career`** — Protected: Updates user target career goal (`selectedCareerId`, `selectedCareerAt`) with strict validation.
- **`GET /api/careers`** — Protected: Retrieves active career benchmark catalog from Firestore.
- **`GET /api/resume`** — Protected: Retrieves current user's resume metadata from Firestore (`resumes/{uid}`).
- **`POST /api/resume`** — Protected: Multipart upload to private Cloud Storage (`resumes/{uid}/{randomId}`) with consent and metadata.
- **`PUT /api/resume`** — Protected: Multipart replacement of stored resume with atomic metadata update and old object cleanup.
- **`DELETE /api/resume`** — Protected: Permanently deletes stored resume object and metadata for caller.
- **`POST /api/resume/analyze`** — Protected: Extracts and infers technical skills from uploaded resume using Groq Cloud API (`groq-sdk`).
- **`GET /api/assessment/status`** — Protected: Retrieves current active assessment session or previous verified assessment results.
- **`POST /api/assessment/start`** — Protected: Initializes or resumes 10-minute diagnostic session with sanitized question payload.
- **`POST /api/assessment/submit`** — Protected: Submits answers with atomic Firestore transaction, server-side grading, deadline enforcement, and explanation reveal.
- **`GET /api/assessment/result/:assessmentId`** — Protected: Retrieves stored verified assessment result and explanations for caller.


---

## Firebase Configuration

### Frontend Web Configuration (`client/.env`)
Set the public Firebase Web app configuration values in `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Backend Firebase Admin Configuration (`server/.env`)
Set the absolute path to your Firebase Admin SDK service account key JSON file in `server/.env`:
```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/service-account.json
```

---

## Local Setup

### Prerequisites
- **Node.js**: v20+ (tested on Node v24)
- **npm**: v10+ (tested on npm 11)

### 1. Server Setup (Backend)
Navigate to the `server/` directory and install dependencies:
```bash
cd server
npm install
```
Configure environment variables:
```bash
cp .env.example .env
```
Run the development server:
```bash
npm run dev
```
The server starts on port `5000`:
- **Base URL:** `http://localhost:5000`
- **Health Check Endpoint:** `http://localhost:5000/api/health`

You can test the health endpoint directly:
```bash
curl http://localhost:5000/api/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "skill-gap-platform-api",
  "time": "2026-10-09T..."
}
```

### 2. Client Setup (Frontend)
In a separate terminal, navigate to the `client/` directory and install dependencies:
```bash
cd client
npm install
```
Configure environment variables:
```bash
cp .env.example .env
```
Start the Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`. You will see the **Skill Gap Platform - Setup Check** page. If the server is running, the card will display:
```
Backend: connected
Status: ok
Service: skill-gap-platform-api
```

---

## Project Description

Every student has different skills, career goals, and learning speeds. However, most students do not know exactly what skills they are missing for their desired tech career, nor do they know which resources to study. 

This platform solves that problem by using Artificial Intelligence to:
1. Extract existing skills from a student's uploaded resume.
2. Verify skills through focused assessments.
3. Compare current skills with industry career requirements.
4. Identify measurable skill gaps.
5. Generate an AI-powered personalized learning roadmap with curated resources and practice quizzes.
6. Provide an interactive dashboard to track learning progress over time.

---

## 9-Step User Workflow

The platform follows a strict 9-step sequence:
1. **Register/Login** — User creates an account or logs in securely.
2. **Select Career** — User picks their target career path (e.g., Full Stack Developer).
3. **Upload Resume** — User submits their resume for analysis (resumes are not stored permanently).
4. **Extract Skills (AI)** — AI reads the resume and extracts current technical skills.
5. **Take Assessment** — User completes questions to verify their current knowledge level.
6. **Find Skill Gap** — System computes the exact gap between required and current skill levels.
7. **Create Roadmap (AI)** — AI builds a structured, step-by-step learning roadmap tailored to the biggest gaps.
8. **Learn & Practice** — User studies recommended courses, videos, and documentation, and tests understanding with AI quizzes.
9. **Track Progress** — System tracks completed roadmap topics and displays live visual progress on the dashboard.

---

## Planned Modules & Features

- **Landing Page** — Clear introduction to the platform, features, workflow, and call to action.
- **Authentication** — Secure sign up, login, logout, and session management using Firebase Authentication.
- **Minimal Onboarding** *(Enhancement)* — Guided initial setup to welcome students and guide them into career selection.
- **Career Selection** — Curated library of tech career profiles with predefined required skill benchmarks.
- **Resume Skill Analysis** — Fast text extraction and AI parsing to detect technical skills without retaining resume files.
- **Skill Assessment** — Targeted diagnostic tests to confirm practical knowledge and assign objective scores.
- **Skill Gap Analysis** — Mathematical comparison using the formula `Skill Gap = Required Level - Current Level`.
- **Personalized Roadmap (AI)** — Dynamic, prioritized learning path focusing on high-gap skills first.
- **Curated Learning Resources** — Recommended free courses, documentation, tutorials, and practice projects.
- **AI Quizzes & Feedback** — Topic-based quizzes with AI evaluation and constructive advice on improvement areas.
- **Student Dashboard** — Visual summary featuring progress charts, current focus areas, and skill levels.
- **Progress Tracking** — Dynamically calculated completion metrics based on completed roadmap topics.
- **Profile & Settings** — User profile management and complete account-data deletion option.

---

## Technology Stack

The project relies strictly on a modern, free-tier friendly full-stack architecture:

- **Frontend:**
  - React (with Vite build tool)
  - Tailwind CSS (responsive styling)
  - React Router (client-side routing)
  - Lucide React (clean UI icons)
  - Recharts (dashboard data visualizations)
  - React Hook Form + Zod (form state management and schema validation)

- **Backend:**
  - Node.js + Express (REST API)
  - Firebase Admin SDK (secure server-side token verification and database operations)

- **Authentication & Database:**
  - Firebase Authentication (secure email/password and federated identity)
  - Cloud Firestore (NoSQL document database for user profiles, roadmaps, and progress)

- **Artificial Intelligence:**
  - Groq Cloud API via official SDK (`groq-sdk`)
  - Called **ONLY** from the backend server
  - Model configured via environment variable `GROQ_MODEL` (default: `llama-3.3-70b-versatile`)


---

## Documentation

Comprehensive project documentation is available in the [`docs/`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs) directory:
- [`docs/01-requirements.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/01-requirements.md) — Module checklist, user stories, phases, and future scope.
- [`docs/02-architecture.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/02-architecture.md) — System flow, data flow Mermaid diagram, and security model.
- [`docs/03-folder-structure.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/03-folder-structure.md) — Planned layout for `client/` and `server/`.
- [`docs/04-scoring-method.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/04-scoring-method.md) — 0-100 scoring scale, gap formulas, worked examples, and limitations.
- [`docs/05-team-workflow.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/05-team-workflow.md) — 2-person Git branch strategy and phase ownership matrix.

