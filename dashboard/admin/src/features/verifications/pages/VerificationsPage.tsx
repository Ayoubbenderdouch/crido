import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  PhoneCall,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  PhoneOff,
  Hash,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/data/KpiCard'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { DataTable, type Column } from '@/components/data/DataTable'
import { fetchMerchantVerifications } from '@/lib/mock/api'
import type {
  MerchantVerification,
  VerificationOutcome,
} from '@/lib/mock/data'
import { formatDate, type Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

// Inline Arabic labels — i18n entries will land in a follow-up sweep.
const OUTCOME_LABEL: Record<VerificationOutcome, string> = {
  confirmed: 'مؤكد',
  denied: 'مرفوض',
  unreachable: 'غير قابل للوصول',
  postponed: 'مؤجل',
}

const OUTCOME_TONE: Record<
  VerificationOutcome,
  { wrap: string; icon: typeof CheckCircle2 }
> = {
  confirmed: { wrap: 'bg-[#9FE1CB] text-[#04342C]', icon: CheckCircle2 },
  denied: { wrap: 'bg-[#FCEBEB] text-[#791F1F]', icon: XCircle },
  unreachable: { wrap: 'bg-[#F1EFE8] text-[#444441]', icon: PhoneOff },
  postponed: { wrap: 'bg-[#FAEEDA] text-[#633806]', icon: Clock },
}

function OutcomeBadge({ outcome }: { outcome: VerificationOutcome }) {
  const tone = OUTCOME_TONE[outcome]
  const Icon = tone.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        tone.wrap,
      )}
    >
      <Icon size={13} strokeWidth={2} />
      {OUTCOME_LABEL[outcome]}
    </span>
  )
}

type Row = MerchantVerification & { _seq: number }

const OUTCOMES: (VerificationOutcome | 'all')[] = [
  'all',
  'confirmed',
  'unreachable',
  'postponed',
  'denied',
]

export default function VerificationsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const [search, setSearch] = useState('')
  const [outcomeFilter, setOutcomeFilter] =
    useState<(typeof OUTCOMES)[number]>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['merchant-verifications'],
    queryFn: fetchMerchantVerifications,
  })

  const stats = useMemo(() => {
    const all = data ?? []
    return {
      total: all.length,
      confirmed: all.filter((v) => v.outcome === 'confirmed').length,
      pending: all.filter(
        (v) => v.outcome === 'unreachable' || v.outcome === 'postponed',
      ).length,
      denied: all.filter((v) => v.outcome === 'denied').length,
    }
  }, [data])

  const rows = useMemo<Row[]>(() => {
    let list = data ?? []
    if (outcomeFilter !== 'all') {
      list = list.filter((v) => v.outcome === outcomeFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (v) =>
          v.number.toLowerCase().includes(q) ||
          v.request_id.toLowerCase().includes(q) ||
          v.merchant_phone.toLowerCase().includes(q) ||
          v.caller_name.toLowerCase().includes(q) ||
          v.notes.toLowerCase().includes(q),
      )
    }
    // Sequential numbering reflects the visible (filtered + searched) list.
    return list.map((v, i) => ({ ...v, _seq: i + 1 }))
  }, [data, outcomeFilter, search])

  const columns: Column<Row>[] = [
    {
      key: 'seq',
      header: '#',
      cell: (r) => (
        <span className="font-mono text-xs tabular-nums text-foreground-tertiary">
          {r._seq}
        </span>
      ),
    },
    {
      key: 'number',
      header: 'رقم التحقق',
      cell: (r) => (
        <span
          className="font-mono text-xs tabular-nums font-medium text-foreground"
          dir="ltr"
        >
          {r.number}
        </span>
      ),
    },
    {
      key: 'request',
      header: 'الطلب',
      cell: (r) => (
        <Link
          to={`/financing-requests/${r.request_id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-xs tabular-nums font-medium text-primary hover:underline"
          dir="ltr"
        >
          {r.request_id}
        </Link>
      ),
    },
    {
      key: 'phone',
      header: 'هاتف التاجر',
      cell: (r) => (
        <a
          href={`tel:${r.merchant_phone}`}
          onClick={(e) => e.stopPropagation()}
          className="font-mono text-xs tabular-nums text-foreground-secondary hover:text-primary"
          dir="ltr"
        >
          {r.merchant_phone}
        </a>
      ),
    },
    {
      key: 'outcome',
      header: 'النتيجة',
      cell: (r) => <OutcomeBadge outcome={r.outcome} />,
    },
    {
      key: 'called_at',
      header: 'تاريخ المكالمة',
      cell: (r) => (
        <span className="text-xs text-foreground-secondary">
          {formatDate(r.called_at, locale)}
        </span>
      ),
    },
    {
      key: 'caller',
      header: 'المسؤول',
      cell: (r) => (
        <span className="text-xs font-medium text-foreground">
          {r.caller_name}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'الملاحظات',
      cell: (r) => (
        <p
          className="max-w-[280px] truncate text-xs text-foreground-secondary"
          title={r.notes}
        >
          {r.notes}
        </p>
      ),
    },
  ]

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground">
          {t('verifications.title')}
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          سجل جميع مكالمات التحقق المنجزة مع التجار المقترحين — مرقّمة ومؤرّخة
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="مكالمات مجموعة"
          value={String(stats.total)}
          icon={PhoneCall}
        />
        <KpiCard
          label="مؤكدة"
          value={String(stats.confirmed)}
          icon={CheckCircle2}
          sparkColor="#1D9E75"
        />
        <KpiCard
          label="بانتظار المعاودة"
          value={String(stats.pending)}
          icon={Clock}
          accent="warning"
        />
        <KpiCard
          label="مرفوضة"
          value={String(stats.denied)}
          icon={XCircle}
          sparkColor="#E24B4A"
        />
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background-secondary/50 p-1">
          {OUTCOMES.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcomeFilter(o)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                outcomeFilter === o
                  ? 'bg-primary text-primary-fg shadow-sm'
                  : 'text-foreground-secondary hover:bg-background',
              )}
            >
              {o === 'all' ? t('common.all') : OUTCOME_LABEL[o]}
            </button>
          ))}
        </div>
        <div className="relative max-w-sm flex-1 sm:max-w-xs">
          <Search
            size={16}
            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم التحقق، الطلب، الهاتف…"
            className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={PhoneCall} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
          />
        )}
      </Card>

      {rows.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-foreground-tertiary">
          <Hash size={14} />
          الترقيم يعكس القائمة الظاهرة — يُحدَّث تلقائياً عند تغيير الفلتر
        </p>
      ) : null}
    </div>
  )
}
