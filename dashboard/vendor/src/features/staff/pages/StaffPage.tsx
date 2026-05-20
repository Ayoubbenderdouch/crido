import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { UserCog, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/data/DataTable'
import { StatusBadge } from '@/components/data/StatusBadge'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import { Loader } from '@/components/data/Loader'
import { fetchStaff } from '@/lib/mock/api'
import type { Staff } from '@/lib/mock/data'
import { formatDate, type Locale } from '@/lib/format'

export default function StaffPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale

  const { data, isLoading } = useQuery({ queryKey: ['staff'], queryFn: fetchStaff })
  const rows = data ?? []

  const columns: Column<Staff>[] = [
    {
      key: 'name',
      header: t('staff.columns.name'),
      cell: (s) => (
        <div className="flex items-center gap-3">
          <Avatar name={s.name} size={36} />
          <span className="font-medium text-foreground">{s.name}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      header: t('staff.columns.phone'),
      cell: (s) => <span className="tabular-nums text-foreground-secondary" dir="ltr">{s.phone}</span>,
    },
    {
      key: 'role',
      header: t('staff.columns.role'),
      cell: (s) => (
        <span className="rounded-sm bg-background-secondary px-2 py-0.5 text-xs text-foreground-secondary">
          {t(`staff.roles.${s.role}`)}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: t('staff.columns.lastLogin'),
      cell: (s) => (
        <span className="text-foreground-tertiary">
          {s.lastLoginAt ? formatDate(s.lastLoginAt, locale) : t('staff.neverLoggedIn')}
        </span>
      ),
    },
    {
      key: 'status',
      header: t('staff.columns.status'),
      align: 'end',
      cell: (s) => <StatusBadge status={s.active ? 'active' : 'inactive'} />,
    },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('staff.title')} subtitle={t('staff.subtitle')}>
        <Button size="sm" onClick={() => toast(t('common.actionDemo'))}>
          <UserPlus size={15} />
          {t('staff.addStaff')}
        </Button>
      </PageHeader>

      <Card>
        {isLoading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState icon={UserCog} title={t('common.noResults')} />
        ) : (
          <DataTable columns={columns} rows={rows} rowKey={(s) => String(s.id)} />
        )}
      </Card>
    </div>
  )
}
