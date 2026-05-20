import { NavLink, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Store, FileText, CreditCard, Banknote,
  Send, PhoneCall, AlertTriangle, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearToken } from '@/lib/auth'
import { currentAdmin } from '@/lib/mock/data'
import { Avatar } from '@/components/data/Avatar'

const NAV = [
  {
    section: 'sectionMain',
    items: [
      { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
      { to: '/clients', key: 'clients', icon: Users },
      { to: '/merchants', key: 'merchants', icon: Store },
      { to: '/financing-requests', key: 'requests', icon: FileText },
      { to: '/financings', key: 'financings', icon: CreditCard },
      { to: '/payments', key: 'payments', icon: Banknote },
      { to: '/payouts', key: 'payouts', icon: Send },
      { to: '/merchant-verifications', key: 'verifications', icon: PhoneCall },
      { to: '/collections', key: 'collections', icon: AlertTriangle },
    ],
  },
  {
    section: 'sectionManage',
    items: [
      { to: '/reports', key: 'reports', icon: BarChart3 },
      { to: '/settings', key: 'settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function logout() {
    clearToken()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-e border-border bg-background">
      <div className="flex h-15 shrink-0 items-center px-5">
        <span className="text-xl font-semibold text-primary">Crido</span>
        <span className="ms-2 text-xs text-foreground-tertiary">{t('app.tagline')}</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((group) => (
          <div key={group.section} className="mb-4">
            <p className="px-3 pb-1.5 text-xs text-foreground-tertiary">
              {t(`nav.${group.section}`)}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary-surface font-medium text-primary'
                      : 'text-foreground-secondary hover:bg-background-secondary',
                  )
                }
              >
                <item.icon size={18} strokeWidth={1.5} />
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-3">
        <Avatar name={currentAdmin.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{currentAdmin.name}</p>
          <p className="truncate text-xs text-foreground-tertiary">{currentAdmin.email}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          title={t('common.logout')}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-tertiary transition-colors hover:bg-background-secondary hover:text-danger"
        >
          <LogOut size={17} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  )
}
