// Single entrypoint for the vendor API. Switches between the real
// Laravel API and the in-memory mock based on VITE_API_MODE.
// Pages import from `@/lib/api` and don't need to know which mode is on.

import { API_MODE } from '@/lib/apiClient'

import * as realDashboard from '@/lib/api/dashboard'
import * as realRequests from '@/lib/api/financingRequests'
import * as realFinancings from '@/lib/api/financings'
import * as realPayouts from '@/lib/api/payouts'
import * as realCustomers from '@/lib/api/customers'
import * as realProducts from '@/lib/api/products'
import * as realBranches from '@/lib/api/branches'
import * as realStaff from '@/lib/api/staff'
import * as realProfile from '@/lib/api/profile'

import * as mock from '@/lib/mock/api'

export const isRealApi = API_MODE === 'real'

export const fetchDashboard = isRealApi ? realDashboard.fetchDashboard : mock.fetchDashboard
export const fetchRequests = isRealApi ? realRequests.fetchRequests : mock.fetchRequests
export const fetchRequest = isRealApi ? realRequests.fetchRequest : mock.fetchRequest
export const confirmRequest = realRequests.confirmRequest
export const rejectRequest = realRequests.rejectRequest

export const fetchFinancings = isRealApi ? realFinancings.fetchFinancings : mock.fetchFinancings
export const fetchFinancing = isRealApi ? realFinancings.fetchFinancing : mock.fetchFinancing

export const fetchPayouts = isRealApi ? realPayouts.fetchPayouts : mock.fetchPayouts
export const fetchPayout = isRealApi ? realPayouts.fetchPayout : mock.fetchPayout

export const fetchCustomers = isRealApi ? realCustomers.fetchCustomers : mock.fetchCustomers
export const fetchCustomer = isRealApi ? realCustomers.fetchCustomer : mock.fetchCustomer

export const fetchProducts = isRealApi ? realProducts.fetchProducts : mock.fetchProducts
export const fetchBranches = isRealApi ? realBranches.fetchBranches : mock.fetchBranches
export const fetchStaff = isRealApi ? realStaff.fetchStaff : mock.fetchStaff

// Real-API only side-effects:
export const productsApi = realProducts
export const branchesApi = realBranches
export const staffApi = realStaff
export const profileApi = realProfile
