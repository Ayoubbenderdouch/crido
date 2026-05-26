import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Bell, Building2, Globe, KeyRound, Save, Shield } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getBranches } from '@/lib/vendorStore'
import {
  loadVendorSettings,
  NOTIF_CHANNELS,
  NOTIF_TYPES,
  saveVendorSettings,
  type NotificationChannel,
  type NotificationType,
  type VendorSettings,
} from '@/lib/vendorSettings'
import { cn } from '@/lib/utils'

const SELECT =
  'h-9 min-w-[10rem] rounded-md border border-border-strong bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative mx-auto h-5 w-9 shrink-0 rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-border-strong',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'start-4' : 'start-0.5',
        )}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const branches = getBranches()
  const firstBranchId = branches[0]?.id ?? 1

  const [settings, setSettings] = useState<VendorSettings>(() =>
    loadVendorSettings(firstBranchId),
  )

  function setNotif(type: NotificationType, channel: NotificationChannel, value: boolean) {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: { ...prev.notifications[type], [channel]: value },
      },
    }))
  }

  function handleSave() {
    saveVendorSettings(settings)
    toast.success(t('settings.saved'))
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')}>
        <Button size="sm" onClick={handleSave}>
          <Save size={15} />
          {t('settings.save')}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader className="border-b border-border bg-primary-surface/40">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg">
                <Bell size={16} strokeWidth={1.75} />
              </span>
              {t('settings.sections.notifications')}
            </CardTitle>
          </CardHeader>
          <div className="p-5">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 gap-y-4 sm:gap-x-10">
              <span />
              {NOTIF_CHANNELS.map((ch) => (
                <span
                  key={ch}
                  className="text-center text-xs font-medium text-foreground-tertiary"
                >
                  {t(`settings.channels.${ch}`)}
                </span>
              ))}
              {NOTIF_TYPES.map((nt) => (
                <Fragment key={nt}>
                  <span className="text-sm text-foreground">{t(`settings.notifications.${nt}`)}</span>
                  {NOTIF_CHANNELS.map((ch) => (
                    <Toggle
                      key={ch}
                      checked={settings.notifications[nt][ch]}
                      onChange={(v) => setNotif(nt, ch, v)}
                      label={`${t(`settings.notifications.${nt}`)} — ${t(`settings.channels.${ch}`)}`}
                    />
                  ))}
                </Fragment>
              ))}
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-primary-surface/40">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg">
                <Building2 size={16} strokeWidth={1.75} />
              </span>
              {t('settings.sections.preferences')}
            </CardTitle>
          </CardHeader>
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Building2 size={15} className="text-primary" />
                {t('settings.defaultBranch')}
              </div>
              <select
                className={SELECT}
                value={settings.defaultBranchId}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    defaultBranchId: Number(e.target.value),
                  }))
                }
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Globe size={15} className="text-primary" />
                {t('settings.language')}
              </div>
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

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-primary-surface/40">
            <CardTitle className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-fg">
                <Shield size={16} strokeWidth={1.75} />
              </span>
              {t('settings.sections.security')}
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 p-5">
            <p className="text-sm leading-relaxed text-foreground-secondary">
              {t('settings.securityHint')}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toast.success(t('settings.passwordChanged'))}
            >
              <KeyRound size={15} />
              {t('settings.changePassword')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
