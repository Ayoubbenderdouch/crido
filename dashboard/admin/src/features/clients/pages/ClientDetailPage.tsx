import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AlertTriangle, Camera, ChevronRight, IdCard, MapPin, ShieldAlert, UserX } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { Avatar } from '@/components/data/Avatar'
import { DataTable, type Column } from '@/components/data/DataTable'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { fetchClient } from '@/lib/mock/api'
import {
  DEBT_RATIO_MAX_PCT,
  debtRatioPct,
  financings,
  type Client,
  type Financing,
} from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const TABS = ['overview', 'kyc', 'financings', 'credit'] as const
type Tab = (typeof TABS)[number]

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function ClientDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const { id } = useParams()
  const [tab, setTab] = useState<Tab>('overview')

  const { data: c, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(Number(id)),
  })

  if (isLoading) return <Loader />
  if (!c) {
    return (
      <div className="animate-fade-up">
        <Card><EmptyState icon={UserX} title={t('common.notFound')} /></Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/clients"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('clients.title')}
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Avatar name={c.name} size={52} />
        <div className="me-auto">
          <h1 className="text-xl font-medium text-foreground">{c.name}</h1>
          <p className="flex items-center gap-2 text-sm text-foreground-tertiary">
            <span className="tabular-nums" dir="ltr">{c.phone}</span>
            <span className="text-foreground-tertiary/40">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} />
              {c.wilaya}
            </span>
          </p>
        </div>
        <TierBadge tier={c.tier} />
        <StatusBadge status={c.kycStatus} />
      </div>

      <DebtRatioPanel client={c} locale={locale} />

      <div className="mb-4 flex gap-1 border-b border-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2 text-sm transition-colors',
              tab === tb
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-foreground-secondary hover:text-foreground',
            )}
          >
            {t(`clients.tabs.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'overview' ? <OverviewTab client={c} locale={locale} /> : null}
      {tab === 'kyc' ? <KycTab kycStatus={c.kycStatus} /> : null}
      {tab === 'financings' ? <FinancingsTab name={c.name} locale={locale} /> : null}
      {tab === 'credit' ? <CreditTab client={c} locale={locale} /> : null}
    </div>
  )
}

function OverviewTab({ client: c, locale }: { client: Client; locale: Locale }) {
  const { t } = useTranslation()
  const ninLabel = locale === 'ar' ? 'الرقم الوطني (NIN)' : 'NIN'
  const wilayaLabel = locale === 'ar' ? 'الولاية' : 'Wilaya'
  return (
    <Card className="px-5">
      <Field label={t('clients.fields.phone')} value={<span dir="ltr">{c.phone}</span>} />
      <Field label={ninLabel} value={<span dir="ltr" className="font-mono tabular-nums">{c.nationalId || '—'}</span>} />
      <Field label={t('clients.fields.dob')} value={formatDate(c.dateOfBirth, locale)} />
      <Field label={t('clients.fields.address')} value={c.address} />
      <Field label={wilayaLabel} value={c.wilaya} />
      <Field label={t('clients.columns.commune')} value={c.commune} />
      <Field label={t('clients.fields.employment')} value={t(`employment.${c.employmentStatus}`)} />
      <Field label={t('clients.fields.employer')} value={c.employer ?? '—'} />
      <Field
        label={t('clients.fields.income')}
        value={c.monthlyIncomeDzd ? formatDzd(c.monthlyIncomeDzd, locale) : '—'}
      />
    </Card>
  )
}

function KycTab({ kycStatus }: { kycStatus: string }) {
  const { t } = useTranslation()
  const demo = () => toast(t('common.actionDemo'))
  const docs = [
    { key: 'idFront', icon: IdCard },
    { key: 'idBack', icon: IdCard },
    { key: 'selfie', icon: Camera },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('kyc.docsTitle')}</CardTitle>
        <StatusBadge status={kycStatus} />
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
        {docs.map((d) => (
          <div
            key={d.key}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong bg-background-secondary text-foreground-tertiary"
          >
            <d.icon size={28} strokeWidth={1.5} />
            <span className="px-2 text-center text-xs">{t(`kyc.${d.key}`)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Button variant="ghost" size="sm" onClick={demo}>{t('kyc.rejectKyc')}</Button>
        <Button size="sm" onClick={demo}>{t('kyc.approveKyc')}</Button>
      </div>
    </Card>
  )
}

function FinancingsTab({ name, locale }: { name: string; locale: Locale }) {
  const { t } = useTranslation()
  const rows = financings.filter((f) => f.clientName === name)

  const columns: Column<Financing>[] = [
    {
      key: 'reference',
      header: t('financings.columns.reference'),
      cell: (f) => <span className="font-medium tabular-nums">{f.reference}</span>,
    },
    { key: 'product', header: t('requests.columns.product'), cell: (f) => f.productName },
    {
      key: 'remaining',
      header: t('financings.columns.remaining'),
      align: 'end',
      cell: (f) => <span className="tabular-nums">{formatDzd(f.remainingDzd, locale)}</span>,
    },
    {
      key: 'status',
      header: t('financings.columns.status'),
      align: 'end',
      cell: (f) => <StatusBadge status={f.status} />,
    },
  ]

  return (
    <Card>
      {rows.length === 0 ? (
        <EmptyState icon={UserX} title={t('common.noResults')} />
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(f) => f.reference} />
      )}
    </Card>
  )
}

function CreditTab({ client: c, locale }: { client: Client; locale: Locale }) {
  const { t } = useTranslation()
  const available = Math.max(0, c.creditLimitDzd - c.usedCreditDzd)
  const usedPct = c.creditLimitDzd > 0 ? (c.usedCreditDzd / c.creditLimitDzd) * 100 : 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-foreground-tertiary">{t('clients.fields.score')}</p>
        <p className="mt-1 text-3xl font-medium tabular-nums text-primary">{c.creditScore}</p>
        <div className="mt-3"><TierBadge tier={c.tier} /></div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-foreground-tertiary">{t('clients.fields.used')}</span>
          <span className="tabular-nums font-medium">
            {formatDzd(c.usedCreditDzd, locale)} / {formatDzd(c.creditLimitDzd, locale)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-background-secondary">
          <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md bg-background-secondary px-4 py-3">
            <p className="text-xs text-foreground-tertiary">{t('clients.fields.limit')}</p>
            <p className="mt-1 tabular-nums font-medium">{formatDzd(c.creditLimitDzd, locale)}</p>
          </div>
          <div className="rounded-md bg-primary-surface px-4 py-3">
            <p className="text-xs text-primary">{t('clients.fields.available')}</p>
            <p className="mt-1 tabular-nums font-medium text-primary">{formatDzd(available, locale)}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Debt-to-income panel ──────────────────────────────────────────────
// Always visible across all tabs; mirrors the policy badge in the list page.
//   • 0–15%   green
//   • 15–25%  amber
//   • 25–30%  red (admin must review)
//   • > 30%   critical (auto-rejected by Crido policy)
function DebtRatioPanel({ client: c, locale }: { client: Client; locale: Locale }) {
  const ratio = debtRatioPct(c)
  const hasIncome = !!c.monthlyIncomeDzd && c.monthlyIncomeDzd > 0
  const overPolicy = hasIncome && ratio > DEBT_RATIO_MAX_PCT
  const isHigh = hasIncome && ratio > 25 && ratio <= DEBT_RATIO_MAX_PCT
  const isCaution = hasIncome && ratio > 15 && ratio <= 25

  // Bar is clamped to 100% but tinted by the band.
  const barPct = Math.min(100, Math.max(0, ratio))
  const policyPct = DEBT_RATIO_MAX_PCT // 30
  const barColor = overPolicy
    ? '#E24B4A'
    : isHigh
      ? '#E24B4A'
      : isCaution
        ? '#EF9F27'
        : '#1D9E75'
  const ratioTextClass = overPolicy
    ? 'text-[#E24B4A]'
    : isHigh
      ? 'text-[#791F1F]'
      : isCaution
        ? 'text-[#633806]'
        : 'text-[#04342C]'

  const lbl = {
    title: locale === 'ar' ? 'نسبة المديونية الشهرية' : "Ratio d'endettement mensuel",
    formula: locale === 'ar' ? 'القسط الشهري ÷ الدخل الشهري × 100' : 'Charge mensuelle ÷ Revenu × 100',
    debt: locale === 'ar' ? 'القسط الشهري' : 'Charge mensuelle',
    income: locale === 'ar' ? 'الدخل الشهري' : 'Revenu mensuel',
    policy: locale === 'ar' ? `السقف ${policyPct}%` : `Plafond ${policyPct}%`,
    policyNote:
      locale === 'ar'
        ? `سياسة Crido: لا يجب أن تتجاوز نسبة المديونية الشهرية ${policyPct}٪ من خلاصة الدخل.`
        : `Politique Crido : le ratio mensuel ne doit pas dépasser ${policyPct}% du revenu.`,
    overWarning:
      locale === 'ar'
        ? `هذا العميل يتجاوز سقف ${policyPct}٪ — مرفوض تلقائياً وفق سياسة المخاطر.`
        : `Ce client dépasse le plafond de ${policyPct}% — automatiquement refusé.`,
    highWarning:
      locale === 'ar'
        ? 'تحذير: نسبة المديونية مرتفعة — تتطلب مراجعة من المسؤول قبل قبول أي تمويل جديد.'
        : 'Alerte : ratio élevé — toute nouvelle demande nécessite une revue manuelle.',
    cautionNote:
      locale === 'ar' ? 'نسبة معتدلة — قابلة للقبول' : 'Ratio modéré — acceptable',
    safeNote: locale === 'ar' ? 'هامش أمان جيد' : 'Marge confortable',
    noIncome:
      locale === 'ar'
        ? 'لا يوجد دخل مُسجَّل — لا يمكن حساب نسبة المديونية.'
        : 'Aucun revenu enregistré — ratio non calculable.',
  }

  return (
    <Card
      className={cn(
        'mb-4 overflow-hidden border-l-4 p-5',
        overPolicy
          ? 'border-l-[#E24B4A] bg-[#FCEBEB]/40'
          : isHigh
            ? 'border-l-[#E24B4A]'
            : isCaution
              ? 'border-l-[#EF9F27]'
              : 'border-l-[#1D9E75]',
      )}
    >
      <div className="flex flex-wrap items-end gap-6">
        <div className="min-w-[180px]">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-foreground-tertiary">
            <ShieldAlert size={12} />
            {lbl.title}
          </p>
          {hasIncome ? (
            <p className={cn('mt-1 text-5xl font-semibold tabular-nums leading-none', ratioTextClass)}>
              {ratio.toFixed(1)}
              <span className="text-3xl">%</span>
            </p>
          ) : (
            <p className="mt-1 text-3xl font-medium text-foreground-tertiary">—</p>
          )}
          <p className="mt-1 text-[11px] text-foreground-tertiary">{lbl.formula}</p>
        </div>

        <div className="flex flex-1 flex-col gap-3 min-w-[260px]">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className="inline-flex items-center gap-2">
              <span className="text-foreground-tertiary">{lbl.debt}</span>
              <span className="font-medium tabular-nums text-foreground">
                {c.currentMonthlyDebtDzd ? formatDzd(c.currentMonthlyDebtDzd, locale) : '—'}
              </span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="text-foreground-tertiary">{lbl.income}</span>
              <span className="font-medium tabular-nums text-foreground">
                {c.monthlyIncomeDzd ? formatDzd(c.monthlyIncomeDzd, locale) : '—'}
              </span>
            </span>
          </div>

          {/* Bar with 30% policy marker */}
          <div className="relative" aria-hidden>
            <div className="h-3 overflow-hidden rounded-full bg-background-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${barPct}%`, backgroundColor: barColor }}
              />
            </div>
            {/* 30% policy marker line */}
            <div
              className="absolute -top-1 h-5 w-px bg-foreground-secondary/80"
              style={{ insetInlineStart: `${policyPct}%` }}
            />
            <span
              className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground-secondary/90 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-background"
              style={{ insetInlineStart: `${policyPct}%`, ['--tw-translate-x' as string]: '-50%' }}
            >
              {lbl.policy}
            </span>
            <div className="mt-1 flex justify-between text-[10px] tabular-nums text-foreground-tertiary">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual warning / note */}
      {overPolicy ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#E24B4A] px-3 py-2 text-sm text-white">
          <AlertTriangle size={16} strokeWidth={2.5} className="mt-0.5 shrink-0" />
          <span>{lbl.overWarning}</span>
        </div>
      ) : isHigh ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#E24B4A]/30 bg-[#FCEBEB]/60 px-3 py-2 text-sm text-[#791F1F]">
          <AlertTriangle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />
          <span>{lbl.highWarning}</span>
        </div>
      ) : isCaution ? (
        <p className="mt-3 text-xs text-[#633806]">{lbl.cautionNote}</p>
      ) : hasIncome ? (
        <p className="mt-3 text-xs text-[#04342C]/80">{lbl.safeNote}</p>
      ) : (
        <p className="mt-3 text-xs text-foreground-tertiary">{lbl.noIncome}</p>
      )}

      <p className="mt-2 text-[11px] text-foreground-tertiary">{lbl.policyNote}</p>
    </Card>
  )
}
