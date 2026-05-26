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
import type { Financing } from '@/lib/mock/data'
import {
  clientHref,
  computePortfolioStats,
  findClientByName,
  merchantHref,
} from '@/lib/financingLookup'
import { formatDzd, formatDate, daysBetween, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Link } from 'react-router'

const ANCHOR = '2026-05-20'
const STATUS_TABS = ['all', 'active', 'late', 'completed', 'defaulted'] as const
type StatusTab = (typeof STATUS_TABS)[number]

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

export default function FinancingsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [tab, setTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['financings'], queryFn: fetchFinancings })

  const stats = useMemo(() => computePortfolioStats(data ?? []), [data])

  const rows = useMemo(() => {
    let list = data ?? []
    if (tab !== 'all') list = list.filter((f) => f.status === tab)
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
  }, [data, tab, search])

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
              {client ? (
                <div className="mt-0.5">
                  <TierBadge tier={client.tier} />
                </div>
              ) : null}
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
    return {
      all: all.length,
      active: all.filter((f) => f.status === 'active').length,
      late: all.filter((f) => f.status === 'late').length,
      completed: all.filter((f) => f.status === 'completed').length,
      defaulted: all.filter((f) => f.status === 'defaulted').length,
    }
  }, [data])

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

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="relative max-w-sm flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('financings.search')}
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
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
