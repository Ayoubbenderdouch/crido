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
// New feature pages (added in dashboard upgrade)
import NotificationsPage from '@/features/notifications/pages/NotificationsPage'
import MessagesPage from '@/features/messages/pages/MessagesPage'
import ConversationPage from '@/features/messages/pages/ConversationPage'
import RolesPage from '@/features/roles/pages/RolesPage'
import RoleDetailPage from '@/features/roles/pages/RoleDetailPage'
import RoleFormPage from '@/features/roles/pages/RoleFormPage'
import AccountingPage from '@/features/accounting/pages/AccountingPage'

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
      { path: 'accounting', element: <AccountingPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'finance', element: <FinancePage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'messages/:conversationId', element: <ConversationPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'roles/new', element: <RoleFormPage /> },
      { path: 'roles/:id', element: <RoleDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
