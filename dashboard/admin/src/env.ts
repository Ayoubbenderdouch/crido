// Typed access to Vite env vars. Keep all `import.meta.env` reads here so
// the rest of the codebase deals with plain constants.
//
// VITE_API_MODE switches the data layer between the real Laravel backend
// (`real`) and the offline mock layer (`mock`). Default is `real`.

export type ApiMode = 'real' | 'mock'

function readApiMode(): ApiMode {
  const raw = (import.meta.env.VITE_API_MODE ?? 'real').toString().toLowerCase()
  return raw === 'mock' ? 'mock' : 'real'
}

export const API_URL: string =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'

export const API_MODE: ApiMode = readApiMode()

export const APP_NAME: string = import.meta.env.VITE_APP_NAME || 'Crido Admin'
export const DEFAULT_LOCALE: string = import.meta.env.VITE_DEFAULT_LOCALE || 'ar'
