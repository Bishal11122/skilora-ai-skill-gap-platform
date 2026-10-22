import { auth } from './firebase';

const PROD_API_URL = 'https://skilora-ai-skill-gap-platform.onrender.com/api';
const DEV_API_URL = 'http://localhost:5001/api';

/**
 * Resolves the active backend API base URL.
 * Prefers `import.meta.env.VITE_API_URL`.
 * If unset:
 *   - Production mode (`import.meta.env.PROD`): uses deployed Render backend
 *   - Development mode (`import.meta.env.DEV`): uses local backend at localhost:5001
 */
export const API_BASE_URL = (() => {
  const envUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : null;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  const isProd = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD);
  return isProd ? PROD_API_URL : DEV_API_URL;
})();

/**
 * Safely resolves an endpoint to a complete, normalized API URL.
 * Handles variations with or without trailing slashes and prevents duplicate `/api/api` paths.
 *
 * @param {string} endpoint - API path (e.g. '/users/me', 'careers', '/api/careers')
 * @returns {string} Fully qualified URL
 */
export function buildApiUrl(endpoint = '') {
  const base = API_BASE_URL.replace(/\/+$/, '');
  const baseEndsWithApi = base.endsWith('/api');
  let path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (baseEndsWithApi) {
    if (path === '/api') {
      path = '';
    } else if (path.startsWith('/api/')) {
      path = path.slice(4);
    }
  } else {
    if (!path.startsWith('/api/') && path !== '/api') {
      path = `/api${path}`;
    }
  }

  return `${base}${path}`;
}

/**
 * Public GET request helper (used for health checks and unauthenticated queries).
 * @param {string} endpoint - API endpoint (e.g., '/health' or '/api/health')
 * @returns {Promise<{ data: any, error: string | null }>}
 */
export async function get(endpoint) {
  const url = buildApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error?.message) {
          errorMessage = errorBody.error.message;
        }
      } catch {
        // Non-JSON response fallback
      }
      return { data: null, error: errorMessage };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    return {
      data: null,
      error: `Network error: Backend not reachable (${message})`,
    };
  }
}

/**
 * Executes an authenticated API request with an Authorization: Bearer <idToken> header.
 * If the server responds with 401, signs out the user cleanly.
 */
async function authenticatedRequest(endpoint, method = 'GET', body = null, extraOptions = {}) {
  if (!auth?.currentUser) {
    return { data: null, error: 'User is not authenticated' };
  }

  let token;
  try {
    token = await auth.currentUser.getIdToken();
  } catch {
    return { data: null, error: 'Failed to retrieve authentication token' };
  }

  const url = buildApiUrl(endpoint);

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const options = {
    method,
    headers,
    ...extraOptions,
  };

  if (body !== null) {
    if (body instanceof FormData) {
      // Do NOT set Content-Type header manually; browser automatically sets boundary
      options.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      // Check if server rejected specifically for RECENT_AUTH_REQUIRED
      try {
        const errorBody = await response.json();
        if (errorBody?.error?.code === 'RECENT_AUTH_REQUIRED') {
          return {
            data: null,
            error: errorBody.error.message,
            code: 'RECENT_AUTH_REQUIRED',
            status: 401,
          };
        }
      } catch {
        // Fallback to normal session sign-out
      }

      // Clean sign-out on general 401 Unauthorized response from server
      try {
        await auth.signOut();
      } catch {
        // Ignore sign-out errors
      }
      return { data: null, error: 'Session expired. Please log in again.', status: 401 };
    }

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errorBody = await response.json();
        if (errorBody?.error?.message) {
          errorMessage = errorBody.error.message;
        }
      } catch {
        // Fallback
      }
      return { data: null, error: errorMessage, status: response.status };
    }

    const json = await response.json();
    return { data: json.data !== undefined ? json.data : json, error: null, status: response.status };
  } catch (err) {
    if (err?.name === 'AbortError') {
      return { data: null, error: 'Request cancelled', aborted: true };
    }
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    return {
      data: null,
      error: `Network error: Backend not reachable (${message})`,
    };
  }
}

export function getAuth(endpoint) {
  return authenticatedRequest(endpoint, 'GET');
}

export function postAuth(endpoint, body) {
  return authenticatedRequest(endpoint, 'POST', body);
}

export function putAuth(endpoint, body) {
  return authenticatedRequest(endpoint, 'PUT', body);
}

export function patchAuth(endpoint, body) {
  return authenticatedRequest(endpoint, 'PATCH', body);
}

export function deleteAuth(endpoint, body = null) {
  return authenticatedRequest(endpoint, 'DELETE', body);
}

export function uploadAuth(endpoint, formData, { method = 'POST', signal } = {}) {
  return authenticatedRequest(endpoint, method, formData, signal ? { signal } : {});
}

export default {
  get,
  getAuth,
  postAuth,
  putAuth,
  patchAuth,
  deleteAuth,
  uploadAuth,
  buildApiUrl,
  baseUrl: API_BASE_URL,
};
