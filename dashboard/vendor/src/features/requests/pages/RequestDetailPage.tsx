import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  FileX,
  Phone,
  MessageCircle,
  User,
  Package,
  Clock,
  Wallet,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { confirmRequest, fetchRequest, isRealApi, rejectRequest } from '@/lib/api'
import { merchantProfile } from '@/lib/mock/data'
import { updateRequestStatus } from '@/lib/vendorStore'
import { apiErrorMessage } from '@/lib/apiClient'
import { formatDzd, type Locale } from '@/lib/format'

const INPUT =
  'w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={18} className="text-primary" />
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-xs text-foreground-tertiary">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-1">{children}</div>
      {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
    </section>
  )
}

function ActionModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="close"
        onClick={onClose}
      />
      <div
        role="dialog"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-foreground-tertiary transition hover:bg-background-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
      </div>
    </div>
  )
}

export default function RequestDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [confirmNote, setConfirmNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['request', reference],
    queryFn: () => fetchRequest(reference ?? ''),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['request', reference] })
    void queryClient.invalidateQueries({ queryKey: ['requests'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const handleConfirm = async () => {
    if (!reference) return
    const note = confirmNote.trim()
    try {
      if (isRealApi) {
        await confirmRequest(reference, note || undefined)
      } else {
        updateRequestStatus(reference, 'merchant_confirmed', note || t('requests.confirmedNote'))
      }
      toast.success(t('requests.confirmedToast'))
      setConfirmOpen(false)
      setConfirmNote('')
      invalidate()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const handleReject = async () => {
    if (!reference) return
    const reason = rejectReason.trim()
    if (!reason) {
      toast.error(t('requests.rejectReasonRequired'))
      return
    }
    try {
      if (isRealApi) {
        await rejectRequest(reference, reason)
      } else {
        updateRequestStatus(reference, 'merchant_rejected', reason)
      }
      toast.success(t('requests.rejectedToast'))
      setRejectOpen(false)
      setRejectReason('')
      invalidate()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileX} title={t('common.notFound')} />
        </section>
      </div>
    )
  }

  const commission = Math.round((data.amountDzd * merchantProfile.commissionRate) / 100)
  const payout = data.amountDzd - commission
  const waPhone = data.customerPhone.replace(/\D/g, '')
  const canAct = data.status === 'submitted'
  const waCtx = { name: data.customerName, ref: data.reference }
  const waPresets = [
    { key: 'confirmed' as const, labelKey: 'requests.whatsapp.confirmed', messageKey: 'requests.whatsapp.messages.confirmed' },
    { key: 'ready' as const, labelKey: 'requests.whatsapp.ready', messageKey: 'requests.whatsapp.messages.ready' },
    { key: 'needInfo' as const, labelKey: 'requests.whatsapp.needInfo', messageKey: 'requests.whatsapp.messages.needInfo' },
  ]

  const steps =
    data.status === 'merchant_rejected'
      ? [
          { label: t('requests.timelineSubmitted'), done: true },
          { label: t('requests.timelineRejected'), done: true },
        ]
      : [
          { label: t('requests.timelineSubmitted'), done: true },
          {
            label: t('requests.timelineConfirmed'),
            done: data.status === 'merchant_confirmed' || data.status === 'approved',
          },
          { label: t('requests.timelineApproved'), done: data.status === 'approved' },
        ]

  return (
    <div className="animate-fade-up">
      <Link
        to="/requests"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-foreground-tertiary">{t('requests.detailLabel')}</p>
          <h1 className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{data.reference}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          {canAct ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setRejectOpen(true)}>
                {t('requests.reject')}
              </Button>
              <Button size="sm" onClick={() => setConfirmOpen(true)}>
                {t('requests.confirm')}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            icon={User}
            title={t('requests.sections.customer')}
            footer={
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${data.customerPhone}`}>
                  <Button variant="secondary" size="sm">
                    <Phone size={15} />
                    {t('common.call')}
                  </Button>
                </a>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm">
                    <MessageCircle size={15} />
                    {t('common.whatsapp')}
                  </Button>
                </a>
              </div>
            }
          >
            <DetailRow label={t('requests.columns.customer')} value={data.customerName} />
            <DetailRow label={t('customers.fields.phone')} value={<span dir="ltr">{data.customerPhone}</span>} />
            <DetailRow label={t('requests.sections.branch')} value={data.branchName} />
          </SectionCard>

          <SectionCard icon={MessageCircle} title={t('requests.whatsapp.title')} subtitle={t('requests.whatsapp.subtitle')}>
            <div className="flex flex-wrap gap-2 py-3">
              {waPresets.map((preset) => (
                <a
                  key={preset.key}
                  href={whatsappLink(data.customerPhone, t(preset.messageKey, waCtx))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium text-[#128C7E] transition hover:border-[#25D366]/50 hover:bg-[#25D366]/15"
                >
                  <MessageCircle size={16} />
                  {t(preset.labelKey)}
                </a>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Package} title={t('requests.sections.product')}>
            <DetailRow label={t('requests.columns.product')} value={data.productName} />
            <DetailRow
              label={t('requests.columns.plan')}
              value={t('requests.months', { count: data.planMonths })}
            />
            <DetailRow label={t('requests.columns.amount')} value={formatDzd(data.amountDzd, locale)} />
          </SectionCard>

          {data.note ? (
            <section className="rounded-2xl border border-border bg-background-secondary/40 px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-foreground">{t('requests.merchantNote')}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">{data.note}</p>
            </section>
          ) : null}

          <SectionCard icon={Clock} title={t('requests.sections.timeline')}>
            <ol className="py-2">
              {steps.map((s, idx) => (
                <li key={s.label} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                      s.done
                        ? 'bg-primary text-primary-fg'
                        : 'bg-background-secondary text-foreground-tertiary',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span className={s.done ? 'text-sm text-foreground' : 'text-sm text-foreground-tertiary'}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <section className="h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet size={18} className="text-primary" />
              {t('requests.breakdown.title')}
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.finalPrice')}</span>
              <span className="tabular-nums text-foreground">{formatDzd(data.amountDzd, locale)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.commission')}</span>
              <span className="tabular-nums text-foreground">− {formatDzd(commission, locale)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="rounded-xl bg-gradient-to-br from-primary-surface to-primary-surface/40 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{t('requests.breakdown.payout')}</span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatDzd(payout, locale)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">
              {t('requests.breakdown.hint')}
            </p>
          </div>
        </section>
      </div>

      <ActionModal
        open={confirmOpen}
        title={t('requests.confirmModal.title')}
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              {t('requests.confirmModal.submit')}
            </Button>
          </>
        }
      >
        <label className="block text-xs font-medium text-foreground-secondary">
          {t('requests.confirmModal.notesLabel')}
        </label>
        <textarea
          value={confirmNote}
          onChange={(e) => setConfirmNote(e.target.value)}
          rows={3}
          className={cn(INPUT, 'mt-1.5 h-auto resize-none')}
          dir="rtl"
          placeholder={t('requests.confirmModal.notesPlaceholder')}
        />
      </ActionModal>

      <ActionModal
        open={rejectOpen}
        title={t('requests.rejectModal.title')}
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRejectOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReject}>
              {t('requests.rejectModal.submit')}
            </Button>
          </>
        }
      >
        <label className="block text-xs font-medium text-foreground-secondary">
          {t('requests.rejectModal.reasonLabel')} *
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className={cn(INPUT, 'mt-1.5 h-auto resize-none')}
          dir="rtl"
          placeholder={t('requests.rejectModal.reasonPlaceholder')}
        />
      </ActionModal>
    </div>
  )
}
