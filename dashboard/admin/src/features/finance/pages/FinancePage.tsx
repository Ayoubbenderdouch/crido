import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Megaphone,
  Server,
  Scale,
  Plus,
  Trash2,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Sparkles,
  Calculator,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/data/KpiCard'
import { TimeRangePicker } from '@/components/data/TimeRangePicker'
import { ActionModal, MODAL_TEXTAREA } from '@/components/data/ActionModal'
import {
  addOperatingExpense,
  deleteOperatingExpense,
  getOperatingExpenses,
  updateOperatingExpense,
  type ExpenseCategory,
  type OperatingExpense,
} from '@/lib/adminExpenseStore'
import { computeFinanceSummary, financeChartPoints, type PlLine } from '@/lib/financeCompute'
import { formatDzd, type Locale } from '@/lib/format'
import { loadStoredTimeRange, type TimeRangeId } from '@/lib/timeRange'
import { cn } from '@/lib/utils'

const EXPENSE_ICONS: Record<ExpenseCategory, typeof Building2> = {
  rent: Building2,
  salaries: Users,
  marketing: Megaphone,
  technology: Server,
  legal: Scale,
  operations: Wallet,
  other: Wallet,
}

const TABS = ['summary', 'expenses', 'cashflow'] as const
type Tab = (typeof TABS)[number]

const SELECT =
  'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

const QUICK_CATEGORIES: ExpenseCategory[] = [
  'rent',
  'salaries',
  'marketing',
  'technology',
  'legal',
  'operations',
]

const EMPTY_FORM = {
  category: 'rent' as ExpenseCategory,
  label: '',
  amountDzd: '',
  period: '2026-05',
  recurring: true,
  note: '',
}

export default function FinancePage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [range, setRange] = useState<TimeRangeId>(loadStoredTimeRange)
  const [tab, setTab] = useState<Tab>('summary')
  const [expenses, setExpenses] = useState(() => getOperatingExpenses())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const summary = useMemo(() => computeFinanceSummary(range, expenses), [range, expenses])
  const chartData = useMemo(() => financeChartPoints(range, expenses), [range, expenses])
  const periodLabel = t(`timeRange.${range}`)

  function refreshExpenses() {
    setExpenses(getOperatingExpenses())
  }

  function openAddModal(preset?: Partial<typeof EMPTY_FORM>) {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, ...preset })
    setModalOpen(true)
  }

  function openEditExpense(row: OperatingExpense) {
    setEditingId(row.id)
    setForm({
      category: row.category,
      label: row.label,
      amountDzd: String(row.amountDzd),
      period: row.period,
      recurring: row.recurring,
      note: row.note ?? '',
    })
    setModalOpen(true)
  }

  function submitExpense() {
    const amount = Number(String(form.amountDzd).replace(/\s/g, ''))
    if (!form.label.trim() || !amount || amount <= 0) {
      toast.error(t('finance.expense.validation'))
      return
    }
    const payload = {
      category: form.category,
      label: form.label.trim(),
      amountDzd: amount,
      period: form.period,
      recurring: form.recurring,
      note: form.note.trim() || null,
    }
    if (editingId) {
      updateOperatingExpense(editingId, payload)
      toast.success(t('finance.expense.updated'))
    } else {
      addOperatingExpense(payload)
      toast.success(t('finance.expense.added'))
    }
    refreshExpenses()
    setModalOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function removeExpense(id: string) {
    deleteOperatingExpense(id)
    refreshExpenses()
    toast.success(t('finance.expense.deleted'))
  }

  const netPositive = summary.result.netProfitDzd >= 0

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{t('finance.title')}</h1>
          <p className="mt-1 max-w-xl text-sm text-foreground-secondary">{t('finance.subtitle')}</p>
        </div>
        <TimeRangePicker value={range} onChange={setRange} />
      </div>

      <section
        className={cn(
          'mb-6 overflow-hidden rounded-2xl border p-6 shadow-sm',
          netPositive
            ? 'border-primary/25 bg-gradient-to-br from-primary/10 via-background to-background'
            : 'border-danger/25 bg-gradient-to-br from-danger/8 via-background to-background',
        )}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground-tertiary">
          {t('finance.netProfit')} · {periodLabel}
        </p>
        <p
          className={cn(
            'mt-2 text-4xl font-bold tabular-nums tracking-tight',
            netPositive ? 'text-primary' : 'text-danger',
          )}
        >
          {formatDzd(summary.result.netProfitDzd, locale)}
        </p>
        <p className="mt-2 text-sm text-foreground-secondary">
          {t('finance.netProfitHint', {
            revenue: formatDzd(summary.result.grossProfitCollectedDzd, locale),
            expenses: formatDzd(summary.result.operatingExpensesDzd, locale),
            margin: summary.result.marginPct,
          })}
        </p>
      </section>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t('finance.kpis.revenue')}
          value={formatDzd(summary.result.grossProfitCollectedDzd, locale)}
          icon={TrendingUp}
          accent="default"
        />
        <KpiCard
          label={t('finance.kpis.expenses')}
          value={formatDzd(summary.result.operatingExpensesDzd, locale)}
          icon={TrendingDown}
          accent="warning"
        />
        <KpiCard
          label={t('finance.kpis.collected')}
          value={formatDzd(summary.cashflow.clientCollectionsDzd, locale)}
          icon={ArrowDownLeft}
        />
        <KpiCard
          label={t('finance.kpis.disbursed')}
          value={formatDzd(summary.cashflow.merchantDisbursementsDzd, locale)}
          icon={ArrowUpRight}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={cn(
              'rounded-lg px-4 py-2 text-xs font-semibold transition-all',
              tab === tb ? 'bg-primary text-primary-fg shadow-sm' : 'text-foreground-secondary hover:bg-background',
            )}
          >
            {t(`finance.tabs.${tb}`)}
          </button>
        ))}
      </div>

      {tab === 'summary' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden p-0 lg:col-span-2">
            <div className="flex flex-col gap-4 border-b border-border bg-gradient-to-r from-warning/8 via-background to-primary-surface/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calculator size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t('finance.quick.title')}</p>
                  <p className="text-xs text-foreground-tertiary">{t('finance.quick.hint')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_CATEGORIES.map((cat) => {
                  const Icon = EXPENSE_ICONS[cat]
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        openAddModal({
                          category: cat,
                          label: t(`finance.quick.labels.${cat}`),
                          period: '2026-05',
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground-secondary transition hover:border-primary/40 hover:bg-primary-surface hover:text-primary"
                    >
                      <Icon size={14} />
                      <Plus size={12} />
                      {t(`finance.categories.${cat}`)}
                    </button>
                  )
                })}
                <Button size="sm" onClick={() => openAddModal()}>
                  <Plus size={16} className="me-1" />
                  {t('finance.expense.add')}
                </Button>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <PiggyBank size={18} className="text-primary" />
                  {t('finance.pl.title')}
                </h2>
                <p className="mt-0.5 text-xs text-foreground-tertiary">{t('finance.pl.hint')}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                <Sparkles size={12} />
                {t('finance.quick.live')}
              </span>
            </div>
            <dl className="divide-y divide-border px-5">
              {summary.plLines.map((line) => (
                <PlLineRow
                  key={line.key}
                  line={line}
                  locale={locale}
                  netPositive={netPositive}
                  expenseRows={summary.expenses.rows}
                  onEdit={openEditExpense}
                  onDelete={removeExpense}
                />
              ))}
              {summary.expenses.rows.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-foreground-tertiary">{t('finance.quick.empty')}</p>
                  <Button size="sm" className="mt-3" variant="secondary" onClick={() => openAddModal()}>
                    <Plus size={14} className="me-1" />
                    {t('finance.expense.add')}
                  </Button>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">{t('finance.chart.title')}</h2>
              <p className="text-xs text-foreground-tertiary">{t('timeRange.chartHint', { period: periodLabel })}</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888780' }} axisLine={false} tickLine={false} />
                  <YAxis
                    width={40}
                    tick={{ fontSize: 10, fill: '#888780' }}
                    tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => formatDzd(Number(v ?? 0), locale)}
                    contentStyle={{ borderRadius: 10, fontSize: 12 }}
                  />
                  <Legend />
                  <Bar dataKey="income" name={t('finance.chart.income')} fill="#0F6E56" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name={t('finance.chart.expenses')} fill="#EF9F27" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 text-sm font-semibold">{t('finance.revenueBreakdown')}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background-secondary/40 p-4">
                <p className="text-xs text-foreground-tertiary">{t('finance.revenue.commission')}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {formatDzd(summary.revenue.commissionsCollectedDzd, locale)}
                </p>
                <p className="mt-1 text-xs text-foreground-tertiary">
                  {t('finance.revenue.projected')}: {formatDzd(summary.revenue.commissionsProjectedDzd, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background-secondary/40 p-4">
                <p className="text-xs text-foreground-tertiary">{t('finance.revenue.margin')}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-foreground">
                  {formatDzd(summary.revenue.marginCollectedDzd, locale)}
                </p>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary-surface/30 p-4">
                <p className="text-xs text-primary">{t('finance.revenue.totalProjected')}</p>
                <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                  {formatDzd(summary.revenue.totalProjectedDzd, locale)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === 'expenses' ? (
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">{t('finance.expense.title')}</h2>
              <p className="text-xs text-foreground-tertiary">
                {t('finance.expense.total')}: {formatDzd(summary.expenses.totalDzd, locale)}
              </p>
            </div>
            <Button size="sm" onClick={() => openAddModal()}>
              <Plus size={16} className="me-1" />
              {t('finance.expense.add')}
            </Button>
          </div>
          <div className="divide-y divide-border">
            {summary.expenses.rows.length === 0 ? (
              <p className="p-8 text-center text-sm text-foreground-tertiary">{t('common.noResults')}</p>
            ) : (
              summary.expenses.rows.map((row) => (
                <ExpenseRow
                  key={row.id}
                  row={row}
                  locale={locale}
                  onEdit={() => openEditExpense(row)}
                  onDelete={() => removeExpense(row.id)}
                />
              ))
            )}
          </div>
        </Card>
      ) : null}

      {tab === 'cashflow' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">{t('finance.cashflow.title')}</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 rounded-lg bg-primary-surface/40 px-3 py-2">
                <dt className="text-foreground-secondary">{t('finance.cashflow.in')}</dt>
                <dd className="font-semibold tabular-nums text-primary">
                  {formatDzd(summary.cashflow.clientCollectionsDzd, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 rounded-lg bg-warning/10 px-3 py-2">
                <dt className="text-foreground-secondary">{t('finance.cashflow.out')}</dt>
                <dd className="font-semibold tabular-nums text-warning">
                  {formatDzd(summary.cashflow.merchantDisbursementsDzd, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt>{t('finance.cashflow.pendingPayouts')}</dt>
                <dd className="font-medium tabular-nums">
                  {formatDzd(summary.cashflow.pendingMerchantPayoutsDzd, locale)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t('finance.cashflow.outstanding')}</dt>
                <dd className="font-medium tabular-nums">
                  {formatDzd(summary.portfolio.outstandingDzd, locale)}
                </dd>
              </div>
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">{t('finance.portfolio.title')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{summary.portfolio.activeCount}</p>
                <p className="text-xs text-foreground-tertiary">{t('finance.portfolio.active')}</p>
              </div>
              <div className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-center">
                <p className="text-2xl font-bold text-danger">{summary.portfolio.defaultedCount}</p>
                <p className="text-xs text-foreground-tertiary">{t('finance.portfolio.defaulted')}</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">{t('finance.portfolio.hint')}</p>
          </Card>
        </div>
      ) : null}

      <ActionModal
        open={modalOpen}
        title={editingId ? t('finance.expense.edit') : t('finance.expense.add')}
        onClose={() => {
          setModalOpen(false)
          setEditingId(null)
          setForm(EMPTY_FORM)
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setModalOpen(false)
                setEditingId(null)
                setForm(EMPTY_FORM)
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button onClick={submitExpense}>
              {editingId ? t('finance.expense.save') : t('common.save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
              {t('finance.expense.category')}
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className={SELECT}
            >
              {(['rent', 'salaries', 'marketing', 'technology', 'legal', 'operations', 'other'] as const).map(
                (c) => (
                  <option key={c} value={c}>
                    {t(`finance.categories.${c}`)}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
              {t('finance.expense.label')}
            </label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className={SELECT}
              placeholder={t('finance.expense.labelPlaceholder')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
              {t('finance.expense.amount')}
            </label>
            <input
              value={form.amountDzd}
              onChange={(e) => setForm((f) => ({ ...f, amountDzd: e.target.value }))}
              className={SELECT}
              dir="ltr"
              inputMode="numeric"
              placeholder="85000"
            />
            {form.amountDzd ? (
              <p className="mt-1.5 text-xs text-primary">
                {t('finance.expense.preview', {
                  amount: formatDzd(Number(String(form.amountDzd).replace(/\s/g, '')) || 0, locale),
                })}
              </p>
            ) : null}
          </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
                {t('finance.expense.period')}
              </label>
              <input
                type="month"
                value={form.period}
                onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
                className={SELECT}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm((f) => ({ ...f, recurring: e.target.checked }))}
              className="rounded border-border"
            />
            {t('finance.expense.recurring')}
          </label>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground-tertiary">
              {t('finance.expense.note')}
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className={MODAL_TEXTAREA}
            />
          </div>
        </div>
      </ActionModal>
    </div>
  )
}

function PlLineRow({
  line,
  locale,
  netPositive,
  expenseRows,
  onEdit,
  onDelete,
}: {
  line: PlLine
  locale: Locale
  netPositive: boolean
  expenseRows: OperatingExpense[]
  onEdit: (row: OperatingExpense) => void
  onDelete: (id: string) => void
}) {
  const { t } = useTranslation()
  const isTotal = line.type === 'total'
  const isSub = line.type === 'subtotal'
  const isExpense = line.type === 'out' && line.expenseId
  const expense = isExpense ? expenseRows.find((e) => e.id === line.expenseId) : undefined
  const Icon = line.category ? EXPENSE_ICONS[line.category] : null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 py-3',
        isTotal && 'bg-primary-surface/40 -mx-5 px-5 py-4',
        isSub && 'font-medium',
        isExpense && 'group hover:bg-background-secondary/40',
      )}
    >
      <dt
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 text-sm',
          line.type === 'in' && 'text-foreground-secondary',
          isTotal && 'text-base font-semibold text-primary',
        )}
      >
        {Icon ? (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <Icon size={14} />
          </span>
        ) : null}
        <span className="truncate">
          {line.labelText ?? t(`finance.pl.${line.key}`)}
        </span>
      </dt>
      <dd className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            'tabular-nums text-sm font-medium',
            line.type === 'in' && 'text-primary',
            (line.type === 'out' || line.key === 'expenseSubtotal') && 'text-warning',
            isTotal && 'text-lg font-bold',
            isTotal && (netPositive ? 'text-primary' : 'text-danger'),
          )}
        >
          {line.type === 'out' || line.key === 'expenseSubtotal'
            ? `−${formatDzd(line.amountDzd, locale)}`
            : formatDzd(line.amountDzd, locale)}
        </span>
        {expense ? (
          <span className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="rounded-lg p-1.5 text-foreground-tertiary hover:bg-primary-surface hover:text-primary"
              aria-label={t('finance.expense.edit')}
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense.id)}
              className="rounded-lg p-1.5 text-foreground-tertiary hover:bg-danger/10 hover:text-danger"
              aria-label={t('common.delete')}
            >
              <Trash2 size={14} />
            </button>
          </span>
        ) : null}
      </dd>
    </div>
  )
}

function ExpenseRow({
  row,
  locale,
  onEdit,
  onDelete,
}: {
  row: OperatingExpense
  locale: Locale
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const Icon = EXPENSE_ICONS[row.category]

  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-background-secondary/30">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-surface text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{row.label}</p>
        <p className="text-xs text-foreground-tertiary">
          {t(`finance.categories.${row.category}`)} · {row.period}
          {row.recurring ? ` · ${t('finance.expense.recurringBadge')}` : ''}
        </p>
        {row.note ? <p className="mt-0.5 text-xs text-foreground-secondary">{row.note}</p> : null}
      </div>
      <p className="text-lg font-bold tabular-nums text-warning">{formatDzd(row.amountDzd, locale)}</p>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-foreground-tertiary transition hover:bg-primary-surface hover:text-primary"
        aria-label={t('finance.expense.edit')}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-foreground-tertiary transition hover:bg-danger/10 hover:text-danger"
        aria-label={t('common.delete')}
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
