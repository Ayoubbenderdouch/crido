import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, Shield, Sparkles, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/data/Avatar'
import { StatusBadge } from '@/components/data/StatusBadge'
import { getStaffById, saveStaffMember, type StaffRole } from '@/lib/vendorStore'
import { useFormRoute } from '@/lib/useFormRoute'

const ROLES: StaffRole[] = ['owner', 'manager', 'cashier', 'viewer']

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(9),
  role: z.enum(['owner', 'manager', 'cashier', 'viewer']),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const INPUT =
  'h-11 w-full rounded-xl border border-border-strong bg-background px-3.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

export default function StaffFormPage() {
  const { isNew, numericId: staffId } = useFormRoute()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = staffId ? getStaffById(staffId) : undefined

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '+213',
      role: 'cashier',
      active: true,
    },
  })

  const watched = watch()

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        phone: existing.phone,
        role: existing.role,
        active: existing.active,
      })
    }
  }, [existing, reset])

  if (!isNew && (staffId == null || Number.isNaN(staffId) || !existing)) {
    return (
      <div className="animate-fade-up">
        <Link to="/staff" className="text-sm text-primary hover:underline">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  const onSubmit = (data: FormValues) => {
    saveStaffMember({
      id: staffId,
      name: data.name,
      phone: data.phone,
      role: data.role,
      active: data.active,
      lastLoginAt: existing?.lastLoginAt ?? null,
    })
    void queryClient.invalidateQueries({ queryKey: ['staff'] })
    toast.success(isNew ? t('staff.savedNew') : t('staff.savedEdit'))
    navigate('/staff')
  }

  const displayName = watched.name || t('staff.preview.placeholderName')

  return (
    <div className="animate-fade-up">
      <Link
        to="/staff"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('staff.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
            <Sparkles size={14} />
            {isNew ? t('staff.badgeNew') : t('staff.badgeEdit')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isNew ? t('staff.addStaff') : t('staff.editTitle', { name: existing?.name ?? '' })}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-foreground-secondary">{t('staff.formHint')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCog size={18} className="text-primary" />
                {t('staff.sections.identity')}
              </h2>
              <p className="mb-4 text-xs text-foreground-tertiary">{t('staff.sections.identityHint')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t('staff.fields.name')} *`}>
                  <input
                    {...register('name')}
                    className={INPUT}
                    placeholder={t('staff.placeholders.name')}
                  />
                </Field>
                <Field label={`${t('staff.fields.phone')} *`}>
                  <input
                    {...register('phone')}
                    className={INPUT}
                    dir="ltr"
                    placeholder="+213 5XX XXX XXX"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield size={18} className="text-primary" />
                {t('staff.sections.access')}
              </h2>
              <p className="mb-4 text-xs text-foreground-tertiary">{t('staff.sections.accessHint')}</p>
              <Field label={`${t('staff.fields.role')} *`}>
                <select {...register('role')} className={INPUT}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {t(`staff.roles.${r}`)}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-foreground-tertiary">{t('staff.roleDesc')}</p>
              </Field>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">{t('staff.sections.status')}</h2>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background-secondary/50 px-4 py-3.5 transition hover:border-primary/30">
                <div>
                  <span className="text-sm font-medium text-foreground">{t('staff.fields.active')}</span>
                  <p className="text-xs text-foreground-tertiary">{t('staff.activeDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  {...register('active')}
                  className="h-5 w-5 rounded accent-[#0F6E56]"
                />
              </label>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                {t('common.save')}
              </Button>
              <Link to="/staff">
                <Button type="button" variant="secondary">
                  {t('common.cancel')}
                </Button>
              </Link>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
                <p className="text-xs font-medium text-primary">{t('staff.preview.label')}</p>
                <p className="mt-0.5 text-[11px] text-foreground-tertiary">{t('staff.preview.hint')}</p>
              </div>
              <div className="p-5">
                <div className="mb-4 flex justify-center">
                  <Avatar name={displayName} size={72} />
                </div>
                <p className="text-center font-semibold text-foreground">{displayName}</p>
                {watched.phone && watched.phone.length > 4 && (
                  <p className="mt-1 text-center text-sm tabular-nums text-foreground-secondary" dir="ltr">
                    {watched.phone}
                  </p>
                )}
                <div className="mt-4 flex justify-center">
                  <span className="rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
                    {t(`staff.roles.${watched.role}`)}
                  </span>
                </div>
                <div className="mt-4 border-t border-border pt-4 flex justify-center">
                  <StatusBadge status={watched.active ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground-secondary">{label}</label>
      {children}
    </div>
  )
}
