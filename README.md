# AI-Powered Skill Gap Analysis & Personalized Learning Platform

> **Tagline:** Resume → AI → Skills → Learning → Career  
> **Main Idea:** "Our system helps students know what to learn and how to learn it."

A minor project submitted in partial fulfilment of the requirements for the degree of **Bachelor of Computer Applications (BCA) — AIML (5th Semester)**, JNCT Professional University, Bhopal.

**Authors:**
- Bishal Sharma
- Lakshya Deep

---

## Project Status

**Status: Phase 1 complete**  
*(Documentation, requirements, architecture, folder structure, and scoring method defined. No application code or dependencies have been installed yet.)*

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
  - Google Gemini API via official SDK (`@google/genai`)
  - Called **ONLY** from the backend server
  - Model configured via environment variable `GEMINI_MODEL`

---

## Documentation

Comprehensive project documentation is available in the [`docs/`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs) directory:
- [`docs/01-requirements.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/01-requirements.md) — Module checklist, user stories, phases, and future scope.
- [`docs/02-architecture.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/02-architecture.md) — System flow, data flow Mermaid diagram, and security model.
- [`docs/03-folder-structure.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/03-folder-structure.md) — Planned layout for `client/` and `server/`.
- [`docs/04-scoring-method.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/04-scoring-method.md) — 0-100 scoring scale, gap formulas, worked examples, and limitations.
- [`docs/05-team-workflow.md`](file:///Users/bishalsharma/Documents/MINOR%20PROJECT/docs/05-team-workflow.md) — 2-person Git branch strategy and phase ownership matrix.
