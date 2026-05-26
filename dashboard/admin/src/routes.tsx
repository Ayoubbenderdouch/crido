import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ClientsPage from '@/features/clients/pages/ClientsPage'
import ClientDetailPage from '@/features/clients/pages/ClientDetailPage'
import MerchantsPage from '@/features/merchants/pages/MerchantsPage'
import MerchantDetailPage from '@/features/merchants/pages/MerchantDetailPage'
import ProposedMerchantDetailPage from '@/features/merchants/pages/ProposedMerchantDetailPage'
import RequestsPage from '@/features/financing-requests/pages/RequestsPage'
import RequestDetailPage from '@/features/financing-requests/pages/RequestDetailPage'
import FinancingsPage from '@/features/financings/pages/FinancingsPage'
import FinancingDetailPage from '@/features/financings/pages/FinancingDetailPage'
import PaymentsPage from '@/features/payments/pages/PaymentsPage'
import PaymentDetailPage from '@/features/payments/pages/PaymentDetailPage'
import PayoutsPage from '@/features/payouts/pages/PayoutsPage'
import PayoutDetailPage from '@/features/payouts/pages/PayoutDetailPage'
import VerificationsPage from '@/features/verifications/pages/VerificationsPage'
import CollectionsPage from '@/features/collections/pages/CollectionsPage'
import ReportsPage from '@/features/reports/pages/ReportsPage'
import FinancePage from '@/features/finance/pages/FinancePage'
import SettingsPage from '@/features/settings/pages/SettingsPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'clients/:id', element: <ClientDetailPage /> },
      { path: 'merchants', element: <MerchantsPage /> },
      { path: 'merchants/ad-hoc/:requestRef', element: <ProposedMerchantDetailPage /> },
      { path: 'merchants/:id', element: <MerchantDetailPage /> },
      { path: 'financing-requests', element: <RequestsPage /> },
      { path: 'financing-requests/:reference', element: <RequestDetailPage /> },
      { path: 'financings', element: <FinancingsPage /> },
      { path: 'financings/:reference', element: <FinancingDetailPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'payments/:reference', element: <PaymentDetailPage /> },
      { path: 'payouts', element: <PayoutsPage /> },
      { path: 'payouts/:reference', element: <PayoutDetailPage /> },
      { path: 'merchant-verifications', element: <VerificationsPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
