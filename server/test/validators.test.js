import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateResumeBuffer,
  sanitizeFileName,
  validateConsent,
  MAX_FILE_SIZE_BYTES,
} from '../src/validators/resumeFile.validator.js';
import { careerSelectionSchema } from '../src/validators/career.validator.js';

test('File Signature Validator - Valid PDF', () => {
  // "%PDF-1.4 sample content"
  const validPdfBuffer = Buffer.from('%PDF-1.4\nSome sample PDF data');
  const result = validateResumeBuffer(validPdfBuffer, 'student_resume.pdf');
  assert.equal(result.valid, true);
  assert.equal(result.ext, 'pdf');
  assert.equal(result.contentType, 'application/pdf');
});

test('File Signature Validator - Valid DOCX Header', () => {
  // "PK\x03\x04" standard zip local header followed by content
  const validDocxBuffer = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00,
  ]);
  const result = validateResumeBuffer(validDocxBuffer, 'my_resume.docx');
  assert.equal(result.valid, true);
  assert.equal(result.ext, 'docx');
  assert.equal(
    result.contentType,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
});

test('File Signature Validator - .txt renamed to .pdf', () => {
  const fakePdfBuffer = Buffer.from('This is a plain text file pretending to be PDF.');
  const result = validateResumeBuffer(fakePdfBuffer, 'fake.pdf');
  assert.equal(result.valid, false);
  assert.equal(result.status, 415);
  assert.match(result.message, /File signature does not match a valid PDF/i);
});

test('File Signature Validator - Empty Buffer (0 bytes)', () => {
  const emptyBuffer = Buffer.alloc(0);
  const result = validateResumeBuffer(emptyBuffer, 'empty.pdf');
  assert.equal(result.valid, false);
  assert.equal(result.status, 400);
  assert.match(result.message, /empty/i);
});

test('File Signature Validator - ZIP renamed to .pdf', () => {
  // Zip header starting with PK\x03\x04 but named .pdf
  const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
  const result = validateResumeBuffer(zipBuffer, 'archive.pdf');
  assert.equal(result.valid, false);
  assert.equal(result.status, 415);
  assert.match(result.message, /File signature does not match a valid PDF/i);
});

test('File Signature Validator - Wrong Extension (.exe, .txt, .doc)', () => {
  const validPdfHeader = Buffer.from('%PDF-1.4 sample');

  const exeResult = validateResumeBuffer(validPdfHeader, 'malicious.exe');
  assert.equal(exeResult.valid, false);
  assert.equal(exeResult.status, 415);

  const txtResult = validateResumeBuffer(validPdfHeader, 'notes.txt');
  assert.equal(txtResult.valid, false);
  assert.equal(txtResult.status, 415);

  const docResult = validateResumeBuffer(validPdfHeader, 'old_format.doc');
  assert.equal(docResult.valid, false);
  assert.equal(docResult.status, 415);
});

test('File Signature Validator - Oversized Buffer (> 5 MB)', () => {
  const oversizedBuffer = Buffer.alloc(MAX_FILE_SIZE_BYTES + 10);
  // Give it a valid header so it passes initial check, but fails size
  Buffer.from('%PDF-').copy(oversizedBuffer, 0);
  const result = validateResumeBuffer(oversizedBuffer, 'huge.pdf');
  assert.equal(result.valid, false);
  assert.equal(result.status, 413);
  assert.match(result.message, /exceeds maximum allowed limit/i);
});

test('Filename Sanitizer - Directory Traversal and Unsafe Characters', () => {
  assert.equal(sanitizeFileName('../../../etc/passwd'), 'passwd');
  assert.equal(sanitizeFileName('..\\..\\windows\\system32\\cmd.exe'), 'cmd.exe');
  assert.equal(sanitizeFileName('my resume\x00\x1f.pdf'), 'my resume.pdf');
  assert.equal(sanitizeFileName('...hidden.pdf'), 'hidden.pdf');
  assert.equal(sanitizeFileName(''), 'resume.pdf');
  assert.equal(sanitizeFileName(null), 'resume.pdf');
});

test('Filename Sanitizer - Length Bounding', () => {
  const longName = 'a'.repeat(150) + '.pdf';
  const sanitized = sanitizeFileName(longName);
  assert.ok(sanitized.length <= 100);
  assert.ok(sanitized.endsWith('.pdf'));
});

test('Consent Validator - Strict Checking', () => {
  assert.equal(validateConsent(true), true);
  assert.equal(validateConsent('true'), true);
  assert.equal(validateConsent(false), false);
  assert.equal(validateConsent('false'), false);
  assert.equal(validateConsent(undefined), false);
  assert.equal(validateConsent(null), false);
  assert.equal(validateConsent('yes'), false);
});

test('Career Selection Schema - Unknown fields rejected (strict)', () => {
  // Valid
  const valid = careerSelectionSchema.safeParse({ careerId: 'full-stack-developer' });
  assert.equal(valid.success, true);
  assert.equal(valid.data.careerId, 'full-stack-developer');

  // Unknown field rejected
  const unknownField = careerSelectionSchema.safeParse({
    careerId: 'full-stack-developer',
    maliciousField: 'exploit',
  });
  assert.equal(unknownField.success, false);
  assert.match(
    unknownField.error.issues[0].message,
    /unrecognized key|unknown field/i
  );

  // Missing careerId rejected
  const missing = careerSelectionSchema.safeParse({});
  assert.equal(missing.success, false);

  // Empty careerId rejected
  const empty = careerSelectionSchema.safeParse({ careerId: '   ' });
  assert.equal(empty.success, false);
});
