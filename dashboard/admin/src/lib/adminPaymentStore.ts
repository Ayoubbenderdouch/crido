import { payments, type Payment, type PaymentStatus } from '@/lib/mock/data'

const STORAGE_KEY = 'crido_admin_payments_v1'

type Override = {
  status?: PaymentStatus
  adminNote?: string | null
  decidedAt?: string
}

type Store = Record<string, Override>

function read(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch {
    /* ignore */
  }
  return {}
}

function write(store: Store): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function getPayments(): Payment[] {
  const overrides = read()
  return payments.map((p) => {
    const o = overrides[p.reference]
    if (!o) return p
    return { ...p, ...(o.status ? { status: o.status } : {}) }
  })
}

export function getPaymentByRef(reference: string): Payment | undefined {
  return getPayments().find((p) => p.reference === reference)
}

export type PaymentDecision = 'verified' | 'rejected'

export function applyPaymentDecision(
  reference: string,
  decision: PaymentDecision,
  note?: string | null,
): Payment | undefined {
  const base = payments.find((p) => p.reference === reference)
  if (!base) return undefined

  const status: PaymentStatus =
    decision === 'verified' ? 'verified' : 'rejected'

  const store = read()
  store[reference] = {
    status,
    adminNote: note?.trim() || null,
    decidedAt: new Date().toISOString(),
  }
  write(store)

  return { ...base, status }
}

export function getPaymentAdminNote(reference: string): string | null {
  return read()[reference]?.adminNote ?? null
}

export function getPaymentDecidedAt(reference: string): string | null {
  return read()[reference]?.decidedAt ?? null
}
