/// <reference types="vite/client" />
/**
 * JV Controls — API Base URL Utility
 *
 * In development:  Vite proxy handles /api → localhost:5000 (no env var needed)
 * In production:   VITE_API_URL points to the deployed backend, e.g.
 *                  https://jv-controls-api.onrender.com
 *
 * Usage:
 *   import { apiUrl } from '../utils/api';
 *   fetch(apiUrl('/api/auth/login'), { ... })
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';

/**
 * Prepend the backend base URL to any relative /api path.
 * If VITE_API_URL is not set (dev mode), returns the path as-is
 * so the Vite proxy handles it.
 */
export function apiUrl(path: string): string {
  if (BASE_URL) {
    // Remove trailing slash from base, ensure path starts with /
    return `${BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}

export default apiUrl;
