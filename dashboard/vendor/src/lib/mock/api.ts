// Mock API layer for the vendor dashboard — async functions consumed
// by TanStack Query hooks. All responses are scoped to the current
// merchant. Same call sites later point at /api/v1/merchant endpoints.

import {
  branches,
  buildDailySeries,
  customers,
  financings,
  incomingRequests,
  payouts,
  products,
  staff,
  type Branch,
  type Customer,
  type Financing,
  type IncomingRequest,
  type Payout,
  type Product,
  type Staff,
} from './data'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export type DashboardData = {
  kpis: {
    monthSalesDzd: number
    totalFinancings: number
    pendingRequests: number
    pendingPayoutDzd: number
  }
  trends: { sales: number; financings: number; payout: number }
  sparks: { sales: number[]; financings: number[]; requests: number[]; payout: number[] }
  daily: { date: string; salesDzd: number }[]
  topProducts: { name: string; value: number }[]
  duration: { name: string; value: number; color: string }[]
}

const DURATION_COLOR: Record<string, string> = {
  '6': '#1D9E75',
  '12': '#0F6E56',
}

export async function fetchDashboard(): Promise<DashboardData> {
  await delay()
  const daily = buildDailySeries()

  const pendingPayout = payouts
    .filter((p) => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amountDzd, 0)

  // Top-5 selling products by financing count.
  const productCounts = new Map<string, number>()
  for (const f of financings) {
    productCounts.set(f.productName, (productCounts.get(f.productName) ?? 0) + 1)
  }
  const topProducts = [...productCounts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  // Financing-duration distribution.
  const durationCounts = new Map<string, number>()
  for (const f of financings) {
    const key = String(f.planMonths)
    durationCounts.set(key, (durationCounts.get(key) ?? 0) + 1)
  }
  const duration = [...durationCounts.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([name, value]) => ({ name, value, color: DURATION_COLOR[name] ?? '#888780' }))

  return {
    kpis: {
      monthSalesDzd: 575000,
      totalFinancings: financings.length,
      pendingRequests: incomingRequests.filter((r) => r.status === 'submitted').length,
      pendingPayoutDzd: pendingPayout,
    },
    trends: { sales: 14, financings: 9, payout: 6 },
    sparks: {
      sales: daily.slice(-12).map((d) => d.salesDzd),
      financings: [1, 0, 2, 1, 1, 2, 0, 1, 2, 1, 1, 2],
      requests: [2, 1, 3, 2, 1, 2, 3, 2, 1, 2, 3, 3],
      payout: [60000, 0, 90000, 55000, 0, 112000, 68000, 0, 90000, 55000, 0, 68000],
    },
    daily,
    topProducts,
    duration,
  }
}

export async function fetchRequests(): Promise<IncomingRequest[]> {
  await delay()
  return incomingRequests
}

export async function fetchRequest(reference: string): Promise<IncomingRequest | undefined> {
  await delay()
  return incomingRequests.find((r) => r.reference === reference)
}

export async function fetchFinancings(): Promise<Financing[]> {
  await delay()
  return financings
}

export async function fetchFinancing(reference: string): Promise<Financing | undefined> {
  await delay()
  return financings.find((f) => f.reference === reference)
}

export async function fetchPayouts(): Promise<Payout[]> {
  await delay()
  return payouts
}

export async function fetchPayout(reference: string): Promise<Payout | undefined> {
  await delay()
  return payouts.find((p) => p.reference === reference)
}

export async function fetchCustomers(): Promise<Customer[]> {
  await delay()
  return customers
}

export async function fetchCustomer(id: number): Promise<Customer | undefined> {
  await delay()
  return customers.find((c) => c.id === id)
}

export async function fetchProducts(): Promise<Product[]> {
  await delay()
  return products
}

export async function fetchBranches(): Promise<Branch[]> {
  await delay()
  return branches
}

export async function fetchStaff(): Promise<Staff[]> {
  await delay()
  return staff
}
