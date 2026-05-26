import { merchantProfile } from '@/lib/mock/data'

/** Murabaha BNPL plans — client margin (هامش), not interest. */
export const BNPL_PLANS = [
  { months: 4 as const, clientMarginPct: 12 },
  { months: 6 as const, clientMarginPct: 15 },
  { months: 12 as const, clientMarginPct: 18 },
] as const

export type BnplPlanMonths = (typeof BNPL_PLANS)[number]['months']

export type BnplCalcResult = {
  planMonths: BnplPlanMonths
  clientMarginPct: number
  monthlyInstallment: number
  totalToCollect: number
  merchantPayout: number
  clientMargin: number
  merchantCommission: number
}

function roundHalfUp(value: number, decimals = 2): number {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * BNPL preview math per BUSINESS_RULES §1.2:
 * merchant_commission = principal × commission%
 * merchant_payout = principal − commission
 * client_margin = principal × margin%
 * total_to_collect = principal + client_margin
 * monthly_installment = total_to_collect / months (HALF-UP to 2 decimals)
 */
export function calcBnpl(
  principalDzd: number,
  planMonths: BnplPlanMonths,
  merchantCommissionPct: number = merchantProfile.commissionRate,
): BnplCalcResult | null {
  if (!Number.isFinite(principalDzd) || principalDzd <= 0) return null

  const plan = BNPL_PLANS.find((p) => p.months === planMonths)
  if (!plan) return null

  const merchantCommission = roundHalfUp(principalDzd * (merchantCommissionPct / 100))
  const merchantPayout = roundHalfUp(principalDzd - merchantCommission)
  const clientMargin = roundHalfUp(principalDzd * (plan.clientMarginPct / 100))
  const totalToCollect = roundHalfUp(principalDzd + clientMargin)
  const monthlyInstallment = roundHalfUp(totalToCollect / plan.months)

  return {
    planMonths: plan.months,
    clientMarginPct: plan.clientMarginPct,
    monthlyInstallment,
    totalToCollect,
    merchantPayout,
    clientMargin,
    merchantCommission,
  }
}

export function calcAllBnplPlans(
  principalDzd: number,
  merchantCommissionPct: number = merchantProfile.commissionRate,
): BnplCalcResult[] {
  return BNPL_PLANS.map((p) => calcBnpl(principalDzd, p.months, merchantCommissionPct)).filter(
    (r): r is BnplCalcResult => r != null,
  )
}
