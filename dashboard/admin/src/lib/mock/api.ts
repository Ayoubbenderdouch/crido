// Dispatcher between the real-backend adapter and the original in-memory mock.
//
// Most pages still import from this path (`@/lib/mock/api`). When
// `VITE_API_MODE=real`, every call is forwarded to `./api.real.ts` which calls
// the Laravel backend and adapts the response back into the mock types. In
// `mock` mode, calls go through the original in-memory implementation in
// `./api.mock.ts` for offline development.

import { API_MODE } from '@/env'
import * as real from './api.real'
import * as mock from './api.mock'

const impl = API_MODE === 'mock' ? mock : real

// Re-export every public symbol from whichever implementation is active.
// We list them explicitly so TypeScript can keep types tight.

export const fetchDashboard = impl.fetchDashboard
export const fetchClients = impl.fetchClients
export const fetchClient = impl.fetchClient
export const fetchMerchants = impl.fetchMerchants
export const fetchMerchant = impl.fetchMerchant
export const fetchRequests = impl.fetchRequests
export const fetchRequest = impl.fetchRequest
export const fetchRequestContext = impl.fetchRequestContext
export const fetchProposedMerchant = impl.fetchProposedMerchant
export const fetchFinancings = impl.fetchFinancings
export const fetchFinancing = impl.fetchFinancing
export const fetchFinancingContext = impl.fetchFinancingContext
export const fetchPayments = impl.fetchPayments
export const fetchPaymentContext = impl.fetchPaymentContext
export const buildInstallments = impl.buildInstallments
export const fetchMerchantPayouts = impl.fetchMerchantPayouts
export const fetchPayoutContext = impl.fetchPayoutContext
export const fetchVerifications = impl.fetchVerifications
export const fetchCollections = impl.fetchCollections
export const fetchSettings = impl.fetchSettings

export type {
  DashboardData,
  InstallmentRow,
  RequestContext,
  ProposedMerchantContext,
  FinancingDetailContext,
  PaymentDetailContext,
  PayoutDetailContext,
} from './api.real'
