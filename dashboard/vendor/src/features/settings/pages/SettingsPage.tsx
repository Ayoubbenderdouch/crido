import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { branches } from '@/lib/mock/data'

const NOTIF_TYPES = ['newRequest', 'payoutSent', 'financingCompleted'] as const
const CHANNELS = ['sms', 'email', 'push'] as const
const SELECT =
  'h-9 rounded-md border border-border-strong bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>{t('settings.sections.notifications')}</CardTitle></CardHeader>
          <div className="p-5">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-8 gap-y-3.5">
              <span />
              {CHANNELS.map((ch) => (
                <span key={ch} className="text-center text-xs font-medium text-foreground-tertiary">
                  {t(`settings.channels.${ch}`)}
                </span>
              ))}
              {NOTIF_TYPES.map((nt) => (
                <Fragment key={nt}>
                  <span className="text-sm text-foreground">{t(`settings.notifications.${nt}`)}</span>
                  {CHANNELS.map((ch) => (
                    <input
                      key={ch}
                      type="checkbox"
                      defaultChecked={ch !== 'email'}
                      className="mx-auto h-4 w-4 accent-[#0F6E56]"
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('settings.sections.preferences')}</CardTitle></CardHeader>
          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">{t('settings.defaultBranch')}</span>
              <select className={SELECT}>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">{t('settings.language')}</span>
              <select
                className={SELECT}
                value={i18n.language}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('settings.sections.security')}</CardTitle></CardHeader>
          <div className="p-5">
            <Button variant="secondary" size="sm" onClick={() => toast(t('common.actionDemo'))}>
              <KeyRound size={15} />
              {t('settings.changePassword')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
