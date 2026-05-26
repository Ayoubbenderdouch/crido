import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronRight,
  FileX,
  User,
  Package,
  Clock,
  Wallet,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
} from 'lucide-react'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchFinancing } from '@/lib/api'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import type { Financing } from '@/lib/mock/data'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-end text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  accent = 'primary',
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle?: string
  children: React.ReactNode
  accent?: 'primary' | 'muted'
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div
        className={cn(
          'border-b border-border px-5 py-4',
          accent === 'primary'
            ? 'bg-gradient-to-r from-primary-surface/90 via-primary-surface/40 to-transparent'
            : 'bg-background-secondary/50',
        )}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              accent === 'primary' ? 'bg-primary/10 text-primary' : 'bg-background-secondary text-foreground-secondary',
            )}
          >
            <Icon size={17} />
          </span>
          {title}
        </h2>
        {subtitle ? <p className="mt-1 ps-10 text-xs text-foreground-tertiary">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
  )
}

function buildTimeline(data: Financing, t: (key: string) => string) {
  const payoutStep = {
    label: data.payoutPaid ? t('financings.timelinePayoutPaid') : t('financings.timelinePayoutPending'),
    done: data.payoutPaid,
  }

  if (data.status === 'defaulted') {
    return [
      { label: t('financings.timelineActivated'), done: true },
      payoutStep,
      { label: t('financings.timelineDefaulted'), done: true },
    ]
  }

  if (data.status === 'completed') {
    return [
      { label: t('financings.timelineActivated'), done: true },
      payoutStep,
      { label: t('financings.timelineCompleted'), done: true },
    ]
  }

  return [
    { label: t('financings.timelineActivated'), done: true },
    payoutStep,
    { label: t('financings.timelineActive'), done: false },
  ]
}

export default function FinancingDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['financing', reference],
    queryFn: () => fetchFinancing(reference ?? ''),
  })

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

  const steps = buildTimeline(data, t)
  const marginDzd = data.totalAmountDzd - data.payoutDzd

  return (
    <div className="animate-fade-up">
      <Link
        to="/financings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('financings.title')}
      </Link>

      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary-surface/80 via-card to-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-foreground-tertiary">{t('financings.detailLabel')}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
              {data.reference}
            </h1>
            <p className="mt-2 text-sm text-foreground-secondary">
              {t('financings.fields.activated')}: {formatDate(data.activatedAt, locale)}
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard icon={User} title={t('financings.sections.customer')}>
            <DetailRow label={t('financings.columns.customer')} value={data.customerName} />
            <DetailRow
              label={t('financings.fields.requestRef')}
              value={
                <Link
                  to={`/requests/${data.requestRef}`}
                  className="inline-flex items-center gap-1 tabular-nums text-primary transition hover:underline"
                >
                  {data.requestRef}
                  <ExternalLink size={13} />
                </Link>
              }
            />
          </SectionCard>

          <SectionCard icon={Package} title={t('financings.sections.product')}>
            <DetailRow label={t('financings.columns.product')} value={data.productName} />
            <DetailRow
              label={t('financings.columns.plan')}
              value={t('requests.months', { count: data.planMonths })}
            />
            <DetailRow
              label={t('financings.columns.total')}
              value={formatDzd(data.totalAmountDzd, locale)}
            />
          </SectionCard>

          <SectionCard icon={Clock} title={t('financings.sections.timeline')} subtitle={t('financings.timelineHint')}>
            <ol className="py-2">
              {steps.map((s, idx) => (
                <li key={s.label} className="flex items-center gap-3 py-2.5">
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      s.done ? 'bg-primary text-primary-fg' : 'bg-background-secondary text-foreground-tertiary',
                    )}
                  >
                    {s.done ? <CheckCircle2 size={16} /> : <CircleDashed size={16} />}
                  </span>
                  <span className={s.done ? 'text-sm font-medium text-foreground' : 'text-sm text-foreground-tertiary'}>
                    {s.label}
                  </span>
                  {idx < steps.length - 1 ? (
                    <span className="ms-auto hidden h-px w-8 bg-border sm:block" aria-hidden />
                  ) : null}
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <section className="h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/90 to-transparent px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Wallet size={17} />
              </span>
              {t('financings.sections.summary')}
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('financings.columns.total')}</span>
              <span className="tabular-nums text-foreground">{formatDzd(data.totalAmountDzd, locale)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('financings.summary.margin')}</span>
              <span className="tabular-nums text-foreground">− {formatDzd(marginDzd, locale)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="rounded-xl bg-gradient-to-br from-primary-surface to-primary-surface/30 px-4 py-4 ring-1 ring-primary/10">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-primary">{t('financings.columns.payout')}</span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatDzd(data.payoutDzd, locale)}
                </span>
              </div>
              <p
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                  data.payoutPaid ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning',
                )}
              >
                {data.payoutPaid ? <CheckCircle2 size={13} /> : <CircleDashed size={13} />}
                {data.payoutPaid ? t('financings.payoutPaid') : t('financings.payoutPending')}
              </p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">
              {t('financings.summary.hint')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
