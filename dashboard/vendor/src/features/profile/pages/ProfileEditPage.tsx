import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ArrowRight, Store } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVendorStore } from '@/hooks/useVendorStore'
import { saveProfile } from '@/lib/vendorStore'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2),
  nameFr: z.string().optional(),
  tagline: z.string().min(2),
  description: z.string().min(10),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  address: z.string().min(5),
})

type FormValues = z.infer<typeof schema>

const INPUT =
  'h-10 w-full rounded-md border border-border-strong bg-background px-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-foreground-secondary">
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
    </div>
  )
}

export default function ProfileEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { profile } = useVendorStore()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: profile,
  })

  useEffect(() => {
    reset(profile)
  }, [profile, reset])

  const onSubmit = (data: FormValues) => {
    saveProfile({
      ...data,
      email: data.email || '',
      website: data.website || '',
      nameFr: data.nameFr || data.name,
    })
    toast.success(t('profile.saved'))
    navigate('/profile')
  }

  return (
    <div className="animate-fade-up mx-auto max-w-2xl">
      <Link
        to="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-foreground-tertiary transition-colors hover:text-primary"
      >
        <ArrowRight size={16} className="rtl:rotate-180" />
        {t('profile.title')}
      </Link>

      <PageHeader title={t('profile.edit')} subtitle={t('profile.editHint')} />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-primary-surface/40 px-5 py-4 sm:px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-fg">
            <Store size={20} strokeWidth={1.5} />
          </span>
          <p className="text-sm text-foreground-secondary">{t('profile.editIntro')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('profile.fields.nameAr')} required>
              <input {...register('name')} className={INPUT} dir="rtl" />
              {errors.name ? (
                <p className="mt-1 text-xs text-danger">{t('profile.validation.required')}</p>
              ) : null}
            </Field>
            <Field label={t('profile.fields.nameFr')}>
              <input {...register('nameFr')} className={INPUT} />
            </Field>
          </div>

          <Field label={t('profile.fields.tagline')} required>
            <input {...register('tagline')} className={INPUT} dir="rtl" />
          </Field>

          <Field label={t('profile.fields.description')} required>
            <textarea
              {...register('description')}
              rows={4}
              className={cn(INPUT, 'h-auto resize-none py-2.5')}
              dir="rtl"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('profile.fields.phone')} required>
              <input {...register('phone')} className={INPUT} dir="ltr" type="tel" />
            </Field>
            <Field label={t('profile.fields.email')}>
              <input {...register('email')} className={INPUT} dir="ltr" type="email" />
            </Field>
          </div>

          <Field label={t('profile.fields.website')}>
            <input {...register('website')} className={INPUT} dir="ltr" placeholder="taharphone.dz" />
          </Field>

          <Field label={t('profile.fields.address')} required>
            <input {...register('address')} className={INPUT} dir="rtl" />
          </Field>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <Button type="submit" disabled={isSubmitting}>
              {t('common.save')}
            </Button>
            <Link to="/profile">
              <Button type="button" variant="secondary">
                {t('common.cancel')}
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
