import { extractText } from 'unpdf';
import mammoth from 'mammoth';
import {
  validateResumeBuffer,
  MAX_FILE_SIZE_BYTES,
} from '../validators/resumeFile.validator.js';

/**
 * Maximum character limit for extracted resume text.
 * Prevents downstream memory bloat and protects AI token limits.
 */
export const MAX_EXTRACTED_TEXT_LENGTH = 50000;

/**
 * Custom error class for resume text extraction failures.
 */
export class ResumeParseError extends Error {
  constructor(message, code = 'PARSE_ERROR', statusCode = 400) {
    super(message);
    this.name = 'ResumeParseError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Normalizes whitespace and strips dangerous non-printable control characters
 * while preserving valid line breaks and paragraph boundaries.
 *
 * @param {string} rawText - Unprocessed raw string from document parser
 * @param {object} [options]
 * @param {number} [options.maxLength=MAX_EXTRACTED_TEXT_LENGTH]
 * @returns {{ text: string, truncated: boolean, originalLength: number }}
 */
export function sanitizeExtractedText(rawText, options = {}) {
  if (!rawText || typeof rawText !== 'string') {
    return { text: '', truncated: false, originalLength: 0 };
  }

  const maxLength =
    typeof options.maxLength === 'number' && options.maxLength > 0
      ? options.maxLength
      : MAX_EXTRACTED_TEXT_LENGTH;

  // 1. Convert Windows CRLF and legacy Mac CR to standard \n
  let text = rawText.replace(/\r\n|\r/g, '\n');

  // 2. Strip non-printable control characters: ASCII 0-8, 11-12, 14-31, and 127
  // Note: Tab (\x09) and Newline (\x0A) are intentionally preserved
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Normalize horizontal whitespace per line (collapse consecutive spaces/tabs to single space)
  text = text
    .split('\n')
    .map((line) => line.replace(/[^\S\n]+/g, ' ').trim())
    .join('\n');

  // 4. Collapse excessive newlines (3 or more) down to 2 to preserve paragraph boundaries
  text = text.replace(/\n{3,}/g, '\n\n');

  // 5. Trim overall string
  text = text.trim();

  const originalLength = text.length;
  let truncated = false;

  // 6. Apply character bound
  if (text.length > maxLength) {
    text = text.slice(0, maxLength).trimEnd();
    truncated = true;
  }

  return {
    text,
    truncated,
    originalLength,
  };
}

/**
 * Extracts raw text from an in-memory PDF buffer.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ rawText: string, pageCount: number }>}
 */
async function extractPdfText(buffer) {
  try {
    const uint8 = new Uint8Array(buffer);
    const result = await extractText(uint8);

    const pages = Array.isArray(result?.text)
      ? result.text
      : [result?.text || ''];
    const rawText = pages.join('\n\n');
    const pageCount =
      typeof result?.totalPages === 'number'
        ? result.totalPages
        : pages.length;

    return { rawText, pageCount };
  } catch (error) {
    throw new ResumeParseError(
      'Failed to parse PDF document: file structure is corrupt or unreadable',
      'CORRUPTED_PDF',
      422
    );
  }
}

/**
 * Extracts raw text from an in-memory DOCX buffer.
 *
 * @param {Buffer} buffer
 * @returns {Promise<{ rawText: string, pageCount: null }>}
 */
async function extractDocxText(buffer) {
  try {
    const mammothModule = mammoth.default || mammoth;
    const result = await mammothModule.extractRawText({ buffer });
    return {
      rawText: result?.value || '',
      pageCount: null,
    };
  } catch (error) {
    throw new ResumeParseError(
      'Failed to parse DOCX document: file structure is corrupt or unreadable',
      'CORRUPTED_DOCX',
      422
    );
  }
}

/**
 * Parses an in-memory resume Buffer (.pdf or .docx) and extracts sanitized text.
 *
 * Strictly adheres to security rules:
 * - In-memory processing only (never written to disk or temporary files)
 * - File signature and size validated before parser invocation
 * - Zero logging of document text or personal identifiable information (PII)
 *
 * @param {Buffer} buffer - File contents in memory
 * @param {string} fileNameOrExt - File name with extension or just extension
 * @param {object} [options]
 * @param {number} [options.maxLength=MAX_EXTRACTED_TEXT_LENGTH]
 * @returns {Promise<{ text: string, characterCount: number, pageCount: number|null, fileType: 'pdf'|'docx', truncated: boolean }>}
 */
export async function extractResumeText(buffer, fileNameOrExt, options = {}) {
  if (!fileNameOrExt || typeof fileNameOrExt !== 'string') {
    throw new ResumeParseError(
      'Original file name or extension is required',
      'MISSING_FILENAME',
      400
    );
  }

  // Normalize extension-only inputs (e.g. 'pdf' -> 'resume.pdf')
  let testName = fileNameOrExt.trim();
  if (!testName.includes('.')) {
    testName = `resume.${testName}`;
  } else if (testName.startsWith('.')) {
    testName = `resume${testName}`;
  }

  // 1. Re-use existing file buffer & signature validator
  const validation = validateResumeBuffer(buffer, testName);
  if (!validation.valid) {
    let errorCode = 'VALIDATION_FAILED';
    if (validation.status === 413) errorCode = 'FILE_TOO_LARGE';
    if (validation.status === 415) errorCode = 'INVALID_SIGNATURE';
    if (validation.status === 400 && (!buffer || buffer.length === 0))
      errorCode = 'EMPTY_BUFFER';

    throw new ResumeParseError(
      validation.message,
      errorCode,
      validation.status
    );
  }

  // 2. Route to appropriate in-memory parser
  let rawText = '';
  let pageCount = null;

  if (validation.ext === 'pdf') {
    const parsed = await extractPdfText(buffer);
    rawText = parsed.rawText;
    pageCount = parsed.pageCount;
  } else if (validation.ext === 'docx') {
    const parsed = await extractDocxText(buffer);
    rawText = parsed.rawText;
    pageCount = parsed.pageCount;
  } else {
    throw new ResumeParseError(
      'Unsupported file format. Only PDF and DOCX files are supported.',
      'UNSUPPORTED_FORMAT',
      415
    );
  }

  // 3. Sanitize and normalize whitespace
  const sanitized = sanitizeExtractedText(rawText, options);

  // 4. Handle empty / scanned-image-only documents
  if (sanitized.text.length === 0) {
    throw new ResumeParseError(
      'No readable text could be extracted from this document. If this is a scanned image or photo of a resume, please upload a text-based PDF or DOCX file (OCR is not supported).',
      'NO_TEXT_DETECTED',
      422
    );
  }

  return {
    text: sanitized.text,
    characterCount: sanitized.text.length,
    pageCount,
    fileType: validation.ext,
    truncated: sanitized.truncated,
  };
}

export default {
  extractResumeText,
  sanitizeExtractedText,
  ResumeParseError,
  MAX_EXTRACTED_TEXT_LENGTH,
  MAX_FILE_SIZE_BYTES,
};
