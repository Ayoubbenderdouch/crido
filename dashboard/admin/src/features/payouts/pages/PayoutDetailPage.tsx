import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  FileX,
  Store,
  User,
  CreditCard,
  MessageSquare,
  PlayCircle,
  CheckCircle2,
  MapPin,
  Phone,
  ImageIcon,
  ZoomIn,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { ActionModal, MODAL_TEXTAREA } from '@/components/data/ActionModal'
import { PayoutMethodCard } from '@/components/payouts/PayoutMethodCard'
import { PayoutWorkflowSteps } from '@/components/payouts/PayoutWorkflowSteps'
import { PayoutProofDisplay } from '@/components/payouts/PayoutProofDisplay'
import { PayoutProofUpload, type PayoutProofFile } from '@/components/payouts/PayoutProofUpload'
import { PayoutVendorBanner } from '@/components/payouts/PayoutVendorBanner'
import {
  applyPayoutStatus,
  getPayoutAdminNote,
  getPayoutProof,
  getPayoutTransferRef,
} from '@/lib/adminPayoutStore'
import { fetchPayoutContext } from '@/lib/mock/api'
import { clientHref, findClientByName, merchantHref } from '@/lib/financingLookup'
import { computePayoutBreakdown, getPayoutBankDetails } from '@/lib/payoutBankDetails'
import { formatDzd, formatDate, formatTenure, type Locale } from '@/lib/format'

export default function PayoutDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<'processing' | 'paid' | null>(null)
  const [note, setNote] = useState('')
  const [transferRef, setTransferRef] = useState('')
  const [proofDraft, setProofDraft] = useState<PayoutProofFile | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['payout-context', reference],
    queryFn: () => fetchPayoutContext(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <Card>
        <EmptyState icon={FileX} title={t('common.notFound')} />
      </Card>
    )
  }

  const { payout: p, financing: f, merchant: m } = data
  const client = findClientByName(p.customerName)
  const mHref = merchantHref(p.merchantName)
  const savedNote = getPayoutAdminNote(p.reference)
  const savedTransferRef = getPayoutTransferRef(p.reference)
  const savedProof = getPayoutProof(p.reference)
  const bankDetails = getPayoutBankDetails(m, p.method)
  const breakdown = computePayoutBreakdown(p.amountDzd, m?.commissionRate ?? 5)
  const amountFmt = formatDzd(p.amountDzd, locale)

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['payout-context', reference] })
    void queryClient.invalidateQueries({ queryKey: ['merchant-payouts'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  function submit() {
    if (!reference || !modal) return
    if (modal === 'paid' && !proofDraft) {
      toast.error(t('payouts.upload.required'))
      return
    }
    const status = modal === 'processing' ? 'processing' : 'paid'
    applyPayoutStatus(reference, status, {
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
    setNote('')
    setTransferRef('')
    setProofDraft(null)
    invalidate()
  }

  function openPaidModal() {
    setModal('paid')
    setNote('')
    setTransferRef('')
    setProofDraft(null)
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/payouts"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('payouts.title')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-primary/8 via-background to-background px-6 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <Avatar name={p.merchantName} size={56} className="hidden shrink-0 sm:flex" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-tertiary">{t('payouts.detail.payout')}</p>
                <h1 className="mt-1 text-xl font-medium tabular-nums">{p.reference}</h1>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">{p.merchantName}</span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {t('payouts.detail.vendorLabel')}
                  </span>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-foreground-tertiary">
                    {formatDate(p.createdAt, locale)}
                    {p.paidAt ? ` · ${t('payouts.detail.paidOn', { date: formatDate(p.paidAt, locale) })}` : ''}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-foreground">{amountFmt}</p>
          </div>

          <div className="mt-6 rounded-xl border border-border/80 bg-background/60 p-4 backdrop-blur-sm">
            <PayoutWorkflowSteps status={p.status} />
          </div>

          {p.status !== 'paid' ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {p.status === 'pending' ? (
                <Button size="sm" onClick={() => { setModal('processing'); setNote(''); setTransferRef('') }}>
                  <PlayCircle size={16} className="me-1.5" />
                  {t('payouts.startProcessing')}
                </Button>
              ) : null}
              {p.status === 'processing' || p.status === 'pending' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="border-primary/30 bg-primary text-primary-fg hover:bg-primary/90"
                  onClick={openPaidModal}
                >
                  <CheckCircle2 size={16} className="me-1.5" />
                  {t('payouts.markPaid')}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {(savedNote || savedTransferRef) ? (
        <Card className="mb-4 border-primary/20 bg-primary-surface/30 p-4">
          <div className="flex items-start gap-3">
            <MessageSquare size={18} className="text-primary" />
            <div className="space-y-1">
              {savedTransferRef ? (
                <p className="text-sm font-mono tabular-nums" dir="ltr">
                  {t('payouts.detail.transferRef')}: {savedTransferRef}
                </p>
              ) : null}
              {savedNote ? <p className="text-sm">{savedNote}</p> : null}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <PayoutMethodCard method={p.method} amountLabel={amountFmt} details={bankDetails} />

          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon size={16} className="text-primary" />
                {t('payouts.detail.proof')}
              </h2>
              <p className="mt-0.5 text-xs text-foreground-tertiary">{t('payouts.detail.proofHint')}</p>
            </div>
            <div className="relative bg-gradient-to-b from-[#e8f1fa] to-background-secondary/30">
              <div className="absolute start-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#0c447c] shadow-sm backdrop-blur-sm">
                <ZoomIn size={12} />
                {savedProof ? t('payouts.upload.uploadedLabel') : t('payouts.detail.proofBadge')}
              </div>
              <PayoutProofDisplay
                payout={p}
                bankDetails={bankDetails}
                locale={locale}
                transferRef={savedTransferRef}
                uploaded={savedProof}
              />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <CreditCard size={16} className="text-primary" />
              {t('payouts.detail.breakdown')}
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-foreground-tertiary">{t('payouts.detail.grossSale')}</dt>
                <dd className="font-medium tabular-nums">{formatDzd(breakdown.grossSaleDzd, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-2">
                <dt className="text-foreground-tertiary">
                  {t('payouts.detail.commission', { rate: m?.commissionRate ?? 5 })}
                </dt>
                <dd className="font-medium tabular-nums text-warning">
                  −{formatDzd(breakdown.commissionDzd, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-1">
                <dt className="font-semibold text-foreground">{t('payouts.detail.netPayout')}</dt>
                <dd className="text-lg font-bold tabular-nums text-primary">
                  {formatDzd(breakdown.payoutDzd, locale)}
                </dd>
              </div>
            </dl>
            {f ? (
              <p className="mt-3 text-xs text-foreground-tertiary">
                {f.productName} ·{' '}
                <Link to={`/financings/${f.reference}`} className="text-primary hover:underline">
                  {f.reference}
                </Link>
              </p>
            ) : null}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Store size={16} className="text-primary" />
              {t('payouts.columns.merchant')}
            </h2>
            {m ? (
              <div className="flex items-start gap-3">
                <Avatar name={m.name} size={48} />
                <div className="min-w-0 flex-1">
                  {mHref ? (
                    <Link to={mHref} className="font-semibold hover:text-primary hover:underline">
                      {m.name}
                    </Link>
                  ) : (
                    <p className="font-semibold">{m.name}</p>
                  )}
                  <p className="mt-0.5 text-xs text-foreground-tertiary">
                    {m.category} · {formatTenure(m.joinedAt, locale)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground-secondary">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {m.commune}
                    </span>
                    <span className="inline-flex items-center gap-1" dir="ltr">
                      <Phone size={12} />
                      {m.phone}
                    </span>
                  </div>
                  {m.pendingPayoutDzd > 0 ? (
                    <p className="mt-2 rounded-lg bg-warning/10 px-2 py-1 text-xs font-medium text-warning">
                      {t('merchants.detail.stats.pendingPayout')}: {formatDzd(m.pendingPayoutDzd, locale)}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="font-semibold">{p.merchantName}</p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User size={16} className="text-info" />
              {t('payouts.columns.customer')}
            </h2>
            <div className="flex items-center gap-3">
              <Avatar name={p.customerName} size={40} />
              <div>
                {clientHref(p.customerName) ? (
                  <Link
                    to={clientHref(p.customerName)!}
                    className="font-semibold hover:text-primary hover:underline"
                  >
                    {p.customerName}
                  </Link>
                ) : (
                  <p className="font-semibold">{p.customerName}</p>
                )}
                {client ? (
                  <div className="mt-1 flex gap-2">
                    <TierBadge tier={client.tier} />
                    <span className="text-xs text-foreground-tertiary">
                      {client.creditScore}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          {f ? (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold">{t('payouts.detail.financing')}</h2>
              <Link
                to={`/financings/${f.reference}`}
                className="font-medium text-primary hover:underline"
              >
                {f.reference}
              </Link>
              <p className="mt-1 text-sm text-foreground-secondary">{f.productName}</p>
              <StatusBadge status={f.status} />
            </Card>
          ) : null}
        </div>
      </div>

      <ActionModal
        open={modal === 'processing'}
        title={t('payouts.processModal.title')}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={submit}>{t('payouts.startProcessing')}</Button>
          </>
        }
      >
        <PayoutVendorBanner merchantName={p.merchantName} amountLabel={amountFmt} reference={p.reference} />
        <p className="mb-3 text-sm text-foreground-secondary">{t('payouts.processModal.body')}</p>
        <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
          {t('payouts.modal.noteOptional')}
        </label>
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
            <Button onClick={submit}>{t('payouts.markPaid')}</Button>
          </>
        }
      >
        <PayoutVendorBanner merchantName={p.merchantName} amountLabel={amountFmt} />
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
        <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
          {t('payouts.modal.noteOptional')}
        </label>
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
