import { useTranslation } from 'react-i18next'
import { Search, Bell, Store } from 'lucide-react'
import { merchantProfile } from '@/lib/mock/data'

export function Topbar() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <header className="flex h-15 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-surface text-primary">
          <Store size={18} strokeWidth={1.5} />
        </span>
        <div className="hidden sm:block">
          <p className="text-sm font-medium leading-tight text-foreground">{merchantProfile.name}</p>
          <p className="text-xs leading-tight text-foreground-tertiary">{merchantProfile.commune}</p>
        </div>
      </div>

      <div className="relative hidden max-w-xs flex-1 md:block">
        <Search
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute inset-y-0 my-auto start-3 text-foreground-tertiary"
        />
        <input
          type="search"
          placeholder={t('common.search')}
          className="h-9 w-full rounded-md border border-border bg-background-secondary ps-9 pe-3 text-sm text-foreground placeholder:text-foreground-tertiary focus:border-primary focus:bg-background focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => i18n.changeLanguage(isArabic ? 'fr' : 'ar')}
          className="h-9 rounded-md px-3 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-secondary"
        >
          {isArabic ? 'Français' : 'العربية'}
        </button>
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary transition-colors hover:bg-background-secondary"
        >
          <Bell size={19} strokeWidth={1.5} />
          <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>
      </div>
    </header>
  )
}
