import { z } from 'zod';
import { getGroqClient } from './groq.service.js';
import { GROQ_MODEL } from '../config/env.js';
import { getSkillQuizQuestions } from '../data/skillQuizQuestions.js';

/**
 * Zod validation schema for an AI-generated quiz question item.
 */
export const aiGeneratedQuestionSchema = z.object({
  id: z.string().trim().min(1),
  skill: z.string().trim().min(1),
  topic: z.string().trim().min(1),
  question: z.string().trim().min(10),
  options: z.array(z.string().trim().min(1)).length(4),
  correctOption: z.number().int().min(0).max(3),
  explanation: z.string().trim().min(10),
});

export const aiGeneratedQuizSchema = z.object({
  questions: z.array(aiGeneratedQuestionSchema).min(3).max(5),
});

/**
 * Generates skill-specific quiz questions using Groq AI with strict Zod validation.
 * NEVER depends exclusively on AI availability — gracefully and automatically falls back
 * to the curated deterministic question bank upon any error, timeout, or schema failure.
 *
 * @param {string} skillName - Canonical or display skill name
 * @param {string} [topic] - Optional topic focus
 * @returns {Promise<{ questions: Array<object>, source: 'ai' | 'curated' }>}
 */
export async function getOrGenerateQuizQuestions(skillName, topic = '') {
  // 1. Attempt AI generation if Groq is available
  try {
    const groq = getGroqClient();
    if (groq) {
      const prompt = `Generate a 5-question multiple choice technical quiz on the skill "${skillName}"${
        topic ? ` focusing on "${topic}"` : ''
      }.
Requirements:
1. Provide exactly 5 practical, rigorous questions testing conceptual understanding and code patterns.
2. Provide exactly 4 distinct options per question.
3. Specify "correctOption" as a 0-based integer (0, 1, 2, or 3).
4. Provide a clear pedagogical "explanation" for why the correct option is right.
5. Return JSON matching this schema:
{
  "questions": [
    {
      "id": "ai_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}_01",
      "skill": "${skillName}",
      "topic": "${topic || 'Core Concepts'}",
      "question": "Clear prompt...",
      "options": ["A", "B", "C", "D"],
      "correctOption": 0,
      "explanation": "Clear explanation..."
    }
  ]
}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interviewer. Return ONLY valid JSON adhering strictly to the requested schema with no commentary or markdown backticks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: GROQ_MODEL || 'llama-3.3-70b-versatile',
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const rawContent = chatCompletion?.choices?.[0]?.message?.content;
      if (rawContent) {
        const parsed = JSON.parse(rawContent.trim());
        const validated = aiGeneratedQuizSchema.safeParse(parsed);
        if (validated.success && validated.data.questions.length >= 3) {
          // Normalize IDs to prevent collisions
          const normalized = validated.data.questions.map((q, idx) => ({
            ...q,
            id: `ai_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${idx + 1}`,
            skill: skillName,
          }));
          return { questions: normalized, source: 'ai' };
        }
      }
    }
  } catch {
    // Non-blocking fallback: Logically fall back to deterministic bank
  }

  // 2. Deterministic curated bank fallback
  const fallbackQuestions = getSkillQuizQuestions(skillName);
  return {
    questions: fallbackQuestions,
    source: 'curated',
  };
}

export default {
  getOrGenerateQuizQuestions,
  aiGeneratedQuestionSchema,
  aiGeneratedQuizSchema,
};
