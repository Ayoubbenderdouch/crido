import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, FileX, Phone, MessageCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchRequest } from '@/lib/mock/api'
import { merchantProfile } from '@/lib/mock/data'
import { formatDzd, type Locale } from '@/lib/format'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function RequestDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { reference } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['request', reference],
    queryFn: () => fetchRequest(reference ?? ''),
  })

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={FileX} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  const commission = Math.round((data.amountDzd * merchantProfile.commissionRate) / 100)
  const payout = data.amountDzd - commission
  const waPhone = data.customerPhone.replace(/\D/g, '')

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
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <PageHeader title={data.reference}>
        <StatusBadge status={data.status} />
        {data.status === 'submitted' ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => toast(t('requests.rejectedToast'))}>
              {t('requests.reject')}
            </Button>
            <Button size="sm" onClick={() => toast.success(t('requests.confirmedToast'))}>
              {t('requests.confirm')}
            </Button>
          </>
        ) : null}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>{t('requests.sections.customer')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field label={t('requests.columns.customer')} value={data.customerName} />
              <Field label={t('customers.fields.phone')} value={<span dir="ltr">{data.customerPhone}</span>} />
              <Field label={t('requests.sections.branch')} value={data.branchName} />
            </div>
            <div className="flex gap-2 border-t border-border px-5 py-3">
              <a href={`tel:${data.customerPhone}`}>
                <Button variant="secondary" size="sm"><Phone size={15} />{t('common.call')}</Button>
              </a>
              <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm"><MessageCircle size={15} />{t('common.whatsapp')}</Button>
              </a>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t('requests.sections.product')}</CardTitle></CardHeader>
            <div className="px-5 py-2">
              <Field label={t('requests.columns.product')} value={data.productName} />
              <Field
                label={t('requests.columns.plan')}
                value={t('requests.months', { count: data.planMonths })}
              />
              <Field label={t('requests.columns.amount')} value={formatDzd(data.amountDzd, locale)} />
            </div>
          </Card>

          {data.note ? (
            <Card className="px-5 py-4">
              <p className="text-sm font-medium text-foreground">{t('requests.merchantNote')}</p>
              <p className="mt-1 text-sm text-foreground-secondary">{data.note}</p>
            </Card>
          ) : null}

          <Card>
            <CardHeader><CardTitle>{t('requests.sections.timeline')}</CardTitle></CardHeader>
            <ol className="px-5 py-4">
              {steps.map((s, idx) => (
                <li key={s.label} className="flex items-center gap-3 py-2">
                  <span
                    className={
                      s.done
                        ? 'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-fg'
                        : 'flex h-6 w-6 items-center justify-center rounded-full bg-background-secondary text-xs text-foreground-tertiary'
                    }
                  >
                    {idx + 1}
                  </span>
                  <span className={s.done ? 'text-sm text-foreground' : 'text-sm text-foreground-tertiary'}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle>{t('requests.breakdown.title')}</CardTitle></CardHeader>
          <div className="px-5 py-3">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.finalPrice')}</span>
              <span className="tabular-nums text-foreground">{formatDzd(data.amountDzd, locale)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.commission')}</span>
              <span className="tabular-nums text-foreground">− {formatDzd(commission, locale)}</span>
            </div>
            <div className="my-1 border-t border-border" />
            <div className="rounded-md bg-primary-surface px-3 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{t('requests.breakdown.payout')}</span>
                <span className="text-lg font-medium tabular-nums text-primary">
                  {formatDzd(payout, locale)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-foreground-tertiary">
              {t('requests.breakdown.hint')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
