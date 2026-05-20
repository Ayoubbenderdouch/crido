// Mock API layer — async functions consumed by TanStack Query hooks.
// Same call sites will later point at the real /api/v1 endpoints.

import {
  buildDailySeries,
  clients,
  collectionAccounts,
  financingRequests,
  financings,
  merchantPayouts,
  merchants,
  payments,
  settings,
  verificationQueue,
  type Client,
  type CollectionAccount,
  type Financing,
  type FinancingRequest,
  type Merchant,
  type MerchantPayout,
  type Payment,
  type SettingItem,
  type VerificationItem,
} from './data'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export type DashboardData = {
  kpis: {
    activeClients: number
    activeFinancings: number
    pendingVerification: number
    monthRevenueDzd: number
    kycPending: number
    outstandingDzd: number
  }
  trends: { clients: number; financings: number; revenue: number }
  sparks: { clients: number[]; financings: number[]; payments: number[]; revenue: number[] }
  daily: { date: string; financings: number; revenueDzd: number }[]
  weekly: { label: string; financings: number }[]
  portfolio: { name: string; value: number; color: string }[]
}

export type InstallmentRow = {
  number: number
  dueDate: string
  amountDzd: number
  status: 'paid' | 'due' | 'scheduled' | 'late'
}

const STATUS_COLOR: Record<string, string> = {
  active: '#1D9E75',
  late: '#EF9F27',
  completed: '#0F6E56',
  defaulted: '#E24B4A',
  cancelled: '#888780',
}

export async function fetchDashboard(): Promise<DashboardData> {
  await delay()
  const daily = buildDailySeries()
  const activeFin = financings.filter((f) => f.status === 'active' || f.status === 'late')

  const weekly: { label: string; financings: number }[] = []
  for (let i = 0; i < daily.length; i += 5) {
    const chunk = daily.slice(i, i + 5)
    weekly.push({
      label: `${chunk[0].date.slice(8, 10)}/${chunk[0].date.slice(5, 7)}`,
      financings: chunk.reduce((sum, d) => sum + d.financings, 0),
    })
  }

  const counts = new Map<string, number>()
  for (const f of financings) counts.set(f.status, (counts.get(f.status) ?? 0) + 1)
  const portfolio = [...counts.entries()].map(([name, value]) => ({
    name,
    value,
    color: STATUS_COLOR[name] ?? '#888780',
  }))

  return {
    kpis: {
      activeClients: clients.filter((c) => c.kycStatus === 'approved').length,
      activeFinancings: activeFin.length,
      pendingVerification: payments.filter((p) => p.status === 'pending_verification').length,
      monthRevenueDzd: 412000,
      kycPending: clients.filter((c) => c.kycStatus === 'pending').length,
      outstandingDzd: activeFin.reduce((sum, f) => sum + f.remainingDzd, 0),
    },
    trends: { clients: 12, financings: 8, revenue: 15 },
    sparks: {
      clients: [3, 4, 4, 5, 6, 6, 7, 7, 8, 9, 9, 10],
      financings: daily.slice(-12).map((d) => d.financings),
      payments: [2, 1, 3, 2, 4, 3, 2, 5, 3, 4, 3, 3],
      revenue: daily.slice(-12).map((d) => d.revenueDzd),
    },
    daily,
    weekly,
    portfolio,
  }
}

export async function fetchClients(): Promise<Client[]> {
  await delay()
  return clients
}

export async function fetchClient(id: number): Promise<Client | undefined> {
  await delay()
  return clients.find((c) => c.id === id)
}

export async function fetchMerchants(): Promise<Merchant[]> {
  await delay()
  return merchants
}

export async function fetchRequests(): Promise<FinancingRequest[]> {
  await delay()
  return financingRequests
}

export async function fetchRequest(reference: string): Promise<FinancingRequest | undefined> {
  await delay()
  return financingRequests.find((r) => r.reference === reference)
}

export async function fetchFinancings(): Promise<Financing[]> {
  await delay()
  return financings
}

export async function fetchPayments(): Promise<Payment[]> {
  await delay()
  return payments
}

/** Derive an installment schedule for a financing detail view. */
export function buildInstallments(f: Financing): InstallmentRow[] {
  const rows: InstallmentRow[] = []
  const start = new Date(f.activatedAt)
  for (let i = 1; i <= f.durationMonths; i++) {
    const due = new Date(start)
    due.setMonth(due.getMonth() + i)
    let status: InstallmentRow['status'] = 'scheduled'
    if (i <= f.paidInstallments) status = 'paid'
    else if (i === f.paidInstallments + 1) status = f.status === 'late' ? 'late' : 'due'
    rows.push({
      number: i,
      dueDate: due.toISOString().slice(0, 10),
      amountDzd: f.monthlyInstallmentDzd,
      status,
    })
  }
  return rows
}

export async function fetchMerchantPayouts(): Promise<MerchantPayout[]> {
  await delay()
  return merchantPayouts
}

export async function fetchVerifications(): Promise<VerificationItem[]> {
  await delay()
  return verificationQueue
}

export async function fetchCollections(): Promise<CollectionAccount[]> {
  await delay()
  return [...collectionAccounts].sort((a, b) => b.daysLate - a.daysLate)
}

export async function fetchSettings(): Promise<SettingItem[]> {
  await delay()
  return settings
}
