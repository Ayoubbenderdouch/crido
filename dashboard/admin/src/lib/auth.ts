// Mock auth for the visual prototype. Replaced by real Sanctum token
// handling once the backend auth endpoints exist (Sprint 1).

const TOKEN_KEY = 'crido_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

/** Mock sign-in — accepts any non-empty credentials. */
export function mockLogin(phone: string, password: string): boolean {
  if (phone.trim().length > 0 && password.trim().length > 0) {
    setToken(`mock.${btoa(phone)}.${Date.now()}`)
    return true
  }
  return false
}
