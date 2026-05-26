import { buildDailySeries, financings, type Financing } from '@/lib/mock/data'
import { getMerchantPayouts } from '@/lib/adminPayoutStore'
import { getPayments } from '@/lib/adminPaymentStore'
import type { OperatingExpense, ExpenseCategory } from '@/lib/adminExpenseStore'
import { filterByRange, sumNumeric, type TimeRangeId } from '@/lib/timeRange'

export type FinancingEconomics = {
  principalDzd: number
  commissionDzd: number
  marginDzd: number
  totalProfitDzd: number
  collectedProfitDzd: number
  remainingProfitDzd: number
}

export function economicsForFinancing(f: Financing): FinancingEconomics {
  const marginPct = f.durationMonths >= 12 ? 15 : f.durationMonths >= 6 ? 8 : 5
  const principalDzd = Math.round(f.totalToCollectDzd / (1 + marginPct / 100))
  const marginDzd = f.totalToCollectDzd - principalDzd
  const commissionDzd = Math.round(principalDzd * 0.05)
  const totalProfitDzd = commissionDzd + marginDzd
  const ratio = f.totalToCollectDzd > 0 ? f.paidAmountDzd / f.totalToCollectDzd : 0
  const collectedProfitDzd = Math.round(totalProfitDzd * ratio)
  return {
    principalDzd,
    commissionDzd,
    marginDzd,
    totalProfitDzd,
    collectedProfitDzd,
    remainingProfitDzd: totalProfitDzd - collectedProfitDzd,
  }
}

function periodsInRange(range: TimeRangeId, anchor = '2026-05-20'): string[] {
  const daily = filterByRange(buildDailySeries(), range, anchor)
  const months = new Set<string>()
  for (const d of daily) months.add(d.date.slice(0, 7))
  return [...months].sort()
}

function expenseInRange(e: OperatingExpense, range: TimeRangeId): boolean {
  const months = periodsInRange(range)
  if (months.length === 0) return e.period === anchorMonth()
  return months.includes(e.period)
}

function anchorMonth(): string {
  return '2026-05'
}

export type FinanceSummary = {
  range: TimeRangeId
  revenue: {
    chartRevenueDzd: number
    commissionsProjectedDzd: number
    commissionsCollectedDzd: number
    marginCollectedDzd: number
    totalCollectedDzd: number
    totalProjectedDzd: number
  }
  cashflow: {
    clientCollectionsDzd: number
    merchantDisbursementsDzd: number
    pendingMerchantPayoutsDzd: number
  }
  portfolio: {
    outstandingDzd: number
    activeCount: number
    defaultedCount: number
  }
  expenses: {
    byCategory: Record<ExpenseCategory, number>
    totalDzd: number
    rows: OperatingExpense[]
  }
  result: {
    grossProfitCollectedDzd: number
    operatingExpensesDzd: number
    netProfitDzd: number
    marginPct: number
  }
  plLines: PlLine[]
}

export type PlLine = {
  key: string
  amountDzd: number
  type: 'in' | 'out' | 'subtotal' | 'total'
  /** Custom row label (expense lines) */
  labelText?: string
  expenseId?: string
  category?: ExpenseCategory
}

export function computeFinanceSummary(
  range: TimeRangeId,
  operatingExpenses: OperatingExpense[],
): FinanceSummary {
  const daily = filterByRange(buildDailySeries(), range)
  const chartRevenueDzd = sumNumeric(daily, 'revenueDzd')

  let commissionsProjectedDzd = 0
  let commissionsCollectedDzd = 0
  let marginCollectedDzd = 0
  let totalCollectedDzd = 0
  let totalProjectedDzd = 0

  for (const f of financings) {
    const e = economicsForFinancing(f)
    commissionsProjectedDzd += e.commissionDzd
    commissionsCollectedDzd += Math.round(e.commissionDzd * (f.paidAmountDzd / Math.max(f.totalToCollectDzd, 1)))
    marginCollectedDzd += Math.round(e.marginDzd * (f.paidAmountDzd / Math.max(f.totalToCollectDzd, 1)))
    totalCollectedDzd += e.collectedProfitDzd
    totalProjectedDzd += e.totalProfitDzd
  }

  const allPayments = getPayments()
  const clientCollectionsDzd = allPayments
    .filter((p) => p.status === 'verified')
    .reduce((s, p) => s + p.amountDzd, 0)

  const payouts = getMerchantPayouts()
  const merchantDisbursementsDzd = payouts
    .filter((p) => p.status === 'paid')
    .reduce((s, p) => s + p.amountDzd, 0)
  const pendingMerchantPayoutsDzd = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((s, p) => s + p.amountDzd, 0)

  const outstandingDzd = financings.reduce((s, f) => s + f.remainingDzd, 0)
  const activeCount = financings.filter((f) => f.status === 'active' || f.status === 'late').length
  const defaultedCount = financings.filter((f) => f.status === 'defaulted').length

  const expenseRows = operatingExpenses.filter((e) => expenseInRange(e, range))
  const byCategory = {} as Record<ExpenseCategory, number>
  for (const row of expenseRows) {
    byCategory[row.category] = (byCategory[row.category] ?? 0) + row.amountDzd
  }
  const operatingExpensesDzd = expenseRows.reduce((s, e) => s + e.amountDzd, 0)

  const revenueSubtotalDzd = commissionsCollectedDzd + marginCollectedDzd
  const grossProfitCollectedDzd = revenueSubtotalDzd

  const netProfitDzd = revenueSubtotalDzd - operatingExpensesDzd
  const marginPct =
    revenueSubtotalDzd > 0
      ? Math.round((netProfitDzd / revenueSubtotalDzd) * 1000) / 10
      : 0

  const plLines: PlLine[] = [
    { key: 'commissionCollected', amountDzd: commissionsCollectedDzd, type: 'in' },
    { key: 'marginCollected', amountDzd: marginCollectedDzd, type: 'in' },
    { key: 'revenueSubtotal', amountDzd: revenueSubtotalDzd, type: 'subtotal' },
    ...expenseRows.map((e) => ({
      key: e.id,
      expenseId: e.id,
      labelText: e.label,
      category: e.category,
      amountDzd: e.amountDzd,
      type: 'out' as const,
    })),
    { key: 'expenseSubtotal', amountDzd: operatingExpensesDzd, type: 'subtotal' },
    { key: 'netProfit', amountDzd: netProfitDzd, type: 'total' },
  ]

  return {
    range,
    revenue: {
      chartRevenueDzd,
      commissionsProjectedDzd,
      commissionsCollectedDzd,
      marginCollectedDzd,
      totalCollectedDzd,
      totalProjectedDzd,
    },
    cashflow: {
      clientCollectionsDzd,
      merchantDisbursementsDzd,
      pendingMerchantPayoutsDzd,
    },
    portfolio: { outstandingDzd, activeCount, defaultedCount },
    expenses: { byCategory, totalDzd: operatingExpensesDzd, rows: expenseRows },
    result: { grossProfitCollectedDzd, operatingExpensesDzd, netProfitDzd, marginPct },
    plLines,
  }
}

/** Income vs expense bars for chart */
export function financeChartPoints(
  range: TimeRangeId,
  operatingExpenses: OperatingExpense[],
): Array<{ label: string; income: number; expenses: number }> {
  const daily = filterByRange(buildDailySeries(), range)
  const monthTotal = operatingExpenses
    .filter((e) => expenseInRange(e, range))
    .reduce((s, e) => s + e.amountDzd, 0)
  const perDay = daily.length > 0 ? monthTotal / daily.length : 0
  return daily.map((d) => ({
    label: d.date.slice(5),
    income: d.revenueDzd,
    expenses: Math.round(perDay * 0.85 + d.financings * 800),
  }))
}
