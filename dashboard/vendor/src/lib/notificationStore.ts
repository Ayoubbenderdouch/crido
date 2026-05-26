import { buildVendorNotifications, type VendorNotification } from '@/lib/vendorNotifications'

const STORAGE_KEY = 'crido_vendor_notif_read_v1'

type Listener = () => void
const listeners = new Set<Listener>()
let readSnapshot = 0

function notify() {
  readSnapshot += 1
  listeners.forEach((l) => l())
}

export function getNotificationReadSnapshot(): number {
  return readSnapshot
}

export function subscribeNotificationRead(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : [])
  } catch {
    return new Set()
  }
}

function persistReadIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
  notify()
}

export function markNotificationRead(id: string): void {
  const ids = getReadIds()
  if (ids.has(id)) return
  ids.add(id)
  persistReadIds(ids)
}

export function markAllNotificationsRead(ids: string[]): void {
  const readIds = getReadIds()
  let changed = false
  for (const id of ids) {
    if (!readIds.has(id)) {
      readIds.add(id)
      changed = true
    }
  }
  if (changed) persistReadIds(readIds)
}

function applyReadState(items: Omit<VendorNotification, 'read'>[]): VendorNotification[] {
  const readIds = getReadIds()
  return items.map((n) => ({ ...n, read: readIds.has(n.id) }))
}

export function getVendorNotifications(): VendorNotification[] {
  return applyReadState(buildVendorNotifications())
}

export function getUnreadNotificationCount(): number {
  return getVendorNotifications().filter((n) => !n.read).length
}
