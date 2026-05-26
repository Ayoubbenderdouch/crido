import {
  branches as seedBranches,
  incomingRequests as seedRequests,
  merchantProfile as seedProfile,
  payouts as seedPayouts,
  products as seedProducts,
  staff as seedStaff,
  type Branch,
  type IncomingRequest,
  type Payout,
  type Product,
  type RequestStatus,
  type Staff,
  type StaffRole,
} from '@/lib/mock/data'

const STORAGE_KEY = 'crido_vendor_store_v2'

export type MerchantProfileEditable = {
  name: string
  nameFr: string
  tagline: string
  description: string
  phone: string
  email: string
  website: string
  address: string
}

type StoreData = {
  products: Product[]
  branches: Branch[]
  staff: Staff[]
  requests: IncomingRequest[]
  profile: MerchantProfileEditable
}

type Listener = () => void
const listeners = new Set<Listener>()

/** Stable reference for useSyncExternalStore — must not change between notifies. */
let storeCache: StoreData | null = null

function notify() {
  listeners.forEach((l) => l())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function defaultData(): StoreData {
  return {
    products: structuredClone(seedProducts),
    branches: structuredClone(seedBranches),
    staff: structuredClone(seedStaff),
    requests: structuredClone(seedRequests),
    profile: {
      name: seedProfile.name,
      nameFr: seedProfile.nameFr,
      tagline: seedProfile.tagline,
      description: seedProfile.description,
      phone: seedProfile.phone,
      email: seedProfile.email,
      website: seedProfile.website,
      address: seedProfile.address,
    },
  }
}

function readStoreFromStorage(): StoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as Partial<StoreData>
    const base = defaultData()
    return {
      ...base,
      ...parsed,
      products: parsed.products?.length ? parsed.products : base.products,
      branches: parsed.branches?.length ? parsed.branches : base.branches,
      staff: parsed.staff?.length ? parsed.staff : base.staff,
      requests: parsed.requests?.length ? parsed.requests : base.requests,
      profile: { ...base.profile, ...parsed.profile },
    }
  } catch {
    return defaultData()
  }
}

export function loadStore(): StoreData {
  if (!storeCache) {
    storeCache = readStoreFromStorage()
  }
  return storeCache
}

function persist(data: StoreData) {
  storeCache = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  notify()
}

// ——— Products ———

export function getProducts(): Product[] {
  return loadStore().products
}

export function getProductById(id: number): Product | undefined {
  return getProducts().find((p) => p.id === id)
}

export function saveProduct(input: Omit<Product, 'id'> & { id?: number }): Product {
  const data = loadStore()
  if (input.id != null) {
    const idx = data.products.findIndex((p) => p.id === input.id)
    const updated: Product = { ...data.products[idx], ...input, id: input.id }
    if (idx >= 0) data.products[idx] = updated
    persist(data)
    return updated
  }
  const nextId = Math.max(0, ...data.products.map((p) => p.id)) + 1
  const created: Product = { ...input, id: nextId } as Product
  data.products.push(created)
  persist(data)
  return created
}

export function deleteProduct(id: number): void {
  const data = loadStore()
  data.products = data.products.filter((p) => p.id !== id)
  persist(data)
}

// ——— Branches ———

export function getBranches(): Branch[] {
  return loadStore().branches
}

export function getBranchById(id: number): Branch | undefined {
  return getBranches().find((b) => b.id === id)
}

export function saveBranch(input: Omit<Branch, 'id'> & { id?: number }): Branch {
  const data = loadStore()
  if (input.id != null) {
    const idx = data.branches.findIndex((b) => b.id === input.id)
    const updated: Branch = { ...data.branches[idx], ...input, id: input.id }
    if (idx >= 0) data.branches[idx] = updated
    persist(data)
    return updated
  }
  const nextId = Math.max(0, ...data.branches.map((b) => b.id)) + 1
  const created: Branch = { ...input, id: nextId } as Branch
  data.branches.push(created)
  persist(data)
  return created
}

// ——— Staff ———

export function getStaff(): Staff[] {
  return loadStore().staff
}

export function getStaffById(id: number): Staff | undefined {
  return getStaff().find((s) => s.id === id)
}

export function saveStaffMember(input: Omit<Staff, 'id'> & { id?: number }): Staff {
  const data = loadStore()
  if (input.id != null) {
    const idx = data.staff.findIndex((s) => s.id === input.id)
    const updated: Staff = { ...data.staff[idx], ...input, id: input.id }
    if (idx >= 0) data.staff[idx] = updated
    persist(data)
    return updated
  }
  const nextId = Math.max(0, ...data.staff.map((s) => s.id)) + 1
  const created: Staff = {
    ...input,
    id: nextId,
    lastLoginAt: null,
    active: true,
  } as Staff
  data.staff.push(created)
  persist(data)
  return created
}

// ——— Requests ———

export function getRequests(): IncomingRequest[] {
  return loadStore().requests
}

export function getRequestByRef(reference: string): IncomingRequest | undefined {
  return getRequests().find((r) => r.reference === reference)
}

export function updateRequestStatus(
  reference: string,
  status: RequestStatus,
  note?: string,
): IncomingRequest | undefined {
  const data = loadStore()
  const idx = data.requests.findIndex((r) => r.reference === reference)
  if (idx < 0) return undefined
  data.requests[idx] = {
    ...data.requests[idx],
    status,
    note: note ?? data.requests[idx].note,
  }
  persist(data)
  return data.requests[idx]
}

export function getPendingRequestCount(): number {
  return getRequests().filter((r) => r.status === 'submitted').length
}

// ——— Payouts ———

export function getPayouts(): Payout[] {
  return seedPayouts
}

// ——— Profile ———

export function getProfile(): MerchantProfileEditable {
  return loadStore().profile
}

export function saveProfile(patch: Partial<MerchantProfileEditable>): MerchantProfileEditable {
  const data = loadStore()
  data.profile = { ...data.profile, ...patch }
  persist(data)
  return data.profile
}

export type { StaffRole }
