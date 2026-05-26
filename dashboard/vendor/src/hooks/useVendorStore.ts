import { useSyncExternalStore } from 'react'
import { loadStore, subscribe } from '@/lib/vendorStore'

export function useVendorStore() {
  return useSyncExternalStore(subscribe, loadStore, loadStore)
}
