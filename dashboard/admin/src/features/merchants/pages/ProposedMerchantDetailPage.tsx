import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Store, Phone, MapPin, FileText, User } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchProposedMerchant } from '@/lib/mock/api'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

function ProfileStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background-secondary/40 px-3 py-2.5">
      <p className="text-xs text-foreground-tertiary">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function ProposedMerchantDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { requestRef } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['proposed-merchant', requestRef],
    queryFn: () => fetchProposedMerchant(requestRef ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <Card>
          <EmptyState icon={Store} title={t('common.notFound')} />
        </Card>
      </div>
    )
  }

  const { verification, request, requestCount, totalVolumeDzd } = data
  const waDigits = verification.proposedMerchantPhone.replace(/\D/g, '')

  return (
    <div className="animate-fade-up">
      <Link
        to={`/financing-requests/${verification.requestRef}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('merchants.proposed.backToRequest')}
      </Link>

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="bg-gradient-to-br from-amber-500/10 via-background to-background px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary-surface text-primary">
              <Store size={28} strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-medium text-foreground">
                  {verification.proposedMerchantName}
                </h1>
                <span className="rounded-md bg-background-secondary px-2 py-0.5 text-xs font-medium">
                  {t('source.ad_hoc')}
                </span>
                <StatusBadge status="pending" />
              </div>
              <p className="mt-2 text-sm text-foreground-secondary">
                {t('merchants.proposed.subtitle')}
              </p>
              <p className="mt-1 text-xs text-foreground-tertiary">
                {t('merchants.proposed.linkedRequest')}:{' '}
                <span className="font-medium tabular-nums text-foreground">
                  {verification.requestRef}
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileStat
          label={t('merchants.proposed.stats.requests')}
          value={String(requestCount)}
        />
        <ProfileStat
          label={t('merchants.proposed.stats.volume')}
          value={formatDzd(totalVolumeDzd, locale)}
        />
        <ProfileStat
          label={t('merchants.proposed.stats.currentAmount')}
          value={formatDzd(verification.amountDzd, locale)}
        />
        <ProfileStat
          label={t('merchants.proposed.stats.submitted')}
          value={formatDate(verification.submittedAt, locale)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <CardHeader className="mb-3 px-0 pt-0">
            <CardTitle>{t('merchants.proposed.contact')}</CardTitle>
          </CardHeader>
          <div className="space-y-4 text-sm">
            <a
              href={`tel:${verification.proposedMerchantPhone}`}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition hover:border-primary/30 hover:bg-primary-surface/30"
              dir="ltr"
            >
              <Phone size={18} className="shrink-0 text-primary" />
              <span className="font-medium text-foreground">{verification.proposedMerchantPhone}</span>
            </a>
            <div className="flex items-start gap-3 rounded-xl border border-border px-4 py-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
              <span className="text-foreground-secondary">{verification.proposedMerchantAddress}</span>
            </div>
            <a
              href={`https://wa.me/${waDigits}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {t('merchants.proposed.whatsapp')}
            </a>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader className="mb-3 px-0 pt-0">
            <CardTitle>{t('merchants.proposed.requestContext')}</CardTitle>
          </CardHeader>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border py-2.5">
              <span className="text-foreground-tertiary">{t('requests.columns.client')}</span>
              <span className="font-medium">{verification.clientName}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border py-2.5">
              <span className="text-foreground-tertiary">{t('requests.columns.product')}</span>
              <span className="font-medium">{request?.productName ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border py-2.5">
              <span className="text-foreground-tertiary">{t('requests.columns.plan')}</span>
              <span className="font-medium">
                {t('requests.months', { count: verification.planMonths })}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-foreground-tertiary">{t('requests.columns.status')}</span>
              {request ? <StatusBadge status={request.status} /> : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/financing-requests/${verification.requestRef}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-fg transition hover:brightness-95"
            >
              <FileText size={14} />
              {t('merchants.proposed.openRequest')}
            </Link>
            <Link
              to="/merchant-verifications"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-background-secondary"
            >
              <User size={14} />
              {t('requests.profile.openVerification')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
