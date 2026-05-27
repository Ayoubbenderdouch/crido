import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  CircleDollarSign,
  BadgeCheck,
  ShieldCheck,
  Store,
  MessageCircle,
  Settings as SettingsIcon,
  Inbox,
  CheckCheck,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/data/EmptyState'
import {
  MOCK_NOTIFICATIONS,
  type Notification,
  type NotificationType,
} from '@/lib/mock/data'
import { formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const TODAY_ANCHOR = new Date('2026-05-27T10:00:00Z')

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

type ReadFilter = 'all' | 'unread'
type TypeFilter = 'all' | NotificationType

const TYPE_FILTERS: { id: TypeFilter; labelAr: string; labelFr: string }[] = [
  { id: 'all', labelAr: 'الكل', labelFr: 'Tout' },
  { id: 'financing_approved', labelAr: 'التمويلات', labelFr: 'Financements' },
  { id: 'payment_verified', labelAr: 'المدفوعات', labelFr: 'Paiements' },
  { id: 'kyc_pending', labelAr: 'التحقق', labelFr: 'KYC' },
  { id: 'merchant_request', labelAr: 'التجار', labelFr: 'Marchands' },
  { id: 'message_received', labelAr: 'الرسائل', labelFr: 'Messages' },
  { id: 'system', labelAr: 'النظام', labelFr: 'Système' },
]

type Group = { id: 'today' | 'yesterday' | 'last_week' | 'older'; titleAr: string; titleFr: string }
const GROUPS: Group[] = [
  { id: 'today', titleAr: 'اليوم', titleFr: "Aujourd'hui" },
  { id: 'yesterday', titleAr: 'الأمس', titleFr: 'Hier' },
  { id: 'last_week', titleAr: 'الأسبوع الماضي', titleFr: 'La semaine dernière' },
  { id: 'older', titleAr: 'أقدم', titleFr: 'Plus ancien' },
]

function dayDiff(iso: string, anchor: Date): number {
  const t = new Date(iso)
  const a = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()))
  const b = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()))
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

function groupOf(iso: string): Group['id'] {
  const d = dayDiff(iso, TODAY_ANCHOR)
  if (d <= 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d <= 7) return 'last_week'
  return 'older'
}

function timeOnly(iso: string, locale: Locale): string {
  const d = new Date(iso)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  if (locale === 'ar') return `${hh}:${mm}`
  return `${hh}h${mm}`
}

const PAGE_SIZE = 10

export default function NotificationsPage() {
  const { i18n } = useTranslation()
  const locale = (i18n.language as Locale) ?? 'ar'
  const isArabic = locale === 'ar'
  const navigate = useNavigate()

  const [items, setItems] = useState<Notification[]>(() =>
    [...MOCK_NOTIFICATIONS].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  )
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)

  const stats = useMemo(
    () => ({
      total: items.length,
      unread: items.filter((n) => n.unread).length,
    }),
    [items],
  )

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (readFilter === 'unread' && !n.unread) return false
      if (typeFilter !== 'all' && n.type !== typeFilter) return false
      return true
    })
  }, [items, readFilter, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  // Group page rows by date bucket
  const groupedPage = useMemo(() => {
    const map = new Map<Group['id'], Notification[]>()
    for (const n of pageRows) {
      const g = groupOf(n.created_at)
      const arr = map.get(g) ?? []
      arr.push(n)
      map.set(g, arr)
    }
    return GROUPS.filter((g) => (map.get(g.id)?.length ?? 0) > 0).map((g) => ({
      group: g,
      rows: map.get(g.id) ?? [],
    }))
  }, [pageRows])

  function markOne(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
  }

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  function openNotification(n: Notification) {
    if (n.unread) markOne(n.id)
    if (n.link) navigate(n.link)
  }

  function changeFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  return (
    <div className="animate-fade-up">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-medium text-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-surface text-primary">
              <Bell size={18} strokeWidth={1.75} />
            </span>
            {isArabic ? 'الإشعارات' : 'Notifications'}
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {isArabic
              ? `${stats.total} إشعار · ${stats.unread} غير مقروء`
              : `${stats.total} notifications · ${stats.unread} non lues`}
          </p>
        </div>

        {stats.unread > 0 && (
          <Button variant="secondary" size="sm" onClick={markAll}>
            <CheckCheck size={15} />
            {isArabic ? 'تحديد الكل كمقروء' : 'Tout marquer comme lu'}
          </Button>
        )}
      </div>

      {/* Filters bar */}
      <Card className="mb-4 p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Read filter */}
          <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/60 p-1">
            {(['all', 'unread'] as ReadFilter[]).map((id) => {
              const active = readFilter === id
              const count = id === 'all' ? stats.total : stats.unread
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => changeFilter(() => setReadFilter(id))}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    active
                      ? 'bg-primary text-primary-fg shadow-[0_4px_14px_-6px_rgba(15,110,86,0.55)]'
                      : 'text-foreground-secondary hover:bg-background hover:text-foreground',
                  )}
                >
                  {id === 'all'
                    ? isArabic
                      ? 'الكل'
                      : 'Tout'
                    : isArabic
                      ? 'غير مقروء'
                      : 'Non lu'}
                  <span className="ms-1.5 tabular-nums opacity-80">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-foreground-tertiary">
              <Filter size={12} strokeWidth={1.75} />
              {isArabic ? 'حسب النوع' : 'Type'}
            </span>
            <div className="inline-flex shrink-0 flex-wrap gap-1">
              {TYPE_FILTERS.map((f) => {
                const active = typeFilter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => changeFilter(() => setTypeFilter(f.id))}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                      active
                        ? 'border-primary bg-primary-surface text-primary'
                        : 'border-border bg-background text-foreground-secondary hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    {isArabic ? f.labelAr : f.labelFr}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title={isArabic ? 'لا توجد إشعارات' : 'Aucune notification'}
            hint={
              isArabic
                ? 'حاول تغيير المرشحات لرؤية المزيد من الإشعارات.'
                : 'Essayez de modifier les filtres pour voir davantage de notifications.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-5">
          {groupedPage.map(({ group, rows }) => (
            <section key={group.id}>
              <div className="mb-2 flex items-center gap-3 px-1">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground-tertiary">
                  {isArabic ? group.titleAr : group.titleFr}
                </h2>
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] tabular-nums text-foreground-tertiary">
                  {rows.length}
                </span>
              </div>

              <Card className="overflow-hidden p-0">
                {rows.map((n) => {
                  const Icon = TYPE_ICON[n.type]
                  const tone = TYPE_TONE[n.type]
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'group flex items-start gap-3 border-b border-border px-5 py-4 transition-colors last:border-0',
                        n.unread ? 'bg-primary-surface/25' : 'bg-card',
                        'hover:bg-background-secondary',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                          tone.bg,
                          tone.fg,
                        )}
                      >
                        <Icon size={18} strokeWidth={1.75} />
                      </span>

                      <button
                        type="button"
                        onClick={() => openNotification(n)}
                        className="min-w-0 flex-1 text-start"
                      >
                        <div className="flex items-baseline gap-2">
                          <p
                            className={cn(
                              'truncate text-sm leading-snug',
                              n.unread
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-foreground-secondary',
                            )}
                          >
                            {n.title}
                          </p>
                          {n.unread && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-snug text-foreground-secondary">
                          {n.body}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-foreground-tertiary">
                          <span className="tabular-nums">{formatDate(n.created_at, locale)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums" dir="ltr">
                            {timeOnly(n.created_at, locale)}
                          </span>
                        </div>
                      </button>

                      <div className="flex shrink-0 items-center gap-1">
                        {n.unread && (
                          <button
                            type="button"
                            onClick={() => markOne(n.id)}
                            title={isArabic ? 'تحديد كمقروء' : 'Marquer comme lu'}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground-secondary opacity-0 transition-all hover:border-primary/30 hover:text-primary group-hover:opacity-100 lg:opacity-100"
                          >
                            <Check size={12} />
                            <span className="hidden sm:inline">
                              {isArabic ? 'مقروء' : 'Lu'}
                            </span>
                          </button>
                        )}
                        {n.link && (
                          <button
                            type="button"
                            onClick={() => openNotification(n)}
                            title={isArabic ? 'فتح' : 'Ouvrir'}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-foreground-tertiary transition-colors hover:bg-background-secondary hover:text-primary"
                          >
                            <ChevronLeft size={15} className="ltr:rotate-180" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Card>
            </section>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-xs text-foreground-tertiary">
                {isArabic
                  ? `الصفحة ${safePage} من ${totalPages} · ${filtered.length} نتيجة`
                  : `Page ${safePage} sur ${totalPages} · ${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-background-secondary disabled:opacity-40"
                >
                  <ChevronRight size={14} className="ltr:rotate-180" />
                  {isArabic ? 'السابق' : 'Précédent'}
                </button>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground-secondary transition-colors hover:bg-background-secondary disabled:opacity-40"
                >
                  {isArabic ? 'التالي' : 'Suivant'}
                  <ChevronLeft size={14} className="ltr:rotate-180" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
