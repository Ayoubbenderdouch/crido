import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Send,
  Clock,
  Loader2,
  CheckCircle2,
  Search,
  ChevronLeft,
  Building2,
  Smartphone,
  Banknote,
  PlayCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/data/KpiCard'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { ActionModal, MODAL_TEXTAREA } from '@/components/data/ActionModal'
import { applyPayoutStatus } from '@/lib/adminPayoutStore'
import { PayoutVendorBanner } from '@/components/payouts/PayoutVendorBanner'
import { PayoutProofUpload, type PayoutProofFile } from '@/components/payouts/PayoutProofUpload'
import { fetchMerchantPayouts } from '@/lib/mock/api'
import type { MerchantPayout, PayoutMethod } from '@/lib/mock/data'
import { merchantHref } from '@/lib/financingLookup'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const TABS = ['all', 'pending', 'processing', 'paid'] as const
type Tab = (typeof TABS)[number]

const METHOD_ICON: Record<PayoutMethod, typeof Building2> = {
  ccp_transfer: Building2,
  baridi_mob: Smartphone,
  cash_delivery: Banknote,
}

function MethodBadge({ method }: { method: PayoutMethod }) {
  const { t } = useTranslation()
  const Icon = METHOD_ICON[method]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-background-secondary px-2 py-1 text-xs font-medium text-foreground-secondary">
      <Icon size={14} className="text-primary" strokeWidth={1.75} />
      {t(`method.${method}`)}
    </span>
  )
}

export default function PayoutsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('pending')
  const [search, setSearch] = useState('')
  const [activeRef, setActiveRef] = useState<string | null>(null)
  const [modal, setModal] = useState<'processing' | 'paid' | null>(null)
  const [note, setNote] = useState('')
  const [transferRef, setTransferRef] = useState('')
  const [proofDraft, setProofDraft] = useState<PayoutProofFile | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['merchant-payouts'],
    queryFn: fetchMerchantPayouts,
  })

  const activePayout = useMemo(
    () => (data ?? []).find((p) => p.reference === activeRef),
    [data, activeRef],
  )

  const stats = useMemo(() => {
    const all = data ?? []
    const pending = all.filter((p) => p.status === 'pending')
    const processing = all.filter((p) => p.status === 'processing')
    return {
      pending: pending.length,
      pendingDzd: pending.reduce((s, p) => s + p.amountDzd, 0),
      processing: processing.length,
      processingDzd: processing.reduce((s, p) => s + p.amountDzd, 0),
      paid: all.filter((p) => p.status === 'paid').length,
    }
  }, [data])

  const tabCounts = useMemo(() => {
    const all = data ?? []
    return {
      all: all.length,
      pending: all.filter((p) => p.status === 'pending').length,
      processing: all.filter((p) => p.status === 'processing').length,
      paid: all.filter((p) => p.status === 'paid').length,
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
          p.merchantName.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.financingRef.toLowerCase().includes(q),
      )
    }
    const order: Record<string, number> = { pending: 0, processing: 1, paid: 2 }
    return [...list].sort((a, b) => {
      const d = order[a.status] - order[b.status]
      if (d !== 0) return d
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [data, tab, search])

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['merchant-payouts'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  function openModal(ref: string, type: 'processing' | 'paid') {
    setActiveRef(ref)
    setModal(type)
    setNote('')
    setTransferRef('')
    setProofDraft(null)
  }

  function submitModal() {
    if (!activeRef || !modal) return
    if (modal === 'paid' && !proofDraft) {
      toast.error(t('payouts.upload.required'))
      return
    }
    applyPayoutStatus(activeRef, modal === 'processing' ? 'processing' : 'paid', {
      note,
      transferRef: modal === 'paid' ? transferRef : undefined,
      proof: modal === 'paid' ? proofDraft : undefined,
    })
    toast.success(
      modal === 'processing'
        ? t('payouts.processModal.success')
        : t('payouts.paidModal.success'),
    )
    setModal(null)
    setActiveRef(null)
    setNote('')
    setTransferRef('')
    setProofDraft(null)
    invalidate()
  }

  const columns: Column<MerchantPayout>[] = [
    {
      key: 'reference',
      header: t('payouts.columns.reference'),
      cell: (p) => (
        <div>
          <p className="font-medium tabular-nums text-foreground">{p.reference}</p>
          <p className="mt-0.5 text-xs text-foreground-tertiary">{formatDate(p.createdAt, locale)}</p>
        </div>
      ),
    },
    {
      key: 'merchant',
      header: t('payouts.columns.merchant'),
      cell: (p) => {
        const href = merchantHref(p.merchantName)
        return (
          <div className="flex items-center gap-2.5">
            <Avatar name={p.merchantName} size={32} />
            <div className="min-w-0">
              {href ? (
                <Link
                  to={href}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate font-medium hover:text-primary hover:underline"
                >
                  {p.merchantName}
                </Link>
              ) : (
                <span className="block truncate font-medium">{p.merchantName}</span>
              )}
              <p className="truncate text-xs text-foreground-tertiary">{p.customerName}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'financing',
      header: t('payouts.columns.financing'),
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
      header: t('payouts.columns.amount'),
      align: 'end',
      cell: (p) => (
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatDzd(p.amountDzd, locale)}
        </span>
      ),
    },
    {
      key: 'method',
      header: t('payouts.columns.method'),
      cell: (p) => <MethodBadge method={p.method} />,
    },
    {
      key: 'status',
      header: t('payouts.columns.status'),
      align: 'end',
      cell: (p) =>
        p.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 border-primary/30 text-primary hover:bg-primary-surface"
              onClick={() => openModal(p.reference, 'processing')}
            >
              <PlayCircle size={14} className="me-1" />
              {t('payouts.startProcessing')}
            </Button>
          </div>
        ) : p.status === 'processing' ? (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button size="sm" onClick={() => openModal(p.reference, 'paid')}>
              {t('payouts.markPaid')}
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
        <h1 className="text-2xl font-medium text-foreground">{t('payouts.title')}</h1>
        <p className="mt-1 text-sm text-foreground-secondary">{t('payouts.subtitle')}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('payouts.stats.pending')}
          value={String(stats.pending)}
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label={t('payouts.stats.pendingAmount')}
          value={formatDzd(stats.pendingDzd, locale)}
          icon={Send}
        />
        <KpiCard
          label={t('payouts.stats.processing')}
          value={String(stats.processing)}
          icon={Loader2}
          accent="default"
        />
        <KpiCard
          label={t('payouts.stats.paid')}
          value={String(stats.paid)}
          icon={CheckCircle2}
          sparkColor="#1D9E75"
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
                tb === 'pending' && tab !== tb && stats.pending > 0 && 'text-warning',
              )}
            >
              {t(`payouts.tabs.${tb}`)}
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
            placeholder={t('payouts.search')}
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Send} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(p) => p.reference}
            onRowClick={(p) => navigate(`/payouts/${p.reference}`)}
          />
        )}
      </Card>

      <ActionModal
        open={modal === 'processing'}
        title={t('payouts.processModal.title')}
        subtitle={activeRef ?? ''}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitModal}>{t('payouts.startProcessing')}</Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-foreground-secondary">{t('payouts.processModal.body')}</p>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={MODAL_TEXTAREA}
          placeholder={t('payouts.processModal.notePlaceholder')}
        />
      </ActionModal>

      <ActionModal
        open={modal === 'paid'}
        title={t('payouts.paidModal.title')}
        size="lg"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submitModal}>{t('payouts.markPaid')}</Button>
          </>
        }
      >
        {activePayout ? (
          <PayoutVendorBanner
            merchantName={activePayout.merchantName}
            amountLabel={formatDzd(activePayout.amountDzd, locale)}
          />
        ) : null}
        <p className="mb-3 text-sm text-foreground-secondary">{t('payouts.paidModal.body')}</p>
        <label className="mb-2 block text-xs font-semibold text-foreground">
          {t('payouts.upload.label')} <span className="text-danger">*</span>
        </label>
        <PayoutProofUpload value={proofDraft} onChange={setProofDraft} compact />
        <label className="mb-1 mt-4 block text-xs font-medium text-foreground-tertiary">
          {t('payouts.paidModal.transferRef')}
        </label>
        <input
          value={transferRef}
          onChange={(e) => setTransferRef(e.target.value)}
          placeholder={t('payouts.paidModal.transferRefPlaceholder')}
          className="mb-3 h-10 w-full rounded-xl border border-border px-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          dir="ltr"
        />
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={MODAL_TEXTAREA}
          placeholder={t('payouts.paidModal.notePlaceholder')}
        />
      </ActionModal>
    </div>
  )
}
