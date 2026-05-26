import { useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Bell, Store } from 'lucide-react'
import { merchantProfile } from '@/lib/mock/data'
import { NotificationDrawer } from '@/components/layout/NotificationDrawer'
import {
  getNotificationReadSnapshot,
  getVendorNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotificationRead,
} from '@/lib/notificationStore'
import { useVendorStore } from '@/hooks/useVendorStore'
import { cn } from '@/lib/utils'

export function Topbar() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const [drawerOpen, setDrawerOpen] = useState(false)

  useVendorStore()
  useSyncExternalStore(
    subscribeNotificationRead,
    getNotificationReadSnapshot,
    getNotificationReadSnapshot,
  )

  const notifications = getVendorNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = () => {
    markAllNotificationsRead(notifications.map((n) => n.id))
  }

  const handleNotificationRead = (id: string) => {
    markNotificationRead(id)
  }

  return (
    <>
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
            onClick={() => setDrawerOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary transition-colors hover:bg-background-secondary"
            aria-label={t('notifications.title')}
            aria-expanded={drawerOpen}
          >
            <Bell size={19} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span
                className={cn(
                  'absolute flex items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white',
                  unreadCount > 9
                    ? 'start-3 top-0.5 min-w-[18px] px-1 leading-[18px]'
                    : 'start-4 top-0.5 h-[18px] w-[18px]',
                )}
                aria-label={t('notifications.unreadCount', { count: unreadCount })}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <NotificationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onNotificationRead={handleNotificationRead}
      />
    </>
  )
}
