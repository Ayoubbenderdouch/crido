import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Store, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchBranches } from '@/lib/api'
import type { Branch } from '@/lib/mock/data'

export default function BranchesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({ queryKey: ['branches'], queryFn: fetchBranches })
  const rows = data ?? []

  const columns: Column<Branch>[] = [
    {
      key: 'branch',
      header: t('branches.columns.branch'),
      cell: (b) => <span className="font-medium text-foreground">{b.name}</span>,
    },
    {
      key: 'address',
      header: t('branches.columns.address'),
      cell: (b) => (
        <span className="text-foreground-secondary">
          {b.commune} · {b.street}
        </span>
      ),
    },
    {
      key: 'phone',
      header: t('branches.columns.phone'),
      cell: (b) => (
        <span className="tabular-nums text-foreground-secondary" dir="ltr">
          {b.phone}
        </span>
      ),
    },
    { key: 'manager', header: t('branches.columns.manager'), cell: (b) => b.managerName },
    {
      key: 'status',
      header: t('branches.columns.status'),
      align: 'end',
      cell: (b) => <StatusBadge status={b.active ? 'active' : 'inactive'} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('branches.title')} subtitle={t('branches.subtitle')}>
        <Link to="/branches/new">
          <Button size="sm" type="button" className="shadow-sm">
            <Plus size={15} />
            {t('branches.addBranch')}
          </Button>
        </Link>
      </PageHeader>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={Store} title={t('common.noResults')} />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(b) => String(b.id)}
            onRowClick={(b) => navigate(`/branches/${b.id}`)}
          />
        )}
      </Card>
    </div>
  )
}
