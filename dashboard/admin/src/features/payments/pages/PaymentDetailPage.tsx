import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  FileX,
  User,
  CreditCard,
  MessageSquare,
  ImageIcon,
  CheckCircle2,
  ZoomIn,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { ActionModal, MODAL_TEXTAREA } from '@/components/data/ActionModal'
import {
  applyPaymentDecision,
  getPaymentAdminNote,
  getPaymentDecidedAt,
} from '@/lib/adminPaymentStore'
import { fetchPaymentContext } from '@/lib/mock/api'
import { clientHref, findClientByName } from '@/lib/financingLookup'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Smartphone,
  Building2,
  Wallet,
  Banknote as BanknoteIcon,
  FileText,
  Briefcase,
} from 'lucide-react'
import { PaymentProofPreview } from '@/components/payments/PaymentProofPreview'
import type { PaymentMethod } from '@/lib/mock/data'

const METHOD_ICON: Record<PaymentMethod, typeof BanknoteIcon> = {
  ccp: Wallet,
  baridi_mob: Smartphone,
  bank_transfer: Building2,
  cash_to_agent: BanknoteIcon,
  check: FileText,
  company_payment: Briefcase,
}

const METHOD_LABEL_AR: Partial<Record<PaymentMethod, string>> = {
  check: 'شيك',
  company_payment: 'دفع من شركة',
}

const METHOD_TONE: Record<PaymentMethod, { wrap: string; icon: string }> = {
  ccp: { wrap: 'bg-primary-surface text-primary', icon: 'text-primary' },
  baridi_mob: { wrap: 'bg-primary-surface text-primary', icon: 'text-primary' },
  bank_transfer: { wrap: 'bg-primary-surface text-primary', icon: 'text-primary' },
  cash_to_agent: { wrap: 'bg-primary-surface text-primary', icon: 'text-primary' },
  check: { wrap: 'bg-info/10 text-info', icon: 'text-info' },
  company_payment: { wrap: 'bg-warning/10 text-warning', icon: 'text-warning' },
}

function MethodBadge({ method }: { method: PaymentMethod }) {
  const { t } = useTranslation()
  const Icon = METHOD_ICON[method]
  const tone = METHOD_TONE[method]
  const label = METHOD_LABEL_AR[method] ?? t(`method.${method}`)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium',
        tone.wrap,
      )}
    >
      <Icon size={18} className={tone.icon} />
      {label}
    </span>
  )
}

export default function PaymentDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()
  const queryClient = useQueryClient()
  const [modal, setModal] = useState<'verify' | 'reject' | null>(null)
  const [note, setNote] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['payment-context', reference],
    queryFn: () => fetchPaymentContext(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <Card>
        <EmptyState icon={FileX} title={t('common.notFound')} />
      </Card>
    )
  }

  const { payment: p, financing: f } = data
  const client = findClientByName(p.clientName)
  const cHref = clientHref(p.clientName)
  const canVerify = p.status === 'pending_verification'
  const savedNote = getPaymentAdminNote(p.reference)
  const decidedAt = getPaymentDecidedAt(p.reference)

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ['payment-context', reference] })
    void queryClient.invalidateQueries({ queryKey: ['payments'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  function submit(decision: 'verify' | 'reject') {
    if (!reference) return
    applyPaymentDecision(reference, decision === 'verify' ? 'verified' : 'rejected', note)
    toast.success(
      decision === 'verify' ? t('payments.verifyModal.success') : t('payments.rejectModal.success'),
    )
    setModal(null)
    setNote('')
    invalidate()
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/payments"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('payments.title')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-warning/10 via-background to-background px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-foreground-tertiary">{t('payments.detail.payment')}</p>
              <h1 className="mt-1 text-xl font-medium tabular-nums">{p.reference}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={p.status} />
                <MethodBadge method={p.method} />
              </div>
            </div>
            <p className="text-3xl font-semibold tabular-nums text-foreground">
              {formatDzd(p.amountDzd, locale)}
            </p>
          </div>
          {canVerify ? (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => { setModal('verify'); setNote('') }}>
                <CheckCircle2 size={16} className="me-1.5" />
                {t('payments.verify')}
              </Button>
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => { setModal('reject'); setNote('') }}>
                {t('common.reject')}
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      {savedNote ? (
        <Card className="mb-4 border-primary/20 bg-primary-surface/30 p-4">
          <div className="flex items-start gap-3">
            <MessageSquare size={18} className="text-primary" />
            <div>
              <p className="text-xs text-foreground-tertiary">
                {t('requests.adminNote.title')}
                {decidedAt ? ` · ${formatDate(decidedAt.slice(0, 10), locale)}` : ''}
              </p>
              <p className="mt-1 text-sm">{savedNote}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden p-0 lg:col-span-2">
          <div className="border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ImageIcon size={16} className="text-primary" />
              {t('payments.detail.proof')}
            </h2>
          </div>
          <div className="relative bg-gradient-to-b from-[#f0ebf5] to-background-secondary/30">
            <div className="absolute start-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#5c2d91] shadow-sm backdrop-blur-sm">
              <ZoomIn size={12} />
              {t('payments.detail.baridiMobCapture')}
            </div>
            <PaymentProofPreview payment={p} locale={locale} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <User size={16} className="text-info" />
              {t('payments.columns.client')}
            </h2>
            <div className="flex items-center gap-3">
              <Avatar name={p.clientName} size={44} />
              <div>
                {cHref ? (
                  <Link to={cHref} className="font-semibold hover:text-primary hover:underline">
                    {p.clientName}
                  </Link>
                ) : (
                  <p className="font-semibold">{p.clientName}</p>
                )}
                {client ? (
                  <div className="mt-1 flex gap-2">
                    <TierBadge tier={client.tier} />
                    <span className="text-xs text-foreground-tertiary">
                      {t('requests.profile.creditScore')}: {client.creditScore}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CreditCard size={16} className="text-primary" />
              {t('payments.columns.financing')}
            </h2>
            <Link
              to={`/financings/${p.financingRef}`}
              className="font-medium tabular-nums text-primary hover:underline"
            >
              {p.financingRef}
            </Link>
            {f ? (
              <div className="mt-3 space-y-2 text-sm text-foreground-secondary">
                <p>{f.productName}</p>
                <p>
                  {t('financings.columns.remaining')}:{' '}
                  <span className="font-medium text-foreground">
                    {formatDzd(f.remainingDzd, locale)}
                  </span>
                </p>
                <p>
                  {t('financings.detail.monthly')}:{' '}
                  <span className="font-medium tabular-nums text-foreground">
                    {formatDzd(f.monthlyInstallmentDzd, locale)}
                  </span>
                </p>
                {Math.abs(f.monthlyInstallmentDzd - p.amountDzd) > 100 ? (
                  <p className="rounded-lg bg-warning/10 px-2 py-1 text-xs text-warning">
                    {t('payments.detail.amountMismatch')}
                  </p>
                ) : (
                  <p className="rounded-lg bg-primary-surface px-2 py-1 text-xs text-primary">
                    {t('payments.detail.amountMatch')}
                  </p>
                )}
              </div>
            ) : null}
          </Card>

          <Card className="p-5 text-sm">
            <p className="text-foreground-tertiary">{t('requests.columns.date')}</p>
            <p className="mt-1 font-medium">{formatDate(p.submittedAt, locale)}</p>
          </Card>
        </div>
      </div>

      <ActionModal
        open={modal === 'verify'}
        title={t('payments.verifyModal.title')}
        subtitle={t('payments.verifyModal.subtitle')}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModal(null)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={() => submit('verify')}>{t('payments.verify')}</Button>
          </>
        }
      >
        <label className="block text-sm font-medium">
          {t('payments.verifyModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">({t('requests.adminNote.optional')})</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className={cn(MODAL_TEXTAREA, 'mt-2')}
          placeholder={t('payments.verifyModal.notePlaceholder')}
        />
      </ActionModal>

      <ActionModal
        open={modal === 'reject'}
        title={t('payments.rejectModal.title')}
        subtitle={t('payments.rejectModal.subtitle')}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModal(null)}>{t('common.cancel')}</Button>
            <Button size="sm" className="bg-danger text-white" onClick={() => submit('reject')}>
              {t('common.reject')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium">
          {t('payments.rejectModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">({t('requests.adminNote.optional')})</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className={cn(MODAL_TEXTAREA, 'mt-2')}
          placeholder={t('payments.rejectModal.notePlaceholder')}
        />
      </ActionModal>
    </div>
  )
}
