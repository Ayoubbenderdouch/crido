// Axios instance used by the real-API modules under src/lib/api/.
// Adds the Sanctum bearer token + Accept-Language header on every request
// and centralises the 401 handler (clear token, bounce to /login).

import axios, { AxiosError, type AxiosInstance } from 'axios'
import { clearToken, getToken } from '@/lib/auth'

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://127.0.0.1:8000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Sanctum tokens are sent via Authorization header — no cookies needed.
  withCredentials: false,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  const lang =
    (typeof document !== 'undefined' && document.documentElement.lang) || 'ar'
  config.headers.set('Accept-Language', lang)
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) {
      clearToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  },
)

/**
 * Pulls a human-friendly error message out of an Axios error.
 * Falls back to the generic `error.message` when the backend didn't
 * send a JSON body (timeouts, network errors, …).
 */
export function apiErrorMessage(err: unknown, fallback?: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string; errors?: Record<string, string[]> }
      | undefined
    if (data?.message) return data.message
    if (data?.error) return data.error
    if (data?.errors) {
      const firstField = Object.values(data.errors)[0]
      if (Array.isArray(firstField) && firstField.length > 0) {
        return firstField[0]
      }
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback ?? 'Request failed'
}

export const API_URL = baseURL
export const API_MODE: 'real' | 'mock' =
  (import.meta.env.VITE_API_MODE as 'real' | 'mock' | undefined) ?? 'real'
