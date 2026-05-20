import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/data/Loader'
import { fetchSettings } from '@/lib/mock/api'
import type { SettingItem } from '@/lib/mock/data'

const CATEGORIES = ['financing', 'risk', 'kyc'] as const

export default function SettingsPage() {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  if (isLoading || !data) return <Loader />

  const groups = CATEGORIES.map((cat) => ({
    category: cat,
    items: data.filter((s) => s.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')}>
        <Button size="sm" onClick={() => toast.success(t('common.actionDemo'))}>
          <Save size={15} />
          {t('settings.save')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.category}>
            <CardHeader>
              <CardTitle>{t(`settings.categories.${group.category}`)}</CardTitle>
            </CardHeader>
            <div className="px-5 py-2">
              {group.items.map((s: SettingItem) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
                >
                  <span className="text-sm text-foreground">{t(`settings.keys.${s.key}`)}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={s.value}
                      className="h-9 w-32 rounded-md border border-border-strong bg-background px-3 text-end text-sm tabular-nums text-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="w-10 text-xs text-foreground-tertiary">
                      {t(`settings.units.${s.unit}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
