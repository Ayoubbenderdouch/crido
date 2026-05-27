import { NavLink, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Users, Store, FileText, CreditCard, Banknote,
  Send, PhoneCall, AlertTriangle, BarChart3, Wallet, Settings, LogOut,
  Bell, MessageSquare, Shield, Calculator,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getStoredUser, logoutWithApi } from '@/lib/auth'
import { currentAdmin } from '@/lib/mock/data'
import { Avatar } from '@/components/data/Avatar'

const NAV = [
  {
    section: 'sectionMain',
    items: [
      { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
      { to: '/clients', key: 'clients', icon: Users, label: 'العملاء' },
      { to: '/merchants', key: 'merchants', icon: Store, label: 'التجار' },
      { to: '/financing-requests', key: 'requests', icon: FileText, label: 'طلبات التمويل' },
      { to: '/financings', key: 'financings', icon: CreditCard, label: 'التمويلات' },
      { to: '/payments', key: 'payments', icon: Banknote, label: 'المدفوعات' },
      { to: '/payouts', key: 'payouts', icon: Send, label: 'مدفوعات التجار' },
      { to: '/merchant-verifications', key: 'verifications', icon: PhoneCall, label: 'مكالمات التحقق' },
      { to: '/collections', key: 'collections', icon: AlertTriangle, label: 'التحصيل' },
      { to: '/messages', key: 'messages', icon: MessageSquare, label: 'الرسائل' },
      { to: '/notifications', key: 'notifications', icon: Bell, label: 'الإشعارات' },
    ],
  },
  {
    section: 'sectionManage',
    items: [
      { to: '/accounting', key: 'accounting', icon: Calculator, label: 'المحاسبة' },
      { to: '/finance', key: 'finance', icon: Wallet, label: 'المالية' },
      { to: '/reports', key: 'reports', icon: BarChart3, label: 'التقارير' },
      { to: '/roles', key: 'roles', icon: Shield, label: 'الصلاحيات' },
      { to: '/settings', key: 'settings', icon: Settings, label: 'الإعدادات' },
    ],
  },
]

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const storedUser = getStoredUser()
  const displayName = storedUser?.full_name ?? currentAdmin.name

  async function logout() {
    await logoutWithApi()
    navigate('/login')
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-e border-border bg-background">
      <div className="flex h-15 shrink-0 items-center gap-2.5 px-5">
        <img src="/crido-logo.png" alt="Crido" className="h-8 w-8 rounded-lg" />
        <div className="leading-tight">
          <p className="text-lg font-semibold text-primary">Crido</p>
          <p className="text-xs text-foreground-tertiary">{t('app.tagline')}</p>
        </div>
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
                {t(`nav.${item.key}`, { defaultValue: item.label })}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-3">
        <Avatar name={displayName} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
          <p className="truncate text-xs text-foreground-tertiary">
            {storedUser?.email ?? currentAdmin.email}
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
