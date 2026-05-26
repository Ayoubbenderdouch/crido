import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { PhoneCall, Search, Clock, Banknote, Package } from 'lucide-react'
import { KpiCard } from '@/components/data/KpiCard'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { VerificationCallCard } from '@/components/verifications/VerificationCallCard'
import { fetchVerifications } from '@/lib/mock/api'
import { formatDzd, type Locale } from '@/lib/format'
export default function VerificationsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['verifications'], queryFn: fetchVerifications })

  const rows = useMemo(() => {
    const list = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (v) =>
        v.requestRef.toLowerCase().includes(q) ||
        v.productName.toLowerCase().includes(q) ||
        v.proposedMerchantName.toLowerCase().includes(q) ||
        v.clientName.toLowerCase().includes(q),
    )
  }, [data, search])

  const stats = useMemo(() => {
    const all = data ?? []
    return {
      count: all.length,
      totalDzd: all.reduce((s, v) => s + v.amountDzd, 0),
    }
  }, [data])

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-medium text-foreground">{t('verifications.title')}</h1>
        <p className="mt-1 text-sm text-foreground-secondary">{t('verifications.subtitle')}</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label={t('verifications.stats.pending')}
          value={String(stats.count)}
          icon={PhoneCall}
          accent="warning"
        />
        <KpiCard
          label={t('verifications.stats.totalValue')}
          value={formatDzd(stats.totalDzd, locale)}
          icon={Banknote}
        />
        <KpiCard
          label={t('verifications.stats.products')}
          value={String(stats.count)}
          icon={Package}
        />
      </div>

      <div className="mb-4 relative max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('verifications.search')}
          className="h-10 w-full rounded-xl border border-border bg-background ps-9 pe-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : rows.length === 0 ? (
        <EmptyState icon={PhoneCall} title={t('common.noResults')} />
      ) : (
        <div className="space-y-4">
          {rows.map((item) => (
            <VerificationCallCard
              key={item.requestRef}
              item={item}
              locale={locale}
              onOpen={() => navigate(`/financing-requests/${item.requestRef}`)}
            />
          ))}
        </div>
      )}

      {rows.length > 0 ? (
        <p className="mt-4 flex items-center gap-2 text-xs text-foreground-tertiary">
          <Clock size={14} />
          {t('verifications.hint')}
        </p>
      ) : null}
    </div>
  )
}
