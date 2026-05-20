import { NavLink, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ClipboardList, CreditCard, Wallet,
  Users, Package, Store, UserCog, Building2, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearToken } from '@/lib/auth'
import { currentUser, incomingRequests } from '@/lib/mock/data'

const NAV = [
  {
    section: 'sectionMain',
    items: [
      { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
      { to: '/requests', key: 'requests', icon: ClipboardList },
      { to: '/financings', key: 'financings', icon: CreditCard },
      { to: '/payouts', key: 'payouts', icon: Wallet },
      { to: '/customers', key: 'customers', icon: Users },
    ],
  },
  {
    section: 'sectionManage',
    items: [
      { to: '/products', key: 'products', icon: Package },
      { to: '/branches', key: 'branches', icon: Store },
      { to: '/staff', key: 'staff', icon: UserCog },
      { to: '/profile', key: 'profile', icon: Building2 },
      { to: '/settings', key: 'settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const pendingCount = incomingRequests.filter((r) => r.status === 'submitted').length

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
                <span className="flex-1">{t(`nav.${item.key}`)}</span>
                {item.key === 'requests' && pendingCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-fg">
                    {pendingCount}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-surface text-sm font-medium text-primary">
          {currentUser.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{currentUser.name}</p>
          <p className="truncate text-xs text-foreground-tertiary">
            {t(`staff.roles.${currentUser.role}`)}
          </p>
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
