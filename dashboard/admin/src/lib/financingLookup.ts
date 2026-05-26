import { clients, merchants, type Client, type Financing, type Merchant } from '@/lib/mock/data'

export function findClientByName(name: string): Client | undefined {
  return clients.find((c) => c.name === name)
}

export function findMerchantByName(name: string): Merchant | undefined {
  const clean = name.replace(/\s*\(مقترح\)\s*/g, '').trim()
  return (
    merchants.find((m) => m.name === name || m.name === clean || name.includes(m.name)) ??
    undefined
  )
}

export function merchantHref(name: string): string | null {
  const m = findMerchantByName(name)
  if (m) return `/merchants/${m.id}`
  return null
}

export function clientHref(name: string): string | null {
  const c = findClientByName(name)
  if (c) return `/clients/${c.id}`
  return null
}

export type FinancingPortfolioStats = {
  total: number
  active: number
  late: number
  completed: number
  defaulted: number
  outstandingDzd: number
  collectedDzd: number
}

export function computePortfolioStats(rows: Financing[]): FinancingPortfolioStats {
  return {
    total: rows.length,
    active: rows.filter((f) => f.status === 'active').length,
    late: rows.filter((f) => f.status === 'late').length,
    completed: rows.filter((f) => f.status === 'completed').length,
    defaulted: rows.filter((f) => f.status === 'defaulted').length,
    outstandingDzd: rows.reduce((s, f) => s + f.remainingDzd, 0),
    collectedDzd: rows.reduce((s, f) => s + f.paidAmountDzd, 0),
  }
}
