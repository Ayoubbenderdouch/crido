// Token storage + helpers for the vendor dashboard.
// The Sanctum token returned by /auth/login lives under this key in
// localStorage. apiClient picks it up automatically on every request.

const TOKEN_KEY = 'crido_vendor_token'
const USER_KEY = 'crido_vendor_user'

export type AuthUser = {
  id: number
  uuid: string
  role: string
  full_name: string | null
  phone: string | null
  email: string | null
  locale: string | null
  status: unknown
  phone_verified_at: string | null
  email_verified_at: string | null
  permissions: string[]
}

export function getToken(): string | null {
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

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Mock sign-in helper — only used when VITE_API_MODE=mock. */
export function mockLogin(phone: string, password: string): boolean {
  if (phone.trim().length > 0 && password.trim().length > 0) {
    setToken(`mock.${btoa(phone)}.${Date.now()}`)
    return true
  }
  return false
}
