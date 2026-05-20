import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { Users, CreditCard, Banknote, TrendingUp, PhoneCall, ChevronLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/data/StatCard'
import { StatusBadge } from '@/components/data/StatusBadge'
import { DataTable, type Column } from '@/components/data/DataTable'
import { Loader } from '@/components/data/Loader'
import { fetchDashboardStats, fetchDailySeries } from '@/lib/mock/api'
import { clients, financingRequests, type FinancingRequest } from '@/lib/mock/data'
import { formatDzd, formatNumber, type Locale } from '@/lib/format'

const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const stats = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: fetchDashboardStats })
  const series = useQuery({ queryKey: ['dashboard', 'series'], queryFn: fetchDailySeries })

  if (stats.isLoading || series.isLoading || !stats.data || !series.data) {
    return <Loader />
  }
  const s = stats.data

  const recent = financingRequests.slice(0, 5)
  const pendingKyc = clients.filter((c) => c.kycStatus === 'pending')

  const recentColumns: Column<FinancingRequest>[] = [
    {
      key: 'reference',
      header: t('requests.columns.reference'),
      cell: (r) => <span className="font-medium tabular-nums text-foreground">{r.reference}</span>,
    },
    { key: 'client', header: t('requests.columns.client'), cell: (r) => r.clientName },
    {
      key: 'amount',
      header: t('requests.columns.amount'),
      align: 'end',
      cell: (r) => <span className="tabular-nums">{formatDzd(r.amountDzd, locale)}</span>,
    },
    {
      key: 'status',
      header: t('requests.columns.status'),
      align: 'end',
      cell: (r) => <StatusBadge status={r.status} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label={t('dashboard.stats.activeClients')}
          value={formatNumber(s.activeClients, locale)}
          hint={`${formatNumber(s.kycPending, locale)} ${t('dashboard.stats.kycPending')}`}
        />
        <StatCard
          icon={CreditCard}
          label={t('dashboard.stats.activeFinancings')}
          value={formatNumber(s.activeFinancings, locale)}
          hint={formatDzd(s.outstandingDzd, locale)}
        />
        <StatCard
          icon={Banknote}
          label={t('dashboard.stats.pendingVerification')}
          value={formatNumber(s.pendingVerification, locale)}
          accent="warning"
        />
        <StatCard
          icon={TrendingUp}
          label={t('dashboard.stats.monthRevenue')}
          value={formatDzd(s.monthRevenueDzd, locale)}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-md font-medium text-foreground">{t('dashboard.charts.financings')}</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={series.data} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tickFormatter={shortDate} interval={6} tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}
                  labelFormatter={(l) => shortDate(String(l))}
                />
                <Area type="monotone" dataKey="financings" stroke="#0F6E56" strokeWidth={2} fill="#0F6E56" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-md font-medium text-foreground">{t('dashboard.charts.revenue')}</p>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={series.data} margin={{ top: 6, right: 6, bottom: 0, left: 8 }}>
                <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="date" tickFormatter={shortDate} interval={6} tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`} tick={{ fontSize: 11, fill: '#888780' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}
                  labelFormatter={(l) => shortDate(String(l))}
                  formatter={(v) => formatDzd(Number(v), locale)}
                />
                <Area type="monotone" dataKey="revenueDzd" stroke="#1D9E75" strokeWidth={2} fill="#1D9E75" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('dashboard.recentRequests')}</CardTitle>
            <button
              type="button"
              onClick={() => navigate('/financing-requests')}
              className="text-sm text-primary hover:underline"
            >
              {t('common.viewAll')}
            </button>
          </CardHeader>
          <DataTable
            columns={recentColumns}
            rows={recent}
            rowKey={(r) => r.reference}
            onRowClick={(r) => navigate(`/financing-requests/${r.reference}`)}
          />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.pendingKyc')}</CardTitle>
          </CardHeader>
          <ul>
            {pendingKyc.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="flex w-full items-center gap-3 border-b border-border px-5 py-3.5 text-start transition-colors last:border-0 hover:bg-background-secondary"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-surface text-sm font-medium text-primary">
                    {c.name.charAt(0)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{c.name}</span>
                    <span className="block text-xs text-foreground-tertiary">{c.commune}</span>
                  </span>
                  <ChevronLeft size={16} className="shrink-0 text-foreground-tertiary ltr:rotate-180" />
                </button>
              </li>
            ))}
            {pendingKyc.length === 0 ? (
              <li className="flex items-center gap-2 px-5 py-6 text-sm text-foreground-tertiary">
                <PhoneCall size={16} strokeWidth={1.5} />
                {t('common.noResults')}
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  )
}
