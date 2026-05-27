import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  CircleDollarSign,
  BadgeCheck,
  ShieldCheck,
  Store,
  MessageCircle,
  Settings as SettingsIcon,
  Inbox,
  ChevronLeft,
} from 'lucide-react'
import { NotificationBell } from '@/components/data/NotificationBell'
import { GlobalSearch } from '@/components/data/GlobalSearch'
import { MOCK_NOTIFICATIONS, type Notification, type NotificationType } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

const TYPE_ICON: Record<NotificationType, typeof CircleDollarSign> = {
  financing_approved: CircleDollarSign,
  payment_verified: BadgeCheck,
  kyc_pending: ShieldCheck,
  merchant_request: Store,
  message_received: MessageCircle,
  system: SettingsIcon,
}

const TYPE_TONE: Record<NotificationType, { bg: string; fg: string }> = {
  financing_approved: { bg: 'bg-primary-surface', fg: 'text-primary' },
  payment_verified: { bg: 'bg-[#E1F5EE]', fg: 'text-[#085041]' },
  kyc_pending: { bg: 'bg-[#FAEEDA]', fg: 'text-[#633806]' },
  merchant_request: { bg: 'bg-[#E6F1FB]', fg: 'text-[#0C447C]' },
  message_received: { bg: 'bg-[#FCEBEB]', fg: 'text-[#791F1F]' },
  system: { bg: 'bg-background-secondary', fg: 'text-foreground-secondary' },
}

/** Quick "5 min ago / 3h / yesterday / 24 May" formatter — RTL-safe. */
function timeAgo(iso: string, locale: 'ar' | 'fr', now: Date): string {
  const then = new Date(iso)
  const diffMin = Math.max(0, Math.round((now.getTime() - then.getTime()) / 60000))
  if (locale === 'ar') {
    if (diffMin < 1) return 'الآن'
    if (diffMin < 60) return `قبل ${diffMin} د`
    if (diffMin < 60 * 24) return `قبل ${Math.round(diffMin / 60)} س`
    if (diffMin < 60 * 24 * 2) return 'أمس'
    return `قبل ${Math.round(diffMin / (60 * 24))} يوم`
  }
  if (diffMin < 1) return "à l'instant"
  if (diffMin < 60) return `il y a ${diffMin} min`
  if (diffMin < 60 * 24) return `il y a ${Math.round(diffMin / 60)} h`
  if (diffMin < 60 * 24 * 2) return 'hier'
  return `il y a ${Math.round(diffMin / (60 * 24))} j`
}

function NotificationDropdownRow({
  notif,
  onClick,
  locale,
  now,
}: {
  notif: Notification
  onClick: () => void
  locale: 'ar' | 'fr'
  now: Date
}) {
  const Icon = TYPE_ICON[notif.type]
  const tone = TYPE_TONE[notif.type]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 border-b border-border px-4 py-3 text-start transition-colors last:border-0 hover:bg-background-secondary',
        notif.unread && 'bg-primary-surface/30',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
          tone.bg,
          tone.fg,
        )}
      >
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              'truncate text-sm leading-snug',
              notif.unread ? 'font-semibold text-foreground' : 'font-medium text-foreground-secondary',
            )}
          >
            {notif.title}
          </span>
          {notif.unread && (
            <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          )}
        </span>
        <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-foreground-tertiary">
          {notif.body}
        </span>
        <span className="mt-1 block text-[11px] text-foreground-tertiary">
          {timeAgo(notif.created_at, locale, now)}
        </span>
      </span>
    </button>
  )
}

export function Topbar() {
  const { i18n } = useTranslation()
  const locale = (i18n.language as 'ar' | 'fr') ?? 'ar'
  const isArabic = locale === 'ar'
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const now = useMemo(() => new Date('2026-05-27T10:00:00Z'), [])

  const sorted = useMemo(
    () => [...MOCK_NOTIFICATIONS].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [],
  )
  const unreadCount = useMemo(() => sorted.filter((n) => n.unread).length, [sorted])
  const top5 = sorted.slice(0, 5)

  // Close on outside click + Esc
  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function openNotification(n: Notification) {
    setOpen(false)
    navigate(n.link ?? '/notifications')
  }

  return (
    <header className="flex h-15 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <GlobalSearch />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => i18n.changeLanguage(isArabic ? 'fr' : 'ar')}
          className="h-9 rounded-md px-3 text-sm font-medium text-foreground-secondary transition-colors hover:bg-background-secondary"
        >
          {isArabic ? 'Français' : 'العربية'}
        </button>

        <div ref={wrapRef} className="relative">
          <NotificationBell
            count={unreadCount}
            onClick={() => setOpen((v) => !v)}
            active={open}
          />

          {open && (
            <div
              role="menu"
              className="animate-fade-up absolute end-0 top-[calc(100%+8px)] z-50 w-[360px] overflow-hidden rounded-xl border border-border bg-card shadow-lg ring-1 ring-black/[0.03]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isArabic ? 'الإشعارات' : 'Notifications'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-foreground-tertiary">
                    {unreadCount > 0
                      ? isArabic
                        ? `${unreadCount} غير مقروء`
                        : `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                      : isArabic
                        ? 'كل الإشعارات مقروءة'
                        : 'Toutes lues'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-danger/10 px-2 py-0.5 text-[11px] font-bold text-danger">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {top5.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary text-foreground-tertiary">
                      <Inbox size={22} strokeWidth={1.5} />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {isArabic ? 'لا توجد إشعارات' : 'Aucune notification'}
                    </p>
                  </div>
                ) : (
                  top5.map((n) => (
                    <NotificationDropdownRow
                      key={n.id}
                      notif={n}
                      onClick={() => openNotification(n)}
                      locale={locale}
                      now={now}
                    />
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  navigate('/notifications')
                }}
                className="flex w-full items-center justify-between gap-2 border-t border-border bg-background-secondary/50 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-background-secondary"
              >
                <span>{isArabic ? 'عرض كل الإشعارات' : 'Voir toutes les notifications'}</span>
                <ChevronLeft size={15} className="ltr:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
