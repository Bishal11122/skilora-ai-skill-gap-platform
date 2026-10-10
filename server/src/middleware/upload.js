import multer from 'multer';
import { MAX_FILE_SIZE_BYTES } from '../validators/resumeFile.validator.js';

// Memory storage keeps file buffers in RAM, never writing temporary files to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
  },
});

/**
 * Middleware wrapper for single resume file upload field ("resume").
 * Maps Multer errors to standardized JSON error responses:
 * - 413 for payload too large
 * - 400 for unexpected fields or multipart errors
 */
export function handleResumeUpload(req, res, next) {
  const singleUpload = upload.single('resume');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            error: {
              message: 'File size exceeds maximum allowed limit of 5 MB',
            },
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: {
              message: 'Unexpected file field. Field name must be "resume"',
            },
          });
        }
        return res.status(400).json({
          error: {
            message: `Upload error: ${err.message}`,
          },
        });
      }
      return res.status(400).json({
        error: {
          message: err.message || 'File upload failed',
        },
      });
    }

    next();
  });
}

export default handleResumeUpload;
