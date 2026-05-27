// Visual representation of a financing request's lifecycle.
// Two presentations:
//   • <RequestStepper> — full horizontal stepper with labels + timestamps
//   • <RequestStepperCompact> — 5 small dots, used inside list rows
//
// Both honour RTL (first step is rightmost in Arabic) by relying on flex
// direction inherited from the document `dir` attribute — no manual flips.

import { useTranslation } from 'react-i18next'
import { Check, Clock, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, type Locale } from '@/lib/format'
import type { IncomingRequest, RequestStatus } from '@/lib/mock/data'

type StepKey = 'submitted' | 'merchant_confirmed' | 'processing' | 'approved' | 'completed'

const STEP_ORDER: StepKey[] = [
  'submitted',
  'merchant_confirmed',
  'processing',
  'approved',
  'completed',
]

const STEP_INDEX: Record<StepKey, number> = {
  submitted: 0,
  merchant_confirmed: 1,
  processing: 2,
  approved: 3,
  completed: 4,
}

/** Map an incoming status onto the current step index (0-based). */
function statusToIndex(status: RequestStatus): number {
  if (status === 'merchant_rejected') return 0
  return STEP_INDEX[status as StepKey] ?? 0
}

/** Pick a Tailwind tint per step — used for the small completed-step
 *  ring colour. */
const STEP_TINT: Record<StepKey, { ring: string; chip: string; accent: string }> = {
  submitted:           { ring: 'ring-sky-200',    chip: 'bg-sky-50  text-sky-700',    accent: '#2F7AD0' },
  merchant_confirmed:  { ring: 'ring-teal-200',   chip: 'bg-teal-50 text-teal-700',   accent: '#0F6E56' },
  processing:          { ring: 'ring-amber-200',  chip: 'bg-amber-50 text-amber-800', accent: '#B7791F' },
  approved:            { ring: 'ring-teal-200',   chip: 'bg-teal-50 text-teal-700',   accent: '#0F6E56' },
  completed:           { ring: 'ring-emerald-200',chip: 'bg-emerald-50 text-emerald-700', accent: '#04342C' },
}

function labelFor(step: StepKey, lang: string): string {
  if (lang === 'fr') {
    return {
      submitted: 'Soumise',
      merchant_confirmed: 'Confirmée',
      processing: 'En traitement',
      approved: 'Approuvée',
      completed: 'Clôturée',
    }[step]
  }
  // Arabic — emphasis on the two new states the user explicitly requested.
  return {
    submitted: 'مُقدَّم',
    merchant_confirmed: 'مؤكَّد من التاجر',
    processing: 'قيد المعالجة',
    approved: 'موافق عليه',
    completed: 'مكتمل',
  }[step]
}

function timestampFor(req: IncomingRequest, step: StepKey): string | undefined | null {
  switch (step) {
    case 'submitted':
      return req.submittedAt ?? req.createdAt
    case 'merchant_confirmed':
      return req.merchantConfirmedAt
    case 'processing':
      return req.processingStartedAt
    case 'approved':
      return req.approvedAt
    case 'completed':
      return req.completedAt
  }
}

// ─── Full stepper ─────────────────────────────────────────────────────

type FullProps = {
  request: IncomingRequest
}

export function RequestStepper({ request }: FullProps) {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const rejected = request.status === 'merchant_rejected'
  const activeIdx = statusToIndex(request.status)

  if (rejected) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-danger/25 bg-danger/5 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white">
          <X size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-danger">
            {locale === 'fr' ? 'Demande rejetée' : 'تم رفض الطلب'}
          </p>
          {request.rejectedAt ? (
            <p className="mt-0.5 text-xs text-foreground-tertiary">
              {locale === 'fr' ? 'Le ' : 'في '}
              {formatDate(request.rejectedAt, locale)}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-5 shadow-sm sm:px-6">
      <ol className="flex w-full items-start">
        {STEP_ORDER.map((step, idx) => {
          const done = idx < activeIdx
          const active = idx === activeIdx
          const tint = STEP_TINT[step]
          const ts = timestampFor(request, step)
          const isLast = idx === STEP_ORDER.length - 1
          return (
            <li
              key={step}
              className={cn(
                'group relative flex min-w-0 flex-1 flex-col items-center',
                isLast && 'flex-none',
              )}
            >
              <div className="flex w-full items-center">
                {/* Step bubble */}
                <div className="relative z-10 flex flex-col items-center">
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all',
                      done && 'bg-primary text-primary-fg shadow-sm',
                      active &&
                        'bg-primary text-primary-fg shadow-md ring-4 ring-offset-2 ring-offset-card animate-pulse-soft',
                      active && tint.ring,
                      !done && !active && 'border-2 border-dashed border-border-strong bg-background text-foreground-tertiary',
                    )}
                  >
                    {done ? (
                      <Check size={16} strokeWidth={2.5} />
                    ) : active && step === 'processing' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : active ? (
                      <Clock size={16} />
                    ) : (
                      idx + 1
                    )}
                  </span>
                </div>
                {/* Connector to next step (skip on the last) */}
                {!isLast ? (
                  <span
                    className={cn(
                      'mx-1 h-[3px] flex-1 rounded-full transition-all sm:mx-2',
                      done ? 'bg-primary' : 'bg-border',
                    )}
                  />
                ) : null}
              </div>
              {/* Label + timestamp */}
              <div className="mt-2 max-w-[7.5rem] text-center sm:max-w-[10rem]">
                <p
                  className={cn(
                    'text-[11px] font-medium leading-tight sm:text-xs',
                    active && 'text-primary',
                    done && 'text-foreground',
                    !done && !active && 'text-foreground-tertiary',
                  )}
                >
                  {labelFor(step, locale)}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-foreground-tertiary tabular-nums sm:text-[11px]">
                  {ts ? formatDate(ts.slice(0, 10), locale) : '—'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─── Compact dots (used in list rows) ─────────────────────────────────

type CompactProps = {
  status: RequestStatus
}

/** 5 tiny dots showing how far along a request is — fits inside table cells. */
export function RequestStepperCompact({ status }: CompactProps) {
  const rejected = status === 'merchant_rejected'
  const activeIdx = statusToIndex(status)

  return (
    <div className="inline-flex items-center gap-1">
      {STEP_ORDER.map((step, idx) => {
        const done = idx < activeIdx
        const active = idx === activeIdx && !rejected
        return (
          <span
            key={step}
            className={cn(
              'h-2 w-2 rounded-full transition-colors',
              rejected && 'bg-danger/40',
              !rejected && done && 'bg-primary',
              !rejected && active && 'bg-primary ring-2 ring-primary/30 animate-pulse-soft',
              !rejected && !done && !active && 'bg-border',
            )}
            title={labelFor(step, 'ar')}
          />
        )
      })}
      {rejected ? (
        <X size={12} className="ms-1 text-danger" strokeWidth={2.5} />
      ) : null}
    </div>
  )
}
