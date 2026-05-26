import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Shield, Store, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { login as realLogin } from '@/lib/api/auth'
import { mockLogin } from '@/lib/auth'
import { isRealApi } from '@/lib/api'
import { apiErrorMessage } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INPUT =
  'h-11 w-full rounded-lg border border-border-strong bg-background px-3.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

const FEATURE_ICONS = [Store, TrendingUp, Shield] as const

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isRtl = i18n.language === 'ar'
  const [phone, setPhone] = useState(isRealApi ? '+213700000000' : '+213661234567')
  const [password, setPassword] = useState(isRealApi ? 'vendor123!' : 'crido-demo')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      if (isRealApi) {
        await realLogin(phone.trim(), password)
        navigate('/dashboard')
      } else {
        if (mockLogin(phone, password)) navigate('/dashboard')
      }
    } catch (err) {
      const msg = apiErrorMessage(err, t('login.errors.generic') as string)
      toast.error(msg)
    } finally {
      setBusy(false)
    }
  }

  const features = [
    t('login.features.requests'),
    t('login.features.financing'),
    t('login.features.payouts'),
  ] as const

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel — order first so RTL places it on the start (right) side */}
      <section
        className={cn(
          'relative flex flex-1 flex-col justify-between overflow-hidden bg-primary px-8 py-10 text-primary-fg lg:px-12 lg:py-14',
          'min-h-[220px] lg:min-h-screen',
        )}
      >
        <div
          className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-white/5"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-white/5"
          aria-hidden
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <img
              src="/crido-logo.png"
              alt=""
              className="h-12 w-12 rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20"
            />
            <div>
              <p className="text-2xl font-medium tracking-tight">Crido</p>
              <p className="text-sm text-white/75">{t('login.vendorPortal')}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-8 lg:mt-0">
          <p
            className="max-w-md text-2xl font-medium leading-snug lg:text-3xl"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {t('login.tagline')}
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((text, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span dir={isRtl ? 'rtl' : 'ltr'}>{text}</span>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="relative mt-8 text-xs text-white/50 lg:mt-0">
          {t('login.footer')}
        </p>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center bg-background-secondary px-6 py-10 lg:px-14">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <img src="/crido-logo.png" alt="Crido" className="h-10 w-10 rounded-lg" />
              <span className="text-lg font-medium text-primary">Crido</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-7 shadow-sm sm:p-8">
            <h1 className="text-xl font-medium text-foreground">{t('login.welcome')}</h1>
            <p className="mt-1.5 text-sm text-foreground-secondary">{t('login.subtitle')}</p>

            <form onSubmit={submit} className="mt-7 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm text-foreground-secondary">
                  {t('login.phone')}
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className={INPUT}
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-foreground-secondary">
                  {t('login.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={INPUT}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="h-11 w-full text-base" disabled={busy}>
                {busy ? t('common.loading') : t('login.submit')}
              </Button>
            </form>

            <div className="mt-5 flex items-start gap-2 rounded-lg bg-primary-surface px-3 py-2.5">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground-secondary">
                {t('login.demoHint')}
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-foreground-tertiary">{t('login.secureAccess')}</p>
        </div>
      </section>
    </div>
  )
}
