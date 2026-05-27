import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Bell,
  Calendar,
  CircleAlert,
  PercentCircle,
  PhoneCall,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/data/EmptyState'
import { Avatar } from '@/components/data/Avatar'
import {
  MOCK_MAY_INSTALLMENTS,
  type MonthlyInstallmentRow,
  type MonthlyInstallmentStatus,
} from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

// ─── Static i18n labels (page is not wired into the global i18n files yet) ───
const LABELS_AR = {
    title: 'المحاسبة',
    subtitle: 'محاسبة الشهر — من يجب أن يدفع؟',
    export: 'تصدير',
    monthLabel: 'الشهر',
    yearLabel: 'السنة',
    kpiExpected: 'إجمالي المتوقع',
    kpiCollected: 'تم التحصيل',
    kpiOutstanding: 'متبقي',
    kpiRate: 'معدّل التحصيل',
    vsLastMonth: 'مقارنة بالشهر الماضي',
    sectionTitle: 'من يجب أن يدفع هذا الشهر',
    sectionHint: 'كل قسط مستحق خلال {{period}} — مرتّب حسب تاريخ الاستحقاق',
    filterAll: 'الكل',
    filterUnpaid: 'غير مدفوع',
    filterPaid: 'مدفوع',
    filterLate: 'متأخر',
    wilayaAll: 'كل الولايات',
    searchPlaceholder: 'ابحث باسم العميل أو رقم التمويل…',
    colIndex: '#',
    colClient: 'العميل',
    colPhone: 'الهاتف',
    colWilaya: 'الولاية',
    colFinancing: 'مرجع التمويل',
    colInstallment: 'القسط',
    colAmount: 'المبلغ',
    colDueDate: 'تاريخ الاستحقاق',
    colStatus: 'الحالة',
    colAction: 'إجراء',
    actionRemind: 'تذكير',
    actionReminded: 'تم التذكير',
    actionCall: 'اتصال',
    installmentOf: '{{n}} من {{total}}',
    statusPaid: 'مدفوع',
    statusPending: 'قيد الانتظار',
    statusLate: 'متأخر',
    statusMissed: 'لم يُسدَّد',
    emptyTitle: 'لا توجد أقساط مطابقة',
    emptyHint: 'جرّب تغيير الفلاتر أو البحث.',
    reminderToast: 'تم إرسال التذكير إلى {{name}}',
    exportToast: 'سيتم تنزيل تقرير المحاسبة قريباً.',
    noPhone: '—',
    rowsCount: '{{n}} قسط',
}

const LABELS_FR: typeof LABELS_AR = {
    title: 'Comptabilité',
    subtitle: 'Comptabilité mensuelle — qui doit payer ?',
    export: 'Exporter',
    monthLabel: 'Mois',
    yearLabel: 'Année',
    kpiExpected: 'Total attendu',
    kpiCollected: 'Encaissé',
    kpiOutstanding: 'Restant',
    kpiRate: 'Taux de recouvrement',
    vsLastMonth: 'vs. mois dernier',
    sectionTitle: 'Qui doit payer ce mois',
    sectionHint: 'Chaque échéance pour {{period}} — triée par date',
    filterAll: 'Tous',
    filterUnpaid: 'Non payés',
    filterPaid: 'Payés',
    filterLate: 'En retard',
    wilayaAll: 'Toutes les wilayas',
    searchPlaceholder: 'Nom du client ou réf. de financement…',
    colIndex: '#',
    colClient: 'Client',
    colPhone: 'Téléphone',
    colWilaya: 'Wilaya',
    colFinancing: 'Réf. financement',
    colInstallment: 'Échéance',
    colAmount: 'Montant',
    colDueDate: 'Échéance',
    colStatus: 'Statut',
    colAction: 'Action',
    actionRemind: 'Rappeler',
    actionReminded: 'Rappel envoyé',
    actionCall: 'Appeler',
    installmentOf: '{{n}} sur {{total}}',
    statusPaid: 'Payé',
    statusPending: 'En attente',
    statusLate: 'En retard',
    statusMissed: 'Non payé',
    emptyTitle: 'Aucune échéance ne correspond',
    emptyHint: 'Essayez de changer les filtres.',
    reminderToast: 'Rappel envoyé à {{name}}',
    exportToast: 'Le rapport comptable sera téléchargé bientôt.',
    noPhone: '—',
    rowsCount: '{{n}} échéances',
}

const LABELS = { ar: LABELS_AR, fr: LABELS_FR }

const AR_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
]
const FR_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

type StatusFilter = 'all' | 'unpaid' | 'paid' | 'late'

// Anchor date — admin "today" for the prototype. Anything strictly
// before this date that hasn't been paid counts as overdue/missed.
const TODAY = '2026-05-27'

// ─── Tone palettes (subtle row tinting + badge color) ───────────
const ROW_TINT: Record<MonthlyInstallmentStatus, string> = {
  paid: 'bg-[#F1FBF6]',
  pending: 'bg-[#FBF8EF]',
  late: 'bg-[#FDF4E4]',
  missed: 'bg-[#FCEEEE]',
}
const BADGE: Record<MonthlyInstallmentStatus, { bg: string; text: string; dot: string }> = {
  paid: { bg: '#E1F5EE', text: '#085041', dot: '#1D9E75' },
  pending: { bg: '#F4F0E1', text: '#6B5B12', dot: '#C2A02A' },
  late: { bg: '#FAEEDA', text: '#6B3D04', dot: '#EF9F27' },
  missed: { bg: '#FCEBEB', text: '#791F1F', dot: '#E24B4A' },
}
const ROW_ACCENT: Record<MonthlyInstallmentStatus, string> = {
  paid: '#1D9E75',
  pending: '#C2A02A',
  late: '#EF9F27',
  missed: '#E24B4A',
}

function statusLabel(s: MonthlyInstallmentStatus, t: typeof LABELS.ar): string {
  switch (s) {
    case 'paid':
      return t.statusPaid
    case 'pending':
      return t.statusPending
    case 'late':
      return t.statusLate
    case 'missed':
      return t.statusMissed
  }
}

function StatusPill({
  status,
  labels,
}: {
  status: MonthlyInstallmentStatus
  labels: typeof LABELS.ar
}) {
  const tone = BADGE[status]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: tone.bg, color: tone.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tone.dot }} />
      {statusLabel(status, labels)}
    </span>
  )
}

export default function AccountingPage() {
  const { i18n } = useTranslation()
  const locale = (i18n.language as Locale) === 'fr' ? 'fr' : 'ar'
  const L = LABELS[locale]
  const monthNames = locale === 'fr' ? FR_MONTHS : AR_MONTHS

  // Default = May 2026 (today is 2026-05-27)
  const [month, setMonth] = useState<number>(5) // 1-indexed
  const [year, setYear] = useState<number>(2026)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [wilaya, setWilaya] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [reminded, setReminded] = useState<Set<string>>(new Set())

  // For the prototype only the May 2026 fixture is wired up. Other months
  // render with empty data — the UI still shows correctly.
  const allRows = useMemo(
    () => (month === 5 && year === 2026 ? MOCK_MAY_INSTALLMENTS : []),
    [month, year],
  )

  const wilayaOptions = useMemo(() => {
    const set = new Set<string>()
    for (const r of allRows) set.add(r.wilaya_ar)
    return ['all', ...[...set].sort()]
  }, [allRows])

  // ─── KPIs ───────────────────────────────────────────────────
  const stats = useMemo(() => {
    const expected = allRows.reduce((s, r) => s + r.amount_dzd, 0)
    const collected = allRows
      .filter((r) => r.status === 'paid')
      .reduce((s, r) => s + r.amount_dzd, 0)
    const outstanding = expected - collected
    const rate = expected > 0 ? (collected / expected) * 100 : 0
    return { expected, collected, outstanding, rate }
  }, [allRows])

  // ─── Filtering ──────────────────────────────────────────────
  const rows = useMemo(() => {
    let list = allRows
    if (statusFilter === 'unpaid') {
      list = list.filter((r) => r.status !== 'paid')
    } else if (statusFilter === 'paid') {
      list = list.filter((r) => r.status === 'paid')
    } else if (statusFilter === 'late') {
      list = list.filter((r) => r.status === 'late' || r.status === 'missed')
    }
    if (wilaya !== 'all') list = list.filter((r) => r.wilaya_ar === wilaya)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.client_name.toLowerCase().includes(q) ||
          r.financing_ref.toLowerCase().includes(q) ||
          r.client_phone.includes(q),
      )
    }
    // Order: missed → late → pending → paid, then by due_date
    const order: Record<MonthlyInstallmentStatus, number> = {
      missed: 0,
      late: 1,
      pending: 2,
      paid: 3,
    }
    return [...list].sort((a, b) => {
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status]
      return a.due_date.localeCompare(b.due_date)
    })
  }, [allRows, statusFilter, wilaya, search])

  // ─── Tab counts ─────────────────────────────────────────────
  const counts = useMemo(() => {
    return {
      all: allRows.length,
      unpaid: allRows.filter((r) => r.status !== 'paid').length,
      paid: allRows.filter((r) => r.status === 'paid').length,
      late: allRows.filter((r) => r.status === 'late' || r.status === 'missed').length,
    }
  }, [allRows])

  function handleRemind(row: MonthlyInstallmentRow) {
    const key = `${row.financing_ref}-${row.installment_number}`
    setReminded((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    toast.success(L.reminderToast.replace('{{name}}', row.client_name))
  }

  const periodLabel = `${monthNames[month - 1]} ${year}`

  // Synthetic "vs. last month" deltas for the prototype.
  const trend = { expected: 8, collected: 12, outstanding: -4, rate: 3.2 }

  return (
    <div className="animate-fade-up">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{L.title}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">{L.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodPicker
            month={month}
            year={year}
            onMonth={setMonth}
            onYear={setYear}
            monthNames={monthNames}
            monthLabel={L.monthLabel}
            yearLabel={L.yearLabel}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast(L.exportToast)}
          >
            <Download size={15} />
            {L.export}
          </Button>
        </div>
      </div>

      {/* ── KPI cards ────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AccountingKpi
          label={L.kpiExpected}
          value={formatDzd(stats.expected, locale)}
          icon={Banknote}
          trend={trend.expected}
          trendHint={L.vsLastMonth}
          accent="primary"
        />
        <AccountingKpi
          label={L.kpiCollected}
          value={formatDzd(stats.collected, locale)}
          icon={CheckCircle2}
          trend={trend.collected}
          trendHint={L.vsLastMonth}
          accent="success"
        />
        <AccountingKpi
          label={L.kpiOutstanding}
          value={formatDzd(stats.outstanding, locale)}
          icon={CircleAlert}
          trend={trend.outstanding}
          trendHint={L.vsLastMonth}
          accent="warning"
          invertTrendColor
        />
        <AccountingKpi
          label={L.kpiRate}
          value={`${stats.rate.toFixed(1)}%`}
          icon={PercentCircle}
          trend={trend.rate}
          trendHint={L.vsLastMonth}
          accent="primary"
        />
      </div>

      {/* ── Filters bar ──────────────────────────────────────── */}
      <Card className="mb-4 overflow-hidden p-0">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
              {(
                [
                  ['all', L.filterAll],
                  ['unpaid', L.filterUnpaid],
                  ['paid', L.filterPaid],
                  ['late', L.filterLate],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    statusFilter === key
                      ? 'bg-primary text-primary-fg shadow-sm'
                      : 'text-foreground-secondary hover:bg-background hover:text-foreground',
                  )}
                >
                  {label}
                  <span className="ms-1.5 tabular-nums opacity-80">({counts[key]})</span>
                </button>
              ))}
            </div>

            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="h-9 rounded-xl border border-border bg-background px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              {wilayaOptions.map((w) => (
                <option key={w} value={w}>
                  {w === 'all' ? L.wilayaAll : w}
                </option>
              ))}
            </select>
          </div>

          <div className="relative max-w-sm flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={L.searchPlaceholder}
              className="h-9 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>
      </Card>

      {/* ── Main table ───────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-1 border-b border-border bg-gradient-to-r from-primary-surface/70 to-transparent px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{L.sectionTitle}</p>
            <p className="mt-0.5 text-xs text-foreground-tertiary">
              {L.sectionHint.replace('{{period}}', periodLabel)}
            </p>
          </div>
          <span className="text-xs font-medium text-foreground-tertiary">
            <span className="tabular-nums">{rows.length}</span>{' '}
            {L.rowsCount.replace('{{n}}', '').trim()}
          </span>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Banknote} title={L.emptyTitle} hint={L.emptyHint} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-background-secondary text-xs font-medium text-foreground-secondary">
                  <th className="w-[44px] px-3 py-3 text-center">{L.colIndex}</th>
                  <th className="px-4 py-3 text-start">{L.colClient}</th>
                  <th className="px-4 py-3 text-start">{L.colPhone}</th>
                  <th className="px-4 py-3 text-start">{L.colWilaya}</th>
                  <th className="px-4 py-3 text-start">{L.colFinancing}</th>
                  <th className="px-4 py-3 text-start">{L.colInstallment}</th>
                  <th className="px-4 py-3 text-end">{L.colAmount}</th>
                  <th className="px-4 py-3 text-start">{L.colDueDate}</th>
                  <th className="px-4 py-3 text-start">{L.colStatus}</th>
                  <th className="px-4 py-3 text-end">{L.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const key = `${row.financing_ref}-${row.installment_number}`
                  const isLate = row.status === 'late' || row.status === 'missed'
                  const isReminded = reminded.has(key)
                  const daysToDue = daysBetweenIso(TODAY, row.due_date)
                  return (
                    <tr
                      key={key}
                      className={cn(
                        'group border-b border-border/70 transition-colors last:border-0 hover:brightness-[0.98]',
                        ROW_TINT[row.status],
                      )}
                    >
                      {/* index column with status accent stripe */}
                      <td className="relative px-3 py-3 text-center align-middle">
                        <span
                          className="absolute inset-y-2 start-0 w-[3px] rounded-full"
                          style={{ backgroundColor: ROW_ACCENT[row.status] }}
                          aria-hidden
                        />
                        <span className="tabular-nums text-xs font-semibold text-foreground-secondary">
                          {idx + 1}
                        </span>
                      </td>

                      {/* client */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={row.client_name} size={32} />
                          <span className="block truncate font-medium text-foreground">
                            {row.client_name}
                          </span>
                        </div>
                      </td>

                      {/* phone */}
                      <td className="px-4 py-3 align-middle">
                        <a
                          href={`tel:${row.client_phone}`}
                          dir="ltr"
                          className="inline-flex items-center gap-1.5 tabular-nums text-xs font-medium text-foreground-secondary hover:text-primary"
                        >
                          <PhoneCall size={12} className="text-foreground-tertiary" />
                          {row.client_phone}
                        </a>
                      </td>

                      {/* wilaya */}
                      <td className="px-4 py-3 align-middle text-sm text-foreground-secondary">
                        {row.wilaya_ar}
                      </td>

                      {/* financing ref */}
                      <td className="px-4 py-3 align-middle">
                        <span className="tabular-nums text-xs font-medium text-foreground">
                          {row.financing_ref}
                        </span>
                      </td>

                      {/* installment progress */}
                      <td className="px-4 py-3 align-middle">
                        <div className="min-w-[120px]">
                          <p className="tabular-nums text-xs font-medium text-foreground">
                            {L.installmentOf
                              .replace('{{n}}', String(row.installment_number))
                              .replace('{{total}}', String(row.total_installments))}
                          </p>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.round(
                                  (row.installment_number / row.total_installments) * 100,
                                )}%`,
                                backgroundColor: ROW_ACCENT[row.status],
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* amount */}
                      <td className="px-4 py-3 text-end align-middle">
                        <span className="tabular-nums text-base font-semibold text-foreground">
                          {formatDzd(row.amount_dzd, locale)}
                        </span>
                      </td>

                      {/* due date */}
                      <td className="px-4 py-3 align-middle">
                        <p
                          className={cn(
                            'text-sm',
                            isLate ? 'font-medium text-warning' : 'text-foreground',
                          )}
                        >
                          {formatDate(row.due_date, locale)}
                        </p>
                        {row.status === 'pending' && daysToDue > 0 ? (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-tertiary">
                            <Clock size={11} />
                            {locale === 'ar'
                              ? `بعد ${daysToDue} يوم`
                              : `dans ${daysToDue} j`}
                          </p>
                        ) : null}
                        {isLate ? (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-warning">
                            <AlertTriangle size={11} />
                            {locale === 'ar'
                              ? `متأخر ${Math.abs(daysToDue)} يوم`
                              : `${Math.abs(daysToDue)} j de retard`}
                          </p>
                        ) : null}
                      </td>

                      {/* status badge */}
                      <td className="px-4 py-3 align-middle">
                        <StatusPill status={row.status} labels={L} />
                      </td>

                      {/* action */}
                      <td className="px-4 py-3 text-end align-middle">
                        {row.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-foreground-tertiary">
                            <CheckCircle2 size={13} className="text-success" />
                            {statusLabel('paid', L)}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant={isReminded ? 'ghost' : 'secondary'}
                            disabled={isReminded}
                            onClick={() => handleRemind(row)}
                            className="h-8 gap-1.5"
                          >
                            <Bell size={13} />
                            {isReminded ? L.actionReminded : L.actionRemind}
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

// ─── Sub-component: Period picker (month + year) ───────────────
function PeriodPicker({
  month,
  year,
  onMonth,
  onYear,
  monthNames,
  monthLabel,
  yearLabel,
}: {
  month: number
  year: number
  onMonth: (m: number) => void
  onYear: (y: number) => void
  monthNames: readonly string[]
  monthLabel: string
  yearLabel: string
}) {
  const years = [2025, 2026, 2027]
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-2 py-1 shadow-sm">
      <Calendar size={15} className="text-foreground-tertiary" />
      <select
        aria-label={monthLabel}
        value={month}
        onChange={(e) => onMonth(Number(e.target.value))}
        className="h-7 cursor-pointer rounded-md bg-transparent px-1 text-xs font-medium text-foreground focus:outline-none"
      >
        {monthNames.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
      <span className="text-foreground-tertiary">·</span>
      <select
        aria-label={yearLabel}
        value={year}
        onChange={(e) => onYear(Number(e.target.value))}
        className="h-7 cursor-pointer rounded-md bg-transparent px-1 text-xs font-medium tabular-nums text-foreground focus:outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Sub-component: KPI card with trend + accent ───────────────
type LucideIconType = typeof Banknote
function AccountingKpi({
  label,
  value,
  icon: Icon,
  trend,
  trendHint,
  accent,
  invertTrendColor = false,
}: {
  label: string
  value: string
  icon: LucideIconType
  trend?: number
  trendHint?: string
  accent: 'primary' | 'success' | 'warning'
  invertTrendColor?: boolean
}) {
  const accentStyles: Record<typeof accent, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-surface', text: 'text-primary' },
    success: { bg: 'bg-[#E1F5EE]', text: 'text-[#0F6E56]' },
    warning: { bg: 'bg-warning/15', text: 'text-warning' },
  }
  const up = (trend ?? 0) >= 0
  const positiveColor = invertTrendColor ? !up : up
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-foreground-secondary">{label}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
            accentStyles[accent].bg,
            accentStyles[accent].text,
          )}
        >
          <Icon size={18} strokeWidth={1.5} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-medium tabular-nums text-primary">{value}</p>
      {trend !== undefined ? (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-1 font-medium',
              positiveColor ? 'text-success' : 'text-danger',
            )}
          >
            {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {up ? '+' : ''}
            {trend}%
          </span>
          {trendHint ? (
            <span className="text-foreground-tertiary">{trendHint}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  )
}

// ─── Small helper: signed day delta (today → due_date) ─────────
function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00Z').getTime()
  const to = new Date(toIso + 'T00:00:00Z').getTime()
  return Math.round((to - from) / 86_400_000)
}
