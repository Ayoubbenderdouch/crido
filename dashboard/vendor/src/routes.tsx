import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import RequestsPage from '@/features/requests/pages/RequestsPage'
import RequestDetailPage from '@/features/requests/pages/RequestDetailPage'
import FinancingsPage from '@/features/financings/pages/FinancingsPage'
import FinancingDetailPage from '@/features/financings/pages/FinancingDetailPage'
import PayoutsPage from '@/features/payouts/pages/PayoutsPage'
import PayoutDetailPage from '@/features/payouts/pages/PayoutDetailPage'
import CustomersPage from '@/features/customers/pages/CustomersPage'
import CustomerDetailPage from '@/features/customers/pages/CustomerDetailPage'
import ProductsPage from '@/features/products/pages/ProductsPage'
import ProductFormPage from '@/features/products/pages/ProductFormPage'
import BranchesPage from '@/features/branches/pages/BranchesPage'
import BranchFormPage from '@/features/branches/pages/BranchFormPage'
import StaffPage from '@/features/staff/pages/StaffPage'
import StaffFormPage from '@/features/staff/pages/StaffFormPage'
import ProfilePage from '@/features/profile/pages/ProfilePage'
import ProfileEditPage from '@/features/profile/pages/ProfileEditPage'
import SettingsPage from '@/features/settings/pages/SettingsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'requests', element: <RequestsPage /> },
      { path: 'requests/:reference', element: <RequestDetailPage /> },
      { path: 'financings', element: <FinancingsPage /> },
      { path: 'financings/:reference', element: <FinancingDetailPage /> },
      { path: 'payouts', element: <PayoutsPage /> },
      { path: 'payouts/:reference', element: <PayoutDetailPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:id', element: <CustomerDetailPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductFormPage /> },
      { path: 'products/:id', element: <ProductFormPage /> },
      { path: 'branches', element: <BranchesPage /> },
      { path: 'branches/new', element: <BranchFormPage /> },
      { path: 'branches/:id', element: <BranchFormPage /> },
      { path: 'staff', element: <StaffPage /> },
      { path: 'staff/new', element: <StaffFormPage /> },
      { path: 'staff/:id', element: <StaffFormPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/edit', element: <ProfileEditPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
