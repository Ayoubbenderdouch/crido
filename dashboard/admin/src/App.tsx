import { useTranslation } from 'react-i18next'

export default function App() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card px-10 py-12">
        <p className="text-3xl font-medium text-primary">Crido</p>
        <p className="mt-1 text-sm text-foreground-tertiary">{t('app.tagline')}</p>

        <h1 className="mt-8 text-xl font-medium text-foreground">{t('boot.title')}</h1>
        <p className="mt-2 text-base text-foreground-secondary">{t('boot.subtitle')}</p>

        <p className="mt-6 inline-block rounded-md bg-primary-surface px-3 py-1 text-sm font-medium text-primary">
          {t('boot.status')}
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => i18n.changeLanguage(isArabic ? 'fr' : 'ar')}
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
          >
            {isArabic ? 'Français' : 'العربية'}
          </button>
        </div>
      </div>
    </main>
  )
}
