import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Users,
  Store,
  CreditCard,
  Banknote,
  Truck,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Settings,
  Check,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  MOCK_PERMISSIONS,
  PERMISSION_CATEGORIES,
  type Permission,
  type PermissionCategory,
} from '@/lib/mock/data'
import type { Locale } from '@/lib/format'
import { cn } from '@/lib/utils'

const CATEGORY_ICON: Record<PermissionCategory, LucideIcon> = {
  clients: Users,
  merchants: Store,
  financings: CreditCard,
  payments: Banknote,
  payouts: Truck,
  collections: AlertTriangle,
  messages: MessageSquare,
  reports: BarChart3,
  settings: Settings,
}

const CATEGORY_LABEL_AR: Record<PermissionCategory, string> = {
  clients: 'العملاء',
  merchants: 'التجار',
  financings: 'التمويلات',
  payments: 'المدفوعات',
  payouts: 'المدفوعات للتجار',
  collections: 'التحصيل',
  messages: 'الرسائل',
  reports: 'التقارير',
  settings: 'الإعدادات',
}

const CATEGORY_LABEL_FR: Record<PermissionCategory, string> = {
  clients: 'Clients',
  merchants: 'Marchands',
  financings: 'Financements',
  payments: 'Paiements',
  payouts: 'Versements',
  collections: 'Recouvrement',
  messages: 'Messages',
  reports: 'Rapports',
  settings: 'Paramètres',
}

type Props = {
  /** Currently-granted permission slugs. Includes `*` for "all". */
  value: string[]
  onChange: (next: string[]) => void
  /** When true, all inputs are disabled and rendered as a static view. */
  readOnly?: boolean
}

/**
 * Grouped checkbox matrix for editing a role's permissions.
 *
 * Behavior:
 * - When `value` includes `*`, every permission is shown as checked and
 *   individual toggles materialize the wildcard into the explicit list.
 * - Toggling the category header flips every permission in that category.
 */
export function PermissionMatrix({ value, onChange, readOnly }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as Locale
  const labels = locale === 'fr' ? CATEGORY_LABEL_FR : CATEGORY_LABEL_AR

  const hasWildcard = value.includes('*')

  const grouped = useMemo(() => {
    const byCat = new Map<PermissionCategory, Permission[]>()
    for (const p of MOCK_PERMISSIONS) {
      const list = byCat.get(p.category) ?? []
      list.push(p)
      byCat.set(p.category, list)
    }
    return PERMISSION_CATEGORIES
      .map((cat) => ({ category: cat, items: byCat.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0)
  }, [])

  function isOn(slug: string) {
    return hasWildcard || value.includes(slug)
  }

  function materialize(): string[] {
    // Convert `['*']` into the full explicit list so we can toggle individuals.
    return hasWildcard ? MOCK_PERMISSIONS.map((p) => p.slug) : [...value]
  }

  function togglePermission(slug: string) {
    if (readOnly) return
    const base = materialize()
    const next = base.includes(slug)
      ? base.filter((s) => s !== slug)
      : [...base, slug]
    onChange(next)
  }

  function toggleCategory(cat: PermissionCategory, allOn: boolean) {
    if (readOnly) return
    const base = materialize()
    const inCat = MOCK_PERMISSIONS.filter((p) => p.category === cat).map((p) => p.slug)
    const next = allOn
      ? base.filter((s) => !inCat.includes(s))
      : Array.from(new Set([...base, ...inCat]))
    onChange(next)
  }

  const totalChecked = hasWildcard
    ? MOCK_PERMISSIONS.length
    : value.filter((s) => MOCK_PERMISSIONS.some((p) => p.slug === s)).length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-foreground-tertiary">
        <span>
          {t('roles.matrix.legend', {
            defaultValue: locale === 'fr'
              ? 'Cochez les autorisations à accorder à ce rôle.'
              : 'حدد الصلاحيات التي تمنحها لهذا الدور.',
          })}
        </span>
        <span className="tabular-nums font-medium text-foreground">
          {totalChecked} / {MOCK_PERMISSIONS.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {grouped.map(({ category, items }) => {
          const Icon = CATEGORY_ICON[category]
          const checkedInCat = items.filter((p) => isOn(p.slug)).length
          const allOn = checkedInCat === items.length
          const someOn = checkedInCat > 0 && !allOn

          return (
            <div
              key={category}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <button
                type="button"
                onClick={() => toggleCategory(category, allOn)}
                disabled={readOnly}
                className={cn(
                  'flex w-full items-center gap-3 border-b border-border px-4 py-3 text-start transition-colors',
                  readOnly
                    ? 'cursor-default bg-background-secondary/50'
                    : 'hover:bg-primary-surface/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    allOn
                      ? 'bg-primary text-primary-fg'
                      : someOn
                      ? 'bg-primary-surface text-primary'
                      : 'bg-background-secondary text-foreground-tertiary',
                  )}
                >
                  <Icon size={15} strokeWidth={1.85} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {labels[category]}
                  </span>
                  <span className="block text-xs text-foreground-tertiary">
                    {checkedInCat} / {items.length}
                  </span>
                </span>
                <CategoryCheckbox state={allOn ? 'on' : someOn ? 'mixed' : 'off'} />
              </button>

              <ul className="divide-y divide-border">
                {items.map((p) => {
                  const on = isOn(p.slug)
                  const name = locale === 'fr' ? p.name_fr : p.name_ar
                  return (
                    <li key={p.slug}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
                          readOnly && 'cursor-default',
                          on && !readOnly && 'bg-primary-surface/30',
                          !readOnly && 'hover:bg-background-secondary',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => togglePermission(p.slug)}
                          disabled={readOnly}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all',
                            on
                              ? 'border-primary bg-primary text-primary-fg'
                              : 'border-border-strong bg-background',
                            !readOnly && 'peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40',
                          )}
                        >
                          {on ? <Check size={13} strokeWidth={2.5} /> : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-foreground">{name}</span>
                          <span
                            className="block font-mono text-[11px] text-foreground-tertiary"
                            dir="ltr"
                          >
                            {p.slug}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CategoryCheckbox({ state }: { state: 'on' | 'mixed' | 'off' }) {
  return (
    <span
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
        state === 'on'
          ? 'border-primary bg-primary text-primary-fg'
          : state === 'mixed'
          ? 'border-primary bg-primary-surface text-primary'
          : 'border-border-strong bg-background',
      )}
    >
      {state === 'on' ? (
        <Check size={13} strokeWidth={2.5} />
      ) : state === 'mixed' ? (
        <span className="h-0.5 w-2.5 rounded-full bg-primary" />
      ) : null}
    </span>
  )
}
