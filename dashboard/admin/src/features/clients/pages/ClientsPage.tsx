import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Copy,
  MapPin,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchClients } from '@/lib/mock/api'
import { DEBT_RATIO_MAX_PCT, debtRatioPct, type Client } from '@/lib/mock/data'
import { formatDzd, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const SELECT =
  'h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
const KYC_OPTIONS = ['all', 'approved', 'pending', 'rejected', 'not_started', 'expired']
const TIER_OPTIONS = ['all', 'A', 'B', 'C', 'D', 'E']

// ── Debt-ratio color band ──────────────────────────────────────────────
//  • 0–15%  : green  — safe
//  • 15–25% : amber  — caution
//  • 25–30% : red    — high (admin warning)
//  • > 30%  : critical — auto-rejected by Crido risk policy
type DebtBand = 'safe' | 'caution' | 'high' | 'critical' | 'unknown'

const BAND_STYLES: Record<DebtBand, { bg: string; text: string; ring: string }> = {
  safe: { bg: 'bg-[#E1F5EE]', text: 'text-[#04342C]', ring: 'ring-[#9FE1CB]/60' },
  caution: { bg: 'bg-[#FAEEDA]', text: 'text-[#633806]', ring: 'ring-[#EF9F27]/40' },
  high: { bg: 'bg-[#FCEBEB]', text: 'text-[#791F1F]', ring: 'ring-[#E24B4A]/50' },
  critical: { bg: 'bg-[#E24B4A]', text: 'text-white', ring: 'ring-[#E24B4A]' },
  unknown: { bg: 'bg-background-secondary', text: 'text-foreground-tertiary', ring: 'ring-border' },
}

export function bandOf(ratioPct: number, hasIncome: boolean): DebtBand {
  if (!hasIncome) return 'unknown'
  if (ratioPct > DEBT_RATIO_MAX_PCT) return 'critical'
  if (ratioPct > 25) return 'high'
  if (ratioPct > 15) return 'caution'
  return 'safe'
}

function DebtRatioBadge({ client, locale: _locale }: { client: Client; locale: Locale }) {
  const ratio = debtRatioPct(client)
  const hasIncome = !!client.monthlyIncomeDzd && client.monthlyIncomeDzd > 0
  const band = bandOf(ratio, hasIncome)
  const style = BAND_STYLES[band]
  if (!hasIncome) {
    return (
      <span className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-xs tabular-nums', style.bg, style.text)}>
        —
      </span>
    )
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ring-1',
        style.bg,
        style.text,
        style.ring,
      )}
      title={band === 'critical' ? 'يتجاوز سقف 30٪ — مرفوض تلقائياً' : undefined}
    >
      {band === 'critical' ? <AlertTriangle size={12} strokeWidth={2.5} /> : null}
      {ratio.toFixed(1)}%
    </span>
  )
}

// Hook: debounced search string
function useDebounced<T>(value: T, ms = 200): T {
  const [out, setOut] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setOut(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return out
}

export default function ClientsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounced(search.trim().toLowerCase(), 200)
  const [kyc, setKyc] = useState('all')
  const [tier, setTier] = useState('all')
  const [wilaya, setWilaya] = useState('all')
  const [maxRatio, setMaxRatio] = useState(100) // upper bound slider
  const [onlyOverPolicy, setOnlyOverPolicy] = useState(false) // > 25% red flag

  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: fetchClients })
  const clients = data ?? []

  const wilayaOptions = useMemo(() => {
    const set = new Set<string>()
    for (const c of clients) if (c.wilaya) set.add(c.wilaya)
    return ['all', ...Array.from(set).sort()]
  }, [clients])

  const rows = useMemo(() => {
    return clients.filter((c) => {
      if (kyc !== 'all' && c.kycStatus !== kyc) return false
      if (tier !== 'all' && c.tier !== tier) return false
      if (wilaya !== 'all' && c.wilaya !== wilaya) return false
      const ratio = debtRatioPct(c)
      if (ratio > maxRatio) return false
      if (onlyOverPolicy && ratio <= 25) return false
      if (debouncedSearch) {
        const haystack = [c.name, c.phone, c.nationalId, c.wilaya, c.commune].join(' ').toLowerCase()
        if (!haystack.includes(debouncedSearch)) return false
      }
      return true
    })
  }, [clients, kyc, tier, wilaya, maxRatio, onlyOverPolicy, debouncedSearch])

  const copyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation()
    void navigator.clipboard?.writeText(phone)
    toast(locale === 'ar' ? 'تم نسخ الرقم' : 'Numéro copié')
  }

  const clearAll = () => {
    setSearch('')
    setKyc('all')
    setTier('all')
    setWilaya('all')
    setMaxRatio(100)
    setOnlyOverPolicy(false)
  }

  const activeFilters =
    (kyc !== 'all' ? 1 : 0) +
    (tier !== 'all' ? 1 : 0) +
    (wilaya !== 'all' ? 1 : 0) +
    (maxRatio < 100 ? 1 : 0) +
    (onlyOverPolicy ? 1 : 0) +
    (search ? 1 : 0)

  // Debt-ratio policy reminder strings (intentionally inline — no i18n change).
  const policyLabelRatio = locale === 'ar' ? 'نسبة المديونية' : "Ratio d'endettement"
  const policyLabelIncome = locale === 'ar' ? 'الدخل الشهري' : 'Revenu mensuel'
  const policyLabelDebt = locale === 'ar' ? 'القسط الشهري' : 'Charge mensuelle'
  const policyLabelMaxRatio =
    locale === 'ar'
      ? 'السقف الأقصى للنسبة'
      : 'Ratio max affiché'
  const policyLabelOverRisk =
    locale === 'ar'
      ? 'إظهار من تتجاوز نسبتهم 25٪ فقط'
      : 'Afficher uniquement les ratios > 25%'
  const policyLabelClear = locale === 'ar' ? 'إعادة التصفية' : 'Réinitialiser'
  const policyLabelWilaya = locale === 'ar' ? 'الولاية' : 'Wilaya'
  const colHeaderIndex = '#'
  const colHeaderPhone = locale === 'ar' ? 'الهاتف' : 'Téléphone'
  const colHeaderWilaya = locale === 'ar' ? 'الولاية' : 'Wilaya'
  const colHeaderIncome = locale === 'ar' ? 'الدخل الشهري' : 'Revenu mensuel'
  const colHeaderDebt = locale === 'ar' ? 'مديونية الشهر' : 'Dette du mois'
  const colHeaderRatio = locale === 'ar' ? 'النسبة' : 'Ratio'

  const columns: Column<Client>[] = [
    {
      key: 'idx',
      header: colHeaderIndex,
      align: 'center',
      cell: (c) => {
        const i = rows.indexOf(c) + 1
        return (
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-background-secondary px-1.5 text-[11px] font-semibold tabular-nums text-foreground-secondary">
            {i}
          </span>
        )
      },
    },
    {
      key: 'client',
      header: t('clients.columns.client'),
      cell: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.name} size={38} />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{c.name}</p>
            <p className="truncate text-[11px] tabular-nums text-foreground-tertiary" dir="ltr">
              {c.nationalId}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: colHeaderPhone,
      cell: (c) => (
        <button
          type="button"
          onClick={(e) => copyPhone(c.phone, e)}
          className="group inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-mono text-xs tabular-nums text-foreground-secondary transition-colors hover:bg-primary-surface hover:text-primary"
          dir="ltr"
          title={locale === 'ar' ? 'انسخ' : 'Copier'}
        >
          <span>{c.phone}</span>
          <Copy
            size={12}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            strokeWidth={2}
          />
        </button>
      ),
    },
    {
      key: 'wilaya',
      header: colHeaderWilaya,
      cell: (c) => (
        <span className="inline-flex items-center gap-1 text-foreground-secondary">
          <MapPin size={12} className="text-foreground-tertiary" strokeWidth={2} />
          {c.wilaya}
        </span>
      ),
    },
    {
      key: 'income',
      header: colHeaderIncome,
      align: 'end',
      cell: (c) => (
        <span className="tabular-nums text-foreground-secondary">
          {c.monthlyIncomeDzd ? formatDzd(c.monthlyIncomeDzd, locale) : '—'}
        </span>
      ),
    },
    {
      key: 'debt',
      header: colHeaderDebt,
      align: 'end',
      cell: (c) => (
        <span className="tabular-nums text-foreground-secondary">
          {c.currentMonthlyDebtDzd ? formatDzd(c.currentMonthlyDebtDzd, locale) : '—'}
        </span>
      ),
    },
    {
      key: 'ratio',
      header: colHeaderRatio,
      align: 'center',
      cell: (c) => <DebtRatioBadge client={c} locale={locale} />,
    },
    { key: 'kyc', header: t('clients.columns.kyc'), cell: (c) => <StatusBadge status={c.kycStatus} /> },
    { key: 'tier', header: t('clients.columns.tier'), align: 'center', cell: (c) => <TierBadge tier={c.tier} /> },
  ]

  const overPolicyCount = rows.filter((c) => debtRatioPct(c) > DEBT_RATIO_MAX_PCT).length

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('clients.title')} subtitle={t('clients.subtitle')} />

      {/* Prominent search bar */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px]">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              locale === 'ar'
                ? 'بحث بالاسم، الهاتف، الرقم الوطني، الولاية…'
                : 'Rechercher par nom, téléphone, NIN, wilaya…'
            }
            className="h-11 w-full rounded-xl border border-border bg-background ps-10 pe-9 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-foreground-tertiary transition-colors hover:bg-background-secondary hover:text-foreground"
              aria-label={locale === 'ar' ? 'مسح البحث' : 'Effacer'}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
        <span className="rounded-md bg-background-secondary px-3 py-1.5 text-xs text-foreground-secondary">
          {rows.length} {t('common.results')}
        </span>
        {activeFilters > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground-secondary transition-colors hover:border-primary/50 hover:text-primary"
          >
            <X size={12} />
            {policyLabelClear}
            <span className="rounded bg-primary-surface px-1 text-[10px] tabular-nums text-primary">
              {activeFilters}
            </span>
          </button>
        ) : null}
      </div>

      {/* Filter row */}
      <div className="mb-4 rounded-xl border border-border bg-card p-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">
              {policyLabelWilaya}
            </span>
            <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} className={SELECT}>
              {wilayaOptions.map((w) => (
                <option key={w} value={w}>
                  {w === 'all' ? t('common.all') : w}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">
              {t('clients.columns.kyc')}
            </span>
            <select value={kyc} onChange={(e) => setKyc(e.target.value)} className={SELECT}>
              {KYC_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === 'all' ? t('common.all') : t(`status.${o}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">
              {t('clients.columns.tier')}
            </span>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={SELECT}>
              {TIER_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o === 'all' ? t('common.all') : o}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-[220px] flex-col gap-1">
            <span className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-foreground-tertiary">
              <span className="inline-flex items-center gap-1">
                <SlidersHorizontal size={11} />
                {policyLabelMaxRatio}
              </span>
              <span className="tabular-nums normal-case text-foreground">
                ≤ {maxRatio}%
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={maxRatio}
              onChange={(e) => setMaxRatio(Number(e.target.value))}
              className="h-10 w-full cursor-pointer accent-[var(--color-primary)]"
              aria-label={policyLabelMaxRatio}
            />
          </div>

          <label className="ms-auto inline-flex select-none items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground-secondary transition-colors hover:border-[#E24B4A]/40 has-[:checked]:border-[#E24B4A]/60 has-[:checked]:bg-[#FCEBEB]/60 has-[:checked]:text-[#791F1F]">
            <input
              type="checkbox"
              checked={onlyOverPolicy}
              onChange={(e) => setOnlyOverPolicy(e.target.checked)}
              className="size-4 accent-[#E24B4A]"
            />
            <ShieldAlert size={14} />
            <span>{policyLabelOverRisk}</span>
            {overPolicyCount > 0 ? (
              <span className="rounded-full bg-[#E24B4A] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                {overPolicyCount}
              </span>
            ) : null}
          </label>
        </div>
      </div>

      {/* Policy banner — pinned context for the admin */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[#EF9F27]/40 bg-[#FAEEDA]/40 px-3 py-2 text-xs text-[#633806]">
        <ShieldAlert size={14} strokeWidth={2} />
        <span>
          {locale === 'ar'
            ? 'سياسة Crido: نسبة المديونية الشهرية للعميل لا يجب أن تتجاوز 30٪ من خلاصة الدخل.'
            : "Politique Crido : le ratio dette/revenu mensuel ne doit pas dépasser 30%."}
        </span>
        <span className="ms-auto inline-flex items-center gap-2 text-[#633806]/80">
          <LegendDot color="#9FE1CB" />
          <span>0–15%</span>
          <LegendDot color="#EF9F27" />
          <span>15–25%</span>
          <LegendDot color="#E24B4A" />
          <span>25–30%</span>
          <LegendDot color="#E24B4A" outline />
          <span>{locale === 'ar' ? 'مرفوض' : 'Rejeté'} &gt; 30%</span>
        </span>
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(c) => String(c.id)}
            onRowClick={(c) => navigate(`/clients/${c.id}`)}
          />
        )}
      </Card>

      {/* Compact help row, mostly for the policy fields */}
      <p className="mt-3 text-[11px] text-foreground-tertiary">
        {policyLabelRatio} = {policyLabelDebt} ÷ {policyLabelIncome} × 100
      </p>
    </div>
  )
}

function LegendDot({ color, outline = false }: { color: string; outline?: boolean }) {
  return (
    <span
      className="inline-block size-2.5 rounded-full"
      style={{
        backgroundColor: outline ? 'transparent' : color,
        border: outline ? `1.5px solid ${color}` : 'none',
      }}
    />
  )
}
