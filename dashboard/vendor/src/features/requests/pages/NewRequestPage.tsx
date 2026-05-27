// ─────────────────────────────────────────────────────────────
// NewRequestPage — vendor-initiated financing request.
// The merchant captures customer + product info + financing plan
// and submits it on behalf of the buyer (in-store kiosk flow).
// Mock-creates a `submitted` request and navigates to its detail.
// ─────────────────────────────────────────────────────────────

import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm, useWatch, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Coins,
  MapPin,
  Package,
  Phone,
  Receipt,
  Sparkles,
  Store,
  User,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDzd, type Locale } from '@/lib/format'
import { BNPL_PLANS, calcBnpl, type BnplCalcResult } from '@/lib/bnplCalc'
import { merchantProfile } from '@/lib/mock/data'
import { createRequest } from '@/lib/vendorStore'
import { fetchCustomers } from '@/lib/api'
import {
  ADRAR_COMMUNES,
  WILAYAS,
  communeName,
  getCommunesForWilaya,
  wilayaName,
} from '@/lib/geoData'

// ── Validation ────────────────────────────────────────────────

const PHONE_RE = /^\+213[567]\d{8}$/

const schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(PHONE_RE, 'phone_format'),
  fullName: z.string().trim().min(2, 'name_required'),
  wilayaId: z.coerce.number().int().min(1).max(58),
  commune: z.string().trim().min(1, 'commune_required'),
  productType: z.string().min(1, 'product_type_required'),
  productName: z.string().trim().min(2, 'product_name_required'),
  priceDzd: z.coerce
    .number({ error: 'price_required' })
    .min(10_000, 'price_min')
    .max(5_000_000, 'price_max'),
  planMonths: z.coerce.number().int().min(1).max(12),
})

type FormValues = z.infer<typeof schema>

// ── Product types ─────────────────────────────────────────────

type ProductType = {
  key: string
  labelAr: string
  labelFr: string
}

const PRODUCT_TYPES: ProductType[] = [
  { key: 'smartphone', labelAr: 'هاتف ذكي', labelFr: 'Smartphone' },
  { key: 'laptop', labelAr: 'حاسوب محمول', labelFr: 'Ordinateur portable' },
  { key: 'tablet', labelAr: 'جهاز لوحي', labelFr: 'Tablette' },
  { key: 'tv', labelAr: 'تلفاز', labelFr: 'Téléviseur' },
  { key: 'appliance', labelAr: 'جهاز كهرومنزلي', labelFr: 'Électroménager' },
  { key: 'furniture', labelAr: 'أثاث', labelFr: 'Meubles' },
  { key: 'accessory', labelAr: 'ملحقات', labelFr: 'Accessoires' },
  { key: 'other', labelAr: 'أخرى', labelFr: 'Autre' },
]

function productTypeLabel(key: string, locale: Locale): string {
  const type = PRODUCT_TYPES.find((p) => p.key === key)
  if (!type) return key
  return locale === 'ar' ? type.labelAr : type.labelFr
}

// ── Plan math (extended to 1-12 months) ───────────────────────

/**
 * Map any month count 1-12 to a margin %. Standard plans (4/6/12) use the
 * official BNPL_PLANS values; non-standard months interpolate linearly
 * between the two surrounding standard plans, so previews stay sensible
 * while the official offer is still 4/6/12.
 */
function marginPctFor(months: number): number {
  if (months <= 0) return 0
  const plan = BNPL_PLANS.find((p) => p.months === months)
  if (plan) return plan.clientMarginPct
  const sorted = [...BNPL_PLANS].sort((a, b) => a.months - b.months)
  if (months < sorted[0].months) return sorted[0].clientMarginPct
  if (months > sorted[sorted.length - 1].months) return sorted[sorted.length - 1].clientMarginPct
  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]
    const hi = sorted[i + 1]
    if (months >= lo.months && months <= hi.months) {
      const ratio = (months - lo.months) / (hi.months - lo.months)
      return lo.clientMarginPct + (hi.clientMarginPct - lo.clientMarginPct) * ratio
    }
  }
  return sorted[sorted.length - 1].clientMarginPct
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function calcAny(
  priceDzd: number,
  months: number,
  commissionPct = merchantProfile.commissionRate,
): BnplCalcResult | null {
  if (!Number.isFinite(priceDzd) || priceDzd <= 0 || months <= 0) return null
  // Reuse the official helper for standard plans so the math is identical.
  const standard = BNPL_PLANS.find((p) => p.months === months)
  if (standard) return calcBnpl(priceDzd, standard.months, commissionPct)
  const marginPct = marginPctFor(months)
  const merchantCommission = round2(priceDzd * (commissionPct / 100))
  const merchantPayout = round2(priceDzd - merchantCommission)
  const clientMargin = round2(priceDzd * (marginPct / 100))
  const totalToCollect = round2(priceDzd + clientMargin)
  const monthlyInstallment = round2(totalToCollect / months)
  // Cast to BnplCalcResult shape (months type-narrows for non-standard plans).
  return {
    planMonths: months as BnplCalcResult['planMonths'],
    clientMarginPct: round2(marginPct),
    monthlyInstallment,
    totalToCollect,
    merchantPayout,
    clientMargin,
    merchantCommission,
  }
}

// ── Reusable input + section primitives (inline, no new components) ──

const INPUT =
  'h-11 w-full rounded-xl border border-border-strong bg-background px-3.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: { message?: string }
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground-secondary">{label}</label>
      {children}
      {hint && !error?.message ? (
        <p className="mt-1 text-[11px] text-foreground-tertiary">{hint}</p>
      ) : null}
      {error?.message ? <p className="mt-1 text-xs text-danger">{error.message}</p> : null}
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  step,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle?: string
  step: number
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg shadow-sm">
          <Icon size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
              {String(step).padStart(2, '0')}
            </span>
            {title}
          </h2>
          {subtitle ? <p className="mt-0.5 text-xs text-foreground-tertiary">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────

export default function NewRequestPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isAr = locale === 'ar'

  // ── i18n: most labels reuse existing keys; new strings are inline-localized
  // so we don't have to touch ar.json / fr.json (per task constraint).
  const L = isAr ? AR : FR

  // Use seeded customers for the auto-fill lookup.
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: 'onChange',
    defaultValues: {
      phone: '+213',
      fullName: '',
      wilayaId: 1,
      commune: 'أدرار',
      productType: 'smartphone',
      productName: '',
      priceDzd: 100_000,
      planMonths: 6,
    },
  })

  // `useWatch` is compiler-safe; the bare `watch()` from `useForm` returns a
  // function that the React Compiler can't memoize. The cast is safe because
  // `useForm` was initialized with a value for every field.
  const watched = useWatch({ control }) as FormValues
  const wilayaId = Number(watched.wilayaId) || 1
  const communes = useMemo(() => getCommunesForWilaya(wilayaId), [wilayaId])
  const selectedWilaya = WILAYAS.find((w) => w.id === wilayaId)
  const wilayaUnavailable = selectedWilaya ? !selectedWilaya.serviceAvailable : false

  // Customer auto-fill: derive the recognized name directly from the phone
  // input so we don't have to mirror it into local state via an effect.
  const recognized = useMemo<string | null>(() => {
    if (!PHONE_RE.test(watched.phone)) return null
    return customers.find((c) => c.phone === watched.phone)?.name ?? null
  }, [watched.phone, customers])

  // The form-field side effect (filling name / wilaya / commune from the
  // matched customer) stays in an effect — `setValue` is RHF's imperative
  // API, not React local state, so the purity rule doesn't apply.
  useEffect(() => {
    if (!PHONE_RE.test(watched.phone)) return
    const match = customers.find((c) => c.phone === watched.phone)
    if (!match) return
    setValue('fullName', match.name, { shouldValidate: true })
    const commune = ADRAR_COMMUNES.find((c) => c.nameAr === match.commune)
    if (commune) {
      setValue('wilayaId', commune.wilayaId, { shouldValidate: true })
      setValue('commune', commune.nameAr, { shouldValidate: true })
    }
  }, [watched.phone, customers, setValue])

  // Reset commune when wilaya changes (only Adrar has communes loaded).
  useEffect(() => {
    if (!communes.find((c) => c.nameAr === watched.commune)) {
      setValue('commune', communes[0]?.nameAr ?? '')
    }
  }, [wilayaId, communes, watched.commune, setValue])

  const calc = useMemo(
    () => calcAny(Number(watched.priceDzd) || 0, Number(watched.planMonths) || 0),
    [watched.priceDzd, watched.planMonths],
  )

  // ── Submit ──
  const onSubmit = (data: FormValues) => {
    if (wilayaUnavailable) {
      toast.error(L.errors.wilayaUnavailable)
      return
    }
    const commune = ADRAR_COMMUNES.find((c) => c.nameAr === data.commune)
    const wilaya = WILAYAS.find((w) => w.id === data.wilayaId)
    const branchName = `${merchantProfile.name} — ${
      commune ? communeName(commune, locale) : wilaya ? wilayaName(wilaya, locale) : ''
    }`
    const created = createRequest({
      customerName: data.fullName,
      customerPhone: data.phone,
      productName: data.productName,
      amountDzd: Math.round(data.priceDzd),
      planMonths: data.planMonths,
      branchName,
      note: L.submission.merchantNote(productTypeLabel(data.productType, locale)),
    })
    void queryClient.invalidateQueries({ queryKey: ['requests'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    toast.success(L.submission.success(created.reference))
    navigate(`/requests/${created.reference}`)
  }

  const errorMessage = (key?: string): { message?: string } | undefined => {
    if (!key) return undefined
    return { message: L.errors[key as keyof typeof L.errors] ?? key }
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/requests"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
            <Sparkles size={14} />
            {L.badge}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{L.title}</h1>
          <p className="mt-1 max-w-xl text-sm text-foreground-secondary">{L.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ── Left: form sections ─────────────────────────── */}
          <div className="space-y-6">
            {/* Step 1 — Customer */}
            <SectionCard
              icon={User}
              step={1}
              title={L.sections.customer.title}
              subtitle={L.sections.customer.subtitle}
            >
              <div className="space-y-4">
                <Field
                  label={`${L.fields.phone} *`}
                  hint={L.fields.phoneHint}
                  error={errorMessage(errors.phone?.message)}
                >
                  <div className="relative">
                    <Phone
                      size={16}
                      className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                    />
                    <input
                      {...register('phone')}
                      type="tel"
                      dir="ltr"
                      placeholder="+213 5XX XXX XXX"
                      className={cn(INPUT, 'ps-10 tabular-nums', errors.phone && 'border-danger')}
                    />
                  </div>
                  {recognized ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary-surface px-2.5 py-1 text-[11px] font-medium text-primary">
                      <CheckCircle2 size={13} />
                      {L.fields.phoneMatched(recognized)}
                    </div>
                  ) : null}
                </Field>

                <Field
                  label={`${L.fields.fullName} *`}
                  error={errorMessage(errors.fullName?.message)}
                >
                  <input
                    {...register('fullName')}
                    dir="rtl"
                    placeholder={L.fields.fullNamePh}
                    className={cn(INPUT, errors.fullName && 'border-danger')}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={`${L.fields.wilaya} *`}
                    error={errorMessage(errors.wilayaId?.message)}
                  >
                    <Controller
                      control={control}
                      name="wilayaId"
                      render={({ field }) => (
                        <select
                          {...field}
                          value={String(field.value)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={INPUT}
                        >
                          {WILAYAS.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.code} — {wilayaName(w, locale)}
                              {w.serviceAvailable ? '' : ` (${L.wilayaSoon})`}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </Field>

                  <Field
                    label={`${L.fields.commune} *`}
                    error={errorMessage(errors.commune?.message)}
                  >
                    <select
                      {...register('commune')}
                      className={INPUT}
                      disabled={communes.length === 0}
                    >
                      {communes.length === 0 ? (
                        <option value="">{L.fields.communeUnavailable}</option>
                      ) : (
                        communes.map((c) => (
                          <option key={c.code} value={c.nameAr}>
                            {communeName(c, locale)}
                          </option>
                        ))
                      )}
                    </select>
                  </Field>
                </div>

                {wilayaUnavailable ? (
                  <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/8 px-3 py-2.5 text-xs leading-relaxed text-foreground">
                    <CircleAlert size={15} className="mt-0.5 shrink-0 text-warning" />
                    <span>{L.fields.wilayaUnavailableHint}</span>
                  </div>
                ) : null}
              </div>
            </SectionCard>

            {/* Step 2 — Product */}
            <SectionCard
              icon={Package}
              step={2}
              title={L.sections.product.title}
              subtitle={L.sections.product.subtitle}
            >
              <div className="space-y-4">
                <Field
                  label={`${L.fields.productType} *`}
                  error={errorMessage(errors.productType?.message)}
                >
                  <select {...register('productType')} className={INPUT}>
                    {PRODUCT_TYPES.map((p) => (
                      <option key={p.key} value={p.key}>
                        {locale === 'ar' ? p.labelAr : p.labelFr}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label={`${L.fields.productName} *`}
                  error={errorMessage(errors.productName?.message)}
                >
                  <input
                    {...register('productName')}
                    dir="auto"
                    placeholder={L.fields.productNamePh}
                    className={cn(INPUT, errors.productName && 'border-danger')}
                  />
                </Field>

                <Field
                  label={`${L.fields.price} *`}
                  hint={L.fields.priceHint}
                  error={errorMessage(errors.priceDzd?.message)}
                >
                  <div className="relative">
                    <input
                      {...register('priceDzd', { valueAsNumber: true })}
                      type="number"
                      step="1000"
                      min={10_000}
                      className={cn(
                        INPUT,
                        'pe-14 tabular-nums',
                        errors.priceDzd && 'border-danger',
                      )}
                    />
                    <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs font-medium text-foreground-tertiary">
                      {locale === 'ar' ? 'دج' : 'DZD'}
                    </span>
                  </div>
                </Field>
              </div>
            </SectionCard>

            {/* Step 3 — Plan */}
            <SectionCard
              icon={CalendarClock}
              step={3}
              title={L.sections.plan.title}
              subtitle={L.sections.plan.subtitle}
            >
              <Controller
                control={control}
                name="planMonths"
                render={({ field }) => {
                  const months = Number(field.value) || 0
                  return (
                    <div className="space-y-5">
                      {/* Quick chips */}
                      <div className="flex flex-wrap gap-2">
                        {[4, 6, 12].map((m) => {
                          const active = months === m
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => field.onChange(m)}
                              className={cn(
                                'flex flex-1 flex-col items-center gap-0.5 rounded-xl border px-4 py-3 text-sm transition sm:flex-none sm:min-w-[110px]',
                                active
                                  ? 'border-primary bg-primary text-primary-fg shadow-sm'
                                  : 'border-border-strong bg-background text-foreground-secondary hover:border-primary/40 hover:bg-primary-surface/40',
                              )}
                            >
                              <span className="text-lg font-semibold tabular-nums">{m}</span>
                              <span className="text-[11px] uppercase tracking-wider opacity-80">
                                {L.plan.monthsShort}
                              </span>
                            </button>
                          )
                        })}
                        <div
                          className={cn(
                            'flex flex-1 items-center gap-2 rounded-xl border bg-background px-3 py-2 sm:min-w-[160px]',
                            ![4, 6, 12].includes(months)
                              ? 'border-primary/50 bg-primary-surface/40'
                              : 'border-border-strong',
                          )}
                        >
                          <span className="text-[11px] font-medium uppercase tracking-wider text-foreground-tertiary">
                            {L.plan.custom}
                          </span>
                          <input
                            type="number"
                            min={1}
                            max={12}
                            value={months}
                            onChange={(e) => {
                              const n = Math.min(12, Math.max(1, Number(e.target.value) || 1))
                              field.onChange(n)
                            }}
                            className="h-8 w-16 rounded-lg border border-border bg-background px-2 text-center text-sm tabular-nums focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Slider */}
                      <div>
                        <div className="mb-2 flex items-center justify-between text-[11px] text-foreground-tertiary">
                          <span>1</span>
                          <span className="font-medium tabular-nums text-primary">
                            {L.plan.monthsCount(months)}
                          </span>
                          <span>12</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={12}
                          step={1}
                          value={months}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="w-full accent-[#0F6E56]"
                        />
                        <div className="mt-2 grid grid-cols-12 gap-1 text-center text-[10px] text-foreground-tertiary">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                            <span
                              key={n}
                              className={cn(
                                'tabular-nums',
                                n === months ? 'font-bold text-primary' : '',
                              )}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Live plan breakdown */}
                      {calc ? (
                        <div className="grid gap-3 rounded-xl border border-primary/20 bg-gradient-to-br from-primary-surface to-primary-surface/40 p-4 sm:grid-cols-3">
                          <BreakdownStat
                            icon={Wallet}
                            label={L.plan.monthly}
                            value={formatDzd(calc.monthlyInstallment, locale)}
                            tone="primary"
                          />
                          <BreakdownStat
                            icon={Receipt}
                            label={L.plan.total}
                            value={formatDzd(calc.totalToCollect, locale)}
                          />
                          <BreakdownStat
                            icon={Coins}
                            label={L.plan.margin(calc.clientMarginPct)}
                            value={formatDzd(calc.clientMargin, locale)}
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border-strong bg-background-secondary/40 px-4 py-5 text-center text-sm text-foreground-tertiary">
                          {L.plan.enterPrice}
                        </div>
                      )}

                      <p className="text-[11px] leading-relaxed text-foreground-tertiary">
                        {L.plan.disclaimer}
                      </p>
                    </div>
                  )
                }}
              />
            </SectionCard>

            {/* Step 4 — Summary */}
            <SectionCard
              icon={CheckCircle2}
              step={4}
              title={L.sections.review.title}
              subtitle={L.sections.review.subtitle}
            >
              <dl className="grid gap-3 sm:grid-cols-2">
                <SummaryItem label={L.fields.fullName} value={watched.fullName || '—'} />
                <SummaryItem
                  label={L.fields.phone}
                  value={<span dir="ltr">{watched.phone}</span>}
                />
                <SummaryItem
                  label={L.fields.wilaya}
                  value={selectedWilaya ? wilayaName(selectedWilaya, locale) : '—'}
                />
                <SummaryItem label={L.fields.commune} value={watched.commune || '—'} />
                <SummaryItem
                  label={L.fields.productType}
                  value={productTypeLabel(watched.productType, locale)}
                />
                <SummaryItem label={L.fields.productName} value={watched.productName || '—'} />
                <SummaryItem
                  label={L.fields.price}
                  value={formatDzd(Number(watched.priceDzd) || 0, locale)}
                />
                <SummaryItem
                  label={L.plan.label}
                  value={L.plan.monthsCount(Number(watched.planMonths) || 0)}
                />
              </dl>
            </SectionCard>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || wilayaUnavailable}
                className="min-w-[200px] h-12 px-6 text-base"
              >
                {L.actions.submit}
              </Button>
              <Link to="/requests">
                <Button type="button" variant="secondary" className="h-12 px-6">
                  {t('common.cancel')}
                </Button>
              </Link>
              {!isValid ? (
                <span className="text-xs text-foreground-tertiary">{L.actions.fillAll}</span>
              ) : null}
            </div>
          </div>

          {/* ── Right: live preview ─────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <LivePreviewCard
                customerName={watched.fullName}
                phone={watched.phone}
                wilayaName={selectedWilaya ? wilayaName(selectedWilaya, locale) : ''}
                communeName={watched.commune}
                productType={productTypeLabel(watched.productType, locale)}
                productName={watched.productName}
                priceDzd={Number(watched.priceDzd) || 0}
                planMonths={Number(watched.planMonths) || 0}
                calc={calc}
                locale={locale}
                merchantName={isAr ? merchantProfile.name : merchantProfile.nameFr}
                L={L}
              />
            </div>
          </aside>
        </div>

        {/* Mobile preview — shows below the form */}
        <div className="mt-6 lg:hidden">
          <LivePreviewCard
            customerName={watched.fullName}
            phone={watched.phone}
            wilayaName={selectedWilaya ? wilayaName(selectedWilaya, locale) : ''}
            communeName={watched.commune}
            productType={productTypeLabel(watched.productType, locale)}
            productName={watched.productName}
            priceDzd={Number(watched.priceDzd) || 0}
            planMonths={Number(watched.planMonths) || 0}
            calc={calc}
            locale={locale}
            merchantName={isAr ? merchantProfile.name : merchantProfile.nameFr}
            L={L}
          />
        </div>
      </form>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function BreakdownStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  tone?: 'primary'
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-lg bg-card/80 px-3 py-2.5 shadow-sm',
        tone === 'primary' ? 'ring-1 ring-primary/30' : '',
      )}
    >
      <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-foreground-tertiary">{label}</p>
        <p
          className={cn(
            'mt-0.5 tabular-nums font-semibold',
            tone === 'primary' ? 'text-base text-primary' : 'text-sm text-foreground',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function SummaryItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-background-secondary/40 px-3.5 py-2.5">
      <dt className="text-[11px] uppercase tracking-wider text-foreground-tertiary">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  )
}

function LivePreviewCard({
  customerName,
  phone,
  wilayaName: wilayaLabel,
  communeName: communeLabel,
  productType,
  productName,
  priceDzd,
  planMonths,
  calc,
  locale,
  merchantName,
  L,
}: {
  customerName: string
  phone: string
  wilayaName: string
  communeName: string
  productType: string
  productName: string
  priceDzd: number
  planMonths: number
  calc: BnplCalcResult | null
  locale: Locale
  merchantName: string
  L: typeof AR
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_30px_rgba(15,110,86,0.08)]">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/90 to-transparent px-5 py-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {L.preview.label}
        </p>
        <p className="mt-0.5 text-xs text-foreground-tertiary">{L.preview.hint}</p>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg">
            <User size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {customerName || L.preview.customerPh}
            </p>
            <p className="truncate text-xs tabular-nums text-foreground-tertiary" dir="ltr">
              {phone}
            </p>
            {(wilayaLabel || communeLabel) && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-foreground-tertiary">
                <MapPin size={11} />
                {communeLabel}
                {wilayaLabel ? ` · ${wilayaLabel}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border" />

        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-surface text-primary">
            <Package size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {productName || L.preview.productPh}
            </p>
            <p className="text-xs text-foreground-tertiary">{productType}</p>
            <p className="mt-0.5 text-sm tabular-nums font-semibold text-foreground">
              {formatDzd(priceDzd, locale)}
            </p>
          </div>
        </div>

        <div className="border-t border-border" />

        {calc && priceDzd > 0 ? (
          <>
            <div className="rounded-xl bg-gradient-to-br from-primary-surface to-primary-surface/40 px-4 py-4">
              <p className="text-[10px] uppercase tracking-wider text-primary/80">
                {L.plan.monthly}
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-primary">
                {formatDzd(calc.monthlyInstallment, locale)}
              </p>
              <p className="mt-0.5 text-[11px] text-foreground-secondary">
                × {L.plan.monthsCount(planMonths)} = {formatDzd(calc.totalToCollect, locale)}
              </p>
            </div>

            <dl className="space-y-1.5 text-xs">
              <Row label={L.preview.principal} value={formatDzd(priceDzd, locale)} />
              <Row
                label={L.preview.clientMargin(calc.clientMarginPct)}
                value={`+ ${formatDzd(calc.clientMargin, locale)}`}
              />
              <Row
                label={L.preview.commission}
                value={`− ${formatDzd(calc.merchantCommission, locale)}`}
                tone="muted"
              />
              <div className="mt-2 flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-primary-fg">
                <span className="text-xs font-medium">{L.preview.payout}</span>
                <span className="text-sm font-bold tabular-nums">
                  {formatDzd(calc.merchantPayout, locale)}
                </span>
              </div>
            </dl>
          </>
        ) : (
          <p className="rounded-xl border border-dashed border-border-strong bg-background-secondary/40 px-4 py-5 text-center text-sm text-foreground-tertiary">
            {L.preview.empty}
          </p>
        )}

        <div className="flex items-center gap-2 border-t border-border pt-3 text-[11px] text-foreground-tertiary">
          <Store size={13} className="text-primary/70" />
          <span>{L.preview.merchantTag(merchantName)}</span>
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'muted'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-foreground-secondary', tone === 'muted' && 'text-foreground-tertiary')}>
        {label}
      </span>
      <span className="tabular-nums font-medium text-foreground">{value}</span>
    </div>
  )
}

// ── Localized copy (inline; we don't touch the JSON files) ────

const AR = {
  badge: 'طلب جديد',
  title: 'إضافة طلب تمويل',
  subtitle: 'أنشئ طلب تمويل نيابةً عن الزبون مباشرة من نقطة البيع.',
  wilayaSoon: 'قريباً',
  sections: {
    customer: {
      title: 'بيانات الزبون',
      subtitle: 'أدخل رقم هاتف الزبون أولاً — إذا كان مسجلاً سيتم استرجاع بياناته تلقائياً.',
    },
    product: {
      title: 'المنتج',
      subtitle: 'النوع والاسم والسعر الأصلي للمنتج المُموَّل.',
    },
    plan: {
      title: 'خطة التمويل',
      subtitle: 'اختر مدة التقسيط من 1 إلى 12 شهراً. الأرقام تُحدَّث فوراً.',
    },
    review: {
      title: 'مراجعة وتأكيد',
      subtitle: 'تحقّق من البيانات قبل الإرسال — يُرسَل الطلب لمراجعة Crido بعد التأكيد.',
    },
  },
  fields: {
    phone: 'رقم هاتف الزبون',
    phoneHint: 'تنسيق: +213 5XX XXX XXX — إذا كان الزبون مسجلاً، سيتم استرجاع بياناته',
    phoneMatched: (name: string) => `تم التعرف على الزبون: ${name}`,
    fullName: 'الاسم الكامل',
    fullNamePh: 'الاسم الكامل بالعربية',
    wilaya: 'الولاية',
    commune: 'البلدية',
    communeUnavailable: 'لا تتوفر بلديات لهذه الولاية بعد',
    wilayaUnavailableHint:
      'هذه الولاية غير مفعّلة حالياً. Crido متوفّر في ولاية أدرار فقط في هذه المرحلة.',
    productType: 'نوع المنتج',
    productName: 'اسم المنتج',
    productNamePh: 'مثال: iPhone 16',
    price: 'السعر الأصلي',
    priceHint: 'السعر النقدي قبل الهامش — يُحسب القسط الشهري تلقائياً.',
  },
  plan: {
    label: 'الخطة',
    custom: 'مدة مخصصة',
    monthsShort: 'شهر',
    monthsCount: (n: number) => (n > 0 ? `${n} ${n === 1 ? 'شهر' : 'أشهر'}` : '—'),
    monthly: 'القسط الشهري',
    total: 'الإجمالي على الزبون',
    margin: (pct: number) => `هامش الزبون (${Math.round(pct)}%)`,
    enterPrice: 'أدخل سعر المنتج لمعاينة الأقساط',
    disclaimer:
      'أرقام تقديرية وفق صيغة المرابحة — تُثبَّت عند موافقة Crido. لا توجد فوائد، فقط هامش متفق عليه مسبقاً.',
  },
  preview: {
    label: 'معاينة الطلب',
    hint: 'هكذا سيظهر الطلب في طابور Crido',
    customerPh: 'اسم الزبون',
    productPh: 'اسم المنتج',
    principal: 'السعر الأصلي',
    clientMargin: (pct: number) => `هامش الزبون (${Math.round(pct)}%)`,
    commission: `عمولة Crido (${merchantProfile.commissionRate}%)`,
    payout: 'ستستلم',
    empty: 'أكمل البيانات لمعاينة الحسابات',
    merchantTag: (name: string) => `سيُسجَّل الطلب باسم: ${name}`,
  },
  errors: {
    phone_format: 'رقم الهاتف غير صحيح — التنسيق: +213 5XX XXX XXX',
    name_required: 'الاسم الكامل مطلوب',
    commune_required: 'البلدية مطلوبة',
    product_type_required: 'اختر نوع المنتج',
    product_name_required: 'اسم المنتج مطلوب',
    price_required: 'السعر مطلوب',
    price_min: 'الحد الأدنى للسعر 10,000 دج',
    price_max: 'الحد الأقصى للسعر 5,000,000 دج',
    wilayaUnavailable: 'لا يمكن إرسال الطلب — Crido متوفر حالياً في ولاية أدرار فقط.',
  },
  actions: {
    submit: 'إرسال الطلب لـ Crido',
    fillAll: 'أكمل جميع الحقول المطلوبة',
  },
  submission: {
    success: (ref: string) => `تم إنشاء الطلب ${ref} — أُرسل لمراجعة Crido.`,
    merchantNote: (type: string) => `طلب من نقطة البيع — ${type}.`,
  },
}

const FR: typeof AR = {
  badge: 'Nouvelle demande',
  title: 'Ajouter une demande de financement',
  subtitle: 'Créez une demande au nom du client directement depuis le point de vente.',
  wilayaSoon: 'bientôt',
  sections: {
    customer: {
      title: 'Informations client',
      subtitle:
        'Commencez par le numéro de téléphone — si le client est déjà enregistré, ses infos seront pré-remplies.',
    },
    product: {
      title: 'Produit',
      subtitle: 'Type, nom et prix d’origine du produit financé.',
    },
    plan: {
      title: 'Plan de financement',
      subtitle: 'Choisissez la durée (1 à 12 mois). Les chiffres se mettent à jour en direct.',
    },
    review: {
      title: 'Vérification',
      subtitle:
        'Vérifiez les informations avant l’envoi — la demande sera transmise à Crido pour examen.',
    },
  },
  fields: {
    phone: 'Téléphone du client',
    phoneHint: 'Format : +213 5XX XXX XXX — si le client est inscrit, ses infos sont récupérées',
    phoneMatched: (name: string) => `Client reconnu : ${name}`,
    fullName: 'Nom complet',
    fullNamePh: 'Nom complet en arabe',
    wilaya: 'Wilaya',
    commune: 'Commune',
    communeUnavailable: 'Aucune commune disponible pour cette wilaya',
    wilayaUnavailableHint:
      'Cette wilaya n’est pas encore activée. Crido est disponible uniquement à Adrar pour le moment.',
    productType: 'Type de produit',
    productName: 'Nom du produit',
    productNamePh: 'Ex. : iPhone 16',
    price: 'Prix d’origine',
    priceHint: 'Prix cash avant marge — la mensualité est calculée automatiquement.',
  },
  plan: {
    label: 'Plan',
    custom: 'Durée personnalisée',
    monthsShort: 'mois',
    monthsCount: (n: number) => (n > 0 ? `${n} mois` : '—'),
    monthly: 'Mensualité',
    total: 'Total client',
    margin: (pct: number) => `Marge client (${Math.round(pct)} %)`,
    enterPrice: 'Entrez le prix du produit pour voir les mensualités',
    disclaimer:
      'Chiffres indicatifs selon le modèle Murabaha — figés à l’approbation Crido. Pas d’intérêts, uniquement une marge convenue d’avance.',
  },
  preview: {
    label: 'Aperçu de la demande',
    hint: 'Voici comment la demande apparaîtra dans la file Crido',
    customerPh: 'Nom du client',
    productPh: 'Nom du produit',
    principal: 'Prix d’origine',
    clientMargin: (pct: number) => `Marge client (${Math.round(pct)} %)`,
    commission: `Commission Crido (${merchantProfile.commissionRate} %)`,
    payout: 'Vous recevez',
    empty: 'Complétez le formulaire pour voir le calcul',
    merchantTag: (name: string) => `La demande sera enregistrée sous : ${name}`,
  },
  errors: {
    phone_format: 'Numéro invalide — format attendu : +213 5XX XXX XXX',
    name_required: 'Le nom complet est requis',
    commune_required: 'La commune est requise',
    product_type_required: 'Choisissez un type de produit',
    product_name_required: 'Le nom du produit est requis',
    price_required: 'Le prix est requis',
    price_min: 'Prix minimum : 10 000 DZD',
    price_max: 'Prix maximum : 5 000 000 DZD',
    wilayaUnavailable: 'Envoi impossible — Crido n’est disponible qu’à Adrar pour l’instant.',
  },
  actions: {
    submit: 'Envoyer à Crido',
    fillAll: 'Complétez tous les champs requis',
  },
  submission: {
    success: (ref: string) => `Demande ${ref} créée — envoyée à Crido pour examen.`,
    merchantNote: (type: string) => `Demande créée en boutique — ${type}.`,
  },
}
