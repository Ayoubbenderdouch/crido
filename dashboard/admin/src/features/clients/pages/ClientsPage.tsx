import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { TierBadge } from '@/components/data/TierBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchClients } from '@/lib/mock/api'
import type { Client } from '@/lib/mock/data'
import { formatDzd, formatDate, type Locale } from '@/lib/format'

const SELECT = 'h-9 rounded-md border border-border-strong bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none'
const KYC_OPTIONS = ['all', 'approved', 'pending', 'rejected', 'not_started', 'expired']
const TIER_OPTIONS = ['all', 'A', 'B', 'C', 'D', 'E']

export default function ClientsPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const [q, setQ] = useState('')
  const [kyc, setKyc] = useState('all')
  const [tier, setTier] = useState('all')

  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: fetchClients })

  const rows = (data ?? []).filter((c) => {
    if (kyc !== 'all' && c.kycStatus !== kyc) return false
    if (tier !== 'all' && c.tier !== tier) return false
    if (q && !c.name.includes(q) && !c.phone.includes(q)) return false
    return true
  })

  const columns: Column<Client>[] = [
    {
      key: 'client',
      header: t('clients.columns.client'),
      cell: (c) => (
        <div>
          <p className="font-medium text-foreground">{c.name}</p>
          <p className="text-xs tabular-nums text-foreground-tertiary" dir="ltr">{c.phone}</p>
        </div>
      ),
    },
    { key: 'commune', header: t('clients.columns.commune'), cell: (c) => c.commune },
    { key: 'kyc', header: t('clients.columns.kyc'), cell: (c) => <StatusBadge status={c.kycStatus} /> },
    { key: 'tier', header: t('clients.columns.tier'), cell: (c) => <TierBadge tier={c.tier} /> },
    {
      key: 'credit',
      header: t('clients.columns.credit'),
      align: 'end',
      cell: (c) => (
        <span className="tabular-nums text-foreground-secondary">
          {formatDzd(c.usedCreditDzd, locale)} / {formatDzd(c.creditLimitDzd, locale)}
        </span>
      ),
    },
    {
      key: 'financings',
      header: t('clients.columns.financings'),
      align: 'center',
      cell: (c) => <span className="tabular-nums">{c.activeFinancings}</span>,
    },
    {
      key: 'lastActivity',
      header: t('clients.columns.lastActivity'),
      align: 'end',
      cell: (c) => <span className="text-foreground-tertiary">{formatDate(c.lastActivityAt, locale)}</span>,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('clients.title')} subtitle={t('clients.subtitle')} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('common.search')}
          className="h-9 w-56 rounded-md border border-border-strong bg-background px-3 text-sm focus:border-primary focus:outline-none"
        />
        <select value={kyc} onChange={(e) => setKyc(e.target.value)} className={SELECT}>
          {KYC_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o === 'all' ? t('clients.filters.kyc') : t(`status.${o}`)}
            </option>
          ))}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)} className={SELECT}>
          {TIER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o === 'all' ? t('clients.filters.tier') : o}
            </option>
          ))}
        </select>
        <span className="ms-auto text-sm text-foreground-tertiary">
          {rows.length} {t('common.results')}
        </span>
      </div>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(c) => String(c.id)}
            onRowClick={(c) => navigate(`/clients/${c.id}`)}
          />
        )}
      </Card>
    </div>
  )
}
