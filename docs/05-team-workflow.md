# Team Development Workflow & Phase Ownership

**Project Name:** AI-Powered Skill Gap Analysis & Personalized Learning Platform  
**Degree:** Bachelor of Computer Applications (BCA) — AIML, 5th Semester  
**College:** JNCT Professional University, Bhopal  
**Authors:** Bishal Sharma, Lakshya Deep  
**Tagline:** Resume → AI → Skills → Learning → Career  
**Project Status:** Phase 1 complete (Specification & Architecture)

---

## 1. Two-Person Git Workflow

To coordinate work effectively between **Bishal Sharma** and **Lakshya Deep**, the team follows a standard, disciplined Git branching workflow:

### Core Rules:
1. **Single Central Repository:** Both team members push to and pull from the shared Git repository.
2. **Protected `main` Branch:**  
   - The `main` branch always represents verified, working code.
   - Nobody pushes experimental or untested changes directly to `main`.
3. **One Feature Branch Per Phase:**  
   - Every phase is developed on its own dedicated feature branch (for example, `feature/phase-02-scaffolding` or `feature/phase-03-auth`).
4. **Merge Only After Testing:**  
   - Before merging a feature branch into `main`, the branch author must test that the frontend compiles cleanly, the backend starts without errors, and the phase acceptance tests pass.
   - Code is merged using clean Git merges or pull requests.
5. **Never Commit Secrets (`.env`):**  
   - Files containing API keys, private credentials, or Firebase Admin service accounts (`.env`, `.env.local`, `*serviceAccountKey*.json`) must never be committed to Git.
   - Only dummy environment templates (`.env.example`) are tracked in version control.

---

## 2. Step-by-Step Branching Guide

Whenever a team member starts working on an assigned phase:

```bash
# 1. Switch to main and pull the latest changes
git checkout main
git pull origin main

# 2. Create and switch to the new feature branch for that phase
git checkout -b feature/phase-0X-description

# 3. Work on code, verifying changes locally
# ... edit code ...

# 4. Check status and stage modified files
git status
git add .

# 5. Commit with a clear, concise message
git commit -m "feat(phase-0X): implement phase feature description"

# 6. Test thoroughly locally (frontend build, server startup, tests)
# 7. Merge into main once confirmed stable
git checkout main
git merge feature/phase-0X-description
git push origin main
```

---

## 3. Phase Ownership Matrix (14 Phases)

The table below outlines all 14 project phases. The **Owner** column is left blank as a placeholder for the two team members to assign responsibilities:

| Phase # | Phase Title & Description | Owner | Status |
|---|---|---|---|
| **Phase 1** | Project Setup, Architecture & Documentation Blueprints | *(Unassigned)* | **Complete** |
| **Phase 2** | Client & Server Scaffolding, Tooling & Design System Foundation | *(Unassigned)* | **Complete** |
| **Phase 3** | Firebase Authentication, Session State & Token Verification | *(Unassigned)* | **Complete** |
| **Phase 4** | Career Selection Module & Industry Benchmark Dataset | *(Unassigned)* | **Complete** |
| **Phase 5** | Resume Upload & In-Memory Text Extraction Pipeline | *(Unassigned)* | **Complete** |
| **Phase 6** | AI Skill Extraction via Groq Cloud API | | **Complete** |

| **Phase 7** | Diagnostic Skill Assessment Module & Scoring Verification | | Pending |
| **Phase 8** | Skill Gap Calculation Engine & Priority Ranking | | Pending |
| **Phase 9** | AI Personalized Roadmap Generation via Gemini API | | Pending |
| **Phase 10** | Curated Learning Resources Recommendation Engine | | Pending |
| **Phase 11** | AI Practice Quizzes & Automated Feedback Generation | | Pending |
| **Phase 12** | Student Dashboard UI & Visual Analytics (Recharts) | | Pending |
| **Phase 13** | Progress Tracking Engine, Profile Settings & Data Deletion | | Pending |
| **Phase 14** | Minimal Onboarding, Landing Page Polish & End-to-End Validation | | Pending |
