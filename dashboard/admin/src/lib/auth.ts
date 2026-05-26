// Token storage + small auth helpers shared across the admin dashboard.
//
// Backwards-compatible with the original mock auth: `getToken`, `setToken`,
// `clearToken`, `isAuthenticated`, `mockLogin` are still exported, but the
// LoginPage now talks to the real Laravel `auth/login` endpoint via
// `loginWithApi()`.

import * as authApi from './api/auth'

const TOKEN_KEY = 'crido_admin_token'
const USER_KEY = 'crido_admin_user'

export function getToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function getStoredUser(): authApi.AuthUser | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as authApi.AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: authApi.AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/**
 * Real backend login. Stores the token (and user) on success, throws on
 * invalid credentials or when the user is not an admin.
 */
export async function loginWithApi(
  phone: string,
  password: string,
): Promise<authApi.AuthUser> {
  const { user, token } = await authApi.login(phone, password)
  if (user.role !== 'admin') {
    throw new Error('NOT_ADMIN')
  }
  setToken(token)
  setStoredUser(user)
  return user
}

/** Logs out on the backend and clears local state. Always clears locally. */
export async function logoutWithApi(): Promise<void> {
  try {
    await authApi.logout()
  } catch {
    // Even if the network call fails, we still drop local credentials.
  } finally {
    clearToken()
  }
}

/**
 * Legacy mock sign-in — kept for the mock data path. Accepts any non-empty
 * credentials. New code should call `loginWithApi`.
 */
export function mockLogin(phone: string, password: string): boolean {
  if (phone.trim().length > 0 && password.trim().length > 0) {
    setToken(`mock.${btoa(phone)}.${Date.now()}`)
    return true
  }
  return false
}
