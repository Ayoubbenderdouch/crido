import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { mockLogin } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('+213661234567')
  const [password, setPassword] = useState('crido-demo')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (mockLogin(phone, password)) navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-7 text-center">
          <p className="text-3xl font-semibold text-primary">Crido</p>
          <p className="mt-1 text-sm text-foreground-tertiary">{t('login.subtitle')}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-7">
          <h1 className="text-lg font-medium text-foreground">{t('login.title')}</h1>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('login.phone')}
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="h-10 w-full rounded-md border border-border-strong px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t('login.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-md border border-border-strong px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button type="submit" className="w-full">
              {t('login.submit')}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-foreground-tertiary">
            {t('login.demoHint')}
          </p>
        </div>
      </div>
    </div>
  )
}
