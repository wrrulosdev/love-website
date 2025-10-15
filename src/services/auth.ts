import type { LoginResponse } from '../interfaces/auth';
import { api } from './api';

/**
 * Handles user authentication by sending credentials to the backend.
 *
 * @param username - User’s username or email.
 * @param password - Plain text password (sent as x-www-form-urlencoded).
 * @returns Object containing the access token, refresh token, and other metadata defined in LoginResponse.
 */
export async function loginApi(username: string, password: string) {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);

  const { data } = await api.post<LoginResponse>('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return data;
}

/**
 * Requests a new access token using a valid refresh token.
 *
 * @param refreshToken - Refresh token stored locally. If not provided, an empty body is sent.
 * @returns Object containing a new access token and refresh token (if provided by the backend).
 */
export async function refreshApi(refreshToken?: string) {
  const body = refreshToken ? { refresh_token: refreshToken } : {};
  const { data } = await api.post<LoginResponse>('/auth/refresh', body);
  return data;
}

/**
 * Logs out the current user session.
 *
 * @param allSessions - If true, terminates all active sessions for the user.
 *                      Adjust depending on backend requirements.
 * @returns Backend response (usually a confirmation of logout).
 */
export async function logoutApi(allSessions = false) {
  const { data } = await api.post('/auth/logout', { all_sessions: allSessions });
  return data;
}

/**
 * Retrieves information about the currently authenticated user.
 *
 * @returns User data object returned by the backend (e.g., id, username, roles, etc.).
 */
export async function meApi() {
  const { data } = await api.get('/auth/me');
  return data;
}
