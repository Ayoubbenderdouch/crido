import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import i18n from '@/lib/i18n'
import App from './App.tsx'
import './index.css'

// Keep document direction in sync with the active locale (Arabic = RTL).
function applyDir(lng: string) {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lng
}

applyDir(i18n.language)
i18n.on('languageChanged', applyDir)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
