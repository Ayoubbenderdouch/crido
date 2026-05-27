import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { ChevronRight, Layers, Sparkles, Trash2 } from 'lucide-react'
import BnplPlanPreview from '@/components/products/BnplPlanPreview'
import ProductImagePicker from '@/components/products/ProductImagePicker'
import ProductLivePreview from '@/components/products/ProductLivePreview'
import { Button } from '@/components/ui/button'
import { deleteProduct, getProductById, saveProduct } from '@/lib/vendorStore'
import { useFormRoute } from '@/lib/useFormRoute'
import { PRODUCT_CATEGORIES } from '@/lib/productVisuals'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/format'

const schema = z.object({
  name: z.string().min(2),
  nameFr: z.string().optional(),
  category: z.string().min(1),
  priceDzd: z.number().min(1000).max(5_000_000),
  stock: z.number().min(0).optional(),
  sku: z.string().min(1),
  descriptionAr: z.string().optional(),
  available: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const INPUT =
  'h-11 w-full rounded-xl border border-border-strong bg-background px-3.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

export default function ProductFormPage() {
  const { isNew, numericId: productId } = useFormRoute()
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const existing = productId ? getProductById(productId) : undefined

  // Initialize from `existing` directly so we don't have to sync via an
  // effect (which the purity rule rightly flags).
  const [coverImage, setCoverImage] = useState<string | undefined>(existing?.coverImage)
  const [gallery, setGallery] = useState<string[]>(existing?.gallery ?? [])

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: '',
      nameFr: '',
      category: PRODUCT_CATEGORIES[0],
      priceDzd: 50_000,
      stock: 0,
      sku: '',
      descriptionAr: '',
      available: true,
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
        nameFr: existing.nameFr,
        category: existing.category,
        priceDzd: existing.priceDzd,
        stock: existing.stock ?? 0,
        sku: existing.sku,
        descriptionAr: existing.descriptionAr ?? '',
        available: existing.available,
      })
    }
  }, [existing, reset])

  if (!isNew && (productId == null || Number.isNaN(productId) || !existing)) {
    return (
      <div className="animate-fade-up">
        <Link to="/products" className="text-sm text-primary hover:underline">
          {t('common.back')}
        </Link>
      </div>
    )
  }

  const onSubmit = (data: FormValues) => {
    saveProduct({
      id: productId,
      name: data.name,
      nameFr: data.nameFr || data.name,
      category: data.category,
      priceDzd: data.priceDzd,
      stock: data.stock ?? 0,
      sku: data.sku,
      descriptionAr: data.descriptionAr || undefined,
      available: data.available,
      coverImage,
      gallery: gallery.length ? gallery : undefined,
    })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(isNew ? t('products.savedNew') : t('products.savedEdit'))
    navigate('/products')
  }

  const handleDelete = () => {
    if (!productId || !window.confirm(t('products.deleteConfirm'))) return
    deleteProduct(productId)
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(t('products.deleted'))
    navigate('/products')
  }

  const displayName =
    locale === 'fr' && existing?.nameFr ? existing.nameFr : existing?.name

  return (
    <div className="animate-fade-up">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('products.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
            <Sparkles size={14} />
            {isNew ? t('products.badgeNew') : t('products.badgeEdit')}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isNew ? t('products.addProduct') : t('products.editTitle', { name: displayName ?? '' })}
          </h1>
          <p className="mt-1 max-w-lg text-sm text-foreground-secondary">{t('products.formHint')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Layers size={18} className="text-primary" />
                  {t('products.sections.media')}
                </h2>
                <p className="mt-0.5 text-xs text-foreground-tertiary">{t('products.images.sectionHint')}</p>
              </div>
              <div className="p-5">
                <ProductImagePicker
                  category={watched.category}
                  coverImage={coverImage}
                  gallery={gallery}
                  onChange={({ coverImage: c, gallery: g }) => {
                    setCoverImage(c)
                    setGallery(g)
                  }}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-foreground">
                {t('products.sections.details')}
              </h2>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={`${t('products.fields.nameAr')} *`} error={errors.name}>
                    <input
                      {...register('name')}
                      className={cn(INPUT, errors.name && 'border-danger')}
                      dir="rtl"
                      placeholder={t('products.placeholders.nameAr')}
                    />
                  </Field>
                  <Field label={t('products.fields.nameFr')} error={errors.nameFr}>
                    <input
                      {...register('nameFr')}
                      className={INPUT}
                      placeholder={t('products.placeholders.nameFr')}
                    />
                  </Field>
                </div>

                <Field label={`${t('products.category')} *`} error={errors.category}>
                  <select {...register('category')} className={INPUT}>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t('products.fields.description')} error={errors.descriptionAr}>
                  <textarea
                    {...register('descriptionAr')}
                    rows={3}
                    className={cn(INPUT, 'h-auto resize-none py-2.5')}
                    dir="rtl"
                    placeholder={t('products.placeholders.description')}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label={`${t('products.price')} *`} error={errors.priceDzd}>
                    <div className="relative">
                      <input
                        type="number"
                        {...register('priceDzd', { valueAsNumber: true })}
                        className={cn(INPUT, 'pe-12', errors.priceDzd && 'border-danger')}
                      />
                      <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground-tertiary">
                        دج
                      </span>
                    </div>
                  </Field>
                  <Field label={t('products.stock')} error={errors.stock}>
                    <input
                      type="number"
                      {...register('stock', { valueAsNumber: true })}
                      className={INPUT}
                    />
                  </Field>
                  <Field label={`${t('products.sku')} *`} error={errors.sku}>
                    <input
                      {...register('sku')}
                      className={cn(INPUT, 'font-mono', errors.sku && 'border-danger')}
                      dir="ltr"
                      placeholder="TP-XXX-000"
                    />
                  </Field>
                </div>

                <BnplPlanPreview
                  priceDzd={watched.priceDzd || 0}
                  locale={locale}
                  className="lg:hidden"
                />

                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background-secondary/50 px-4 py-3.5 transition hover:border-primary/30">
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {t('products.available')}
                    </span>
                    <p className="text-xs text-foreground-tertiary">{t('products.availableDesc')}</p>
                  </div>
                  <input
                    type="checkbox"
                    {...register('available')}
                    className="h-5 w-5 rounded accent-[#0F6E56]"
                  />
                </label>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                {t('common.save')}
              </Button>
              <Link to="/products">
                <Button type="button" variant="secondary">
                  {t('common.cancel')}
                </Button>
              </Link>
              {!isNew && (
                <Button
                  type="button"
                  variant="destructive"
                  className="ms-auto"
                  onClick={handleDelete}
                >
                  <Trash2 size={15} />
                  {t('common.delete')}
                </Button>
              )}
            </div>
          </div>

          <div className="hidden space-y-6 lg:block">
            <ProductLivePreview
              locale={locale}
              name={watched.name}
              nameFr={watched.nameFr}
              category={watched.category}
              priceDzd={watched.priceDzd || 0}
              stock={watched.stock ?? 0}
              sku={watched.sku}
              available={watched.available}
              coverImage={coverImage}
            />
            <BnplPlanPreview priceDzd={watched.priceDzd || 0} locale={locale} />
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: { message?: string }
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground-secondary">{label}</label>
      {children}
      {error?.message && <p className="mt-1 text-xs text-danger">{error.message}</p>}
    </div>
  )
}
