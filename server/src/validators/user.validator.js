import { z } from 'zod';

/**
 * Zod schema for creating or updating a user profile.
 * - displayName: required string, trimmed, 2 to 60 characters
 * - strict(): unknown fields are rejected with HTTP 400
 * - Disallows client manipulation of uid, email, createdAt, or updatedAt
 */
export const userProfileSchema = z
  .object({
    displayName: z
      .string({
        required_error: 'Display name is required',
        invalid_type_error: 'Display name must be a string',
      })
      .trim()
      .min(2, { message: 'Display name must be at least 2 characters' })
      .max(60, { message: 'Display name cannot exceed 60 characters' }),
  })
  .strict({
    message: 'Unknown fields are not allowed in the request body',
  });

/**
 * Express middleware to validate request body against userProfileSchema.
 */
export function validateUserProfile(req, res, next) {
  const result = userProfileSchema.safeParse(req.body);

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

/**
 * Zod schema for account deletion confirmation.
 * - Requires explicit confirmation string matching 'DELETE' or 'DELETE_MY_ACCOUNT'
 * - strict(): rejects unknown fields
 */
export const accountDeletionSchema = z
  .object({
    confirmation: z
      .string({
        required_error: 'Explicit confirmation is required to delete your account and all personal data',
        invalid_type_error: 'Confirmation must be a string',
      })
      .trim()
      .refine((val) => val === 'DELETE' || val === 'DELETE_MY_ACCOUNT', {
        message: 'Confirmation must be DELETE or DELETE_MY_ACCOUNT',
      }),
  })
  .strict({
    message: 'Unknown fields are not allowed in the request body',
  });

/**
 * Express middleware to validate request body against accountDeletionSchema.
 */
export function validateAccountDeletion(req, res, next) {
  const result = accountDeletionSchema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const message = firstIssue?.message || 'Invalid request body';

    return res.status(400).json({
      error: {
        message,
        code: 'CONFIRMATION_REQUIRED',
      },
    });
  }

  req.validatedBody = result.data;
  next();
}

export default {
  userProfileSchema,
  validateUserProfile,
  accountDeletionSchema,
  validateAccountDeletion,
};
