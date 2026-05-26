import { financingRequests, type FinancingRequest, type RequestStatus } from '@/lib/mock/data'

const STORAGE_KEY = 'crido_admin_request_overrides_v1'

type Override = {
  status?: RequestStatus
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

/** Merge persisted admin decisions onto the seed request list. */
export function getFinancingRequests(): FinancingRequest[] {
  const overrides = read()
  return financingRequests.map((r) => {
    const o = overrides[r.reference]
    if (!o) return r
    return {
      ...r,
      ...(o.status ? { status: o.status } : {}),
    }
  })
}

export function getRequestByRef(reference: string): FinancingRequest | undefined {
  return getFinancingRequests().find((r) => r.reference === reference)
}

export type AdminDecision = 'approved' | 'rejected'

export function applyAdminDecision(
  reference: string,
  decision: AdminDecision,
  note?: string | null,
): FinancingRequest | undefined {
  const base = financingRequests.find((r) => r.reference === reference)
  if (!base) return undefined

  const status: RequestStatus = decision === 'approved' ? 'approved' : 'rejected'
  const store = read()
  store[reference] = {
    status,
    adminNote: note?.trim() || null,
    decidedAt: new Date().toISOString(),
  }
  write(store)

  return { ...base, status }
}

export function getAdminNote(reference: string): string | null {
  return read()[reference]?.adminNote ?? null
}

export function getAdminDecidedAt(reference: string): string | null {
  return read()[reference]?.decidedAt ?? null
}
