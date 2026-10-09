# Skill Scoring Methodology & Gap Calculation

**Project Name:** AI-Powered Skill Gap Analysis & Personalized Learning Platform  
**Degree:** Bachelor of Computer Applications (BCA) — AIML, 5th Semester  
**College:** JNCT Professional University, Bhopal  
**Authors:** Bishal Sharma, Lakshya Deep  
**Tagline:** Resume → AI → Skills → Learning → Career  
**Project Status:** Phase 1 complete (Specification & Architecture)

---

## 1. Skill Measurement Scale (0 to 100)

Every skill tracked on the platform is evaluated on a standardized **0 to 100 numerical scale**:
- **0–24:** Beginner (Introductory awareness of concepts)
- **25–49:** Developing (Basic working understanding, needs frequent guidance)
- **50–74:** Competent (Practical working proficiency, able to complete typical tasks)
- **75–100:** Proficient / Advanced (Deep understanding, industry-ready production capability)

---

## 2. Skill Gap Formula

The skill gap measures the distance between the skill level required by the industry for a specific career role and the current skill level of the student:

$$\text{Skill Gap} = \max(0, \text{Required Level} - \text{Current Level})$$

- If a student's current skill level meets or exceeds the required level ($\text{Current Level} \ge \text{Required Level}$), the gap is **0**.
- The gap can never be a negative number.

---

## 3. Gap Classification Labels & Thresholds

Skill gaps are categorized into three distinct verbal labels:

| Gap Range | Label | Priority Level | Action Required |
|---|---|---|---|
| **Under 15** (< 15) | **Small Gap** | Low Priority | Minor brush-up, practice quizzes, or quick documentation review |
| **15 to 39** | **Medium Gap** | Medium Priority | Structured study, video tutorials, and targeted hands-on exercises |
| **40 or more** ($\ge$ 40) | **High Gap** | **Top Priority (First Focus)** | Comprehensive beginner-to-intermediate course and step-by-step project |

### Why These Thresholds Were Chosen:
These exact numeric thresholds (**under 15**, **15 to 39**, and **40 or more**) were established directly from the minor project report specification so that the worked example from the report produces consistent, mathematically sound classifications.

---

## 4. Worked Example (Acceptance Test)

The following scenario serves as the official acceptance test for the scoring engine:

**Target Career:** Full Stack Developer  
**Industry Benchmark Required Level:** 80 for each core skill

| Skill | Current Level | Required Level | Mathematical Gap ($\text{Req} - \text{Curr}$) | Gap Label | Priority Ranking |
|---|---|---|---|---|---|
| **JavaScript** | 75 | 80 | $80 - 75 = 5$ | **Small Gap** | Rank 3 |
| **React** | 45 | 80 | $80 - 45 = 35$ | **Medium Gap** | Rank 2 |
| **Node.js** | 30 | 80 | $80 - 30 = 50$ | **High Gap** | **Rank 1 (First Priority)** |

### Result of Acceptance Test:
- **Node.js** has a gap of 50 ($\ge 40$), classifying it as a **High Gap**. It is selected as the **first priority** for roadmap generation.
- **React** has a gap of 35 (in the range 15 to 39), classifying it as a **Medium Gap**.
- **JavaScript** has a gap of 5 (< 15), classifying it as a **Small Gap**.

---

## 5. Skill Source Labels

To maintain transparency about how any skill level was determined, every skill score in the system is tagged with one of three official source labels:

1. **`self-reported`:**  
   The score was manually declared by the student during profile onboarding or career setup.
2. **`resume-inferred`:**  
   The score was estimated by the AI engine based on technical keywords, project descriptions, and experience found in the student's uploaded resume.
3. **`assessment-verified`:**  
   The score was determined or adjusted by the platform after the student completed a timed diagnostic multiple-choice assessment or topic quiz. Assessment-verified scores take precedence over self-reported or inferred scores.

---

## 6. Recommendation Logic

When suggesting learning materials (courses, tutorials, videos, and documentation), the system does not pick items at random. It follows this combined logic rule:

$$\text{Recommendation} = f(\text{Skill Gap}, \text{User Level}, \text{Topic})$$

1. **Skill Gap:** Determines the urgency and depth of the resource (e.g., a High Gap triggers a full beginner course, while a Small Gap triggers cheat sheets or advanced tips).
2. **User Level:** Matches the difficulty (Beginner, Intermediate, Advanced) so the student is never overwhelmed or bored.
3. **Topic:** Aligns precisely with the active milestone in the student's personalized roadmap.

---

## 7. Overall Progress Calculation

Progress shown on the student dashboard must always reflect real accomplishments.

$$\text{Overall Progress (\%)} = \left( \frac{\text{Completed Roadmap Topics}}{\text{Total Roadmap Topics}} \right) \times 100$$

### Critical Engineering Rule:
**Dashboard numbers must always be calculated dynamically in real time and never hardcoded.**  
If a student has completed 2 out of 5 topics on their Node.js roadmap, the calculated progress is:
$$\left( \frac{2}{5} \right) \times 100 = 40\%$$

---

## 8. Honest Limitations & Transparency

While the AI-powered scoring system provides helpful direction, we state its scientific limitations honestly:

- **AI estimates are not scientifically validated:**  
  Resume parsing and LLM skill inferencing rely on statistical text analysis, not accredited psychometric or standardized testing.
- **Resume phrasing variance:**  
  A student with exceptional skills who writes a brief resume may receive a lower initial score than a beginner who includes many buzzwords. The **Skill Assessment** phase is specifically designed to correct this discrepancy by measuring actual knowledge.
- **Continuous refinement:**  
  Scores are not static grades; they are dynamic guideposts designed to evolve as students complete quizzes and practice projects.
