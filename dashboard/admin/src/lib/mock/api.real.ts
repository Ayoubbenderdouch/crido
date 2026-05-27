// Real backend adapter for the legacy mock-API surface.
//
// Pages still import `fetchClients`, `fetchDashboard`, etc. from this module.
// In `real` mode the dispatcher (`./api.ts`) re-exports from here. Each
// function below calls the modular real API and shapes the response back into
// the mock data types declared in `./data.ts`.
//
// The backend is still empty in this sprint — empty arrays / zero stats are
// the expected output for most endpoints.

import * as authApi from '../api/auth'
import * as dashApi from '../api/dashboard'
import * as clientsApi from '../api/clients'
import * as merchantsApi from '../api/merchants'
import * as verifyApi from '../api/merchantVerifications'
import * as requestsApi from '../api/financingRequests'
import * as financingsApi from '../api/financings'
import * as paymentsApi from '../api/payments'
import * as payoutsApi from '../api/payouts'
import * as settingsApi from '../api/settings'
import {
  type Client,
  type CollectionAccount,
  type CreditTier,
  type EmploymentStatus,
  type Financing,
  type FinancingRequest,
  type FinancingStatus,
  type KycStatus,
  type Merchant,
  type MerchantPayout,
  type MerchantSource,
  type MerchantStatus,
  type Payment,
  type PaymentMethod,
  type PaymentStatus,
  type PayoutMethod,
  type PayoutStatus,
  type RequestStatus,
  type SettingItem,
  type SettingCategory,
  type SettingUnit,
  type VerificationItem,
  type MerchantVerification,
} from './data'
import { merchantVerifications as merchantVerificationsMock } from './data'
import type { Enum } from '../api/types'

void authApi // keep import for re-exporting elsewhere if needed

// ─── Small helpers ──────────────────────────────────────────────

function enumValue<T extends string>(e: Enum | null | undefined, fallback: T): T {
  return ((e?.value ?? fallback) as T)
}

const STATUS_COLOR: Record<string, string> = {
  active: '#1D9E75',
  late: '#EF9F27',
  completed: '#0F6E56',
  defaulted: '#E24B4A',
  cancelled: '#888780',
}

// ─── Type adapters ──────────────────────────────────────────────

function adaptClient(c: clientsApi.AdminClient): Client {
  const name = c.user?.full_name ?? c.full_name ?? '—'
  const phone = c.user?.phone ?? c.phone ?? ''
  return {
    id: c.id,
    name,
    phone,
    nationalId: c.nin_18digits ?? c.national_id_number ?? '',
    wilaya: c.wilaya?.name_ar ?? 'أدرار',
    commune: c.commune?.name_ar ?? '—',
    kycStatus: enumValue<KycStatus>(c.kyc_status, 'not_started'),
    tier: (c.credit_tier?.value as CreditTier) ?? 'C',
    creditScore: c.credit_score ?? 0,
    creditLimitDzd: Number(c.credit_limit_dzd ?? 0),
    usedCreditDzd: Number(c.used_credit_dzd ?? 0),
    activeFinancings: c.active_financings_count ?? 0,
    employmentStatus: (c.employment_status?.value as EmploymentStatus) ?? 'other',
    employer: c.employer_name ?? null,
    monthlyIncomeDzd: c.monthly_income_dzd ?? null,
    // Backend does not yet aggregate the current-month installment sum.
    // TODO(backend): expose `current_monthly_debt_dzd` so debt-ratio computes server-side.
    currentMonthlyDebtDzd: 0,
    dateOfBirth: c.date_of_birth ?? '',
    address: c.address ?? '',
    createdAt: c.created_at ?? '',
    lastActivityAt: c.last_activity_at ?? c.updated_at ?? c.created_at ?? '',
  }
}

function adaptMerchant(m: merchantsApi.AdminMerchant): Merchant {
  const name = m.business_name_ar ?? m.business_name ?? '—'
  return {
    id: m.id,
    slug: m.slug ?? String(m.id),
    name,
    nameFr: m.business_name_fr ?? null,
    tagline: m.tagline ?? null,
    description: m.description ?? m.description_ar ?? null,
    source: enumValue<MerchantSource>(m.source, 'partner'),
    status: enumValue<MerchantStatus>(m.status, 'pending'),
    phone: m.phone ?? '',
    email: m.email ?? null,
    website: m.website ?? null,
    wilaya: m.wilaya?.name_ar ?? 'أدرار',
    commune: m.commune?.name_ar ?? '—',
    address: m.address ?? '',
    category: m.category?.name_ar ?? '—',
    rc: m.rc_number ?? null,
    nif: m.nif_number ?? null,
    totalSalesDzd: Number(m.total_sales_dzd ?? 0),
    totalFinancings: m.total_financings ?? 0,
    monthSalesDzd: Number(m.month_sales_dzd ?? 0),
    pendingPayoutDzd: Number(m.pending_payout_dzd ?? 0),
    commissionRate: Number(m.commission_rate ?? m.commission_rate_default ?? 5),
    branchesCount: m.branches_count ?? 0,
    productsCount: m.products_count ?? 0,
    staffCount: m.staff_count ?? 0,
    joinedAt: m.approved_at ?? m.created_at ?? '',
    lastActivityAt: m.last_activity_at ?? m.created_at ?? '',
    createdAt: m.created_at ?? '',
  }
}

function adaptRequest(r: requestsApi.FinancingRequest): FinancingRequest {
  const clientName =
    r.client?.user?.full_name ?? r.client?.full_name ?? '—'
  const merchantName =
    r.merchant?.business_name_ar ??
    r.merchant?.business_name ??
    r.proposed_merchant_name ??
    '—'
  return {
    reference: r.reference,
    clientId: r.client?.id ?? r.client_id ?? 0,
    clientName,
    clientTier: (r.client?.credit_tier?.value as CreditTier) ?? 'C',
    merchantName,
    merchantSource: enumValue<MerchantSource>(r.merchant_source, 'partner'),
    productName: r.product_name,
    amountDzd: Number(r.product_amount_dzd ?? 0),
    planMonths: r.plan?.duration_months ?? 12,
    status: enumValue<RequestStatus>(r.status, 'submitted'),
    createdAt: r.created_at,
  }
}

function adaptFinancing(f: financingsApi.Financing): Financing {
  const clientName =
    f.client?.user?.full_name ?? f.client?.full_name ?? '—'
  const merchantName =
    f.merchant?.business_name_ar ?? f.merchant?.business_name ?? '—'
  const productName = f.product_name ?? f.request?.product_name ?? '—'
  const remaining =
    f.remaining_amount_dzd ?? f.remaining_dzd ?? 0
  const paidInstallments =
    f.paid_installments_count ?? f.paid_installments ?? 0
  return {
    reference: f.reference,
    clientName,
    merchantName,
    productName,
    totalToCollectDzd: Number(f.total_to_collect_dzd ?? 0),
    paidAmountDzd: Number(f.paid_amount_dzd ?? 0),
    remainingDzd: Number(remaining),
    monthlyInstallmentDzd: Number(f.monthly_installment_dzd ?? 0),
    durationMonths: f.duration_months,
    paidInstallments,
    nextDueDate: f.next_due_date ?? f.first_due_date ?? '',
    status: enumValue<FinancingStatus>(f.status, 'active'),
    activatedAt: f.activated_at,
  }
}

function adaptPayment(p: paymentsApi.Payment): Payment {
  return {
    reference: p.reference,
    clientName: p.client?.full_name ?? '—',
    financingRef: p.financing?.reference ?? '',
    amountDzd: Number(p.amount_dzd ?? 0),
    method: enumValue<PaymentMethod>(p.method, 'ccp'),
    externalRef: p.external_reference ?? '—',
    status: enumValue<PaymentStatus>(p.status, 'pending_verification'),
    submittedAt: p.submitted_at ?? p.proof_uploaded_at ?? p.created_at ?? '',
  }
}

function adaptPayout(p: payoutsApi.Payout): MerchantPayout {
  const merchantName =
    p.merchant?.business_name_ar ?? p.merchant?.business_name ?? '—'
  return {
    reference: p.reference,
    merchantName,
    customerName: p.client?.full_name ?? '—',
    financingRef: p.financing?.reference ?? '',
    amountDzd: Number(p.amount_dzd ?? 0),
    method: enumValue<PayoutMethod>(p.method, 'ccp_transfer'),
    status: enumValue<PayoutStatus>(p.status, 'pending'),
    createdAt: p.created_at,
    paidAt: p.paid_at ?? null,
  }
}

function adaptVerification(v: verifyApi.MerchantVerification): VerificationItem {
  return {
    requestRef: v.request_reference ?? String(v.request_id ?? ''),
    productName: '—',
    proposedMerchantName: v.proposed_merchant_name ?? '—',
    proposedMerchantPhone: v.proposed_merchant_phone ?? v.called_phone ?? '',
    proposedMerchantAddress: v.proposed_merchant_address ?? '',
    clientName: v.customer_name ?? '—',
    clientPhone: v.customer_phone ?? '',
    amountDzd: Number(v.amount_dzd ?? 0),
    planMonths: v.plan_months ?? 12,
    submittedAt: v.created_at,
  }
}

// ─── Dashboard types (kept identical to mock) ──────────────────

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

// ─── API surface ───────────────────────────────────────────────

export async function fetchDashboard(): Promise<DashboardData> {
  const [stats, revenueChart, financingsChart] = await Promise.all([
    dashApi.fetchStats(),
    dashApi.fetchChart('revenue', '30d').catch(() => null),
    dashApi.fetchChart('financings', '30d').catch(() => null),
  ])

  const dailyRevenue = revenueChart?.series ?? []
  const dailyFinancings = financingsChart?.series ?? []

  // Stitch both series into the mock's "daily" shape, indexed by date.
  const map = new Map<string, { date: string; financings: number; revenueDzd: number }>()
  for (const r of dailyRevenue) {
    map.set(r.date, { date: r.date, financings: 0, revenueDzd: Number(r.value ?? 0) })
  }
  for (const r of dailyFinancings) {
    const existing = map.get(r.date)
    if (existing) existing.financings = Number(r.value ?? 0)
    else map.set(r.date, { date: r.date, financings: Number(r.value ?? 0), revenueDzd: 0 })
  }
  const daily = [...map.values()].sort((a, b) => a.date.localeCompare(b.date))

  const portfolioRaw = [
    { name: 'active', value: stats.financings.active },
    { name: 'completed', value: stats.financings.completed },
    { name: 'defaulted', value: stats.financings.defaulted },
  ].filter((p) => p.value > 0)
  const portfolio = portfolioRaw.map((p) => ({
    ...p,
    color: STATUS_COLOR[p.name] ?? '#888780',
  }))

  const last12 = daily.slice(-12)
  return {
    kpis: {
      activeClients: stats.clients.active,
      activeFinancings: stats.financings.active,
      pendingVerification: stats.payments.pending_verification,
      monthRevenueDzd: Number(stats.revenue.mtd_dzd ?? 0),
      kycPending: stats.clients.kyc_pending,
      outstandingDzd: Number(stats.financings.total_outstanding_dzd ?? 0),
    },
    trends: { clients: 0, financings: 0, revenue: 0 },
    sparks: {
      clients: [],
      financings: last12.map((d) => d.financings),
      payments: [],
      revenue: last12.map((d) => d.revenueDzd),
    },
    daily,
    portfolio,
  }
}

export async function fetchClients(): Promise<Client[]> {
  const res = await clientsApi.listClients({ per_page: 100 })
  return res.data.map(adaptClient)
}

export async function fetchClient(id: number): Promise<Client | undefined> {
  try {
    const c = await clientsApi.getClient(id)
    return adaptClient(c)
  } catch {
    return undefined
  }
}

export async function fetchMerchants(): Promise<Merchant[]> {
  const res = await merchantsApi.listMerchants({ per_page: 100 })
  return res.data.map(adaptMerchant)
}

export async function fetchMerchant(id: number): Promise<Merchant | undefined> {
  try {
    const m = await merchantsApi.getMerchant(id)
    return adaptMerchant(m)
  } catch {
    return undefined
  }
}

export async function fetchRequests(): Promise<FinancingRequest[]> {
  const res = await requestsApi.listRequests({ per_page: 100 })
  return res.data.map(adaptRequest)
}

export async function fetchRequest(
  reference: string,
): Promise<FinancingRequest | undefined> {
  try {
    const r = await requestsApi.getRequest(reference)
    return adaptRequest(r)
  } catch {
    return undefined
  }
}

export type RequestContext = {
  request: FinancingRequest
  client: Client
  merchant: Merchant | null
  verification: VerificationItem | null
}

export async function fetchRequestContext(
  reference: string,
): Promise<RequestContext | undefined> {
  try {
    const raw = await requestsApi.getRequest(reference)
    const request = adaptRequest(raw)
    if (!raw.client) return undefined
    const client = await fetchClient(raw.client.id)
    if (!client) return undefined
    const merchant = raw.merchant ? await fetchMerchant(raw.merchant.id) ?? null : null
    let verification: VerificationItem | null = null
    if (request.merchantSource === 'ad_hoc') {
      try {
        const vres = await verifyApi.listVerifications({ per_page: 100 })
        const found = vres.data.find((v) => v.request_reference === reference)
        verification = found ? adaptVerification(found) : null
      } catch {
        verification = null
      }
    }
    return { request, client, merchant, verification }
  } catch {
    return undefined
  }
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
  try {
    const vres = await verifyApi.listVerifications({ per_page: 100 })
    const v = vres.data.find((x) => x.request_reference === requestRef)
    if (!v) return undefined
    const request = await fetchRequest(requestRef).catch(() => null)
    return {
      verification: adaptVerification(v),
      request: request ?? null,
      requestCount: 1,
      totalVolumeDzd: request?.amountDzd ?? 0,
    }
  } catch {
    return undefined
  }
}

export async function fetchFinancings(): Promise<Financing[]> {
  const res = await financingsApi.listFinancings({ per_page: 100 })
  return res.data.map(adaptFinancing)
}

export async function fetchFinancing(
  reference: string,
): Promise<Financing | undefined> {
  try {
    const f = await financingsApi.getFinancing(reference)
    return adaptFinancing(f)
  } catch {
    return undefined
  }
}

export type FinancingDetailContext = {
  financing: Financing
  installments: InstallmentRow[]
  payments: Payment[]
}

export async function fetchFinancingContext(
  reference: string,
): Promise<FinancingDetailContext | undefined> {
  try {
    const raw = await financingsApi.getFinancing(reference)
    const financing = adaptFinancing(raw)
    const installments = buildInstallments(financing)
    let pays: Payment[] = []
    try {
      const p = await paymentsApi.listPayments({ per_page: 100 })
      pays = p.data
        .filter((x) => x.financing?.reference === reference)
        .map(adaptPayment)
    } catch {
      pays = []
    }
    return { financing, installments, payments: pays }
  } catch {
    return undefined
  }
}

export async function fetchPayments(): Promise<Payment[]> {
  const res = await paymentsApi.listPayments({ per_page: 100 })
  return res.data.map(adaptPayment)
}

export type PaymentDetailContext = {
  payment: Payment
  financing: Financing | undefined
}

export async function fetchPaymentContext(
  reference: string,
): Promise<PaymentDetailContext | undefined> {
  try {
    const p = await paymentsApi.getPayment(reference)
    const payment = adaptPayment(p)
    let financing: Financing | undefined
    if (p.financing?.reference) {
      financing = await fetchFinancing(p.financing.reference)
    }
    return { payment, financing }
  } catch {
    return undefined
  }
}

/** Derive an installment schedule for a financing detail view. */
export function buildInstallments(f: Financing): InstallmentRow[] {
  const rows: InstallmentRow[] = []
  if (!f.activatedAt) return rows
  const start = new Date(f.activatedAt)
  if (Number.isNaN(start.getTime())) return rows
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
  const res = await payoutsApi.listPayouts({ per_page: 100 })
  return res.data.map(adaptPayout)
}

export async function fetchPayoutContext(
  reference: string,
): Promise<PayoutDetailContext | undefined> {
  try {
    const p = await payoutsApi.getPayout(reference)
    const payout = adaptPayout(p)
    let financing: Financing | undefined
    if (p.financing?.reference) {
      financing = await fetchFinancing(p.financing.reference)
    }
    let merchant: Merchant | undefined
    if (p.merchant?.id) {
      merchant = (await fetchMerchant(p.merchant.id)) ?? undefined
    }
    return { payout, financing, merchant }
  } catch {
    return undefined
  }
}

export async function fetchVerifications(): Promise<VerificationItem[]> {
  const res = await verifyApi.listVerifications({ pending_only: true, per_page: 100 })
  return res.data.map(adaptVerification)
}

/**
 * Verification call log (history, all outcomes).
 *
 * Until the backend exposes a paginated call-log endpoint, we surface the
 * seeded mock list so the admin "Verification Calls" page can render. The
 * data shape mirrors what the real API will return (`MerchantVerification`).
 */
export async function fetchMerchantVerifications(): Promise<MerchantVerification[]> {
  return [...merchantVerificationsMock].sort((a, b) => b.called_at.localeCompare(a.called_at))
}

export async function fetchCollections(): Promise<CollectionAccount[]> {
  // Backend exposes /admin/collections via the financings late/defaulted view.
  // For now, derive from the financings list — empty in fresh DB.
  try {
    const res = await financingsApi.listFinancings({ status: 'late', per_page: 100 })
    return res.data.map((f) => ({
      financingRef: f.reference,
      customerName: f.client?.full_name ?? '—',
      customerPhone: f.client?.phone ?? '',
      daysLate: 0,
      overdueDzd: 0,
      lateInstallments: 0,
      status: 'late',
      lastAction: '',
      lastActionAt: '',
    }))
  } catch {
    return []
  }
}

const SETTING_UNIT_MAP: Record<string, SettingUnit> = {
  grace_period_days: 'days',
  request_expiry_days: 'days',
  default_first_due_offset_days: 'days',
  default_threshold_days: 'days',
  kyc_validity_days: 'days',
  min_age_years: 'years',
  max_age_years: 'years',
  max_credit_limit_dzd: 'dzd',
}

const SETTING_CATEGORY_MAP: Record<string, SettingCategory> = {
  grace_period_days: 'financing',
  request_expiry_days: 'financing',
  default_first_due_offset_days: 'financing',
  max_credit_limit_dzd: 'financing',
  default_threshold_days: 'risk',
  kyc_validity_days: 'kyc',
  min_age_years: 'kyc',
  max_age_years: 'kyc',
}

export async function fetchSettings(): Promise<SettingItem[]> {
  const res = await settingsApi.listSettings()
  const items: SettingItem[] = []
  for (const [key, value] of Object.entries(res.data)) {
    // Only surface numeric settings the legacy UI can render.
    if (typeof value !== 'number') continue
    items.push({
      key,
      category: SETTING_CATEGORY_MAP[key] ?? 'financing',
      value,
      unit: SETTING_UNIT_MAP[key] ?? 'days',
    })
  }
  return items
}
