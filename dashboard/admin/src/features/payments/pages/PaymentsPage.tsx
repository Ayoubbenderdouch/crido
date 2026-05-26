import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  Smartphone,
  Building2,
  Wallet,
  BanknoteIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/data/KpiCard'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { ActionModal, MODAL_TEXTAREA } from '@/components/data/ActionModal'
import { applyPaymentDecision } from '@/lib/adminPaymentStore'
import { fetchPayments } from '@/lib/mock/api'
import type { Payment, PaymentMethod } from '@/lib/mock/data'
import { clientHref, findClientByName } from '@/lib/financingLookup'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const TABS = ['all', 'pending_verification', 'verified', 'rejected'] as const
type Tab = (typeof TABS)[number]

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  ccp: Wallet,
  baridi_mob: Smartphone,
  bank_transfer: Building2,
  cash_to_agent: BanknoteIcon,
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const { t } = useTranslation()
  const Icon = METHOD_ICON[method]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-2 py-1 text-xs font-medium text-foreground-secondary">
      <Icon size={14} className="text-primary" strokeWidth={1.75} />
      {t(`method.${method}`)}
    </span>
  )
}

export default function PaymentsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('pending_verification')
  const [search, setSearch] = useState('')
  const [activeRef, setActiveRef] = useState<string | null>(null)
  const [modal, setModal] = useState<'verify' | 'reject' | null>(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['payments'], queryFn: fetchPayments })

  const stats = useMemo(() => {
    const all = data ?? []
    const pending = all.filter((p) => p.status === 'pending_verification')
    return {
      pending: pending.length,
      pendingDzd: pending.reduce((s, p) => s + p.amountDzd, 0),
      verified: all.filter((p) => p.status === 'verified').length,
      rejected: all.filter((p) => p.status === 'rejected').length,
    }
  }, [data])

  const rows = useMemo(() => {
    let list = data ?? []
    if (tab !== 'all') list = list.filter((p) => p.status === tab)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q) ||
          p.financingRef.toLowerCase().includes(q) ||
          p.externalRef.toLowerCase().includes(q),
      )
    }
    return [...list].sort((a, b) => {
      if (a.status === 'pending_verification' && b.status !== 'pending_verification') return -1
      if (b.status === 'pending_verification' && a.status !== 'pending_verification') return 1
      return b.submittedAt.localeCompare(a.submittedAt)
    })
  }, [data, tab, search])

  const tabCounts = useMemo(() => {
    const all = data ?? []
    return {
      all: all.length,
      pending_verification: all.filter((p) => p.status === 'pending_verification').length,
      verified: all.filter((p) => p.status === 'verified').length,
      rejected: all.filter((p) => p.status === 'rejected').length,
    }
  }, [data])

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['payments'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  function openModal(ref: string, type: 'verify' | 'reject') {
    setActiveRef(ref)
    setModal(type)
    setNote('')
  }

  function submitDecision() {
    if (!activeRef || !modal) return
    applyPaymentDecision(activeRef, modal === 'verify' ? 'verified' : 'rejected', note)
    toast.success(modal === 'verify' ? t('payments.verifyModal.success') : t('payments.rejectModal.success'))
    setModal(null)
    setActiveRef(null)
    setNote('')
    invalidate()
  }

  const columns: Column<Payment>[] = [
    {
      key: 'reference',
      header: t('payments.columns.reference'),
      cell: (p) => (
        <div>
          <p className="font-medium tabular-nums text-foreground">{p.reference}</p>
          <p className="mt-0.5 text-xs text-foreground-tertiary">
            {formatDate(p.submittedAt, locale)}
          </p>
        </div>
      ),
    },
    {
      key: 'client',
      header: t('payments.columns.client'),
      cell: (p) => {
        const client = findClientByName(p.clientName)
        const href = clientHref(p.clientName)
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={p.clientName} size={32} />
            <div className="min-w-0">
              {href ? (
                <Link
                  to={href}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate font-medium hover:text-primary hover:underline"
                >
                  {p.clientName}
                </Link>
              ) : (
                <span className="block truncate font-medium">{p.clientName}</span>
              )}
              {client ? <TierBadge tier={client.tier} /> : null}
            </div>
          </div>
        )
      },
    },
    {
      key: 'financing',
      header: t('payments.columns.financing'),
      cell: (p) => (
        <Link
          to={`/financings/${p.financingRef}`}
          onClick={(e) => e.stopPropagation()}
          className="tabular-nums text-sm font-medium text-primary hover:underline"
        >
          {p.financingRef}
        </Link>
      ),
    },
    {
      key: 'amount',
      header: t('payments.columns.amount'),
      align: 'end',
      cell: (p) => (
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatDzd(p.amountDzd, locale)}
        </span>
      ),
    },
    {
      key: 'method',
      header: t('payments.columns.method'),
      cell: (p) => <MethodBadge method={p.method} />,
    },
    {
      key: 'externalRef',
      header: t('payments.columns.externalRef'),
      cell: (p) => (
        <span className="tabular-nums text-xs text-foreground-tertiary" dir="ltr">
          {p.externalRef}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('payments.columns.status'),
      align: 'end',
      cell: (p) =>
        p.status === 'pending_verification' ? (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 border-primary/30 text-primary hover:bg-primary-surface"
              onClick={() => openModal(p.reference, 'verify')}
            >
              {t('payments.verify')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-danger hover:bg-danger/10"
              onClick={() => openModal(p.reference, 'reject')}
            >
              {t('common.reject')}
            </Button>
          </div>
        ) : (
          <StatusBadge status={p.status} />
        ),
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

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t('payments.title')}</h1>
        <p className="mt-1 text-sm text-foreground-secondary">{t('payments.subtitle')}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('payments.stats.pending')}
          value={String(stats.pending)}
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label={t('payments.stats.pendingAmount')}
          value={formatDzd(stats.pendingDzd, locale)}
          icon={Banknote}
        />
        <KpiCard
          label={t('payments.stats.verified')}
          value={String(stats.verified)}
          icon={CheckCircle2}
          sparkColor="#1D9E75"
        />
        <KpiCard
          label={t('payments.stats.rejected')}
          value={String(stats.rejected)}
          icon={XCircle}
          sparkColor="#E24B4A"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
          {TABS.map((tb) => (
            <button
              key={tb}
              type="button"
              onClick={() => setTab(tb)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                tab === tb
                  ? 'bg-primary text-primary-fg shadow-sm'
                  : 'text-foreground-secondary hover:bg-background',
                tb === 'pending_verification' && tab !== tb && stats.pending > 0 && 'text-warning',
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
            placeholder={t('payments.search')}
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Banknote} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(p) => p.reference}
            onRowClick={(p) => navigate(`/payments/${p.reference}`)}
          />
        )}
      </Card>

      <ActionModal
        open={modal === 'verify'}
        title={t('payments.verifyModal.title')}
        subtitle={t('payments.verifyModal.subtitle')}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={submitDecision}>
              {t('payments.verify')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-foreground">
          {t('payments.verifyModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">
            ({t('requests.adminNote.optional')})
          </span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={t('payments.verifyModal.notePlaceholder')}
          className={cn(MODAL_TEXTAREA, 'mt-2')}
        />
      </ActionModal>

      <ActionModal
        open={modal === 'reject'}
        title={t('payments.rejectModal.title')}
        subtitle={t('payments.rejectModal.subtitle')}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              className="bg-danger text-white hover:brightness-95"
              onClick={submitDecision}
            >
              {t('common.reject')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-foreground">
          {t('payments.rejectModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">
            ({t('requests.adminNote.optional')})
          </span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={t('payments.rejectModal.notePlaceholder')}
          className={cn(MODAL_TEXTAREA, 'mt-2')}
        />
      </ActionModal>
    </div>
  )
}
