import { API_URL } from '../config';
import { ApiError } from './ApiError';

export { ApiError };

const TOKEN_KEY = 'smt_token';
let memoryToken = null;

// Token handling lives here so the rest of the app never touches storage directly.
export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) ?? memoryToken; } catch { return memoryToken; }
  },
  set(token) {
    memoryToken = token;
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* storage unavailable */ }
  },
  clear() {
    memoryToken = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

let unauthorizedHandler = null;
export const onUnauthorized = (fn) => { unauthorizedHandler = fn; };

async function realRequest(method, url, { body, token, responseType }) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${API_URL}${url}`, {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  if (!res.ok) {
    let data = {};
    try { data = await res.json(); } catch { /* no body */ }
    throw new ApiError(data.message || res.statusText || 'Something went wrong.', res.status, data.errors);
  }
  if (res.status === 204) return null;
  if (responseType === 'blob') return res.blob();
  return res.json();
}

/**
 * Single entry point for every HTTP call. Components never call fetch directly.
 * With VITE_USE_MOCK=true the request is answered by the in-browser mock backend.
 */
export async function request(method, path, { body, params, responseType } = {}) {
  const qs = params
    ? new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    ).toString()
    : '';
  const url = qs ? `${path}?${qs}` : path;
  const token = tokenStore.get();

  try {
    // __USE_MOCK__ is a build-time constant, so production builds drop the mock backend entirely.
    if (__USE_MOCK__) {
      const { handleMockRequest } = await import('./mock/server.js');
      return await handleMockRequest(method, url, body, token);
    }
    return await realRequest(method, url, { body, token, responseType });
  } catch (err) {
    if (err.status === 401 && token && !path.startsWith('/auth/login') && unauthorizedHandler) {
      unauthorizedHandler();
    }
    throw err;
  }
}
