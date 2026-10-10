import { z } from 'zod';

/**
 * Zod schema for career selection:
 * - careerId: required string, trimmed, non-empty
 * - strict(): unknown fields are rejected with HTTP 400
 */
export const careerSelectionSchema = z
  .object({
    careerId: z
      .string({
        required_error: 'careerId is required',
        invalid_type_error: 'careerId must be a string',
      })
      .trim()
      .min(1, { message: 'careerId cannot be empty' }),
  })
  .strict({
    message: 'Unknown fields are not allowed in the request body',
  });

/**
 * Express middleware to validate PUT /api/users/me/career body.
 */
export function validateCareerSelection(req, res, next) {
  const result = careerSelectionSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message || 'Invalid request body';

    return res.status(400).json({
      error: {
        message,
      },
    });
  }

  req.validatedBody = result.data;
  next();
}

export default {
  careerSelectionSchema,
  validateCareerSelection,
};
