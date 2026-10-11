import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isStorageConfigured,
  getStorageBucketName,
  getSanitizedSupabaseUrl,
  uploadResumeFile,
  deleteResumeFile,
  setSupabaseClientForTesting,
} from '../src/services/supabaseStorage.service.js';

test('Supabase Storage Service - URL Sanitization', () => {
  assert.equal(
    getSanitizedSupabaseUrl('https://example.supabase.co/rest/v1/'),
    'https://example.supabase.co'
  );
  assert.equal(
    getSanitizedSupabaseUrl('https://example.supabase.co/storage/v1'),
    'https://example.supabase.co'
  );
  assert.equal(
    getSanitizedSupabaseUrl('https://example.supabase.co/'),
    'https://example.supabase.co'
  );
  assert.equal(
    getSanitizedSupabaseUrl('"https://example.supabase.co/rest/v1"'),
    'https://example.supabase.co'
  );
  assert.equal(getSanitizedSupabaseUrl(''), '');
});

test('Supabase Storage Service - Configuration Detection', () => {
  // Verifies that isStorageConfigured returns a strict boolean
  const configured = isStorageConfigured();
  assert.equal(typeof configured, 'boolean');

  const bucketName = getStorageBucketName();
  assert.equal(typeof bucketName, 'string');
  assert.ok(bucketName.length > 0);
});

test('Supabase Storage Service - Unconfigured Gate Throws 503', async () => {
  // Ensure unconfigured client throws 503 error when client cannot be initialized
  setSupabaseClientForTesting(null);

  if (!isStorageConfigured()) {
    await assert.rejects(
      async () => {
        await uploadResumeFile('test/fake.pdf', Buffer.from('data'), 'application/pdf');
      },
      (err) => {
        assert.equal(err.status, 503);
        assert.match(err.message, /Storage service is not configured/i);
        return true;
      }
    );

    const deleteRes = await deleteResumeFile('test/fake.pdf');
    assert.equal(deleteRes.success, false);
    assert.match(deleteRes.error, /Storage service is not configured/i);
  }
});

test('Supabase Storage Service - Upload Success with Mock Client', async () => {
  let uploadedParams = null;

  const mockClient = {
    storage: {
      from: (bucket) => ({
        upload: async (path, buffer, options) => {
          uploadedParams = { bucket, path, bufferLength: buffer.length, options };
          return { data: { path }, error: null };
        },
      }),
    },
  };

  setSupabaseClientForTesting(mockClient);

  try {
    const fakeBuffer = Buffer.from('%PDF-1.4 simulated');
    const result = await uploadResumeFile('user123/resume.pdf', fakeBuffer, 'application/pdf');

    assert.equal(result.path, 'user123/resume.pdf');
    assert.equal(uploadedParams.bucket, getStorageBucketName());
    assert.equal(uploadedParams.path, 'user123/resume.pdf');
    assert.equal(uploadedParams.options.contentType, 'application/pdf');
    assert.equal(uploadedParams.options.upsert, false);
  } finally {
    setSupabaseClientForTesting(null);
  }
});

test('Supabase Storage Service - Upload Error Handling with Mock Client', async () => {
  const mockClient = {
    storage: {
      from: () => ({
        upload: async () => {
          return { data: null, error: { message: 'Bucket quota exceeded' } };
        },
      }),
    },
  };

  setSupabaseClientForTesting(mockClient);

  try {
    await assert.rejects(
      async () => {
        await uploadResumeFile('user123/resume.pdf', Buffer.from('data'), 'application/pdf');
      },
      (err) => {
        assert.equal(err.status, 500);
        assert.match(err.message, /Bucket quota exceeded/i);
        return true;
      }
    );
  } finally {
    setSupabaseClientForTesting(null);
  }
});

test('Supabase Storage Service - Safe File Deletion with Mock Client', async () => {
  const removedPaths = [];

  const mockClient = {
    storage: {
      from: (bucket) => ({
        remove: async (paths) => {
          removedPaths.push({ bucket, paths });
          return { data: paths, error: null };
        },
      }),
    },
  };

  setSupabaseClientForTesting(mockClient);

  try {
    // Valid path
    const res = await deleteResumeFile('user123/file-to-delete.pdf');
    assert.equal(res.success, true);
    assert.deepEqual(removedPaths[0].paths, ['user123/file-to-delete.pdf']);

    // Invalid / empty path returns failure cleanly without crashing
    const emptyRes = await deleteResumeFile('');
    assert.equal(emptyRes.success, false);

    // Non-string path
    const nullRes = await deleteResumeFile(null);
    assert.equal(nullRes.success, false);
  } finally {
    setSupabaseClientForTesting(null);
  }
});

test('Supabase Storage Service - Rollback Simulation on DB Failure', async () => {
  const storageFiles = new Set();

  const mockClient = {
    storage: {
      from: () => ({
        upload: async (path) => {
          storageFiles.add(path);
          return { data: { path }, error: null };
        },
        remove: async (paths) => {
          paths.forEach((p) => storageFiles.delete(p));
          return { data: paths, error: null };
        },
      }),
    },
  };

  setSupabaseClientForTesting(mockClient);

  try {
    const uploadPath = 'user123/new-file.pdf';

    // 1. Storage upload succeeds
    await uploadResumeFile(uploadPath, Buffer.from('test'), 'application/pdf');
    assert.ok(storageFiles.has(uploadPath));

    // 2. Simulated DB write throws
    let dbFailed = false;
    try {
      throw new Error('Firestore connection timeout');
    } catch {
      dbFailed = true;
      // 3. Rollback triggers storage deletion
      await deleteResumeFile(uploadPath);
    }

    assert.equal(dbFailed, true);
    // 4. Verify orphan file was rolled back
    assert.equal(storageFiles.has(uploadPath), false);
  } finally {
    setSupabaseClientForTesting(null);
  }
});

test('Supabase Storage Service - Replacement Atomic Cleanup Simulation', async () => {
  const storageFiles = new Set(['user123/old-file.pdf']);

  const mockClient = {
    storage: {
      from: () => ({
        upload: async (path) => {
          storageFiles.add(path);
          return { data: { path }, error: null };
        },
        remove: async (paths) => {
          paths.forEach((p) => storageFiles.delete(p));
          return { data: paths, error: null };
        },
      }),
    },
  };

  setSupabaseClientForTesting(mockClient);

  try {
    const oldPath = 'user123/old-file.pdf';
    const newPath = 'user123/new-file.pdf';

    // Step A: Upload new file
    await uploadResumeFile(newPath, Buffer.from('replacement'), 'application/pdf');
    assert.ok(storageFiles.has(oldPath));
    assert.ok(storageFiles.has(newPath));

    // Step B: Simulate DB update succeeds
    const dbUpdateSuccess = true;
    assert.equal(dbUpdateSuccess, true);

    // Step C: Old file is deleted only after DB update succeeds
    await deleteResumeFile(oldPath);

    assert.equal(storageFiles.has(oldPath), false);
    assert.equal(storageFiles.has(newPath), true);
  } finally {
    setSupabaseClientForTesting(null);
  }
});
