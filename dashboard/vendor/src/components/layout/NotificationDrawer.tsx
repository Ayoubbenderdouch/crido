import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Bell, CheckCheck, ClipboardList, Package, Wallet, X } from 'lucide-react'
import type { VendorNotification, VendorNotificationType } from '@/lib/vendorNotifications'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'

const typeIcons: Record<VendorNotificationType, typeof Bell> = {
  request: ClipboardList,
  payout: Wallet,
  product: Package,
}

const typeColors: Record<VendorNotificationType, string> = {
  request: 'bg-primary-surface text-primary',
  payout: 'bg-warning/15 text-warning',
  product: 'bg-info/15 text-info',
}

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
  notifications: VendorNotification[]
  onMarkAllRead: () => void
  onNotificationRead: (id: string) => void
}

export function NotificationDrawer({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onNotificationRead,
}: NotificationDrawerProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'
  const locale = (isArabic ? 'ar' : 'fr') as 'ar' | 'fr'
  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const handleClick = (notification: VendorNotification) => {
    if (!notification.read) onNotificationRead(notification.id)
    navigate(notification.link)
    onClose()
  }

  return (
    <>
      <div
        className={cn('crido-drawer-backdrop', open && 'crido-drawer-backdrop--open')}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('notifications.title')}
        className={cn('crido-drawer-panel', open && 'crido-drawer-panel--open')}
      >
        <div className="flex h-15 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-medium text-foreground">{t('notifications.title')}</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-fg">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:bg-background-secondary"
            aria-label={t('common.cancel')}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {unreadCount > 0 && (
          <div className="border-b border-border px-5 py-2">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary-light"
            >
              <CheckCheck className="h-4 w-4" strokeWidth={1.5} />
              {t('notifications.markAllRead')}
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
              <Bell className="h-10 w-10 text-foreground-tertiary" strokeWidth={1.25} />
              <p className="text-sm text-foreground-secondary">{t('notifications.empty')}</p>
            </div>
          ) : (
            <ul className="py-2">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type]
                const title = isArabic ? notification.titleAr : notification.titleFr
                const body = isArabic ? notification.bodyAr : notification.bodyFr
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleClick(notification)}
                      className={cn(
                        'crido-notification-item w-full px-5 py-3.5 text-start',
                        !notification.read && 'crido-notification-item--unread',
                      )}
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                            typeColors[notification.type],
                          )}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">{title}</p>
                            {!notification.read && (
                              <span
                                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                                aria-hidden
                              />
                            )}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-foreground-secondary">
                            {body}
                          </p>
                          <p className="mt-1 text-xs text-foreground-tertiary">
                            {formatRelative(notification.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
