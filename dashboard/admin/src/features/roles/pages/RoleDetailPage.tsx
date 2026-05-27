import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  Lock,
  Save,
  RotateCcw,
  Trash2,
  ShieldOff,
  Users,
  Key,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { ActionModal } from '@/components/data/ActionModal'
import { RoleBadge } from '../components/RoleBadge'
import { PermissionMatrix } from '../components/PermissionMatrix'
import {
  MOCK_PERMISSIONS,
  MOCK_ROLES,
  currentAdmin,
  type Role,
} from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

// Mock staff directory — replace with /admin/users when backend is wired up.
type StaffMember = { name: string; email: string; roleId: string }
const MOCK_STAFF: StaffMember[] = [
  { name: currentAdmin.name, email: currentAdmin.email, roleId: 'role-super-admin' },
  { name: 'سارة بن يحيى', email: 'sarah@crido.dz', roleId: 'role-admin' },
  { name: 'لمين بوزيد', email: 'lamine@crido.dz', roleId: 'role-admin' },
  { name: 'فؤاد قاسمي', email: 'fouad@crido.dz', roleId: 'role-finance-manager' },
  { name: 'هاجر صالحي', email: 'hajer@crido.dz', roleId: 'role-support-agent' },
  { name: 'ياسين مصطفاوي', email: 'yassine@crido.dz', roleId: 'role-support-agent' },
  { name: 'ريم عبد الكريم', email: 'reem@crido.dz', roleId: 'role-support-agent' },
  { name: 'بلال حسني', email: 'bilal@crido.dz', roleId: 'role-field-agent' },
  { name: 'منير زروقي', email: 'mounir@crido.dz', roleId: 'role-field-agent' },
]

export default function RoleDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const role: Role | undefined = useMemo(
    () => MOCK_ROLES.find((r) => r.id === id),
    [id],
  )

  const initialPermissions = role?.permissions ?? []
  const [permissions, setPermissions] = useState<string[]>(initialPermissions)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!role) {
    return (
      <div className="animate-fade-up">
        <Card>
          <EmptyState
            icon={ShieldOff}
            title={
              locale === 'fr' ? 'Rôle introuvable' : 'الدور غير موجود'
            }
            hint={
              locale === 'fr'
                ? "Ce rôle n'existe plus ou son identifiant est incorrect."
                : 'هذا الدور لم يعد موجوداً أو أن المعرف غير صحيح.'
            }
          />
        </Card>
      </div>
    )
  }

  const isSuperAdmin = role.slug === 'super_admin'
  const isSystem = role.is_system
  const readOnly = isSuperAdmin

  // For system roles other than super_admin, permissions stay editable but
  // the role itself can't be deleted. Super admin is fully read-only.
  const dirty = useMemo(() => {
    if (readOnly) return false
    const a = new Set(initialPermissions)
    const b = new Set(permissions)
    if (a.size !== b.size) return true
    for (const p of a) if (!b.has(p)) return true
    return false
  }, [initialPermissions, permissions, readOnly])

  const assignedStaff = MOCK_STAFF.filter((s) => s.roleId === role.id)
  const grantedCount = permissions.includes('*')
    ? MOCK_PERMISSIONS.length
    : permissions.filter((p) => MOCK_PERMISSIONS.some((mp) => mp.slug === p)).length

  function save() {
    toast.success(
      locale === 'fr'
        ? `Permissions du rôle « ${role!.name_fr} » mises à jour.`
        : `تم حفظ صلاحيات دور "${role!.name_ar}".`,
    )
  }

  function reset() {
    setPermissions(initialPermissions)
  }

  function confirmDelete() {
    toast.success(
      locale === 'fr'
        ? `Rôle « ${role!.name_fr} » supprimé (démo).`
        : `تم حذف دور "${role!.name_ar}" (تجريبي).`,
    )
    setDeleteOpen(false)
    navigate('/roles')
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/roles"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('roles.title', { defaultValue: locale === 'fr' ? 'Rôles & permissions' : 'الأدوار والصلاحيات' })}
      </Link>

      <PageHeader
        title={locale === 'fr' ? role.name_fr : role.name_ar}
        subtitle={locale === 'fr' ? role.description_fr : role.description_ar}
      >
        {!isSystem ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger hover:bg-danger/10"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 size={14} />
            {locale === 'fr' ? 'Supprimer' : 'حذف'}
          </Button>
        ) : null}
        {!readOnly ? (
          <>
            <Button size="sm" variant="ghost" disabled={!dirty} onClick={reset}>
              <RotateCcw size={14} />
              {locale === 'fr' ? 'Réinitialiser' : 'إعادة'}
            </Button>
            <Button size="sm" disabled={!dirty} onClick={save}>
              <Save size={14} />
              {locale === 'fr' ? 'Enregistrer' : 'حفظ'}
            </Button>
          </>
        ) : null}
      </PageHeader>

      {/* Role overview header card */}
      <Card
        className="relative mb-4 overflow-hidden p-5"
        style={{
          backgroundImage: `linear-gradient(135deg, ${role.color}12 0%, transparent 60%)`,
        }}
      >
        <span
          aria-hidden
          className="absolute inset-y-0 start-0 w-1"
          style={{ backgroundColor: role.color }}
        />
        <div className="flex flex-wrap items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: role.color }}
          >
            <ShieldCheck size={22} strokeWidth={1.85} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {locale === 'fr' ? role.name_fr : role.name_ar}
              </h2>
              <RoleBadge role={role} size="sm" />
              {isSystem ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-background-secondary px-2 py-0.5 text-[11px] font-medium text-foreground-tertiary">
                  <Lock size={11} strokeWidth={2.25} />
                  {locale === 'fr' ? 'Rôle système' : 'دور نظام'}
                </span>
              ) : null}
            </div>
            <p
              className="mt-1 font-mono text-[11px] text-foreground-tertiary"
              dir="ltr"
            >
              {role.slug}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Stat
              icon={Users}
              label={locale === 'fr' ? 'Comptes affectés' : 'حسابات معينة'}
              value={formatNumber(assignedStaff.length, locale)}
            />
            <Stat
              icon={Key}
              label={locale === 'fr' ? 'Permissions' : 'صلاحيات'}
              value={`${grantedCount} / ${MOCK_PERMISSIONS.length}`}
            />
          </div>
        </div>

        {readOnly ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2 text-xs font-medium text-foreground-secondary">
            <Lock size={12} strokeWidth={2.25} />
            {locale === 'fr'
              ? 'Les permissions du super-administrateur ne peuvent pas être modifiées.'
              : 'صلاحيات المدير العام غير قابلة للتعديل.'}
          </p>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {locale === 'fr' ? 'Permissions' : 'الصلاحيات'}
            </CardTitle>
            {dirty ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                {locale === 'fr' ? 'Modifications non enregistrées' : 'تعديلات غير محفوظة'}
              </span>
            ) : null}
          </CardHeader>
          <div className="p-5">
            <PermissionMatrix
              value={permissions}
              onChange={setPermissions}
              readOnly={readOnly}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {locale === 'fr'
                ? `Utilisateurs (${assignedStaff.length})`
                : `الحسابات (${assignedStaff.length})`}
            </CardTitle>
          </CardHeader>
          {assignedStaff.length === 0 ? (
            <EmptyState
              icon={Users}
              title={
                locale === 'fr'
                  ? 'Aucun utilisateur affecté.'
                  : 'لا يوجد مستخدمون مرتبطون بهذا الدور.'
              }
              hint={
                locale === 'fr'
                  ? 'Vous pouvez assigner ce rôle depuis la page utilisateurs.'
                  : 'يمكنك تعيين هذا الدور من صفحة المستخدمين.'
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {assignedStaff.map((s) => (
                <li
                  key={s.email}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <Avatar name={s.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {s.name}
                    </p>
                    <p
                      className="truncate text-xs text-foreground-tertiary"
                      dir="ltr"
                    >
                      {s.email}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ActionModal
        open={deleteOpen}
        title={locale === 'fr' ? 'Supprimer ce rôle ?' : 'حذف هذا الدور؟'}
        subtitle={
          locale === 'fr'
            ? 'Cette action est irréversible. Les comptes affectés devront être réassignés.'
            : 'هذا الإجراء نهائي. سيتعين إعادة تعيين الحسابات المرتبطة بهذا الدور.'
        }
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              {t('common.cancel', { defaultValue: locale === 'fr' ? 'Annuler' : 'إلغاء' })}
            </Button>
            <Button
              size="sm"
              className="bg-danger text-white hover:brightness-95"
              onClick={confirmDelete}
            >
              <Trash2 size={14} />
              {locale === 'fr' ? 'Supprimer' : 'حذف'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-foreground-secondary">
          {locale === 'fr'
            ? `Le rôle « ${role.name_fr} » sera supprimé définitivement. ${assignedStaff.length} compte(s) sont actuellement affecté(s).`
            : `سيتم حذف دور "${role.name_ar}" نهائياً. ${assignedStaff.length} حساب مرتبط بهذا الدور حالياً.`}
        </p>
      </ActionModal>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-background/70 px-3 py-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-surface text-primary">
        <Icon size={14} strokeWidth={1.85} />
      </span>
      <div className="leading-tight">
        <p className="text-[11px] text-foreground-tertiary">{label}</p>
        <p className={cn('text-sm font-semibold tabular-nums text-foreground')}>{value}</p>
      </div>
    </div>
  )
}
