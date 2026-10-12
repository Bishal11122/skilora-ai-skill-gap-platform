import test from 'node:test';
import assert from 'node:assert/strict';
import zlib from 'zlib';
import {
  extractResumeText,
  sanitizeExtractedText,
  ResumeParseError,
  MAX_EXTRACTED_TEXT_LENGTH,
} from '../src/services/resumeParser.service.js';

/**
 * In-memory minimal uncompressed ZIP builder for DOCX testing.
 * Creates an authentic ZIP archive containing specified virtual files.
 */
function buildMinimalZipBuffer(files) {
  const localHeaders = [];
  const centralDirs = [];
  let offset = 0;

  for (const { name, content } of files) {
    const data = Buffer.from(content);
    const nameBuf = Buffer.from(name);

    // Local Header (30 bytes + name + data)
    const local = Buffer.alloc(30 + nameBuf.length + data.length);
    local.writeUInt32LE(0x04034b50, 0); // "PK\x03\x04"
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8); // Store (no compression)
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);

    const crc = zlib.crc32 ? zlib.crc32(data) : 0;
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    nameBuf.copy(local, 30);
    data.copy(local, 30 + nameBuf.length);
    localHeaders.push(local);

    // Central Directory Header (46 bytes + name)
    const cd = Buffer.alloc(46 + nameBuf.length);
    cd.writeUInt32LE(0x02014b50, 0); // "PK\x01\x02"
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0, 8);
    cd.writeUInt16LE(0, 10);
    cd.writeUInt16LE(0, 12);
    cd.writeUInt16LE(0, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(data.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);
    cd.writeUInt16LE(0, 32);
    cd.writeUInt16LE(0, 34);
    cd.writeUInt16LE(0, 36);
    cd.writeUInt32LE(0, 38);
    cd.writeUInt32LE(offset, 42);
    nameBuf.copy(cd, 46);
    centralDirs.push(cd);

    offset += local.length;
  }

  const cdTotalSize = centralDirs.reduce((a, b) => a + b.length, 0);
  const cdOffset = offset;

  // End of Central Directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // "PK\x05\x06"
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cdTotalSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralDirs, eocd]);
}

/**
 * Fixture: Valid minimal PDF containing text.
 */
const VALID_TEXT_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n' +
    '4 0 obj<</Length 55>>stream\n' +
    'BT /F1 12 Tf 100 700 Td (Bishal Sharma React Node.js Developer) Tj ET\n' +
    'endstream\n' +
    'endobj\n' +
    'xref\n' +
    '0 5\n' +
    '0000000000 65535 f \n' +
    '0000000009 00000 n \n' +
    '0000000058 00000 n \n' +
    '0000000115 00000 n \n' +
    '0000000216 00000 n \n' +
    'trailer<</Size 5/Root 1 0 R>>\n' +
    'startxref\n' +
    '321\n' +
    '%%EOF'
);

/**
 * Fixture: Valid PDF with zero text (simulating blank / scanned image page).
 */
const SCANNED_IMAGE_ONLY_PDF_BUFFER = Buffer.from(
  '%PDF-1.4\n' +
    '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n' +
    'xref\n' +
    '0 4\n' +
    '0000000000 65535 f \n' +
    '0000000009 00000 n \n' +
    '0000000058 00000 n \n' +
    '0000000115 00000 n \n' +
    'trailer<</Size 4/Root 1 0 R>>\n' +
    'startxref\n' +
    '200\n' +
    '%%EOF'
);

/**
 * Fixture: Valid DOCX containing text.
 */
const VALID_DOCX_BUFFER = buildMinimalZipBuffer([
  {
    name: '[Content_Types].xml',
    content:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  },
  {
    name: 'word/document.xml',
    content:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Lakshya Deep - Python &amp; AIML Engineer</w:t></w:r></w:p></w:body></w:document>',
  },
]);

/**
 * Fixture: Valid DOCX with no text content.
 */
const EMPTY_TEXT_DOCX_BUFFER = buildMinimalZipBuffer([
  {
    name: '[Content_Types].xml',
    content:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  },
  {
    name: 'word/document.xml',
    content:
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body></w:body></w:document>',
  },
]);

// -------------------------------------------------------------
// Test Suite: Sanitization & Normalization
// -------------------------------------------------------------

test('Text Sanitizer - Control character removal', () => {
  // Contains null bytes, bell, escape, and form feed, alongside tabs and newlines
  const dirty = 'Hello\x00World\x07!\x1B\x0C\nTab\tseparated\x7F';
  const result = sanitizeExtractedText(dirty);

  assert.equal(result.text, 'HelloWorld!\nTab separated');
  assert.equal(result.truncated, false);
});

test('Text Sanitizer - Whitespace normalization and paragraph preservation', () => {
  const unnormalized =
    '   First   Line with extra spaces   \r\n\r\n\r\n\r\n   Second Paragraph   \r\n\r\n';
  const result = sanitizeExtractedText(unnormalized);

  assert.equal(
    result.text,
    'First Line with extra spaces\n\nSecond Paragraph'
  );
  assert.equal(result.truncated, false);
});

test('Text Sanitizer - Maximum character limit bounding', () => {
  const longText = 'A'.repeat(60000);
  const result = sanitizeExtractedText(longText, { maxLength: 50000 });

  assert.equal(result.text.length, 50000);
  assert.equal(result.truncated, true);
  assert.equal(result.originalLength, 60000);
});

// -------------------------------------------------------------
// Test Suite: In-Memory Extraction
// -------------------------------------------------------------

test('Resume Parser - Successful text extraction from valid PDF', async () => {
  const result = await extractResumeText(
    VALID_TEXT_PDF_BUFFER,
    'candidate_resume.pdf'
  );

  assert.equal(result.fileType, 'pdf');
  assert.match(result.text, /Bishal Sharma React Node\.js Developer/i);
  assert.equal(result.characterCount > 0, true);
  assert.equal(result.pageCount, 1);
  assert.equal(result.truncated, false);
});

test('Resume Parser - Successful text extraction from valid DOCX', async () => {
  const result = await extractResumeText(
    VALID_DOCX_BUFFER,
    'candidate_resume.docx'
  );

  assert.equal(result.fileType, 'docx');
  assert.match(result.text, /Lakshya Deep - Python & AIML Engineer/i);
  assert.equal(result.characterCount > 0, true);
  assert.equal(result.pageCount, null);
  assert.equal(result.truncated, false);
});

test('Resume Parser - Extension-only input normalization', async () => {
  const result = await extractResumeText(VALID_TEXT_PDF_BUFFER, '.pdf');
  assert.equal(result.fileType, 'pdf');
  assert.match(result.text, /Bishal Sharma/i);
});

// -------------------------------------------------------------
// Test Suite: Error Handling & Edge Cases
// -------------------------------------------------------------

test('Resume Parser - Rejects empty buffer (0 bytes)', async () => {
  await assert.rejects(
    async () => {
      await extractResumeText(Buffer.alloc(0), 'empty.pdf');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'EMPTY_BUFFER');
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});

test('Resume Parser - Rejects corrupted PDF gracefully without crashing', async () => {
  const corruptPdf = Buffer.from('%PDF-1.4 completely invalid corrupt binary junk');
  await assert.rejects(
    async () => {
      await extractResumeText(corruptPdf, 'corrupt.pdf');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'CORRUPTED_PDF');
      assert.equal(err.statusCode, 422);
      assert.match(err.message, /corrupt or unreadable/i);
      return true;
    }
  );
});

test('Resume Parser - Rejects corrupted DOCX gracefully without crashing', async () => {
  // Valid ZIP header but corrupted zip payload
  const corruptDocx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x99, 0x88, 0x77]);
  await assert.rejects(
    async () => {
      await extractResumeText(corruptDocx, 'corrupt.docx');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'CORRUPTED_DOCX');
      assert.equal(err.statusCode, 422);
      assert.match(err.message, /corrupt or unreadable/i);
      return true;
    }
  );
});

test('Resume Parser - Detects scanned/image-only textless PDF and returns safe error', async () => {
  await assert.rejects(
    async () => {
      await extractResumeText(SCANNED_IMAGE_ONLY_PDF_BUFFER, 'scanned.pdf');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'NO_TEXT_DETECTED');
      assert.equal(err.statusCode, 422);
      assert.match(err.message, /OCR is not supported/i);
      return true;
    }
  );
});

test('Resume Parser - Detects empty text in DOCX and returns safe error', async () => {
  await assert.rejects(
    async () => {
      await extractResumeText(EMPTY_TEXT_DOCX_BUFFER, 'empty_text.docx');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'NO_TEXT_DETECTED');
      assert.equal(err.statusCode, 422);
      return true;
    }
  );
});

test('Resume Parser - Rejects unsupported file extension', async () => {
  await assert.rejects(
    async () => {
      await extractResumeText(Buffer.from('plain text'), 'resume.txt');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.statusCode, 415);
      return true;
    }
  );
});

test('Resume Parser - Rejects mismatched file signature (fake PDF)', async () => {
  const fakePdf = Buffer.from('This is a text file renamed to resume.pdf');
  await assert.rejects(
    async () => {
      await extractResumeText(fakePdf, 'fake.pdf');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'INVALID_SIGNATURE');
      assert.equal(err.statusCode, 415);
      return true;
    }
  );
});

test('Resume Parser - Rejects oversized buffer (> 5 MB)', async () => {
  const oversized = Buffer.alloc(5 * 1024 * 1024 + 10);
  oversized.set(Buffer.from('%PDF-'), 0);

  await assert.rejects(
    async () => {
      await extractResumeText(oversized, 'huge.pdf');
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'FILE_TOO_LARGE');
      assert.equal(err.statusCode, 413);
      return true;
    }
  );
});

test('Resume Parser - Rejects missing filename parameter', async () => {
  await assert.rejects(
    async () => {
      await extractResumeText(VALID_TEXT_PDF_BUFFER, null);
    },
    (err) => {
      assert(err instanceof ResumeParseError);
      assert.equal(err.code, 'MISSING_FILENAME');
      assert.equal(err.statusCode, 400);
      return true;
    }
  );
});
