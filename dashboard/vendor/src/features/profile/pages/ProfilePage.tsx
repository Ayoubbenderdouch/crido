import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  FileCheck2,
  Landmark,
  MapPin,
  Pencil,
  Store,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { merchantProfile, kybDocuments } from '@/lib/mock/data'
import { useVendorStore } from '@/hooks/useVendorStore'
import { formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="max-w-[60%] text-end text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="border-b border-border bg-primary-surface/30">
        <CardTitle className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg">
            <Icon size={16} strokeWidth={1.75} />
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <div className="px-5 py-1">{children}</div>
    </Card>
  )
}

const ltr = (v: string) => (
  <span dir="ltr" className="tabular-nums">
    {v}
  </span>
)

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const { profile: editable } = useVendorStore()
  const p = { ...merchantProfile, ...editable }
  const displayName = locale === 'fr' && p.nameFr ? p.nameFr : p.name

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/profile/edit')}>
          <Pencil size={15} />
          {t('profile.edit')}
        </Button>
      </PageHeader>

      <Card className="relative mb-5 overflow-hidden border-primary/15">
        <div className="absolute inset-y-0 start-0 w-1 bg-primary" aria-hidden />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary shadow-sm">
              <Store size={28} strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium text-foreground">{displayName}</h2>
                <span className="rounded-sm bg-primary-surface px-2.5 py-0.5 text-xs font-medium text-primary">
                  {p.category}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground-secondary" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                {p.tagline}
              </p>
              <p className="mt-3 text-xs text-foreground-tertiary">
                {t('profile.partnerSince', { date: formatDate(p.joinedAt, locale) })}
              </p>
            </div>
          </div>
          <p
            className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-foreground-secondary"
            dir="rtl"
          >
            {p.description}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard icon={Building2} title={t('profile.sections.legal')}>
          <Row label={t('profile.fields.rc')} value={ltr(p.rc)} />
          <Row label={t('profile.fields.nif')} value={ltr(p.nif)} />
          <Row label={t('profile.fields.nis')} value={ltr(p.nis)} />
          <Row label={t('profile.fields.art')} value={ltr(p.art)} />
        </SectionCard>

        <SectionCard icon={MapPin} title={t('profile.sections.contact')}>
          <Row label={t('profile.fields.phone')} value={ltr(p.phone)} />
          <Row label={t('profile.fields.email')} value={ltr(p.email)} />
          <Row label={t('profile.fields.website')} value={ltr(p.website)} />
          <Row label={t('profile.fields.wilaya')} value={p.wilaya} />
          <Row label={t('profile.fields.commune')} value={p.commune} />
          <Row label={t('profile.fields.address')} value={<span dir="rtl">{p.address}</span>} />
        </SectionCard>

        <SectionCard icon={Landmark} title={t('profile.sections.banking')}>
          <Row label={t('profile.fields.bankHolder')} value={p.bank.holder} />
          <Row label={t('profile.fields.ccp')} value={ltr(p.bank.ccp)} />
          <Row label={t('profile.fields.rip')} value={ltr(p.bank.rip)} />
          <Row label={t('profile.fields.baridiMob')} value={ltr(p.bank.baridiMob)} />
          <Row label={t('profile.fields.commissionRate')} value={`${p.commissionRate}%`} />
          <Row label={t('profile.fields.joinedAt')} value={formatDate(p.joinedAt, locale)} />
        </SectionCard>

        <SectionCard icon={FileCheck2} title={t('profile.sections.documents')}>
          {kybDocuments.map((doc) => (
            <div
              key={doc.key}
              className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-0"
            >
              <span className="text-sm text-foreground">{t(`profile.documents.${doc.key}`)}</span>
              <StatusBadge status={doc.status} />
            </div>
          ))}
          <p className="py-3 text-xs text-foreground-tertiary">{t('profile.readonlyNote')}</p>
        </SectionCard>
      </div>
    </div>
  )
}
