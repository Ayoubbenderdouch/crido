// Mock API layer — async functions consumed by TanStack Query hooks.
// Same call sites will later point at the real /api/v1 endpoints.

import {
  buildDailySeries,
  clients,
  financingRequests,
  financings,
  merchants,
  payments,
  type Client,
  type Financing,
  type FinancingRequest,
  type Merchant,
  type Payment,
} from './data'

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms))

export type DashboardStats = {
  activeClients: number
  kycPending: number
  activeFinancings: number
  outstandingDzd: number
  pendingVerification: number
  monthRevenueDzd: number
  pendingVerifications: number
  adHocToVerify: number
}

export type InstallmentRow = {
  number: number
  dueDate: string
  amountDzd: number
  status: 'paid' | 'due' | 'scheduled' | 'late'
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay()
  const activeFin = financings.filter((f) => f.status === 'active' || f.status === 'late')
  return {
    activeClients: clients.filter((c) => c.kycStatus === 'approved').length,
    kycPending: clients.filter((c) => c.kycStatus === 'pending').length,
    activeFinancings: activeFin.length,
    outstandingDzd: activeFin.reduce((s, f) => s + f.remainingDzd, 0),
    pendingVerification: payments.filter((p) => p.status === 'pending_verification').length,
    monthRevenueDzd: 412000,
    pendingVerifications: payments.filter((p) => p.status === 'pending_verification').length,
    adHocToVerify: financingRequests.filter(
      (r) => r.merchantSource === 'ad_hoc' && r.status === 'submitted',
    ).length,
  }
}

export async function fetchDailySeries() {
  await delay()
  return buildDailySeries()
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
