import path from 'path';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Magic byte signatures:
 * - PDF: "%PDF-" -> 0x25, 0x50, 0x44, 0x46, 0x2D
 * - DOCX: Standard ZIP local file header "PK\x03\x04" -> 0x50, 0x4B, 0x03, 0x04
 */
const PDF_MAGIC = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"
const DOCX_ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]); // "PK\x03\x04"

/**
 * Sanitizes an uploaded file name for display purposes only.
 * Strips path traversal, path separators, control characters, and truncates to 100 characters.
 * NEVER use this name for cloud storage object keys.
 */
export function sanitizeFileName(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return 'resume.pdf';
  }

  // 1. Normalize Windows backslashes to forward slashes, then extract base name
  const normalized = rawName.trim().replace(/\\/g, '/');
  const base = path.basename(normalized);

  // 2. Remove non-printable / control characters
  const clean = base.replace(/[\x00-\x1f\x7f-\x9f\/\\]/g, '');

  // 3. Prevent hidden file names or empty result
  const safe = clean.replace(/^\.+/, '') || 'resume.pdf';

  // 4. Bound length to 100 chars while preserving extension
  if (safe.length > 100) {
    const ext = path.extname(safe);
    const stem = path.basename(safe, ext).slice(0, 100 - ext.length);
    return `${stem}${ext}`;
  }

  return safe;
}

/**
 * Validates file buffer, extension, and magic byte file signature.
 * Returns { valid: true, ext, contentType } or { valid: false, status, message }.
 */
export function validateResumeBuffer(buffer, originalname) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return {
      valid: false,
      status: 400,
      message: 'No file buffer provided',
    };
  }

  if (buffer.length === 0) {
    return {
      valid: false,
      status: 400,
      message: 'Uploaded file is empty (0 bytes)',
    };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      status: 413,
      message: 'File size exceeds maximum allowed limit of 5 MB',
    };
  }

  if (!originalname || typeof originalname !== 'string') {
    return {
      valid: false,
      status: 400,
      message: 'Original file name is required',
    };
  }

  const ext = path.extname(originalname).toLowerCase();

  if (ext !== '.pdf' && ext !== '.docx') {
    return {
      valid: false,
      status: 415,
      message: 'Only .pdf and .docx file formats are accepted',
    };
  }

  // Validate PDF
  if (ext === '.pdf') {
    if (buffer.length < PDF_MAGIC.length) {
      return {
        valid: false,
        status: 400,
        message: 'File header is too small to be a valid PDF',
      };
    }

    if (!buffer.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)) {
      return {
        valid: false,
        status: 415,
        message: 'File signature does not match a valid PDF document',
      };
    }

    return {
      valid: true,
      ext: 'pdf',
      contentType: 'application/pdf',
    };
  }

  // Validate DOCX
  if (ext === '.docx') {
    if (buffer.length < DOCX_ZIP_MAGIC.length) {
      return {
        valid: false,
        status: 400,
        message: 'File header is too small to be a valid DOCX',
      };
    }

    if (!buffer.subarray(0, DOCX_ZIP_MAGIC.length).equals(DOCX_ZIP_MAGIC)) {
      return {
        valid: false,
        status: 415,
        message: 'File signature does not match a valid DOCX document',
      };
    }

    return {
      valid: true,
      ext: 'docx',
      contentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  }

  return {
    valid: false,
    status: 415,
    message: 'Unsupported file type',
  };
}

/**
 * Validates explicit consent from request body.
 * Must be strictly true or string 'true'.
 */
export function validateConsent(consentValue) {
  return consentValue === true || consentValue === 'true';
}

export default {
  MAX_FILE_SIZE_BYTES,
  sanitizeFileName,
  validateResumeBuffer,
  validateConsent,
};
