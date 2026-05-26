import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  FileX,
  Phone,
  MapPin,
  X,
  Store,
  Shield,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { applyAdminDecision, getAdminDecidedAt, getAdminNote } from '@/lib/adminRequestStore'
import { fetchRequestContext } from '@/lib/mock/api'
import type { Client, Merchant, VerificationItem } from '@/lib/mock/data'
import { formatDzd, formatDate, formatNumber, formatTenure, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm text-foreground transition placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function computeBreakdown(amount: number, months: number) {
  const marginPct = months >= 12 ? 15 : months >= 6 ? 8 : 5
  const commission = Math.round(amount * 0.05)
  const margin = Math.round((amount * marginPct) / 100)
  const total = amount + margin
  return {
    marginPct,
    commission,
    payout: amount - commission,
    margin,
    total,
    monthly: Math.round(total / months),
    profit: commission + margin,
  }
}

function BreakdownRow({ label, value, strong, accent }: {
  label: string
  value: string
  strong?: boolean
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className={accent ? 'text-sm text-primary' : 'text-sm text-foreground-secondary'}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums',
          strong ? 'text-base font-medium' : 'text-sm',
          accent ? 'text-primary' : 'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}

function ActionModal({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
        aria-label="close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {subtitle ? (
                <p className="mt-1 text-xs text-foreground-tertiary">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-foreground-tertiary transition hover:bg-background-secondary"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
      </div>
    </div>
  )
}

function ProfileStat({
  label,
  value,
  accent,
}: {
  label: string
  value: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        accent ? 'border-primary/20 bg-primary-surface/50' : 'border-border bg-background-secondary/40',
      )}
    >
      <p className="text-xs text-foreground-tertiary">{label}</p>
      <p className={cn('mt-0.5 text-sm font-semibold tabular-nums', accent && 'text-primary')}>
        {value}
      </p>
    </div>
  )
}

function ClientProfileCard({ client, locale }: { client: Client; locale: Locale }) {
  const { t } = useTranslation()
  const usedPct =
    client.creditLimitDzd > 0
      ? Math.round((client.usedCreditDzd / client.creditLimitDzd) * 100)
      : 0

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-info/10 to-transparent px-5 py-4">
        <div className="flex items-start gap-4">
          <Avatar name={client.name} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/clients/${client.id}`}
                className="text-base font-semibold text-foreground hover:text-primary"
              >
                {client.name}
              </Link>
              <TierBadge tier={client.tier} />
              <StatusBadge status={client.kycStatus} />
            </div>
            <a
              href={`tel:${client.phone}`}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-primary"
              dir="ltr"
            >
              <Phone size={14} />
              {client.phone}
            </a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        <ProfileStat
          label={t('requests.profile.creditScore')}
          value={formatNumber(client.creditScore, locale)}
          accent
        />
        <ProfileStat
          label={t('requests.profile.creditLimit')}
          value={formatDzd(client.creditLimitDzd, locale)}
        />
        <ProfileStat
          label={t('requests.profile.creditUsed')}
          value={`${usedPct}%`}
        />
        <ProfileStat
          label={t('requests.profile.activeFinancings')}
          value={String(client.activeFinancings)}
        />
      </div>
      <div className="border-t border-border px-5 py-3 text-sm">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-foreground-secondary">
          <span>{client.commune}</span>
          <span>{t(`employment.${client.employmentStatus}`)}</span>
          {client.employer ? <span>{client.employer}</span> : null}
          {client.monthlyIncomeDzd ? (
            <span>{formatDzd(client.monthlyIncomeDzd, locale)} / {t('requests.profile.month')}</span>
          ) : null}
        </div>
        <Link
          to={`/clients/${client.id}`}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {t('requests.profile.viewClient')}
          <ChevronRight size={14} className="ltr:rotate-180" />
        </Link>
      </div>
    </Card>
  )
}

function MerchantProfileCard({
  requestRef,
  merchantName,
  merchantSource,
  merchant,
  verification,
  locale,
}: {
  requestRef: string
  merchantName: string
  merchantSource: 'partner' | 'ad_hoc'
  merchant: Merchant | null
  verification: VerificationItem | null
  locale: Locale
}) {
  const { t } = useTranslation()
  const isAdHoc = merchantSource === 'ad_hoc'

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/60 to-transparent px-5 py-4">
        <div className="flex items-start gap-4">
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary-surface text-primary">
            <Store size={24} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {merchant ? (
                <Link
                  to={`/merchants/${merchant.id}`}
                  className="text-base font-semibold text-foreground hover:text-primary"
                >
                  {merchant.name}
                </Link>
              ) : isAdHoc ? (
                <Link
                  to={`/merchants/ad-hoc/${requestRef}`}
                  className="text-base font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {verification?.proposedMerchantName ?? merchantName}
                </Link>
              ) : (
                <p className="text-base font-semibold text-foreground">{merchantName}</p>
              )}
              <span className="rounded-md bg-background-secondary px-2 py-0.5 text-xs font-medium">
                {t(`source.${merchantSource}`)}
              </span>
              {merchant ? <StatusBadge status={merchant.status} /> : null}
            </div>
            {isAdHoc && verification ? (
              <p className="mt-1 text-xs text-foreground-tertiary">
                {t('requests.profile.adHocPending')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {merchant ? (
        <>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            <ProfileStat
              label={t('merchants.detail.stats.totalSales')}
              value={formatDzd(merchant.totalSalesDzd, locale)}
            />
            <ProfileStat
              label={t('merchants.detail.stats.financings')}
              value={String(merchant.totalFinancings)}
            />
            <ProfileStat
              label={t('requests.profile.tenure')}
              value={formatTenure(merchant.joinedAt, locale)}
            />
            <ProfileStat
              label={t('requests.profile.commission')}
              value={`${merchant.commissionRate}%`}
            />
          </div>
          <div className="border-t border-border px-5 py-3">
            <a
              href={`tel:${merchant.phone}`}
              className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-primary"
              dir="ltr"
            >
              <Phone size={14} />
              {merchant.phone}
            </a>
            <Link
              to={`/merchants/${merchant.id}`}
              className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {t('requests.profile.viewMerchant')}
              <ChevronRight size={14} className="ltr:rotate-180" />
            </Link>
          </div>
        </>
      ) : verification ? (
        <div className="space-y-3 p-5 text-sm">
          <div className="flex items-center gap-2 text-foreground-secondary">
            <Phone size={14} className="text-primary" />
            <a href={`tel:${verification.proposedMerchantPhone}`} dir="ltr" className="hover:text-primary">
              {verification.proposedMerchantPhone}
            </a>
          </div>
          <div className="flex items-start gap-2 text-foreground-secondary">
            <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>{verification.proposedMerchantAddress}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/merchants/ad-hoc/${requestRef}`}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t('requests.profile.viewMerchant')}
              <ChevronRight size={14} className="ltr:rotate-180" />
            </Link>
            <Link
              to="/merchant-verifications"
              className="inline-flex items-center gap-1 font-medium text-foreground-secondary hover:text-primary hover:underline"
            >
              {t('requests.profile.openVerification')}
              <ChevronRight size={14} className="ltr:rotate-180" />
            </Link>
          </div>
        </div>
      ) : (
        <p className="p-5 text-sm text-foreground-tertiary">{merchantName}</p>
      )}
    </Card>
  )
}

export default function RequestDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()
  const queryClient = useQueryClient()
  const [approveOpen, setApproveOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [approveNote, setApproveNote] = useState('')
  const [rejectNote, setRejectNote] = useState('')

  const { data: ctx, isLoading } = useQuery({
    queryKey: ['request-context', reference],
    queryFn: () => fetchRequestContext(reference ?? ''),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['request-context', reference] })
    void queryClient.invalidateQueries({ queryKey: ['request', reference] })
    void queryClient.invalidateQueries({ queryKey: ['requests'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  if (isLoading) return <Loader />
  if (!ctx) {
    return (
      <div className="animate-fade-up">
        <Card>
          <EmptyState icon={FileX} title={t('common.notFound')} />
        </Card>
      </div>
    )
  }

  const { request: data, client, merchant, verification } = ctx
  const b = computeBreakdown(data.amountDzd, data.planMonths)
  const fmt = (n: number) => formatDzd(n, locale)
  const canDecide = data.status === 'submitted' || data.status === 'under_review'
  const savedNote = getAdminNote(data.reference)
  const decidedAt = getAdminDecidedAt(data.reference)

  const handleApprove = () => {
    applyAdminDecision(data.reference, 'approved', approveNote)
    toast.success(t('requests.approveModal.success'))
    setApproveOpen(false)
    setApproveNote('')
    invalidate()
  }

  const handleReject = () => {
    applyAdminDecision(data.reference, 'rejected', rejectNote)
    toast.success(t('requests.rejectModal.success'))
    setRejectOpen(false)
    setRejectNote('')
    invalidate()
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/financing-requests"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-medium tabular-nums text-foreground">{data.reference}</h1>
        <StatusBadge status={data.status} />
        <div className="ms-auto flex flex-wrap gap-2">
          {canDecide ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setRejectOpen(true)}>
                {t('common.reject')}
              </Button>
              <Button size="sm" onClick={() => setApproveOpen(true)}>
                {t('common.approve')}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {savedNote ? (
        <Card className="mb-4 border-primary/20 bg-primary-surface/30 p-4">
          <div className="flex items-start gap-3">
            <MessageSquare size={18} className="mt-0.5 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-medium text-foreground-tertiary">
                {t('requests.adminNote.title')}
                {decidedAt ? ` · ${formatDate(decidedAt.slice(0, 10), locale)}` : ''}
              </p>
              <p className="mt-1 text-sm text-foreground">{savedNote}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <ClientProfileCard client={client} locale={locale} />
          <MerchantProfileCard
            requestRef={data.reference}
            merchantName={data.merchantName}
            merchantSource={data.merchantSource}
            merchant={merchant}
            verification={verification}
            locale={locale}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                {t('requests.sections.product')}
              </CardTitle>
            </CardHeader>
            <div className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
              <ProfileStat label={t('requests.columns.product')} value={data.productName} />
              <ProfileStat
                label={t('requests.columns.plan')}
                value={t('requests.months', { count: data.planMonths })}
              />
              <ProfileStat label={t('requests.columns.amount')} value={fmt(data.amountDzd)} accent />
            </div>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              {t('requests.breakdown.title')}
            </CardTitle>
          </CardHeader>
          <div className="px-5 py-3">
            <BreakdownRow label={t('requests.breakdown.principal')} value={fmt(data.amountDzd)} />
            <BreakdownRow label={t('requests.breakdown.merchantCommission')} value={`− ${fmt(b.commission)}`} />
            <div className="border-t border-border" />
            <BreakdownRow label={t('requests.breakdown.merchantPayout')} value={fmt(b.payout)} />
            <BreakdownRow label={t('requests.breakdown.clientMargin')} value={`+ ${fmt(b.margin)}`} />
            <div className="border-t border-border" />
            <BreakdownRow label={t('requests.breakdown.totalToCollect')} value={fmt(b.total)} strong />
            <BreakdownRow label={t('requests.breakdown.monthly')} value={fmt(b.monthly)} strong accent />
            <div className="my-1 border-t border-border" />
            <div className="rounded-md bg-primary-surface px-3 py-2.5">
              <BreakdownRow label={t('requests.breakdown.profit')} value={fmt(b.profit)} strong accent />
            </div>
          </div>
        </Card>
      </div>

      <ActionModal
        open={approveOpen}
        title={t('requests.approveModal.title')}
        subtitle={t('requests.approveModal.subtitle')}
        onClose={() => setApproveOpen(false)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setApproveOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleApprove}>
              {t('common.approve')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-foreground">
          {t('requests.approveModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">
            ({t('requests.adminNote.optional')})
          </span>
        </label>
        <textarea
          value={approveNote}
          onChange={(e) => setApproveNote(e.target.value)}
          rows={4}
          placeholder={t('requests.approveModal.notePlaceholder')}
          className={cn(INPUT, 'mt-2 resize-none')}
        />
      </ActionModal>

      <ActionModal
        open={rejectOpen}
        title={t('requests.rejectModal.title')}
        subtitle={t('requests.rejectModal.subtitle')}
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              className="bg-danger text-white hover:brightness-95"
              onClick={handleReject}
            >
              {t('common.reject')}
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium text-foreground">
          {t('requests.rejectModal.noteLabel')}
          <span className="ms-1 font-normal text-foreground-tertiary">
            ({t('requests.adminNote.optional')})
          </span>
        </label>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          rows={4}
          placeholder={t('requests.rejectModal.notePlaceholder')}
          className={cn(INPUT, 'mt-2 resize-none')}
        />
      </ActionModal>
    </div>
  )
}
