import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Store, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { merchantProfile, kybDocuments } from '@/lib/mock/data'
import { formatDate, type Locale } from '@/lib/format'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

const ltr = (v: string) => <span dir="ltr">{v}</span>

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const p = merchantProfile

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')}>
        <Button variant="secondary" size="sm" onClick={() => toast(t('common.actionDemo'))}>
          <Pencil size={15} />
          {t('profile.edit')}
        </Button>
      </PageHeader>

      <Card className="mb-4 p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-surface text-primary">
            <Store size={26} strokeWidth={1.5} />
          </span>
          <div className="me-auto">
            <h2 className="text-lg font-medium text-foreground">{p.name}</h2>
            <p className="text-sm text-foreground-tertiary">{p.tagline}</p>
          </div>
          <span className="rounded-sm bg-background-secondary px-2.5 py-1 text-xs text-foreground-secondary">
            {p.category}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-foreground-secondary">{p.description}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>{t('profile.sections.legal')}</CardTitle></CardHeader>
          <div className="px-5 py-2">
            <Row label={t('profile.fields.rc')} value={ltr(p.rc)} />
            <Row label={t('profile.fields.nif')} value={ltr(p.nif)} />
            <Row label={t('profile.fields.nis')} value={ltr(p.nis)} />
            <Row label={t('profile.fields.art')} value={ltr(p.art)} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('profile.sections.contact')}</CardTitle></CardHeader>
          <div className="px-5 py-2">
            <Row label={t('profile.fields.phone')} value={ltr(p.phone)} />
            <Row label={t('profile.fields.email')} value={ltr(p.email)} />
            <Row label={t('profile.fields.website')} value={ltr(p.website)} />
            <Row label={t('profile.fields.wilaya')} value={p.wilaya} />
            <Row label={t('profile.fields.commune')} value={p.commune} />
            <Row label={t('profile.fields.address')} value={p.address} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('profile.sections.banking')}</CardTitle></CardHeader>
          <div className="px-5 py-2">
            <Row label={t('profile.fields.bankHolder')} value={p.bank.holder} />
            <Row label={t('profile.fields.ccp')} value={ltr(p.bank.ccp)} />
            <Row label={t('profile.fields.rip')} value={ltr(p.bank.rip)} />
            <Row label={t('profile.fields.baridiMob')} value={ltr(p.bank.baridiMob)} />
            <Row label={t('profile.fields.commissionRate')} value={`${p.commissionRate}%`} />
            <Row label={t('profile.fields.joinedAt')} value={formatDate(p.joinedAt, locale)} />
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('profile.sections.documents')}</CardTitle></CardHeader>
          <div className="px-5 py-2">
            {kybDocuments.map((doc) => (
              <div
                key={doc.key}
                className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
              >
                <span className="text-sm text-foreground">{t(`profile.documents.${doc.key}`)}</span>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
