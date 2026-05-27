import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  Plus,
  Lock,
  Users,
  Key,
  ChevronLeft,
  Search,
  Pencil,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { EmptyState } from '@/components/data/EmptyState'
import { RoleBadge } from '../components/RoleBadge'
import {
  MOCK_PERMISSIONS,
  MOCK_ROLES,
  roleHasPermission,
  type Role,
} from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function RolesPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const totalPermissions = MOCK_PERMISSIONS.length

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return MOCK_ROLES
    return MOCK_ROLES.filter((r) => {
      const haystack = [r.slug, r.name_ar, r.name_fr, r.description_ar, r.description_fr]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [search])

  const totalUsers = MOCK_ROLES.reduce((sum, r) => sum + r.users_count, 0)
  const systemRoles = MOCK_ROLES.filter((r) => r.is_system).length

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={t('roles.title', { defaultValue: locale === 'fr' ? 'Rôles & permissions' : 'الأدوار والصلاحيات' })}
        subtitle={t('roles.subtitle', {
          defaultValue:
            locale === 'fr'
              ? 'Définissez ce que chaque membre du staff Crido peut consulter ou exécuter.'
              : 'حدد ما يمكن لكل عضو من فريق Crido الاطلاع عليه أو تنفيذه.',
        })}
      >
        <Button size="sm" onClick={() => navigate('/roles/new')}>
          <Plus size={15} />
          {t('roles.create', { defaultValue: locale === 'fr' ? 'Nouveau rôle' : 'دور جديد' })}
        </Button>
      </PageHeader>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label={t('roles.stats.total', { defaultValue: locale === 'fr' ? 'Total des rôles' : 'إجمالي الأدوار' })}
          value={formatNumber(MOCK_ROLES.length, locale)}
          icon={ShieldCheck}
        />
        <KpiCard
          label={t('roles.stats.users', { defaultValue: locale === 'fr' ? 'Comptes affectés' : 'حسابات معينة' })}
          value={formatNumber(totalUsers, locale)}
          icon={Users}
        />
        <KpiCard
          label={t('roles.stats.permissions', { defaultValue: locale === 'fr' ? 'Autorisations disponibles' : 'صلاحيات متاحة' })}
          value={formatNumber(totalPermissions, locale)}
          icon={Key}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              locale === 'fr' ? 'Rechercher un rôle…' : 'ابحث عن دور…'
            }
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <span className="ms-auto text-sm text-foreground-tertiary">
          {systemRoles} {locale === 'fr' ? 'rôles système' : 'دور نظام'}
        </span>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title={
              locale === 'fr' ? 'Aucun rôle trouvé.' : 'لا توجد أدوار مطابقة.'
            }
            hint={
              locale === 'fr'
                ? 'Essayez de modifier votre recherche ou créez un nouveau rôle.'
                : 'حاول تعديل البحث أو إنشاء دور جديد.'
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              locale={locale}
              totalPermissions={totalPermissions}
              onOpen={() => navigate(`/roles/${role.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

type CardProps = {
  role: Role
  locale: Locale
  totalPermissions: number
  onOpen: () => void
}

function RoleCard({ role, locale, totalPermissions, onOpen }: CardProps) {
  const { t } = useTranslation()
  const description = locale === 'fr' ? role.description_fr : role.description_ar
  const grantedCount = role.permissions.includes('*')
    ? totalPermissions
    : role.permissions.filter((p) =>
        MOCK_PERMISSIONS.some((mp) => mp.slug === p),
      ).length
  const pct = totalPermissions > 0 ? (grantedCount / totalPermissions) * 100 : 0

  // Preview a few permissions (max 4) for an at-a-glance summary.
  const preview = role.permissions.includes('*')
    ? MOCK_PERMISSIONS.slice(0, 4)
    : MOCK_PERMISSIONS.filter((p) => roleHasPermission(role, p.slug)).slice(0, 4)
  const extra = grantedCount - preview.length

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card transition-all',
        'cursor-pointer hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      )}
    >
      {/* Decorative gradient stripe in the role color */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: role.color }}
      />

      <div className="p-5 pt-6">
        <div className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: role.color }}
          >
            <ShieldCheck size={20} strokeWidth={1.85} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold text-foreground">
                {locale === 'fr' ? role.name_fr : role.name_ar}
              </h3>
              {role.is_system ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md bg-background-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground-tertiary"
                  title={
                    locale === 'fr' ? 'Rôle système' : 'دور نظام'
                  }
                >
                  <Lock size={10} strokeWidth={2.25} />
                  {locale === 'fr' ? 'Système' : 'نظام'}
                </span>
              ) : null}
            </div>
            <p
              className="mt-0.5 font-mono text-[11px] text-foreground-tertiary"
              dir="ltr"
            >
              {role.slug}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
          {description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-background-secondary px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground-tertiary">
              <Users size={11} strokeWidth={2} />
              {locale === 'fr' ? 'Comptes' : 'حسابات'}
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {formatNumber(role.users_count, locale)}
            </div>
          </div>
          <div className="rounded-lg bg-background-secondary px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground-tertiary">
              <Key size={11} strokeWidth={2} />
              {locale === 'fr' ? 'Permissions' : 'صلاحيات'}
            </div>
            <div className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {grantedCount}
              <span className="text-xs font-normal text-foreground-tertiary"> / {totalPermissions}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-background-secondary">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: role.color }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {preview.map((p) => (
            <span
              key={p.slug}
              className="inline-flex items-center rounded-md bg-background-secondary px-2 py-0.5 text-[11px] font-medium text-foreground-secondary"
            >
              {locale === 'fr' ? p.name_fr : p.name_ar}
            </span>
          ))}
          {extra > 0 ? (
            <span
              className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${role.color}1A`, color: role.color }}
            >
              +{extra}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background-secondary/50 px-5 py-3 text-sm">
        <RoleBadge role={role} size="sm" />
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          {role.is_system
            ? t('roles.actions.view', { defaultValue: locale === 'fr' ? 'Consulter' : 'عرض' })
            : (
              <>
                <Pencil size={12} strokeWidth={2.25} />
                {t('roles.actions.edit', { defaultValue: locale === 'fr' ? 'Modifier' : 'تعديل' })}
              </>
            )}
          <ChevronLeft size={14} className="ltr:rotate-180" />
        </span>
      </div>
    </div>
  )
}
