import { Navigate, Outlet } from 'react-router'
import { isAuthenticated } from '@/lib/auth'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1200px] px-6 py-7 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
