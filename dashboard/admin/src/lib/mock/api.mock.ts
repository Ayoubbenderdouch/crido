// Mock API layer — async functions consumed by TanStack Query hooks.
// Same call sites will later point at the real /api/v1 endpoints.

import {
  getFinancingRequests,
  getRequestByRef,
} from '@/lib/adminRequestStore'
import { getPaymentByRef, getPayments } from '@/lib/adminPaymentStore'
import { getMerchantPayouts, getPayoutByRef } from '@/lib/adminPayoutStore'
import { findMerchantByName } from '@/lib/financingLookup'
import {
  buildDailySeries,
  clients,
  collectionAccounts,
  financings,
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
  const last30 = daily.slice(-30)

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
      financings: last30.slice(-12).map((d) => d.financings),
      payments: [2, 1, 3, 2, 4, 3, 2, 5, 3, 4, 3, 3],
      revenue: last30.slice(-12).map((d) => d.revenueDzd),
    },
    daily,
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

export async function fetchMerchant(id: number): Promise<Merchant | undefined> {
  await delay()
  return merchants.find((m) => m.id === id)
}

export async function fetchRequests(): Promise<FinancingRequest[]> {
  await delay()
  return getFinancingRequests()
}

export async function fetchRequest(reference: string): Promise<FinancingRequest | undefined> {
  await delay()
  return getRequestByRef(reference)
}

export type RequestContext = {
  request: FinancingRequest
  client: Client
  merchant: Merchant | null
  verification: VerificationItem | null
}

export async function fetchRequestContext(reference: string): Promise<RequestContext | undefined> {
  await delay()
  const request = getRequestByRef(reference)
  if (!request) return undefined

  const client = clients.find((c) => c.id === request.clientId)
  if (!client) return undefined

  const verification =
    verificationQueue.find((v) => v.requestRef === reference) ?? null

  let merchant: Merchant | null = merchants.find((m) => m.name === request.merchantName) ?? null

  if (!merchant && request.merchantSource === 'partner') {
    merchant = merchants.find((m) => request.merchantName.includes(m.name)) ?? null
  }

  return { request, client, merchant, verification }
}

export type ProposedMerchantContext = {
  verification: VerificationItem
  request: FinancingRequest | null
  requestCount: number
  totalVolumeDzd: number
}

export async function fetchProposedMerchant(
  requestRef: string,
): Promise<ProposedMerchantContext | undefined> {
  await delay()
  const verification = verificationQueue.find((v) => v.requestRef === requestRef)
  if (!verification) return undefined

  const request = getRequestByRef(requestRef) ?? null
  const related = getFinancingRequests().filter(
    (r) =>
      r.merchantSource === 'ad_hoc' &&
      (r.reference === requestRef ||
        r.merchantName.includes(verification.proposedMerchantName.slice(0, 8))),
  )

  return {
    verification,
    request,
    requestCount: Math.max(1, related.length),
    totalVolumeDzd: related.reduce((sum, r) => sum + r.amountDzd, 0),
  }
}

export async function fetchFinancings(): Promise<Financing[]> {
  await delay()
  return financings
}

export async function fetchFinancing(reference: string): Promise<Financing | undefined> {
  await delay()
  return financings.find((f) => f.reference === reference)
}

export type FinancingDetailContext = {
  financing: Financing
  installments: InstallmentRow[]
  payments: Payment[]
}

export async function fetchFinancingContext(
  reference: string,
): Promise<FinancingDetailContext | undefined> {
  await delay()
  const financing = financings.find((f) => f.reference === reference)
  if (!financing) return undefined
  return {
    financing,
    installments: buildInstallments(financing),
    payments: payments.filter((p) => p.financingRef === reference),
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  await delay()
  return getPayments()
}

export type PaymentDetailContext = {
  payment: Payment
  financing: Financing | undefined
}

export async function fetchPaymentContext(
  reference: string,
): Promise<PaymentDetailContext | undefined> {
  await delay()
  const payment = getPaymentByRef(reference)
  if (!payment) return undefined
  const financing = financings.find((f) => f.reference === payment.financingRef)
  return { payment, financing }
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

export type PayoutDetailContext = {
  payout: MerchantPayout
  financing?: Financing
  merchant?: Merchant
}

export async function fetchMerchantPayouts(): Promise<MerchantPayout[]> {
  await delay()
  return getMerchantPayouts()
}

export async function fetchPayoutContext(
  reference: string,
): Promise<PayoutDetailContext | undefined> {
  await delay()
  const payout = getPayoutByRef(reference)
  if (!payout) return undefined
  const financing = financings.find((f) => f.reference === payout.financingRef)
  const merchant = findMerchantByName(payout.merchantName)
  return { payout, financing, merchant }
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
