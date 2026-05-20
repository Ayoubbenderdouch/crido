import { useTranslation } from 'react-i18next'
import { Hammer } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/data/EmptyState'

export default function PlaceholderPage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation()

  return (
    <div className="animate-fade-up">
      <PageHeader title={t(titleKey)} />
      <Card>
        <EmptyState
          icon={Hammer}
          title={t('common.comingSoon')}
          hint={t('common.comingSoonHint')}
        />
      </Card>
    </div>
  )
}
