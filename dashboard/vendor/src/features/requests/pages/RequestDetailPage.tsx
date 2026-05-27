import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  ChevronRight,
  FileX,
  Phone,
  MessageCircle,
  User,
  Package,
  Clock,
  Wallet,
  X,
  CheckCircle2,
  PlayCircle,
  Loader2,
  Hourglass,
  Sparkles,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { cn } from '@/lib/utils'
import { confirmRequest, fetchRequest, isRealApi, rejectRequest } from '@/lib/api'
import { merchantProfile, type IncomingRequest } from '@/lib/mock/data'
import { updateRequestStatus } from '@/lib/vendorStore'
import { apiErrorMessage } from '@/lib/apiClient'
import { formatDate, formatDzd, type Locale } from '@/lib/format'
import { RequestStepper } from '../components/RequestStepper'

const INPUT =
  'w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm text-foreground transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function whatsappLink(phone: string, message: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <span className="text-sm text-foreground-tertiary">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon size={18} className="text-primary" />
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-xs text-foreground-tertiary">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-1">{children}</div>
      {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
    </section>
  )
}

function ActionModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        aria-label="close"
        onClick={onClose}
      />
      <div
        role="dialog"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-foreground-tertiary transition hover:bg-background-secondary hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
      </div>
    </div>
  )
}

// ─── Activity log ─────────────────────────────────────────────────────

type LogEntry = {
  key: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  detail?: string
  timestamp?: string | null
  tone: 'submitted' | 'confirmed' | 'processing' | 'approved' | 'completed' | 'rejected'
}

function buildLog(request: IncomingRequest, locale: Locale): LogEntry[] {
  const ar = locale === 'ar'
  const log: LogEntry[] = []

  log.push({
    key: 'submitted',
    icon: Sparkles,
    title: ar ? 'أرسل الزبون الطلب' : 'Client a soumis la demande',
    detail: ar
      ? `طلب من ${request.customerName}`
      : `Demande de ${request.customerName}`,
    timestamp: request.submittedAt ?? request.createdAt,
    tone: 'submitted',
  })

  if (request.merchantConfirmedAt) {
    log.push({
      key: 'merchant_confirmed',
      icon: CheckCircle2,
      title: ar ? 'تم التأكيد من قبل التاجر' : 'Confirmé par le marchand',
      detail: ar
        ? 'السعر والمنتج مؤكَّدان — انتظار Crido'
        : 'Prix et produit confirmés — en attente de Crido',
      timestamp: request.merchantConfirmedAt,
      tone: 'confirmed',
    })
  }

  if (request.processingStartedAt) {
    log.push({
      key: 'processing',
      icon: Loader2,
      title: ar ? 'بدأت Crido بمعالجة الطلب' : 'Crido a démarré le traitement',
      detail: ar
        ? 'مراجعة المستندات وإصدار العقد'
        : 'Vérification des documents et émission du contrat',
      timestamp: request.processingStartedAt,
      tone: 'processing',
    })
  }

  if (request.approvedAt) {
    log.push({
      key: 'approved',
      icon: CheckCircle2,
      title: ar ? 'وافقت Crido على الطلب' : 'Crido a approuvé la demande',
      detail: ar
        ? 'أصبح تمويلاً — سيُحوَّل لك المبلغ قريباً'
        : 'Devient un financement — votre versement arrive',
      timestamp: request.approvedAt,
      tone: 'approved',
    })
  }

  if (request.completedAt) {
    log.push({
      key: 'completed',
      icon: Sparkles,
      title: ar ? 'اكتمل الطلب' : 'Demande clôturée',
      detail: ar
        ? 'تم تسليم المنتج للزبون'
        : 'Produit livré au client',
      timestamp: request.completedAt,
      tone: 'completed',
    })
  }

  if (request.rejectedAt) {
    log.push({
      key: 'rejected',
      icon: X,
      title: ar ? 'تم رفض الطلب' : 'Demande rejetée',
      detail: request.note ?? undefined,
      timestamp: request.rejectedAt,
      tone: 'rejected',
    })
  }

  return log
}

const TONE_RING: Record<LogEntry['tone'], string> = {
  submitted: 'bg-sky-100 text-sky-700 ring-sky-200',
  confirmed: 'bg-primary-surface text-primary ring-primary/20',
  processing: 'bg-amber-100 text-amber-700 ring-amber-200',
  approved: 'bg-primary-surface text-primary ring-primary/20',
  completed: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  rejected: 'bg-danger/10 text-danger ring-danger/30',
}

function ActivityLog({ request }: { request: IncomingRequest }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const ar = locale === 'ar'
  const entries = buildLog(request, locale)

  return (
    <SectionCard
      icon={Activity}
      title={ar ? 'سجل النشاط' : "Journal d'activité"}
      subtitle={
        ar
          ? 'كل تغيير في حالة الطلب يُسجَّل هنا'
          : 'Chaque transition est consignée ici'
      }
    >
      <ol className="relative py-3">
        {entries.map((entry, idx) => {
          const Icon = entry.icon
          const isLast = idx === entries.length - 1
          return (
            <li key={entry.key} className="relative flex gap-3 pb-5 last:pb-2">
              {/* Vertical timeline line */}
              {!isLast ? (
                <span
                  className="absolute top-9 h-[calc(100%-2.25rem)] w-px bg-border"
                  style={{ insetInlineStart: '1.0625rem' }}
                />
              ) : null}
              <span
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-card transition-all',
                  TONE_RING[entry.tone],
                )}
              >
                <Icon
                  size={16}
                  className={cn(entry.tone === 'processing' && 'animate-spin')}
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{entry.title}</p>
                {entry.detail ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground-secondary">
                    {entry.detail}
                  </p>
                ) : null}
                {entry.timestamp ? (
                  <p className="mt-1 text-[11px] tabular-nums text-foreground-tertiary" dir="ltr">
                    {formatDate(entry.timestamp.slice(0, 10), locale)}
                    {entry.timestamp.includes('T') ? (
                      <span className="ms-1 opacity-70">{entry.timestamp.slice(11, 16)}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
      <p className="border-t border-border pt-3 pb-3 text-[11px] leading-relaxed text-foreground-tertiary">
        {ar
          ? 'الحالات الجديدة (تأكيد التاجر / قيد المعالجة) تظهر فور تنفيذها.'
          : 'Les nouvelles étapes (confirmation marchand / en traitement) apparaissent en temps réel.'}
        {' '}
        {t('common.actions') ? null : null}
      </p>
    </SectionCard>
  )
}

// ─── Status-driven action block ───────────────────────────────────────

function StatusActionBlock({
  request,
  locale,
  onConfirm,
  onReject,
  onStartProcessing,
}: {
  request: IncomingRequest
  locale: Locale
  onConfirm: () => void
  onReject: () => void
  onStartProcessing: () => void
}) {
  const ar = locale === 'ar'

  if (request.status === 'submitted') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary-surface to-primary-surface/30 shadow-sm">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <Hourglass size={12} />
                {ar ? 'يحتاج إجراءك' : 'Action requise'}
              </div>
              <h3 className="text-sm font-semibold text-foreground sm:text-md">
                {ar ? 'هل تؤكد توفر المنتج والسعر؟' : 'Confirmez la disponibilité et le prix'}
              </h3>
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-foreground-secondary">
                {ar
                  ? 'سيتم إعلام الزبون فوراً عبر SMS — ثم تنتقل Crido لمعالجة الطلب.'
                  : 'Le client recevra un SMS — Crido lance ensuite le traitement.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={onReject}>
                <X size={15} />
                {ar ? 'رفض الطلب' : 'Rejeter'}
              </Button>
              <Button size="sm" onClick={onConfirm}>
                <CheckCircle2 size={15} />
                {ar ? 'تأكيد الطلب' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (request.status === 'merchant_confirmed') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/30 shadow-sm">
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                <CheckCircle2 size={12} />
                {ar ? 'مؤكَّد من التاجر' : 'Confirmé par le marchand'}
              </div>
              <h3 className="text-sm font-semibold text-foreground sm:text-md">
                {ar
                  ? 'جاهز للانتقال إلى مرحلة المعالجة'
                  : 'Prêt à passer au traitement'}
              </h3>
              <p className="mt-0.5 max-w-xl text-xs leading-relaxed text-foreground-secondary">
                {ar
                  ? 'بمجرد بدء المعالجة، تتولى Crido التحقق من المستندات وإعداد العقد.'
                  : 'Au démarrage, Crido vérifie les documents et prépare le contrat.'}
              </p>
            </div>
            <Button size="sm" onClick={onStartProcessing}>
              <PlayCircle size={15} />
              {ar ? 'بدء المعالجة' : 'Démarrer le traitement'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (request.status === 'processing') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-50/30 shadow-sm">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-4 ring-amber-100/60 animate-pulse-soft">
              <Loader2 size={20} className="animate-spin" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground sm:text-md">
                {ar ? 'جاري المعالجة من قبل Crido…' : 'Traitement par Crido en cours…'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground-secondary">
                {ar
                  ? 'فريق العمليات يراجع المستندات. ستُعلَم بمجرد الموافقة.'
                  : "L'équipe Crido vérifie les documents. Vous serez notifié dès l'approbation."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (request.status === 'approved') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary-surface to-primary-surface/30 shadow-sm">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg ring-4 ring-primary/15">
              <CheckCircle2 size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary sm:text-md">
                {ar ? 'تمت الموافقة على الطلب!' : 'Demande approuvée !'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground-secondary">
                {ar
                  ? 'سيتم تحويل مدفوعاتك خلال أيام عمل قليلة — تابع المدفوعات.'
                  : 'Votre versement arrive sous quelques jours ouvrés — voir Versements.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (request.status === 'completed') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 shadow-sm">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-4 ring-emerald-100/60">
              <Sparkles size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-700 sm:text-md">
                {ar ? 'اكتمل الطلب — تم تسليم المنتج' : 'Demande clôturée — produit livré'}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-foreground-secondary">
                {ar
                  ? 'استلم الزبون منتجه. شكراً على شراكتك مع Crido.'
                  : "Le client a reçu son produit. Merci pour votre partenariat."}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (request.status === 'merchant_rejected') {
    return (
      <div className="overflow-hidden rounded-2xl border-2 border-danger/30 bg-danger/5 shadow-sm">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger text-white">
              <X size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-danger sm:text-md">
                {ar ? 'تم رفض الطلب' : 'Demande rejetée'}
              </p>
              {request.note ? (
                <p className="mt-0.5 text-xs leading-relaxed text-foreground-secondary">
                  {request.note}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function RequestDetailPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const ar = locale === 'ar'
  const { reference } = useParams()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [processingOpen, setProcessingOpen] = useState(false)
  const [confirmNote, setConfirmNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['request', reference],
    queryFn: () => fetchRequest(reference ?? ''),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['request', reference] })
    void queryClient.invalidateQueries({ queryKey: ['requests'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const handleConfirm = async () => {
    if (!reference) return
    const note = confirmNote.trim()
    try {
      if (isRealApi) {
        await confirmRequest(reference, note || undefined)
      } else {
        updateRequestStatus(reference, 'merchant_confirmed', note || t('requests.confirmedNote'))
      }
      toast.success(t('requests.confirmedToast'))
      setConfirmOpen(false)
      setConfirmNote('')
      invalidate()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const handleReject = async () => {
    if (!reference) return
    const reason = rejectReason.trim()
    if (!reason) {
      toast.error(t('requests.rejectReasonRequired'))
      return
    }
    try {
      if (isRealApi) {
        await rejectRequest(reference, reason)
      } else {
        updateRequestStatus(reference, 'merchant_rejected', reason)
      }
      toast.success(t('requests.rejectedToast'))
      setRejectOpen(false)
      setRejectReason('')
      invalidate()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const handleStartProcessing = () => {
    if (!reference) return
    // Mock-only transition — in production this is triggered by Crido admin.
    updateRequestStatus(
      reference,
      'processing',
      ar ? 'تم بدء المعالجة من قبل Crido.' : 'Traitement démarré par Crido.',
    )
    toast.success(
      ar ? 'تم بدء معالجة الطلب — Crido تتولى الباقي.' : 'Traitement démarré.',
    )
    setProcessingOpen(false)
    invalidate()
  }

  if (isLoading) return <Loader />
  if (!data) {
    return (
      <div className="animate-fade-up">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileX} title={t('common.notFound')} />
        </section>
      </div>
    )
  }

  const commission = Math.round((data.amountDzd * merchantProfile.commissionRate) / 100)
  const payout = data.amountDzd - commission
  const waPhone = data.customerPhone.replace(/\D/g, '')
  const waCtx = { name: data.customerName, ref: data.reference }
  const waPresets = [
    { key: 'confirmed' as const, labelKey: 'requests.whatsapp.confirmed', messageKey: 'requests.whatsapp.messages.confirmed' },
    { key: 'ready' as const, labelKey: 'requests.whatsapp.ready', messageKey: 'requests.whatsapp.messages.ready' },
    { key: 'needInfo' as const, labelKey: 'requests.whatsapp.needInfo', messageKey: 'requests.whatsapp.messages.needInfo' },
  ]

  return (
    <div className="animate-fade-up">
      <Link
        to="/requests"
        className="mb-4 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition hover:text-primary"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('requests.title')}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-foreground-tertiary">{t('requests.detailLabel')}</p>
          <h1 className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">{data.reference}</h1>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Status stepper — prominent at the top */}
      <div className="mb-6">
        <RequestStepper request={data} />
      </div>

      {/* Action block — what happens next? */}
      <div className="mb-6">
        <StatusActionBlock
          request={data}
          locale={locale}
          onConfirm={() => setConfirmOpen(true)}
          onReject={() => setRejectOpen(true)}
          onStartProcessing={() => setProcessingOpen(true)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            icon={User}
            title={t('requests.sections.customer')}
            footer={
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${data.customerPhone}`}>
                  <Button variant="secondary" size="sm">
                    <Phone size={15} />
                    {t('common.call')}
                  </Button>
                </a>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer">
                  <Button variant="ghost" size="sm">
                    <MessageCircle size={15} />
                    {t('common.whatsapp')}
                  </Button>
                </a>
              </div>
            }
          >
            <DetailRow label={t('requests.columns.customer')} value={data.customerName} />
            <DetailRow label={t('customers.fields.phone')} value={<span dir="ltr">{data.customerPhone}</span>} />
            <DetailRow label={t('requests.sections.branch')} value={data.branchName} />
          </SectionCard>

          <SectionCard icon={MessageCircle} title={t('requests.whatsapp.title')} subtitle={t('requests.whatsapp.subtitle')}>
            <div className="flex flex-wrap gap-2 py-3">
              {waPresets.map((preset) => (
                <a
                  key={preset.key}
                  href={whatsappLink(data.customerPhone, t(preset.messageKey, waCtx))}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-2.5 text-sm font-medium text-[#128C7E] transition hover:border-[#25D366]/50 hover:bg-[#25D366]/15"
                >
                  <MessageCircle size={16} />
                  {t(preset.labelKey)}
                </a>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Package} title={t('requests.sections.product')}>
            <DetailRow label={t('requests.columns.product')} value={data.productName} />
            <DetailRow
              label={t('requests.columns.plan')}
              value={t('requests.months', { count: data.planMonths })}
            />
            <DetailRow label={t('requests.columns.amount')} value={formatDzd(data.amountDzd, locale)} />
          </SectionCard>

          {data.note ? (
            <section className="rounded-2xl border border-border bg-background-secondary/40 px-5 py-4 shadow-sm">
              <p className="text-sm font-medium text-foreground">{t('requests.merchantNote')}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">{data.note}</p>
            </section>
          ) : null}

          <ActivityLog request={data} />
        </div>

        <section className="h-fit overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
          <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet size={18} className="text-primary" />
              {t('requests.breakdown.title')}
            </h2>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.finalPrice')}</span>
              <span className="tabular-nums text-foreground">{formatDzd(data.amountDzd, locale)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-foreground-secondary">{t('requests.breakdown.commission')}</span>
              <span className="tabular-nums text-foreground">− {formatDzd(commission, locale)}</span>
            </div>
            <div className="my-2 border-t border-border" />
            <div className="rounded-xl bg-gradient-to-br from-primary-surface to-primary-surface/40 px-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{t('requests.breakdown.payout')}</span>
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {formatDzd(payout, locale)}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-foreground-tertiary">
              {t('requests.breakdown.hint')}
            </p>
          </div>

          {/* Small inline status chip with timeline glance */}
          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-foreground-tertiary" />
              <p className="text-[11px] text-foreground-tertiary">
                {ar ? 'آخر تحديث' : 'Mis à jour'}
                {' · '}
                {formatDate(
                  (data.completedAt ??
                    data.approvedAt ??
                    data.processingStartedAt ??
                    data.merchantConfirmedAt ??
                    data.submittedAt ??
                    data.createdAt
                  ).slice(0, 10),
                  locale,
                )}
              </p>
            </div>
          </div>
        </section>
      </div>

      <ActionModal
        open={confirmOpen}
        title={t('requests.confirmModal.title')}
        onClose={() => setConfirmOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleConfirm}>
              {t('requests.confirmModal.submit')}
            </Button>
          </>
        }
      >
        <label className="block text-xs font-medium text-foreground-secondary">
          {t('requests.confirmModal.notesLabel')}
        </label>
        <textarea
          value={confirmNote}
          onChange={(e) => setConfirmNote(e.target.value)}
          rows={3}
          className={cn(INPUT, 'mt-1.5 h-auto resize-none')}
          dir="rtl"
          placeholder={t('requests.confirmModal.notesPlaceholder')}
        />
      </ActionModal>

      <ActionModal
        open={rejectOpen}
        title={t('requests.rejectModal.title')}
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setRejectOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleReject}>
              {t('requests.rejectModal.submit')}
            </Button>
          </>
        }
      >
        <label className="block text-xs font-medium text-foreground-secondary">
          {t('requests.rejectModal.reasonLabel')} *
        </label>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          className={cn(INPUT, 'mt-1.5 h-auto resize-none')}
          dir="rtl"
          placeholder={t('requests.rejectModal.reasonPlaceholder')}
        />
      </ActionModal>

      <ActionModal
        open={processingOpen}
        title={ar ? 'بدء المعالجة' : 'Démarrer le traitement'}
        onClose={() => setProcessingOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setProcessingOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleStartProcessing}>
              <PlayCircle size={15} />
              {ar ? 'تأكيد بدء المعالجة' : 'Confirmer'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3">
            <Hourglass size={18} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-sm leading-relaxed text-amber-900">
              {ar
                ? 'هل أنت متأكد من بدء معالجة الطلب؟ بعد هذه الخطوة، تتولى Crido التحقق من المستندات وإصدار العقد.'
                : 'Voulez-vous démarrer le traitement ? Crido prend ensuite en charge la vérification et le contrat.'}
            </p>
          </div>
          <ul className="space-y-1.5 ps-1 text-xs leading-relaxed text-foreground-secondary">
            <li>• {ar ? 'يُعلَم الزبون فوراً عبر SMS' : "Le client reçoit un SMS de mise à jour"}</li>
            <li>• {ar ? 'يُعَدّ العقد ويُرسَل للتوقيع' : 'Le contrat est préparé et envoyé pour signature'}</li>
            <li>• {ar ? 'يبقى الطلب في حالة "قيد المعالجة" حتى الموافقة' : 'La demande reste « En traitement » jusqu’à approbation'}</li>
          </ul>
        </div>
      </ActionModal>
    </div>
  )
}
