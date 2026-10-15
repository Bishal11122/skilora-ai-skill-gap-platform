import { z } from 'zod';

/**
 * Zod validation schema for single assessment answer item.
 */
export const assessmentAnswerItemSchema = z
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
 * Zod validation schema for POST /api/assessment/submit.
 */
export const submitAssessmentSchema = z
  .object({
    assessmentId: z
      .string({
        required_error: 'assessmentId is required',
        invalid_type_error: 'assessmentId must be a string',
      })
      .trim()
      .min(1, { message: 'assessmentId cannot be empty' }),
    answers: z
      .array(assessmentAnswerItemSchema, {
        required_error: 'answers array is required',
        invalid_type_error: 'answers must be an array',
      })
      .min(1, { message: 'At least one answer must be submitted' }),
  })
  .strict({
    message: 'Unknown fields are not allowed in the request body',
  });

/**
 * Express middleware to validate POST /api/assessment/submit request body.
 */
export function validateSubmitAssessment(req, res, next) {
  const result = submitAssessmentSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message || 'Invalid request body';
    return res.status(400).json({
      error: {
        message,
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
  assessmentAnswerItemSchema,
  submitAssessmentSchema,
  validateSubmitAssessment,
};
