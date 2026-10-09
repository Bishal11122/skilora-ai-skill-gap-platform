const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

/**
 * Helper function for GET requests that gracefully handles network and HTTP errors.
 * @param {string} endpoint - API endpoint (e.g., '/health' or 'health')
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
        // Non-JSON error response fallback
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

export default {
  get,
  baseUrl: API_BASE_URL,
};
