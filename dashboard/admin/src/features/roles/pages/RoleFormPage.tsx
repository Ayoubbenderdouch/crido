import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChevronRight, Plus, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PermissionMatrix } from '../components/PermissionMatrix'
import { MOCK_PERMISSIONS } from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

// Same brand palette used for the existing roles — see DESIGN_SYSTEM.md §1.
const COLOR_PRESETS = [
  '#0F6E56',
  '#0C5B47',
  '#1D9E75',
  '#378ADD',
  '#EF9F27',
  '#E24B4A',
  '#7C4DFF',
  '#08766B',
]

export default function RoleFormPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const navigate = useNavigate()

  const [nameAr, setNameAr] = useState('')
  const [nameFr, setNameFr] = useState('')
  const [descAr, setDescAr] = useState('')
  const [descFr, setDescFr] = useState('')
  const [color, setColor] = useState<string>(COLOR_PRESETS[0])
  const [permissions, setPermissions] = useState<string[]>([])

  const grantedCount = permissions.filter((p) =>
    MOCK_PERMISSIONS.some((mp) => mp.slug === p),
  ).length

  const slug = useMemo(() => {
    // Auto-suggest a slug from the French name (or Arabic transliteration fallback).
    const source = (nameFr || nameAr).trim().toLowerCase()
    return source
      .replace(/[\s؀-ۿ]+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 32)
  }, [nameAr, nameFr])

  const canSubmit = nameAr.trim().length > 1 && nameFr.trim().length > 1 && grantedCount > 0

  function submit() {
    if (!canSubmit) return
    toast.success(
      locale === 'fr'
        ? `Rôle « ${nameFr} » créé avec ${grantedCount} permission(s).`
        : `تم إنشاء دور "${nameAr}" بـ ${grantedCount} صلاحية.`,
    )
    navigate('/roles')
  }

  return (
    <div className="animate-fade-up">
      <Link
        to="/roles"
        className="mb-3 inline-flex items-center gap-1 text-sm text-foreground-tertiary transition-colors hover:text-foreground"
      >
        <ChevronRight size={16} className="ltr:rotate-180" />
        {t('roles.title', { defaultValue: locale === 'fr' ? 'Rôles & permissions' : 'الأدوار والصلاحيات' })}
      </Link>

      <PageHeader
        title={
          locale === 'fr' ? 'Créer un nouveau rôle' : 'إنشاء دور جديد'
        }
        subtitle={
          locale === 'fr'
            ? 'Définissez l’identité bilingue du rôle puis cochez les permissions à accorder.'
            : 'حدد اسم الدور بالعربية والفرنسية ثم اختر الصلاحيات المراد منحها.'
        }
      >
        <Button size="sm" variant="ghost" onClick={() => navigate('/roles')}>
          {t('common.cancel', { defaultValue: locale === 'fr' ? 'Annuler' : 'إلغاء' })}
        </Button>
        <Button size="sm" onClick={submit} disabled={!canSubmit}>
          <Plus size={14} />
          {locale === 'fr' ? 'Créer le rôle' : 'إنشاء الدور'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Identity */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>
              {locale === 'fr' ? 'Identité' : 'الهوية'}
            </CardTitle>
          </CardHeader>
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-xl bg-background-secondary/60 p-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-colors"
                style={{ backgroundColor: color }}
              >
                <ShieldCheck size={20} strokeWidth={1.85} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {nameAr || nameFr || (locale === 'fr' ? 'Nouveau rôle' : 'دور جديد')}
                </p>
                <p
                  className="truncate font-mono text-[11px] text-foreground-tertiary"
                  dir="ltr"
                >
                  {slug || 'new_role'}
                </p>
              </div>
            </div>

            <Field
              label={locale === 'fr' ? 'Nom (Arabe)' : 'الاسم (بالعربية)'}
              required
            >
              <input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثل: مدير المخاطر"
                dir="rtl"
                className={INPUT_BASE}
              />
            </Field>

            <Field
              label={locale === 'fr' ? 'Nom (Français)' : 'الاسم (بالفرنسية)'}
              required
            >
              <input
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                placeholder="ex. Responsable des risques"
                dir="ltr"
                className={INPUT_BASE}
              />
            </Field>

            <Field label={locale === 'fr' ? 'Description (Arabe)' : 'الوصف (بالعربية)'}>
              <textarea
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
                rows={2}
                dir="rtl"
                placeholder="وصف موجز لمسؤوليات هذا الدور…"
                className={cn(INPUT_BASE, 'resize-none py-2')}
              />
            </Field>

            <Field label={locale === 'fr' ? 'Description (Français)' : 'الوصف (بالفرنسية)'}>
              <textarea
                value={descFr}
                onChange={(e) => setDescFr(e.target.value)}
                rows={2}
                dir="ltr"
                placeholder="Brève description des responsabilités…"
                className={cn(INPUT_BASE, 'resize-none py-2')}
              />
            </Field>

            <div>
              <p className="mb-2 text-xs font-medium text-foreground-secondary">
                {locale === 'fr' ? 'Couleur du badge' : 'لون الشارة'}
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={c}
                    className={cn(
                      'h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition-all hover:scale-110',
                      color === c && 'ring-2',
                    )}
                    style={{ backgroundColor: c, ['--tw-ring-color' as string]: c } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>
              {locale === 'fr' ? 'Permissions' : 'الصلاحيات'}
            </CardTitle>
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium',
                grantedCount === 0
                  ? 'bg-background-secondary text-foreground-tertiary'
                  : 'bg-primary-surface text-primary',
              )}
            >
              {grantedCount} / {MOCK_PERMISSIONS.length}
            </span>
          </CardHeader>
          <div className="p-5">
            <PermissionMatrix value={permissions} onChange={setPermissions} />
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate('/roles')}>
          {t('common.cancel', { defaultValue: locale === 'fr' ? 'Annuler' : 'إلغاء' })}
        </Button>
        <Button onClick={submit} disabled={!canSubmit}>
          <Plus size={15} />
          {locale === 'fr' ? 'Créer le rôle' : 'إنشاء الدور'}
        </Button>
      </div>
    </div>
  )
}

const INPUT_BASE =
  'h-10 w-full rounded-xl border border-border-strong bg-background px-3 text-sm text-foreground placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-foreground-secondary">
        {label}
        {required ? <span className="text-danger">*</span> : null}
      </span>
      {children}
    </label>
  )
}
