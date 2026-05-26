// Authentication endpoints.

import { apiClient } from '../apiClient'
import type { Enum } from './types'

export type AuthUser = {
  id: number
  uuid: string
  role: string
  full_name: string
  phone: string
  email: string | null
  locale: 'ar' | 'fr'
  status: Enum
  phone_verified_at: string | null
  email_verified_at: string | null
  permissions: string[]
}

export type LoginResponse = {
  user: AuthUser
  token: string
}

export async function login(phone: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', {
    phone,
    password,
  })
  return data
}

export async function me(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me')
  return data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
