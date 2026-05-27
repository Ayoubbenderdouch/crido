import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, MapPin, Phone, Sparkles, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { getBranchById, saveBranch } from '@/lib/vendorStore'
import { useFormRoute } from '@/lib/useFormRoute'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2),
  commune: z.string().min(1),
  street: z.string().min(2),
  phone: z.string().min(9),
  managerName: z.string().min(2),
  active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const INPUT =
  'h-11 w-full rounded-xl border border-border-strong bg-background px-3.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

export default function BranchFormPage() {
  const { isNew, numericId: branchId } = useFormRoute()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = branchId ? getBranchById(branchId) : undefined

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      commune: 'أدرار',
      street: '',
      phone: '+213',
      managerName: '',
      active: true,
    },
  })

  // `useWatch` is compiler-safe; the bare `watch()` from `useForm` returns a
  // function that the React Compiler can't memoize. The cast is safe because
  // `useForm` was initialized with a value for every field.
  const watched = useWatch({ control }) as FormValues

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        commune: existing.commune,
        street: existing.street,
        phone: existing.phone,
        managerName: existing.managerName,
        active: existing.active,
      })
    }
  }, [existing, reset])

  if (!isNew && (branchId == null || Number.isNaN(branchId) || !existing)) {
    return (
      <div className="animate-fade-up">
        <Link to="/branches" className="text-sm text-primary hover:underline">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  const onSubmit = (data: FormValues) => {
    saveBranch({
      id: branchId,
      name: data.name,
      wilaya: 'أدرار',
      commune: data.commune,
      street: data.street,
      phone: data.phone,
      managerName: data.managerName,
      active: data.active,
    })
    void queryClient.invalidateQueries({ queryKey: ['branches'] })
    toast.success(isNew ? t('branches.savedNew') : t('branches.savedEdit'))
    navigate('/branches')
  }

  const displayName = watched.name || t('branches.preview.placeholderName')

  return (
    <div className="animate-fade-up">
      <Link
        to="/branches"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('branches.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
            <Sparkles size={14} />
            {isNew ? t('branches.badgeNew') : t('branches.badgeEdit')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isNew
              ? t('branches.addBranch')
              : t('branches.editTitle', { name: existing?.name ?? '' })}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-foreground-secondary">{t('branches.formHint')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin size={18} className="text-primary" />
                {t('branches.sections.location')}
              </h2>
              <p className="mb-4 text-xs text-foreground-tertiary">{t('branches.sections.locationHint')}</p>
              <div className="space-y-4">
                <Field label={`${t('branches.fields.name')} *`}>
                  <input
                    {...register('name')}
                    className={INPUT}
                    dir="rtl"
                    placeholder={t('branches.placeholders.name')}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('branches.fields.wilaya')}>
                    <input
                      value="أدرار"
                      readOnly
                      className={cn(INPUT, 'cursor-not-allowed bg-background-secondary/60 text-foreground-secondary')}
                      dir="rtl"
                    />
                  </Field>
                  <Field label={`${t('branches.fields.commune')} *`}>
                    <input
                      {...register('commune')}
                      className={INPUT}
                      placeholder={t('branches.placeholders.commune')}
                    />
                  </Field>
                </div>
                <Field label={`${t('branches.fields.street')} *`}>
                  <input
                    {...register('street')}
                    className={INPUT}
                    dir="rtl"
                    placeholder={t('branches.placeholders.street')}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Phone size={18} className="text-primary" />
                {t('branches.sections.contact')}
              </h2>
              <p className="mb-4 text-xs text-foreground-tertiary">{t('branches.sections.contactHint')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t('branches.fields.phone')} *`}>
                  <input
                    {...register('phone')}
                    className={INPUT}
                    dir="ltr"
                    placeholder="+213 5XX XXX XXX"
                  />
                </Field>
                <Field label={`${t('branches.fields.manager')} *`}>
                  <input
                    {...register('managerName')}
                    className={INPUT}
                    placeholder={t('branches.placeholders.manager')}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">{t('branches.sections.status')}</h2>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background-secondary/50 px-4 py-3.5 transition hover:border-primary/30">
                <div>
                  <span className="text-sm font-medium text-foreground">{t('branches.fields.active')}</span>
                  <p className="text-xs text-foreground-tertiary">{t('branches.activeDesc')}</p>
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
              <Link to="/branches">
                <Button type="button" variant="secondary">
                  {t('common.cancel')}
                </Button>
              </Link>
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
                <p className="text-xs font-medium text-primary">{t('branches.preview.label')}</p>
                <p className="mt-0.5 text-[11px] text-foreground-tertiary">{t('branches.preview.hint')}</p>
              </div>
              <div className="p-5">
                <div className="mb-4 flex h-20 items-center justify-center rounded-xl bg-primary-surface/60">
                  <Store size={36} className="text-primary/50" strokeWidth={1.25} />
                </div>
                <p className="font-semibold text-foreground" dir="rtl">
                  {displayName}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm text-foreground-secondary">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                  <span>
                    {watched.commune || '—'}
                    {watched.street ? ` · ${watched.street}` : ''}
                  </span>
                </p>
                {watched.phone && watched.phone.length > 4 && (
                  <p className="mt-2 flex items-center gap-2 text-sm tabular-nums text-foreground-secondary" dir="ltr">
                    <Phone size={14} className="shrink-0 text-primary" />
                    {watched.phone}
                  </p>
                )}
                {watched.managerName && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-foreground-secondary">
                    <User size={14} className="shrink-0 text-primary" />
                    {watched.managerName}
                  </p>
                )}
                <div className="mt-4 border-t border-border pt-4">
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
