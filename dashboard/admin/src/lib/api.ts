// Central API facade for the Admin Dashboard.
//
// This module re-exports the modular real API namespaces and also provides a
// `mockApiAdapter` for legacy pages that still consume the original mock
// signatures (`fetchClients`, `fetchDashboard`, etc.). The adapter switches at
// runtime via `VITE_API_MODE`: when `real`, calls go through the modular
// `src/lib/api/*` modules; when `mock`, calls fall back to `src/lib/mock/api`.
//
// New code should import from `@/lib/api/<domain>` directly. Old code can
// continue calling the original mock entry points, which now route through the
// adapter.

import { API_MODE } from '@/env'

import * as auth from './api/auth'
import * as dashboard from './api/dashboard'
import * as clients from './api/clients'
import * as merchants from './api/merchants'
import * as merchantVerifications from './api/merchantVerifications'
import * as financingRequests from './api/financingRequests'
import * as financings from './api/financings'
import * as payments from './api/payments'
import * as payouts from './api/payouts'
import * as settings from './api/settings'
import * as reports from './api/reports'
import * as categories from './api/categories'
import * as offers from './api/offers'
import * as banks from './api/banks'
import * as users from './api/users'
import * as financingPlans from './api/financingPlans'
import * as publicData from './api/publicData'

export {
  auth,
  dashboard,
  clients,
  merchants,
  merchantVerifications,
  financingRequests,
  financings,
  payments,
  payouts,
  settings,
  reports,
  categories,
  offers,
  banks,
  users,
  financingPlans,
  publicData,
}

export { apiClient, apiErrorMessage } from './apiClient'

export const api = {
  mode: API_MODE,
  auth,
  dashboard,
  clients,
  merchants,
  merchantVerifications,
  financingRequests,
  financings,
  payments,
  payouts,
  settings,
  reports,
  categories,
  offers,
  banks,
  users,
  financingPlans,
  publicData,
}

export default api
