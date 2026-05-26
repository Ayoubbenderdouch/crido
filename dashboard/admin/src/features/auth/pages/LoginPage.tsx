import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { loginWithApi, mockLogin } from '@/lib/auth'
import { apiErrorMessage } from '@/lib/apiClient'
import { API_MODE } from '@/env'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const INPUT =
  'h-11 w-full rounded-lg border border-border-strong bg-background/80 pe-3 ps-10 text-sm text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-foreground-tertiary focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('+213600000000')
  const [password, setPassword] = useState(
    API_MODE === 'mock' ? 'crido-demo' : 'crido123!',
  )
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isArabic = i18n.language.startsWith('ar')
  const Arrow = isArabic ? ArrowLeft : ArrowRight

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null)

    if (API_MODE === 'mock') {
      if (mockLogin(phone, password)) {
        navigate('/dashboard')
      } else {
        setError(t('login.errorEmpty'))
      }
      return
    }

    setSubmitting(true)
    try {
      await loginWithApi(phone, password)
      toast.success(t('login.success'))
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof Error && err.message === 'NOT_ADMIN') {
        setError(t('login.errorNotAdmin'))
      } else {
        setError(apiErrorMessage(err, t('login.errorInvalid')))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const highlights = [
    { icon: ShieldCheck, key: 'secure' },
    { icon: TrendingUp, key: 'finance' },
    { icon: Sparkles, key: 'bnpl' },
  ] as const

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div
        className={cn(
          'relative flex flex-1 flex-col justify-between overflow-hidden px-8 py-10 lg:px-12 lg:py-14',
          'bg-linear-to-br from-primary via-[#0a5a46] to-[#063d32] text-primary-fg',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px),
              radial-gradient(circle at 80% 70%, #fff 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="pointer-events-none absolute -top-24 -end-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -start-16 h-56 w-56 rounded-full bg-primary-light/25 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/crido-logo.png"
              alt="Crido"
              className="h-11 w-11 rounded-xl bg-white/10 p-1.5 shadow-lg ring-1 ring-white/20"
            />
            <span className="text-xl font-semibold tracking-tight">Crido</span>
          </div>
          <button
            type="button"
            onClick={() => i18n.changeLanguage(isArabic ? 'fr' : 'ar')}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/15"
          >
            <Globe className="h-3.5 w-3.5" />
            {isArabic ? 'Français' : 'العربية'}
          </button>
        </div>

        <div className="relative z-10 my-10 max-w-md lg:my-0">
          <p className="text-sm font-medium uppercase tracking-widest text-white/60">
            {t('login.badge')}
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-snug lg:text-4xl">
            {t('login.hero')}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75">{t('login.heroSub')}</p>

          <ul className="mt-8 space-y-3">
            {highlights.map(({ icon: Icon, key }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="text-sm font-medium text-white/90">{t(`login.highlights.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 hidden text-xs text-white/50 lg:block">{t('login.footer')}</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background-secondary px-6 py-10 lg:px-14">
        <div className="w-full max-w-[400px] animate-fade-up">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <img src="/crido-logo.png" alt="Crido" className="h-14 w-14 rounded-2xl shadow-md" />
            <p className="mt-3 text-2xl font-semibold text-primary">Crido</p>
            <p className="mt-1 text-sm text-foreground-tertiary">{t('login.subtitle')}</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-[0_8px_40px_-12px_rgba(15,110,86,0.12)]">
            <div className="hidden lg:block">
              <p className="text-xs font-medium uppercase tracking-wider text-primary">
                {t('login.subtitle')}
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-foreground">{t('login.title')}</h1>
              <p className="mt-2 text-sm text-foreground-tertiary">{t('login.welcome')}</p>
            </div>
            <h1 className="text-xl font-semibold text-foreground lg:hidden">{t('login.title')}</h1>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t('login.phone')}
                </label>
                <div className="relative">
                  <Phone
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary"
                    strokeWidth={2}
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    autoComplete="tel"
                    className={INPUT}
                    placeholder="+213 600 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-tertiary"
                    strokeWidth={2}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={cn(INPUT, 'pe-10')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-foreground-tertiary transition hover:bg-background-secondary hover:text-foreground"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/8 px-3 py-2.5 text-sm text-danger"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={submitting}
                className="group h-11 w-full rounded-lg text-base font-medium shadow-md shadow-primary/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('login.submitting')}
                  </>
                ) : (
                  <>
                    {t('login.submit')}
                    <Arrow className="h-4 w-4 transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-foreground-tertiary lg:hidden">
            {t('login.footer')}
          </p>
        </div>
      </div>
    </div>
  )
}
