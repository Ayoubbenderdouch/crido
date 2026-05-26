// /auth/* endpoints — login / logout / me.
// Returns the AuthUserResource shape exactly as the backend defines it.

import { apiClient } from '@/lib/apiClient'
import type { AuthUser } from '@/lib/auth'
import { clearToken, setStoredUser, setToken } from '@/lib/auth'

export type LoginResponse = {
  user: AuthUser
  token: string
}

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    phone,
    password,
  })

  if (data.user?.role !== 'vendor') {
    throw new Error('not_a_vendor_account')
  }

  setToken(data.token)
  setStoredUser(data.user)
  return data
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {})
  } catch {
    // ignore — even a failed logout should still clear the local token
  } finally {
    clearToken()
  }
}

export async function me(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
  setStoredUser(data.user)
  return data.user
}
