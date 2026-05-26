// Single axios instance for the Admin Dashboard.
//
// Adds:
//  - Authorization header from local token store
//  - Accept-Language from the current i18n direction
//  - 401 redirect to /login (clears the token first)
//  - apiErrorMessage helper that extracts the Laravel ValidationException /
//    abort message shape we use server-side

import axios, { AxiosError, type AxiosInstance } from 'axios'
import { API_URL } from '@/env'
import { clearToken, getToken } from './auth'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  // Locale — fall back to document.lang then 'ar'
  const locale =
    (typeof document !== 'undefined' && document.documentElement.lang) || 'ar'
  config.headers = config.headers ?? {}
  config.headers['Accept-Language'] = locale
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      if (
        typeof window !== 'undefined' &&
        !window.location.pathname.endsWith('/login')
      ) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Pulls a readable message out of a backend error, with a sensible fallback. */
export function apiErrorMessage(
  error: unknown,
  fallback = 'حدث خطأ ما، حاول مرة أخرى',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    if (data?.message) return data.message
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (first) return first
    }
  }
  return fallback
}
