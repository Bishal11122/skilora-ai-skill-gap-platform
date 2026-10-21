import { z } from 'zod';

/**
 * Zod validation schema for single quiz answer item.
 */
export const quizAnswerItemSchema = z
  .object({
    questionId: z
      .string({
        required_error: 'questionId is required',
        invalid_type_error: 'questionId must be a string',
      })
      .trim()
      .min(1, { message: 'questionId cannot be empty' }),
    selectedOption: z
      .number({
        required_error: 'selectedOption is required',
        invalid_type_error: 'selectedOption must be an integer between 0 and 3',
      })
      .int({ message: 'selectedOption must be an integer' })
      .min(0, { message: 'selectedOption cannot be less than 0' })
      .max(3, { message: 'selectedOption cannot be greater than 3' }),
  })
  .strict({
    message: 'Unknown fields are not allowed in answer items',
  });

/**
 * Zod validation schema for POST /api/quiz/start.
 */
export const startQuizSchema = z
  .object({
    skillName: z
      .string({
        required_error: 'skillName is required',
        invalid_type_error: 'skillName must be a string',
      })
      .trim()
      .min(1, { message: 'skillName cannot be empty' }),
    topic: z
      .string({ invalid_type_error: 'topic must be a string' })
      .trim()
      .optional(),
  })
  .strict({
    message: 'Unknown fields are not allowed in start quiz request',
  });

/**
 * Zod validation schema for POST /api/quiz/submit.
 */
export const submitQuizSchema = z
  .object({
    attemptId: z
      .string({
        required_error: 'attemptId is required',
        invalid_type_error: 'attemptId must be a string',
      })
      .trim()
      .min(1, { message: 'attemptId cannot be empty' }),
    answers: z
      .array(quizAnswerItemSchema, {
        required_error: 'answers array is required',
        invalid_type_error: 'answers must be an array',
      })
      .min(1, { message: 'At least one answer must be submitted' }),
  })
  .strict({
    message: 'Unknown fields are not allowed in submit quiz request',
  });

/**
 * Express middleware to validate POST /api/quiz/start request body.
 */
export function validateStartQuiz(req, res, next) {
  const result = startQuizSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      error: {
        message: firstIssue?.message || 'Invalid start quiz request',
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  req.validatedBody = result.data;
  next();
}

/**
 * Express middleware to validate POST /api/quiz/submit request body.
 */
export function validateSubmitQuiz(req, res, next) {
  const result = submitQuizSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return res.status(400).json({
      error: {
        message: firstIssue?.message || 'Invalid submit quiz request',
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  req.validatedBody = result.data;
  next();
}

export default {
  quizAnswerItemSchema,
  startQuizSchema,
  submitQuizSchema,
  validateStartQuiz,
  validateSubmitQuiz,
};
