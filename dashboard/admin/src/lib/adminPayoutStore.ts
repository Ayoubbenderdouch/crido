import { merchantPayouts, type MerchantPayout, type PayoutStatus } from '@/lib/mock/data'

const STORAGE_KEY = 'crido_admin_payouts_v1'

export type StoredPayoutProof = {
  dataUrl: string
  fileName: string
  mimeType: string
}

type Override = {
  status?: PayoutStatus
  adminNote?: string | null
  transferRef?: string | null
  processingAt?: string
  paidAt?: string | null
  proof?: StoredPayoutProof | null
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

function merge(base: MerchantPayout, o?: Override): MerchantPayout {
  if (!o) return base
  return {
    ...base,
    ...(o.status ? { status: o.status } : {}),
    ...(o.paidAt !== undefined ? { paidAt: o.paidAt } : {}),
  }
}

export function getMerchantPayouts(): MerchantPayout[] {
  const overrides = read()
  return merchantPayouts.map((p) => merge(p, overrides[p.reference]))
}

export function getPayoutByRef(reference: string): MerchantPayout | undefined {
  return getMerchantPayouts().find((p) => p.reference === reference)
}

export function applyPayoutStatus(
  reference: string,
  status: PayoutStatus,
  opts?: {
    note?: string | null
    transferRef?: string | null
    proof?: StoredPayoutProof | null
  },
): MerchantPayout | undefined {
  const base = merchantPayouts.find((p) => p.reference === reference)
  if (!base) return undefined

  const store = read()
  const prev = store[reference] ?? {}
  const now = new Date().toISOString()

  const patch: Override = { ...prev, status }
  if (opts?.note !== undefined) patch.adminNote = opts.note?.trim() || null
  if (opts?.transferRef !== undefined) patch.transferRef = opts.transferRef?.trim() || null
  if (opts?.proof !== undefined) patch.proof = opts.proof

  if (status === 'processing') {
    patch.processingAt = now
    patch.paidAt = null
  }
  if (status === 'paid') {
    patch.paidAt = now.slice(0, 10)
  }

  store[reference] = patch
  write(store)
  return merge(base, patch)
}

export function getPayoutAdminNote(reference: string): string | null {
  return read()[reference]?.adminNote ?? null
}

export function getPayoutTransferRef(reference: string): string | null {
  return read()[reference]?.transferRef ?? null
}

export function getPayoutProcessingAt(reference: string): string | null {
  return read()[reference]?.processingAt ?? null
}

export function getPayoutProof(reference: string): StoredPayoutProof | null {
  return read()[reference]?.proof ?? null
}
