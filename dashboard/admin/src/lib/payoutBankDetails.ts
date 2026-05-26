import type { Merchant } from '@/lib/mock/data'
import type { PayoutMethod } from '@/lib/mock/data'

export type PayoutBankDetails = {
  ccpAccount?: string
  ccpKey?: string
  baridiRip?: string
  cashContact?: string
  cashAddress?: string
}

const BY_MERCHANT_ID: Record<number, PayoutBankDetails> = {
  1: {
    ccpAccount: '0012345678901234567890',
    ccpKey: '26',
    baridiRip: '0661234567',
    cashContact: 'طاهر بن طاهر',
    cashAddress: 'شارع الإمام مالك، حي 20 أوت، أدرار',
  },
  2: {
    ccpAccount: '0098765432109876543210',
    ccpKey: '14',
    baridiRip: '0551098220',
    cashContact: 'إلكترو أدرار',
    cashAddress: 'حي السلام، أدرار',
  },
  3: {
    ccpAccount: '0044556677889900112233',
    ccpKey: '08',
    baridiRip: '0662771403',
    cashContact: 'أثاث توات',
    cashAddress: 'شارع بريد العام، أدرار',
  },
  4: {
    baridiRip: '0770339187',
    cashContact: 'محل النور',
    cashAddress: 'حي السلام، رقان',
  },
}

export function getPayoutBankDetails(
  merchant: Merchant | undefined,
  method: PayoutMethod,
): PayoutBankDetails {
  const base = merchant ? BY_MERCHANT_ID[merchant.id] ?? {} : {}
  if (method === 'ccp_transfer') {
    return {
      ccpAccount: base.ccpAccount ?? '—',
      ccpKey: base.ccpKey ?? '—',
    }
  }
  if (method === 'baridi_mob') {
    return { baridiRip: base.baridiRip ?? merchant?.phone?.replace(/\D/g, '').slice(-10) ?? '—' }
  }
  return {
    cashContact: base.cashContact ?? merchant?.name ?? '—',
    cashAddress: base.cashAddress ?? merchant?.address ?? '—',
  }
}

export function computePayoutBreakdown(
  payoutDzd: number,
  commissionRate: number,
): { grossSaleDzd: number; commissionDzd: number; payoutDzd: number } {
  const rate = commissionRate / 100
  const grossSaleDzd = rate < 1 ? Math.round(payoutDzd / (1 - rate)) : payoutDzd
  const commissionDzd = grossSaleDzd - payoutDzd
  return { grossSaleDzd, commissionDzd, payoutDzd }
}
