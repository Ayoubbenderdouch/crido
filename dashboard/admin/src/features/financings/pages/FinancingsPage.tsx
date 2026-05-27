import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Search,
  ChevronLeft,
  Clock,
  MapPin,
  ChevronDown,
  CalendarDays,
  Phone,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchFinancings } from '@/lib/mock/api'
import {
  MOCK_THIS_MONTH_VIEW,
  WILAYAS,
  getClientWilayaByName,
  type Financing,
  type MonthlyView,
  type WilayaRef,
} from '@/lib/mock/data'
import {
  clientHref,
  computePortfolioStats,
  findClientByName,
  merchantHref,
} from '@/lib/financingLookup'
import { formatDzd, formatDate, daysBetween, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

const ANCHOR = '2026-05-27'
const STATUS_TABS = ['all', 'active', 'late', 'completed', 'defaulted'] as const
type StatusTab = (typeof STATUS_TABS)[number]

type MainTab = 'all_financings' | 'this_month'

const MONTHLY_STATUS_TABS = ['all', 'pending', 'paid', 'late', 'missed'] as const
type MonthlyStatusTab = (typeof MONTHLY_STATUS_TABS)[number]

/**
 * Inline ar/fr copy for the new tabs/filters/KPIs. We don't add keys to
 * `i18n/ar.json` and `i18n/fr.json` per the task constraint — instead we
 * keep the bilingual strings localized at the call site.
 */
const COPY = {
  mainTabsAll: { ar: 'كل التمويلات', fr: 'Tous les financements' },
  mainTabsMonth: { ar: 'مدفوعات هذا الشهر', fr: 'Paiements de ce mois' },
  wilayaPlaceholder: { ar: 'الولاية', fr: 'Wilaya' },
  wilayaAll: { ar: 'كل الولايات', fr: 'Toutes les wilayas' },
  monthlyExpected: { ar: 'المتوقّع هذا الشهر', fr: 'Attendu ce mois' },
  monthlyCollected: { ar: 'المحصّل هذا الشهر', fr: 'Encaissé ce mois' },
  monthlyOutstanding: { ar: 'متبقّي هذا الشهر', fr: 'Restant ce mois' },
  monthlyTotalDue: {
    ar: 'إجمالي مستحق هذا الشهر: {amount} · {count} قسط',
    fr: 'Total dû ce mois : {amount} · {count} échéances',
  },
  monthlySearch: {
    ar: 'بحث بالعميل، الهاتف، التمويل…',
    fr: 'Rechercher client, téléphone, financement…',
  },
  monthlyStatusPending: { ar: 'قيد الاستحقاق', fr: 'À venir' },
  monthlyStatusMissed: { ar: 'فائت', fr: 'Manqué' },
  colWilaya: { ar: 'الولاية', fr: 'Wilaya' },
  colFinancing: { ar: 'التمويل', fr: 'Financement' },
  colInstallment: { ar: 'القسط', fr: 'Échéance' },
  colAmount: { ar: 'المبلغ', fr: 'Montant' },
  colDueDate: { ar: 'تاريخ الاستحقاق', fr: 'Échéance' },
  searchPlaceholder: { ar: 'بحث...', fr: 'Rechercher...' },
  noWilayaResults: { ar: 'لا توجد نتائج', fr: 'Aucun résultat' },
  wilayaActiveTag: { ar: 'متاحة', fr: 'Active' },
} as const

type CopyKey = keyof typeof COPY
function copy(locale: Locale, key: CopyKey): string {
  return COPY[key][locale === 'ar' ? 'ar' : 'fr']
}

function progressColor(status: Financing['status']): string {
  if (status === 'late') return '#EF9F27'
  if (status === 'defaulted') return '#E24B4A'
  if (status === 'completed') return '#1D9E75'
  return '#0F6E56'
}

function InstallmentProgress({ f }: { f: Financing }) {
  const pct = Math.round((f.paidInstallments / f.durationMonths) * 100)
  return (
    <div className="min-w-[120px]">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="font-medium tabular-nums text-foreground">
          {f.paidInstallments}/{f.durationMonths}
        </span>
        <span className="text-foreground-tertiary">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-background-secondary">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: progressColor(f.status) }}
        />
      </div>
    </div>
  )
}

/** Searchable wilaya dropdown — keyboard-friendly, RTL-aware. */
function WilayaSelect({
  value,
  onChange,
  locale,
  placeholder,
  allLabel,
}: {
  value: string
  onChange: (code: string) => void
  locale: Locale
  placeholder: string
  allLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected: WilayaRef | undefined =
    value === 'all' ? undefined : WILAYAS.find((w) => w.code === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return WILAYAS
    return WILAYAS.filter(
      (w) =>
        w.nameAr.toLowerCase().includes(q) ||
        w.nameFr.toLowerCase().includes(q) ||
        w.code.includes(q),
    )
  }, [query])

  const displayName = (w: WilayaRef) => (locale === 'ar' ? w.nameAr : w.nameFr)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 min-w-[200px] items-center justify-between gap-2 rounded-xl border border-border bg-background ps-3 pe-2 text-sm transition-colors',
          'hover:border-foreground/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15',
          open && 'border-primary ring-2 ring-primary/15',
        )}
      >
        <span className="flex items-center gap-2">
          <MapPin size={14} className="text-foreground-tertiary" />
          <span className={cn('truncate', !selected && 'text-foreground-secondary')}>
            {selected ? displayName(selected) : placeholder}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={cn(
            'shrink-0 text-foreground-tertiary transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open ? (
        <div>
          <button
            type="button"
            aria-hidden={true}
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute z-40 mt-1 w-[280px] overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <div className="border-b border-border/60 p-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute start-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                />
                <input
                  autoFocus={true}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={copy(locale, 'searchPlaceholder')}
                  className="h-8 w-full rounded-md border border-border bg-background-secondary/40 ps-8 pe-2 text-xs focus:border-primary focus:bg-background focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => {
                  onChange('all')
                  setOpen(false)
                  setQuery('')
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition-colors',
                  value === 'all'
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'hover:bg-background-secondary',
                )}
              >
                <span>{allLabel}</span>
                <span className="text-xs text-foreground-tertiary">
                  {WILAYAS.length}
                </span>
              </button>
              <div className="my-1 h-px bg-border/60" />
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-foreground-tertiary">
                  {copy(locale, 'noWilayaResults')}
                </div>
              ) : null}
              {filtered.map((w) => {
                const isSelected = value === w.code
                return (
                  <button
                    key={w.code}
                    type="button"
                    onClick={() => {
                      onChange(w.code)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition-colors',
                      isSelected
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'hover:bg-background-secondary',
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="inline-flex h-5 min-w-[26px] items-center justify-center rounded bg-background-secondary px-1 font-mono text-[10px] text-foreground-secondary tabular-nums">
                        {w.code}
                      </span>
                      <span>{displayName(w)}</span>
                    </span>
                    {w.serviceAvailable ? (
                      <span className="rounded-sm bg-[#E1F5EE] px-1.5 py-0.5 text-[10px] font-medium text-[#085041]">
                        {copy(locale, 'wilayaActiveTag')}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/** Top-level tab pill (teal-underline on active). */
function MainTabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: typeof CreditCard
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 pb-3 pt-2 text-sm font-medium transition-colors',
        active
          ? 'text-foreground'
          : 'text-foreground-secondary hover:text-foreground',
      )}
    >
      <Icon size={16} className={cn(active ? 'text-primary' : 'text-foreground-tertiary')} />
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
            active ? 'bg-primary/12 text-primary' : 'bg-background-secondary text-foreground-tertiary',
          )}
        >
          {count}
        </span>
      ) : null}
      <span
        className={cn(
          'absolute inset-x-3 -bottom-px h-0.5 rounded-full transition-all',
          active ? 'bg-primary' : 'bg-transparent',
        )}
      />
    </button>
  )
}

export default function FinancingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState<MainTab>('all_financings')
  const [tab, setTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')
  const [wilayaCode, setWilayaCode] = useState<string>('all')
  const [monthlyStatus, setMonthlyStatus] = useState<MonthlyStatusTab>('all')

  const { data, isLoading } = useQuery({ queryKey: ['financings'], queryFn: fetchFinancings })

  const stats = useMemo(() => computePortfolioStats(data ?? []), [data])

  const rows = useMemo(() => {
    let list = data ?? []
    if (tab !== 'all') list = list.filter((f) => f.status === tab)
    if (wilayaCode !== 'all') {
      list = list.filter((f) => getClientWilayaByName(f.clientName).code === wilayaCode)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (f) =>
          f.reference.toLowerCase().includes(q) ||
          f.clientName.toLowerCase().includes(q) ||
          f.merchantName.toLowerCase().includes(q) ||
          f.productName.toLowerCase().includes(q),
      )
    }
    const order: Record<Financing['status'], number> = {
      late: 0,
      defaulted: 1,
      active: 2,
      completed: 3,
      cancelled: 4,
    }
    return [...list].sort((a, b) => order[a.status] - order[b.status])
  }, [data, tab, search, wilayaCode])

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => (
        <div>
          <p className="font-medium tabular-nums text-foreground">{f.reference}</p>
          <p className="mt-0.5 text-xs text-foreground-tertiary">{f.productName}</p>
        </div>
      ),
    },
    {
      key: 'client',
      header: t('financings.columns.client'),
      cell: (f) => {
        const client = findClientByName(f.clientName)
        const href = clientHref(f.clientName)
        const wilaya = getClientWilayaByName(f.clientName)
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={f.clientName} size={32} />
            <div className="min-w-0">
              {href ? (
                <Link
                  to={href}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                >
                  {f.clientName}
                </Link>
              ) : (
                <span className="block truncate font-medium">{f.clientName}</span>
              )}
              <div className="mt-0.5 flex items-center gap-1.5">
                {client ? <TierBadge tier={client.tier} /> : null}
                <span className="inline-flex items-center gap-1 text-[11px] text-foreground-tertiary">
                  <MapPin size={10} />
                  {locale === 'ar' ? wilaya.nameAr : wilaya.nameFr}
                </span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'merchant',
      header: t('financings.columns.merchant'),
      cell: (f) => {
        const href = merchantHref(f.merchantName)
        return href ? (
          <Link
            to={href}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-foreground-secondary hover:text-primary hover:underline"
          >
            {f.merchantName}
          </Link>
        ) : (
          <span className="text-foreground-secondary">{f.merchantName}</span>
        )
      },
    },
    {
      key: 'progress',
      header: t('financings.columns.progress'),
      cell: (f) => <InstallmentProgress f={f} />,
    },
    {
      key: 'remaining',
      header: t('financings.columns.remaining'),
      align: 'end',
      cell: (f) => (
        <div className="text-end">
          <p className="tabular-nums font-medium text-foreground">{formatDzd(f.remainingDzd, locale)}</p>
          <p className="mt-0.5 text-xs text-foreground-tertiary">
            {t('financings.list.ofTotal', { amount: formatDzd(f.totalToCollectDzd, locale) })}
          </p>
        </div>
      ),
    },
    {
      key: 'nextDue',
      header: t('financings.columns.nextDue'),
      align: 'end',
      cell: (f) => {
        const days = daysBetween(ANCHOR, f.nextDueDate)
        const isLate = f.status === 'late' || (f.status === 'active' && days < 0)
        return (
          <div className="text-end">
            <p className={cn('text-sm', isLate ? 'font-medium text-warning' : 'text-foreground')}>
              {formatDate(f.nextDueDate, locale)}
            </p>
            {f.status !== 'completed' && days !== 0 ? (
              <p className={cn('mt-0.5 flex items-center justify-end gap-1 text-xs', isLate && 'text-warning')}>
                <Clock size={12} />
                {isLate
                  ? t('financings.detail.daysLate', { days: Math.abs(days) })
                  : t('financings.list.inDays', { days })}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
    {
      key: 'view',
      header: '',
      align: 'end',
      cell: () => (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          {t('common.view')}
          <ChevronLeft size={14} className="ltr:rotate-180" />
        </span>
      ),
    },
  ]

  const tabCounts = useMemo(() => {
    const all = data ?? []
    const scope = wilayaCode === 'all'
      ? all
      : all.filter((f) => getClientWilayaByName(f.clientName).code === wilayaCode)
    return {
      all: scope.length,
      active: scope.filter((f) => f.status === 'active').length,
      late: scope.filter((f) => f.status === 'late').length,
      completed: scope.filter((f) => f.status === 'completed').length,
      defaulted: scope.filter((f) => f.status === 'defaulted').length,
    }
  }, [data, wilayaCode])

  // ── Monthly view derivations ────────────────────────────────
  const monthlyRows = useMemo(() => {
    let list: MonthlyView[] = MOCK_THIS_MONTH_VIEW
    if (wilayaCode !== 'all') {
      list = list.filter((r) => r.client_wilaya_code === wilayaCode)
    }
    if (monthlyStatus !== 'all') {
      list = list.filter((r) => r.status === monthlyStatus)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.client_name.toLowerCase().includes(q) ||
          r.client_phone.toLowerCase().includes(q) ||
          r.financing_ref.toLowerCase().includes(q),
      )
    }
    // Sort: late/missed first, then by due_date asc
    const statusOrder: Record<MonthlyView['status'], number> = {
      missed: 0,
      late: 1,
      pending: 2,
      paid: 3,
    }
    return [...list].sort((a, b) => {
      const so = statusOrder[a.status] - statusOrder[b.status]
      if (so !== 0) return so
      return a.due_date.localeCompare(b.due_date)
    })
  }, [wilayaCode, monthlyStatus, search])

  const monthlyTotals = useMemo(() => {
    // Always compute against the wilaya-scoped list (not status-filtered) so
    // the KPI strip stays stable when the user toggles status pills.
    const scoped =
      wilayaCode === 'all'
        ? MOCK_THIS_MONTH_VIEW
        : MOCK_THIS_MONTH_VIEW.filter((r) => r.client_wilaya_code === wilayaCode)
    const expected = scoped.reduce((s, r) => s + r.amount_dzd, 0)
    const collected = scoped
      .filter((r) => r.status === 'paid')
      .reduce((s, r) => s + r.amount_dzd, 0)
    const outstanding = scoped
      .filter((r) => r.status !== 'paid')
      .reduce((s, r) => s + r.amount_dzd, 0)
    return { expected, collected, outstanding, count: scoped.length }
  }, [wilayaCode])

  const monthlyTabCounts = useMemo(() => {
    const scoped =
      wilayaCode === 'all'
        ? MOCK_THIS_MONTH_VIEW
        : MOCK_THIS_MONTH_VIEW.filter((r) => r.client_wilaya_code === wilayaCode)
    return {
      all: scoped.length,
      pending: scoped.filter((r) => r.status === 'pending').length,
      paid: scoped.filter((r) => r.status === 'paid').length,
      late: scoped.filter((r) => r.status === 'late').length,
      missed: scoped.filter((r) => r.status === 'missed').length,
    }
  }, [wilayaCode])

  const monthlyColumns: Column<MonthlyView>[] = [
    {
      key: 'client',
      header: t('financings.columns.client'),
      cell: (r) => {
        const href = clientHref(r.client_name)
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={r.client_name} size={32} />
            <div className="min-w-0">
              {href ? (
                <Link
                  to={href}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate font-medium text-foreground hover:text-primary hover:underline"
                >
                  {r.client_name}
                </Link>
              ) : (
                <span className="block truncate font-medium">{r.client_name}</span>
              )}
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground-tertiary">
                <Phone size={10} />
                <span className="tabular-nums" dir="ltr">
                  {r.client_phone}
                </span>
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'wilaya',
      header: copy(locale, 'colWilaya'),
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary">
          <MapPin size={12} className="text-foreground-tertiary" />
          {locale === 'ar' ? r.client_wilaya_ar : r.client_wilaya_fr}
        </span>
      ),
    },
    {
      key: 'financing',
      header: copy(locale, 'colFinancing'),
      cell: (r) => (
        <Link
          to={`/financings/${r.financing_ref}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium tabular-nums text-foreground hover:text-primary hover:underline"
        >
          {r.financing_ref}
        </Link>
      ),
    },
    {
      key: 'installment',
      header: copy(locale, 'colInstallment'),
      cell: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-background-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-foreground-secondary">
          {r.installment_number}/{r.total_installments}
        </span>
      ),
    },
    {
      key: 'amount',
      header: copy(locale, 'colAmount'),
      align: 'end',
      cell: (r) => (
        <span className="font-medium tabular-nums text-foreground">
          {formatDzd(r.amount_dzd, locale)}
        </span>
      ),
    },
    {
      key: 'dueDate',
      header: copy(locale, 'colDueDate'),
      align: 'end',
      cell: (r) => {
        const days = daysBetween(ANCHOR, r.due_date)
        const isOverdue = (r.status === 'late' || r.status === 'missed') && days < 0
        return (
          <div className="text-end">
            <p className={cn('text-sm', isOverdue ? 'font-medium text-warning' : 'text-foreground')}>
              {formatDate(r.due_date, locale)}
            </p>
            {r.status !== 'paid' && days !== 0 ? (
              <p
                className={cn(
                  'mt-0.5 flex items-center justify-end gap-1 text-xs',
                  isOverdue ? 'text-warning' : 'text-foreground-tertiary',
                )}
              >
                <Clock size={12} />
                {days < 0
                  ? t('financings.detail.daysLate', { days: Math.abs(days) })
                  : t('financings.list.inDays', { days })}
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ]

  const wilayaSelectPlaceholder = copy(locale, 'wilayaPlaceholder')
  const wilayaSelectAllLabel = copy(locale, 'wilayaAll')

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t('financings.title')}</h1>
        <p className="mt-1 text-sm text-foreground-secondary">{t('financings.subtitle')}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('financings.stats.active')}
          value={String(stats.active)}
          icon={CreditCard}
          sparkColor="#0F6E56"
        />
        <KpiCard
          label={t('financings.stats.late')}
          value={String(stats.late)}
          icon={AlertTriangle}
          accent="warning"
          sparkColor="#EF9F27"
        />
        <KpiCard
          label={t('financings.stats.outstanding')}
          value={formatDzd(stats.outstandingDzd, locale)}
          icon={TrendingUp}
        />
        <KpiCard
          label={t('financings.stats.collected')}
          value={formatDzd(stats.collectedDzd, locale)}
          icon={CheckCircle2}
          sparkColor="#1D9E75"
        />
      </div>

      {/* ── Main tab bar ────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-1 border-b border-border">
        <MainTabButton
          active={mainTab === 'all_financings'}
          onClick={() => setMainTab('all_financings')}
          icon={CreditCard}
          label={copy(locale, 'mainTabsAll')}
        />
        <MainTabButton
          active={mainTab === 'this_month'}
          onClick={() => setMainTab('this_month')}
          icon={CalendarDays}
          label={copy(locale, 'mainTabsMonth')}
          count={monthlyTabCounts.all}
        />
      </div>

      {mainTab === 'this_month' ? (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard
              label={copy(locale, 'monthlyExpected')}
              value={formatDzd(monthlyTotals.expected, locale)}
              icon={CalendarDays}
              sparkColor="#0F6E56"
            />
            <KpiCard
              label={copy(locale, 'monthlyCollected')}
              value={formatDzd(monthlyTotals.collected, locale)}
              icon={CheckCircle2}
              sparkColor="#1D9E75"
            />
            <KpiCard
              label={copy(locale, 'monthlyOutstanding')}
              value={formatDzd(monthlyTotals.outstanding, locale)}
              icon={AlertTriangle}
              accent="warning"
              sparkColor="#EF9F27"
            />
          </div>

          <div className="mb-3 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {copy(locale, 'monthlyTotalDue')
                .replace('{amount}', formatDzd(monthlyTotals.expected, locale))
                .replace('{count}', String(monthlyTotals.count))}
            </p>
          </div>
        </>
      ) : null}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {mainTab === 'all_financings' ? (
            <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
              {STATUS_TABS.map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setTab(tb)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    tab === tb
                      ? 'bg-primary text-primary-fg shadow-sm'
                      : 'text-foreground-secondary hover:bg-background hover:text-foreground',
                  )}
                >
                  {tb === 'all' ? t('common.all') : t(`status.${tb}`)}
                  <span className="ms-1.5 tabular-nums opacity-80">({tabCounts[tb]})</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
              {MONTHLY_STATUS_TABS.map((tb) => (
                <button
                  key={tb}
                  type="button"
                  onClick={() => setMonthlyStatus(tb)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    monthlyStatus === tb
                      ? 'bg-primary text-primary-fg shadow-sm'
                      : 'text-foreground-secondary hover:bg-background hover:text-foreground',
                  )}
                >
                  {tb === 'all'
                    ? t('common.all')
                    : tb === 'missed'
                      ? copy(locale, 'monthlyStatusMissed')
                      : tb === 'pending'
                        ? copy(locale, 'monthlyStatusPending')
                        : t(`status.${tb}`)}
                  <span className="ms-1.5 tabular-nums opacity-80">({monthlyTabCounts[tb]})</span>
                </button>
              ))}
            </div>
          )}

          <WilayaSelect
            value={wilayaCode}
            onChange={setWilayaCode}
            locale={locale}
            placeholder={wilayaSelectPlaceholder}
            allLabel={wilayaSelectAllLabel}
          />
        </div>

        <div className="relative max-w-sm flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              mainTab === 'this_month'
                ? copy(locale, 'monthlySearch')
                : t('financings.search')
            }
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {mainTab === 'this_month' ? (
          monthlyRows.length === 0 ? (
            <EmptyState icon={CalendarDays} title={t('common.noResults')} />
          ) : (
            <DataTable
              columns={monthlyColumns}
              rows={monthlyRows}
              rowKey={(r) => `${r.financing_ref}-${r.installment_number}`}
              onRowClick={(r) => navigate(`/financings/${r.financing_ref}`)}
            />
          )
        ) : isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(f) => f.reference}
            onRowClick={(f) => navigate(`/financings/${f.reference}`)}
          />
        )}
      </Card>
    </div>
  )
}
