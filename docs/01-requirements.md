# Project Requirements & Module Specifications

**Project Name:** AI-Powered Skill Gap Analysis & Personalized Learning Platform  
**Degree:** Bachelor of Computer Applications (BCA) — AIML, 5th Semester  
**College:** JNCT Professional University, Bhopal  
**Authors:** Bishal Sharma, Lakshya Deep  
**Tagline:** Resume → AI → Skills → Learning → Career  
**Project Status:** Phase 1 complete (Specification & Architecture)

---

## 1. Overview

This document specifies the functional requirements, modules, user stories, and feature checklists for the platform. The platform is designed to help students know what skills they currently have, what skills they need for their desired career, what the gap is, and how to bridge that gap with personalized roadmaps and AI quizzes.

---

## 2. Module Checklist

The project is broken down into 13 key functional modules across 14 implementation phases. Each module details its origin (Project Report vs. Enhancement), user story, core features, and target implementation phase.

---

### Module 1: Landing Page
- **Source:** Project Report
- **Implementing Phase:** Phase 13
- **User Story:**  
  *As a visiting student, I want to learn what the platform offers, how the 9-step workflow functions, and what benefits it provides, so that I am motivated to create an account and begin my career journey.*
- **Main Features:**
  - Hero section with title, tagline ("Resume → AI → Skills → Learning → Career"), and primary call to action.
  - Visual summary of the 9-step learning pipeline.
  - Key benefits explanation (personalized roadmaps, AI quiz feedback, gap identification).
  - Clean navigation bar and footer with project authorship credits.

---

### Module 2: Authentication (Auth)
- **Source:** Project Report
- **Implementing Phase:** Phase 3
- **User Story:**  
  *As a student, I want to register and log in securely using my email and password, so that my personal career goals, resume data, roadmaps, and quiz scores remain private and accessible only to me.*
- **Main Features:**
  - User registration with email, password, and basic validation (using React Hook Form and Zod).
  - Secure login, session persistence, and logout powered by Firebase Authentication.
  - Password reset flow for students who forget their credentials.
  - Protected frontend routes and backend token verification middleware.

---

### Module 3: Onboarding (Minimal)
- **Source:** Enhancement *(beyond the initial project report for better user experience)*
- **Implementing Phase:** Phase 14
- **User Story:**  
  *As a newly registered student, I want a brief, lightweight onboarding screen, so that I understand what steps are coming next before jumping straight into career selection.*
- **Main Features:**
  - Brief welcome modal/screen explaining the learning-first steps (Select Career → Upload Resume → Skill Gaps → Roadmap).
  - Option to start immediately or review quick tips.
  - Persistent state in Firestore so existing users skip onboarding on subsequent logins.

---

### Module 4: Career Selection
- **Source:** Project Report
- **Implementing Phase:** Phase 4
- **User Story:**  
  *As a student, I want to choose my target career goal from a list of predefined tech roles, so that the system knows what industry skills I should be measured against.*
- **Main Features:**
  - Career catalog cards (e.g., Full Stack Developer, Frontend Developer, Backend Developer, Data Analyst, Machine Learning Engineer).
  - Display of required core skills and required benchmark levels (on a 0–100 scale) for each role.
  - Ability to select and save the active target career to the user profile.

---

### Module 5: Resume Analysis
- **Source:** Project Report
- **Implementing Phase:** Phase 5 & Phase 6
- **User Story:**  
  *As a student, I want to upload my PDF or text resume, so that the system can automatically extract the technical skills I already possess without manual typing.*
- **Main Features:**
  - File upload interface supporting standard PDF and plain text resume files.
  - Backend text extraction pipeline.
  - Strict privacy handling: uploaded resumes are processed in-memory or in temporary storage and deleted immediately (never stored permanently).
  - Security filtering: resume text is treated strictly as untrusted user input and never as system instructions.
  - Learning-first progression: after resume extraction, users are guided directly to Skill Gap Analysis.

---

### Module 6: Diagnostic Assessment (Optional Baseline Calibration)
- **Source:** Project Report
- **Implementing Phase:** Phase 7 (Preserved & Optional)
- **User Story:**  
  *As a student, I can optionally take a brief diagnostic assessment on my extracted or declared skills to calibrate my baseline levels, or proceed directly to skill gap analysis and personalized learning.*
- **Main Features:**
  - Multiple-choice assessment questions matched to the skills detected from the resume and target career.
  - Question presentation with timer and answer selection.
  - Objective scoring that converts test performance into a validated score (0–100 scale).
  - Clear source tagging (marks skills as `assessment-verified` vs. `resume-inferred`).
  - Coexists with future skill-specific quizzes (Module 10); remains non-mandatory in the learning-first flow.

---

### Module 7: Skill Gap Analysis
- **Source:** Project Report
- **Implementing Phase:** Phase 8
- **User Story:**  
  *As a student, I want to see a clear mathematical comparison between what I know and what my chosen career demands, so that I know which skill to prioritize first.*
- **Main Features:**
  - Gap calculation using the formula: `Skill Gap = Required Level - Current Level` (minimum 0).
  - Gap classification labels:
    - **Small Gap:** under 15
    - **Medium Gap:** 15 to 39
    - **High Gap:** 40 or more
  - Automatic priority sorting: skills with the highest gaps (e.g., High Gap) become top priority.
  - Visual comparison table showing skill name, current level, required level, gap size, and priority rank.

---

### Module 8: Personalized Roadmap
- **Source:** Project Report
- **Implementing Phase:** Phase 9
- **User Story:**  
  *As a student, I want an AI-generated step-by-step learning path built specifically around my largest skill gaps, so that I don't waste time studying concepts I already know.*
- **Main Features:**
  - Backend integration via existing Groq Cloud API service (`groq.service.js` with `llama-3.3-70b-versatile`) to construct sequential learning topics.
  - Logical topic sequencing (e.g., Node.js Basics → Express.js → REST API → Database → Backend Project).
  - Step breakdown with estimated completion times and topic descriptions.
  - Storage of the generated roadmap in Cloud Firestore under the user's document.

---

### Module 9: Learning Resources
- **Source:** Project Report
- **Implementing Phase:** Phase 10
- **User Story:**  
  *As a student, I want recommended free courses, documentation links, and video tutorials for each roadmap topic, so that I have the right study materials in one place.*
- **Main Features:**
  - Curated, authoritative static resource dataset with verified official documentation URLs (e.g., MDN, official docs, reputable free resources).
  - Recommendation engine based on the rule: `Skill Gap + User Level + Topic`.
  - Filtered resource cards: Courses, Video Tutorials, Official Documentation, and Practice Projects.
  - External link opening with safe navigation attributes (`noopener noreferrer`).

---

### Module 10: AI Quizzes & Feedback
- **Source:** Project Report
- **Implementing Phase:** Phase 11
- **User Story:**  
  *As a student, I want to take a focused quiz after studying a roadmap topic and receive constructive feedback, so that I can verify my understanding and fix my weak areas.*
- **Main Features:**
  - Dynamic 5-to-10 question multiple-choice quizzes tailored to the specific topic and student level.
  - Automatic scoring and quiz attempt history preservation.
  - Constructive feedback explaining what concepts were missed and what to review next.
  - Skill score updates adhering to defined scoring policies and evidence precedence without treating a single pass as unverified complete mastery.

---

### Module 11: Student Dashboard
- **Source:** Project Report
- **Implementing Phase:** Phase 12
- **User Story:**  
  *As a student, I want a single central dashboard displaying my learning progress, skill levels, active roadmap, and focus area, so that I stay motivated and organized.*
- **Main Features:**
  - Key metric cards: Overall Progress percentage, Target Career, Current Focus Skill, Completed Topics count.
  - Interactive skill chart (using Recharts) contrasting current vs. required levels.
  - Active roadmap progress tracker.
  - Recent quiz scores and feedback logs.

---

### Module 12: Progress Tracking
- **Source:** Project Report
- **Implementing Phase:** Phase 12 & Phase 13
- **User Story:**  
  *As a student, I want my learning progress to be calculated dynamically from my actual completed topics and quizzes, so that my dashboard accurately reflects my hard work.*
- **Main Features:**
  - Dynamic mathematical formula:  
    $$\text{Overall Progress (\%)} = \frac{\text{Completed Roadmap Topics}}{\text{Total Roadmap Topics}} \times 100$$
  - Strict rule: All dashboard statistics are calculated in real time, never hardcoded.
  - Check-off interaction allowing students to mark roadmap topics completed after passing quizzes.

---

### Module 13: Profile & Settings
- **Source:** Enhancement *(standard web security, privacy, and account hygiene)*
- **Implementing Phase:** Phase 13
- **User Story:**  
  *As a student, I want to view my profile information and have the ability to delete all my stored account data, so that I have full control over my privacy and personal data.*
- **Main Features:**
  - View account details (name, email, registration date, selected career).
  - Ability to change target career and reset learning roadmaps.
  - **Account-Data Deletion:** Complete removal of user Firestore documents, roadmaps, quiz history, and Firebase Authentication account upon confirmation.

---

## 3. Future Scope

The project report defines exactly 7 planned enhancements reserved for future versions:

1. **AI resume improvement suggestions** — Provide automated formatting, keyword optimization, and bullet-point rewriting tips based on target job postings.
2. **Job recommendations from skill profile** — Match verified student skill scores directly with active entry-level job openings and internships.
3. **AI mock interviews** — Simulated technical and behavioral interview sessions with automated feedback on communication and accuracy.
4. **GitHub profile analysis** — Automatic scanning of student repositories, commits, and code quality to verify practical development experience.
5. **AI career chatbot** — An interactive conversational assistant to answer student questions regarding career paths, salary trends, and learning strategies.
6. **Voice-based AI mentor** — Audio-driven coaching sessions allowing students to ask questions and receive spoken explanations.
7. **Dedicated mobile app** — Native Android/iOS applications to allow on-the-go quiz practice and roadmap notifications.
