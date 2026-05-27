import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Inbox, Hourglass, Loader2, CheckCircle2, Sparkles, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchRequests } from '@/lib/api'
import { merchantProfile, type IncomingRequest, type RequestStatus } from '@/lib/mock/data'
import { formatDate, formatDzd, type Locale } from '@/lib/format'
import { RequestStepperCompact } from '../components/RequestStepper'

type TabKey =
  | 'confirmation_needed'
  | 'in_processing'
  | 'awaiting_approval'
  | 'approved'
  | 'completed'
  | 'rejected'

type TabDef = {
  key: TabKey
  /** Status keys captured by this tab. */
  match: RequestStatus[]
  icon: typeof Hourglass
  /** Urgency rank — smaller = higher priority. */
  urgency: number
  /** Visual tint for the active tab pill. */
  tint?: 'amber' | 'primary' | 'neutral'
}

// Tabs are sorted by urgency: confirmation_needed first (action required),
// then in_processing & awaiting_approval (Crido has the ball), then the
// historical tabs (approved, completed, rejected).
const TABS: TabDef[] = [
  { key: 'confirmation_needed', match: ['submitted'], icon: Hourglass, urgency: 0, tint: 'amber' },
  { key: 'in_processing', match: ['processing'], icon: Loader2, urgency: 1, tint: 'amber' },
  { key: 'awaiting_approval', match: ['merchant_confirmed'], icon: Hourglass, urgency: 2, tint: 'amber' },
  { key: 'approved', match: ['approved'], icon: CheckCircle2, urgency: 3, tint: 'primary' },
  { key: 'completed', match: ['completed'], icon: Sparkles, urgency: 4, tint: 'primary' },
  { key: 'rejected', match: ['merchant_rejected'], icon: X, urgency: 5, tint: 'neutral' },
]

// Translation strings inlined (the task said not to edit i18n JSON).
function tabLabel(key: TabKey, lang: string): string {
  if (lang === 'fr') {
    return {
      confirmation_needed: 'Confirmation requise',
      in_processing: 'En traitement',
      awaiting_approval: "En attente d'approbation",
      approved: 'Approuvées',
      completed: 'Clôturées',
      rejected: 'Rejetées',
    }[key]
  }
  return {
    confirmation_needed: 'بحاجة تأكيد',
    in_processing: 'قيد المعالجة',
    awaiting_approval: 'بانتظار الموافقة',
    approved: 'موافق عليها',
    completed: 'مكتملة',
    rejected: 'مرفوضة',
  }[key]
}

function urgencyOf(status: RequestStatus): number {
  switch (status) {
    case 'submitted':
      return 0
    case 'merchant_confirmed':
      return 1
    case 'processing':
      return 2
    case 'approved':
      return 3
    case 'completed':
      return 4
    case 'merchant_rejected':
      return 5
    default:
      return 99
  }
}

function payoutOf(amount: number): number {
  return amount - Math.round((amount * merchantProfile.commissionRate) / 100)
}

export default function RequestsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const ar = locale === 'ar'
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('confirmation_needed')

  const { data, isLoading } = useQuery({ queryKey: ['requests'], queryFn: fetchRequests })
  const all = useMemo<IncomingRequest[]>(() => data ?? [], [data])

  const active = TABS.find((tb) => tb.key === tab) ?? TABS[0]
  const rows = useMemo(
    () =>
      all
        .filter((r) => active.match.includes(r.status))
        .sort((a, b) => urgencyOf(a.status) - urgencyOf(b.status) || (b.submittedAt ?? '').localeCompare(a.submittedAt ?? '')),
    [all, active],
  )
  const countOf = (tb: TabDef) => all.filter((r) => tb.match.includes(r.status)).length
  const pendingCount = countOf(TABS[0])

  const columns: Column<IncomingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.reference}</span>,
    },
    {
      key: 'customer',
      header: t('requests.columns.customer'),
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.customerName} size={38} />
          <div>
            <p className="text-foreground">{r.customerName}</p>
            <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{r.customerPhone}</p>
          </div>
        </div>
      ),
    },
    { key: 'product', header: t('requests.columns.product'), cell: (r) => r.productName },
    {
      key: 'plan',
      header: t('requests.columns.plan'),
      cell: (r) => t('requests.months', { count: r.planMonths }),
    },
    {
      key: 'amount',
      header: t('requests.columns.amount'),
      align: 'end',
      cell: (r) => <span className="tabular-nums">{formatDzd(r.amountDzd, locale)}</span>,
    },
    {
      key: 'payout',
      header: t('requests.columns.payout'),
      align: 'end',
      cell: (r) => (
        <span className="tabular-nums font-medium text-primary">
          {formatDzd(payoutOf(r.amountDzd), locale)}
        </span>
      ),
    },
    {
      key: 'progress',
      header: ar ? 'التقدّم' : 'Progression',
      align: 'center',
      cell: (r) => (
        <div className="flex items-center justify-center">
          <RequestStepperCompact status={r.status} />
        </div>
      ),
    },
    {
      key: 'status',
      header: t('requests.columns.status'),
      align: 'end',
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'date',
      header: t('requests.columns.date'),
      align: 'end',
      cell: (r) => (
        <span className="text-foreground-tertiary">
          {formatDate((r.submittedAt ?? r.createdAt).slice(0, 10), locale)}
        </span>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
          <Inbox size={14} />
          {t('requests.badge')}
        </div>
        <PageHeader title={t('requests.title')} subtitle={t('requests.subtitle')} />
      </div>

      {pendingCount > 0 ? (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-surface/90 to-transparent px-5 py-4 shadow-sm">
          <p className="text-sm font-medium text-primary">{t('requests.pendingBanner', { count: pendingCount })}</p>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm">
        {TABS.map((tb) => {
          const count = countOf(tb)
          const TabIcon = tb.icon
          const isActive = tab === tb.key
          const isProcessing = tb.key === 'in_processing'
          return (
            <button
              key={tb.key}
              type="button"
              onClick={() => setTab(tb.key)}
              className={cn(
                'group flex flex-1 items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs transition-all sm:flex-none sm:text-sm',
                isActive
                  ? tb.tint === 'amber'
                    ? 'bg-amber-500/10 font-semibold text-amber-900 shadow-sm ring-1 ring-amber-300/60'
                    : tb.tint === 'neutral'
                      ? 'bg-background-secondary font-semibold text-foreground shadow-sm'
                      : 'bg-primary font-semibold text-primary-fg shadow-sm'
                  : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground',
              )}
            >
              <TabIcon
                size={14}
                className={cn(
                  isProcessing && isActive && 'animate-spin',
                  tb.key === 'confirmation_needed' && isActive && 'animate-pulse-soft',
                )}
              />
              {tabLabel(tb.key, locale)}
              {count > 0 ? (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums',
                    isActive
                      ? tb.tint === 'amber'
                        ? 'bg-amber-500/20 text-amber-900'
                        : tb.tint === 'neutral'
                          ? 'bg-foreground/10 text-foreground'
                          : 'bg-primary-fg/20 text-primary-fg'
                      : 'bg-background-secondary text-foreground-tertiary',
                  )}
                >
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t('requests.emptyTab')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.reference}
            onRowClick={(r) => navigate(`/requests/${r.reference}`)}
          />
        )}
      </section>
    </div>
  )
}
