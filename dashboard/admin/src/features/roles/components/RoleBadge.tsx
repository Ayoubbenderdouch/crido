import { useTranslation } from 'react-i18next'
import { ShieldCheck, Shield, Wallet, Headphones, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role, RoleSlug } from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const ROLE_ICON: Record<RoleSlug, LucideIcon> = {
  super_admin: ShieldCheck,
  admin: Shield,
  finance_manager: Wallet,
  support_agent: Headphones,
  field_agent: Truck,
}

type Props = {
  role: Pick<Role, 'slug' | 'name_ar' | 'name_fr' | 'color'>
  size?: 'sm' | 'md'
  className?: string
  /** When true, only show the colored dot + name without the icon chip. */
  minimal?: boolean
}

/**
 * Visual badge for an admin role. Uses the role's brand color as the surface,
 * with a Lucide glyph that matches the role's responsibility.
 */
export function RoleBadge({ role, size = 'md', className, minimal }: Props) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const Icon = ROLE_ICON[role.slug] ?? Shield
  const label = locale === 'fr' ? role.name_fr : role.name_ar

  if (minimal) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-medium text-foreground',
          className,
        )}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: role.color }} />
        {label}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      style={{
        backgroundColor: `${role.color}1A`,
        color: role.color,
      }}
    >
      <Icon size={size === 'sm' ? 11 : 13} strokeWidth={2} />
      {label}
    </span>
  )
}
