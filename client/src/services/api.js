import { auth } from './firebase';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5001/api';

/**
 * Public GET request helper (used for health checks and unauthenticated queries).
 * @param {string} endpoint - API endpoint (e.g., '/health')
 * @returns {Promise<{ data: any, error: string | null }>}
 */
export async function get(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

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
async function authenticatedRequest(endpoint, method = 'GET', body = null) {
  if (!auth?.currentUser) {
    return { data: null, error: 'User is not authenticated' };
  }

  let token;
  try {
    token = await auth.currentUser.getIdToken();
  } catch {
    return { data: null, error: 'Failed to retrieve authentication token' };
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const options = {
    method,
    headers,
  };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (response.status === 401) {
      // Clean sign-out on 401 Unauthorized response from server
      try {
        await auth.signOut();
      } catch {
        // Ignore sign-out errors
      }
      return { data: null, error: 'Session expired. Please log in again.' };
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
      return { data: null, error: errorMessage };
    }

    const json = await response.json();
    return { data: json.data || json, error: null };
  } catch (err) {
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

export function patchAuth(endpoint, body) {
  return authenticatedRequest(endpoint, 'PATCH', body);
}

export default {
  get,
  getAuth,
  postAuth,
  patchAuth,
  baseUrl: API_BASE_URL,
};
