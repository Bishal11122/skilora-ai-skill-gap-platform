import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET,
} from '../config/env.js';

let supabaseClient = null;

/**
 * Normalizes any provided Supabase URL to its origin (protocol + host),
 * ensuring subpaths like /rest/v1 or /storage/v1 are stripped out.
 *
 * @param {string} [rawUrl]
 * @returns {string} e.g. "https://your-project.supabase.co"
 */
export function getSanitizedSupabaseUrl(rawUrl) {
  const target = (
    typeof rawUrl === 'string'
      ? rawUrl
      : process.env.SUPABASE_URL || SUPABASE_URL || ''
  ).trim();
  const cleaned = target.replace(/^["']|["']$/g, '');
  if (!cleaned) return '';

  try {
    const parsed = new URL(cleaned.startsWith('http') ? cleaned : `https://${cleaned}`);
    return parsed.origin;
  } catch {
    return cleaned.replace(/\/+$/, '');
  }
}

/**
 * Returns true if both SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are configured,
 * or if a test client is injected.
 */
export function isStorageConfigured() {
  if (supabaseClient) {
    return true;
  }

  const url = getSanitizedSupabaseUrl();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    SUPABASE_SERVICE_ROLE_KEY ||
    ''
  ).trim();

  return Boolean(url && key);
}

/**
 * Lazily initializes and returns the Supabase Admin client with service-role privileges.
 * Returns null if required configuration variables are missing.
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!isStorageConfigured()) {
    return null;
  }

  const url = getSanitizedSupabaseUrl();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    SUPABASE_SERVICE_ROLE_KEY ||
    ''
  )
    .trim()
    .replace(/^["']|["']$/g, '');

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * Allows overriding or resetting the client instance for automated unit testing.
 * @internal
 */
export function setSupabaseClientForTesting(mockClient) {
  supabaseClient = mockClient;
}

export function getStorageBucketName() {
  const bucket = (
    process.env.SUPABASE_STORAGE_BUCKET ||
    SUPABASE_STORAGE_BUCKET ||
    'resumes'
  )
    .trim()
    .replace(/^["']|["']$/g, '');

  return bucket || 'resumes';
}

/**
 * Uploads a file buffer to the private Supabase Storage bucket.
 *
 * @param {string} storagePath - Relative path inside the bucket, e.g. `${uid}/${randomId}.${ext}`
 * @param {Buffer} fileBuffer - In-memory buffer of the file
 * @param {string} contentType - MIME type of the document (application/pdf or docx)
 * @returns {Promise<{ path: string }>}
 */
export async function uploadResumeFile(storagePath, fileBuffer, contentType) {
  const client = getSupabaseClient();
  if (!client) {
    const error = new Error('Storage service is not configured');
    error.status = 503;
    throw error;
  }

  const bucket = getStorageBucketName();
  const resolvedUrl = client.supabaseUrl || getSanitizedSupabaseUrl();
  let hostname = 'unknown';
  try {
    hostname = new URL(resolvedUrl).hostname;
  } catch {
    // Non-blocking fallback
  }

  // Safe diagnostics: host, bucket, sanitized path, and MIME type (never logs credentials or file content)
  console.log(
    `[SupabaseStorage] Uploading object -> Host: "${hostname}", Bucket: "${bucket}", ObjectPath: "${storagePath}", ContentType: "${contentType}"`
  );

  const { data, error } = await client.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.warn(
      `[SupabaseStorage] Upload failed on Host "${hostname}" / Bucket "${bucket}": ${error.message}`
    );
    const uploadError = new Error(
      error.message || 'Failed to upload file to storage'
    );
    uploadError.status = 500;
    uploadError.original = error;
    throw uploadError;
  }

  return {
    path: data?.path || storagePath,
  };
}

/**
 * Deletes a file from the private Supabase Storage bucket.
 * Non-throwing safe operation (logs warning if deletion fails).
 *
 * @param {string} storagePath - Relative path inside the bucket
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function deleteResumeFile(storagePath) {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Storage service is not configured',
    };
  }

  if (!storagePath || typeof storagePath !== 'string') {
    return { success: false, error: 'Invalid storage path' };
  }

  try {
    const bucket = getStorageBucketName();
    const resolvedUrl = client.supabaseUrl || getSanitizedSupabaseUrl();
    let hostname = 'unknown';
    try {
      hostname = new URL(resolvedUrl).hostname;
    } catch {
      // Non-blocking fallback
    }

    // Safe diagnostics: host, bucket, and object path (never logs credentials)
    console.log(
      `[SupabaseStorage] Deleting object -> Host: "${hostname}", Bucket: "${bucket}", ObjectPath: "${storagePath}"`
    );

    const { error } = await client.storage
      .from(bucket)
      .remove([storagePath]);

    if (error) {
      console.warn(
        `[SupabaseStorage] Notice: File cleanup for "${storagePath}" on Host "${hostname}" encountered: ${error.message}`
      );
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.warn(
      `[SupabaseStorage] Notice: Unexpected exception during file removal: ${err.message}`
    );
    return { success: false, error: err.message };
  }
}

/**
 * Downloads a file from the private Supabase Storage bucket as an in-memory Buffer.
 *
 * @param {string} storagePath - Relative path inside the bucket, e.g. `${uid}/${randomId}.${ext}`
 * @returns {Promise<Buffer>}
 */
export async function downloadResumeFile(storagePath) {
  const client = getSupabaseClient();
  if (!client) {
    const error = new Error('Storage service is not configured');
    error.status = 503;
    throw error;
  }

  if (!storagePath || typeof storagePath !== 'string') {
    const error = new Error('Invalid storage path');
    error.status = 400;
    throw error;
  }

  const cleanPath = storagePath.startsWith('resumes/')
    ? storagePath.slice('resumes/'.length)
    : storagePath;

  const bucket = getStorageBucketName();
  const { data, error } = await client.storage
    .from(bucket)
    .download(cleanPath);

  if (error || !data) {
    const downloadError = new Error(
      error?.message || 'Failed to download resume file from storage'
    );
    downloadError.status = error?.status === 404 || error?.statusCode === '404' ? 404 : 500;
    downloadError.original = error;
    throw downloadError;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default {
  getSanitizedSupabaseUrl,
  isStorageConfigured,
  getSupabaseClient,
  getStorageBucketName,
  setSupabaseClientForTesting,
  uploadResumeFile,
  deleteResumeFile,
  downloadResumeFile,
};
