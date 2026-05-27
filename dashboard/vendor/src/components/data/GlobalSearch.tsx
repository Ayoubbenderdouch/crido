import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Search,
  UserRound,
  FileText,
  CreditCard,
  Wallet,
  Package,
  Clock,
  CornerDownLeft,
  X,
  History,
  Sparkles,
  Command as CommandIcon,
} from 'lucide-react'
import {
  customers,
  incomingRequests,
  financings,
  payouts,
  products,
} from '@/lib/mock/data'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// Crido Vendor — Global Search ("بحث في كل شيء")
//
// Pill-style search in the Topbar that opens a command-palette
// style dropdown grouped by resource. Searches across customers,
// requests, financings, payouts, and products of this merchant.
// Uses local mock data; no API needed.
//
// Keyboard:
//   ⌘K / Ctrl+K / "/"    → focus the search
//   ↓ ↑                  → move highlight
//   Enter                → open the highlighted result
//   Esc                  → close
// ─────────────────────────────────────────────────────────────

type ResourceType = 'customer' | 'request' | 'financing' | 'payout' | 'product'

type SearchResult = {
  id: string
  type: ResourceType
  title: string
  subtitle: string
  meta?: string
  href: string
}

const RECENT_KEY = 'crido_vendor_recent_searches'
const MAX_RECENTS = 6
const PER_GROUP = 5

const TYPE_CONFIG: Record<
  ResourceType,
  {
    icon: typeof Search
    chipBg: string
    chipFg: string
    iconBg: string
    iconFg: string
    labelAr: string
    labelFr: string
  }
> = {
  customer: {
    icon: UserRound,
    chipBg: 'bg-[#E1F5EE]',
    chipFg: 'text-[#085041]',
    iconBg: 'bg-primary-surface',
    iconFg: 'text-primary',
    labelAr: 'زبون',
    labelFr: 'Client',
  },
  request: {
    icon: FileText,
    chipBg: 'bg-[#FAEEDA]',
    chipFg: 'text-[#633806]',
    iconBg: 'bg-[#FAEEDA]',
    iconFg: 'text-[#633806]',
    labelAr: 'طلب',
    labelFr: 'Demande',
  },
  financing: {
    icon: CreditCard,
    chipBg: 'bg-[#EFE8FC]',
    chipFg: 'text-[#3B1F8B]',
    iconBg: 'bg-[#EFE8FC]',
    iconFg: 'text-[#3B1F8B]',
    labelAr: 'تمويل',
    labelFr: 'Financement',
  },
  payout: {
    icon: Wallet,
    chipBg: 'bg-[#E6F1FB]',
    chipFg: 'text-[#0C447C]',
    iconBg: 'bg-[#E6F1FB]',
    iconFg: 'text-[#0C447C]',
    labelAr: 'دفعة',
    labelFr: 'Virement',
  },
  product: {
    icon: Package,
    chipBg: 'bg-background-secondary',
    chipFg: 'text-foreground-secondary',
    iconBg: 'bg-background-secondary',
    iconFg: 'text-foreground-secondary',
    labelAr: 'منتج',
    labelFr: 'Produit',
  },
}

const GROUP_ORDER: ResourceType[] = ['customer', 'request', 'financing', 'payout', 'product']

function matches(haystack: string | null | undefined, needle: string): boolean {
  if (!haystack) return false
  return haystack.toLowerCase().includes(needle)
}

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((v) => typeof v === 'string').slice(0, MAX_RECENTS) : []
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  if (!q.trim()) return
  try {
    const cur = loadRecents().filter((v) => v !== q)
    const next = [q, ...cur].slice(0, MAX_RECENTS)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
}

function clearRecents() {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    /* ignore */
  }
}

function highlight(text: string, q: string) {
  if (!q.trim()) return text
  const i = text.toLowerCase().indexOf(q.toLowerCase())
  if (i < 0) return text
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-primary/15 px-0.5 text-primary">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  )
}

function search(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const out: SearchResult[] = []

  // Customers — name, phone, commune
  for (const c of customers) {
    if (matches(c.name, q) || matches(c.phone, q) || matches(c.commune, q)) {
      out.push({
        id: `customer-${c.id}`,
        type: 'customer',
        title: c.name,
        subtitle: c.phone,
        meta: c.commune,
        href: `/customers/${c.id}`,
      })
    }
  }

  // Requests — reference, customer name, product, phone
  for (const r of incomingRequests) {
    if (
      matches(r.reference, q) ||
      matches(r.customerName, q) ||
      matches(r.customerPhone, q) ||
      matches(r.productName, q)
    ) {
      out.push({
        id: `request-${r.reference}`,
        type: 'request',
        title: r.reference,
        subtitle: `${r.customerName} — ${r.productName}`,
        meta: r.branchName,
        href: `/requests/${r.reference}`,
      })
    }
  }

  // Financings — reference, customer, product
  for (const f of financings) {
    if (
      matches(f.reference, q) ||
      matches(f.customerName, q) ||
      matches(f.productName, q) ||
      matches(f.requestRef, q)
    ) {
      out.push({
        id: `financing-${f.reference}`,
        type: 'financing',
        title: f.reference,
        subtitle: `${f.customerName} — ${f.productName}`,
        meta: f.requestRef,
        href: `/financings/${f.reference}`,
      })
    }
  }

  // Payouts — reference, customer, financing ref
  for (const p of payouts) {
    if (
      matches(p.reference, q) ||
      matches(p.customerName, q) ||
      matches(p.financingRef, q) ||
      matches(p.productName, q) ||
      matches(p.externalRef, q)
    ) {
      out.push({
        id: `payout-${p.reference}`,
        type: 'payout',
        title: p.reference,
        subtitle: `${p.customerName} — ${p.productName}`,
        meta: p.financingRef,
        href: `/payouts/${p.reference}`,
      })
    }
  }

  // Products — name (ar+fr), SKU, category
  for (const p of products) {
    if (
      matches(p.name, q) ||
      matches(p.nameFr, q) ||
      matches(p.sku, q) ||
      matches(p.category, q)
    ) {
      out.push({
        id: `product-${p.id}`,
        type: 'product',
        title: p.name,
        subtitle: p.sku,
        meta: p.category,
        href: `/products/${p.id}`,
      })
    }
  }

  const grouped: Record<ResourceType, SearchResult[]> = {
    customer: [],
    request: [],
    financing: [],
    payout: [],
    product: [],
  }
  for (const r of out) grouped[r.type].push(r)
  const ordered: SearchResult[] = []
  for (const t of GROUP_ORDER) ordered.push(...grouped[t].slice(0, PER_GROUP))
  return ordered
}

export function GlobalSearch() {
  const { i18n } = useTranslation()
  const locale = (i18n.language as 'ar' | 'fr') ?? 'ar'
  const isArabic = locale === 'ar'
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [recents, setRecents] = useState<string[]>(() => loadRecents())

  const inputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => search(query), [query])
  const grouped = useMemo(() => {
    const g: Partial<Record<ResourceType, SearchResult[]>> = {}
    for (const r of results) {
      ;(g[r.type] ??= []).push(r)
    }
    return g
  }, [results])

  // Keyboard shortcut: ⌘K / Ctrl+K / "/"
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase()
      const inField = tag === 'input' || tag === 'textarea' || (e.target as HTMLElement | null)?.isContentEditable
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (window.matchMedia('(max-width: 767px)').matches) {
          setMobileOpen(true)
          requestAnimationFrame(() => mobileInputRef.current?.focus())
        } else {
          inputRef.current?.focus()
          setOpen(true)
        }
      } else if (e.key === '/' && !inField) {
        e.preventDefault()
        if (window.matchMedia('(max-width: 767px)').matches) {
          setMobileOpen(true)
          requestAnimationFrame(() => mobileInputRef.current?.focus())
        } else {
          inputRef.current?.focus()
          setOpen(true)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    function onPointer(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function handleSelect(r: SearchResult) {
    saveRecent(query.trim())
    setRecents(loadRecents())
    setOpen(false)
    setMobileOpen(false)
    setQuery('')
    navigate(r.href)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) setOpen(true)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const r = results[active]
      if (r) {
        e.preventDefault()
        handleSelect(r)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  function pickRecent(value: string) {
    setQuery(value)
    setActive(0)
    setOpen(true)
    inputRef.current?.focus()
  }

  const placeholder = isArabic ? 'بحث في كل شيء…' : 'Rechercher partout…'
  const shortcutHint = isArabic ? '/ أو ⌘K' : '/ ou ⌘K'

  return (
    <>
      <div ref={wrapRef} className="relative hidden flex-1 md:block md:max-w-md lg:max-w-lg">
        <div
          className={cn(
            'group relative flex h-10 items-center gap-2 rounded-full border bg-background-secondary px-3 transition-all',
            open
              ? 'border-primary/40 bg-background shadow-[0_4px_24px_-12px_rgba(15,110,86,0.35)] ring-2 ring-primary/15'
              : 'border-border hover:border-foreground/15 hover:bg-background',
          )}
        >
          <Search
            size={16}
            strokeWidth={1.75}
            className={cn(
              'shrink-0 transition-colors',
              open ? 'text-primary' : 'text-foreground-tertiary',
            )}
          />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="global-search-listbox"
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-tertiary transition-colors hover:bg-background-secondary hover:text-foreground"
              aria-label={isArabic ? 'مسح البحث' : 'Effacer'}
            >
              <X size={13} strokeWidth={2} />
            </button>
          ) : (
            <kbd className="hidden shrink-0 select-none items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-foreground-tertiary lg:inline-flex">
              <CommandIcon size={9} strokeWidth={2.25} />
              <span>K</span>
            </kbd>
          )}
        </div>

        {open && (
          <DropdownPanel
            ref={listRef}
            query={query}
            results={results}
            grouped={grouped}
            active={active}
            setActive={setActive}
            onSelect={handleSelect}
            recents={recents}
            onPickRecent={pickRecent}
            onClearRecents={() => {
              clearRecents()
              setRecents([])
            }}
            isArabic={isArabic}
            shortcutHint={shortcutHint}
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          setMobileOpen(true)
          requestAnimationFrame(() => mobileInputRef.current?.focus())
        }}
        className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-secondary transition-colors hover:bg-background-secondary md:hidden"
        aria-label={placeholder}
      >
        <Search size={19} strokeWidth={1.5} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
          <div className="flex items-center gap-2 border-b border-border px-3 py-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false)
                setQuery('')
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground-secondary transition-colors hover:bg-background-secondary"
              aria-label={isArabic ? 'إغلاق' : 'Fermer'}
            >
              <X size={18} strokeWidth={1.75} />
            </button>
            <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-border bg-background-secondary px-3">
              <Search size={16} strokeWidth={1.75} className="shrink-0 text-foreground-tertiary" />
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="h-full flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none"
              />
            </div>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto">
            <DropdownBody
              query={query}
              results={results}
              grouped={grouped}
              active={active}
              setActive={setActive}
              onSelect={handleSelect}
              recents={recents}
              onPickRecent={pickRecent}
              onClearRecents={() => {
                clearRecents()
                setRecents([])
              }}
              isArabic={isArabic}
              embedded
            />
          </div>
        </div>
      )}
    </>
  )
}

type PanelProps = {
  query: string
  results: SearchResult[]
  grouped: Partial<Record<ResourceType, SearchResult[]>>
  active: number
  setActive: (i: number) => void
  onSelect: (r: SearchResult) => void
  recents: string[]
  onPickRecent: (v: string) => void
  onClearRecents: () => void
  isArabic: boolean
  shortcutHint: string
}

const DropdownPanel = (function DropdownPanelInner() {
  const Comp = (props: PanelProps & { ref?: React.RefObject<HTMLDivElement | null> }) => {
    const { ref, shortcutHint, ...rest } = props
    return (
      <div
        id="global-search-listbox"
        role="listbox"
        className="absolute end-0 start-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.03]"
      >
        <div ref={ref} className="max-h-[440px] overflow-y-auto">
          <DropdownBody {...rest} />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border bg-background-secondary/60 px-4 py-2 text-[11px] text-foreground-tertiary">
          <div className="flex items-center gap-3">
            <KbdHint label={rest.isArabic ? 'تنقّل' : 'Naviguer'} keys={['↑', '↓']} />
            <KbdHint label={rest.isArabic ? 'فتح' : 'Ouvrir'} keys={['↵']} icon={CornerDownLeft} />
            <KbdHint label={rest.isArabic ? 'إغلاق' : 'Fermer'} keys={['Esc']} />
          </div>
          <span className="font-mono">{shortcutHint}</span>
        </div>
      </div>
    )
  }
  return Comp
})()

type BodyProps = Omit<PanelProps, 'shortcutHint'> & { embedded?: boolean }

function DropdownBody({
  query,
  results,
  grouped,
  active,
  setActive,
  onSelect,
  recents,
  onPickRecent,
  onClearRecents,
  isArabic,
  embedded,
}: BodyProps) {
  if (!query.trim()) {
    return (
      <div className={cn('px-2 py-3', embedded && 'px-3 py-4')}>
        {recents.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                <History size={11} strokeWidth={2} />
                {isArabic ? 'بحوث سابقة' : 'Recherches récentes'}
              </span>
              <button
                type="button"
                onClick={onClearRecents}
                className="text-[11px] font-medium text-foreground-tertiary transition-colors hover:text-foreground"
              >
                {isArabic ? 'مسح' : 'Effacer'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {recents.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onPickRecent(r)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary px-2.5 py-1 text-xs font-medium text-foreground-secondary transition-colors hover:border-primary/30 hover:bg-primary-surface hover:text-primary"
                >
                  <Clock size={11} strokeWidth={1.75} />
                  {r}
                </button>
              ))}
            </div>
            <div className="mx-2 mt-3 border-t border-border" />
          </>
        ) : null}

        <div className="px-2 pt-2 pb-1">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground-tertiary">
            <Sparkles size={11} strokeWidth={2} />
            {isArabic ? 'بحث في كل شيء' : 'Cherchez partout'}
          </p>
          <p className="mt-1 text-xs text-foreground-tertiary">
            {isArabic
              ? 'ابحث عن زبائن، طلبات، تمويلات، دفعات أو منتجات.'
              : 'Clients, demandes, financements, virements ou produits.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 px-2 pt-3">
          {GROUP_ORDER.map((t) => {
            const cfg = TYPE_CONFIG[t]
            const Icon = cfg.icon
            return (
              <div
                key={t}
                className="flex items-center gap-2 rounded-lg border border-border bg-background-secondary/60 px-2.5 py-2"
              >
                <span
                  className={cn('flex h-7 w-7 items-center justify-center rounded-md', cfg.iconBg, cfg.iconFg)}
                >
                  <Icon size={13} strokeWidth={1.75} />
                </span>
                <span className="text-xs font-medium text-foreground-secondary">
                  {isArabic ? cfg.labelAr : cfg.labelFr}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary text-foreground-tertiary">
          <Search size={20} strokeWidth={1.5} />
        </span>
        <p className="text-sm font-medium text-foreground">
          {isArabic ? 'لا توجد نتائج' : 'Aucun résultat'}
        </p>
        <p className="max-w-xs text-xs text-foreground-tertiary">
          {isArabic ? (
            <>
              لم نجد أي شيء يتعلق بـ <span className="font-semibold text-foreground">«{query}»</span>. جرّب
              مرجعاً (CR-…) أو اسماً.
            </>
          ) : (
            <>
              Rien trouvé pour <span className="font-semibold text-foreground">«{query}»</span>. Essayez une
              référence ou un nom.
            </>
          )}
        </p>
      </div>
    )
  }

  let runningIdx = 0
  return (
    <div className="py-1">
      {GROUP_ORDER.map((type) => {
        const items = grouped[type]
        if (!items || items.length === 0) return null
        const cfg = TYPE_CONFIG[type]
        const Icon = cfg.icon
        return (
          <div key={type} className="px-1 py-1">
            <div className="flex items-center justify-between px-3 pb-1 pt-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-foreground-tertiary">
                {isArabic ? cfg.labelAr : cfg.labelFr}
              </span>
              <span className="text-[11px] text-foreground-tertiary">
                {items.length}
                {items.length === PER_GROUP ? '+' : ''}
              </span>
            </div>
            <ul>
              {items.map((r) => {
                const myIdx = runningIdx++
                const isActive = myIdx === active
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      data-idx={myIdx}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(myIdx)}
                      onClick={() => onSelect(r)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start transition-colors',
                        isActive ? 'bg-primary-surface/70' : 'hover:bg-background-secondary',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                          cfg.iconBg,
                          cfg.iconFg,
                        )}
                      >
                        <Icon size={15} strokeWidth={1.75} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {highlight(r.title, query)}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-foreground-tertiary">
                          {highlight(r.subtitle, query)}
                          {r.meta ? (
                            <>
                              <span className="mx-1.5 text-foreground-tertiary/50">·</span>
                              {highlight(r.meta, query)}
                            </>
                          ) : null}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          cfg.chipBg,
                          cfg.chipFg,
                        )}
                      >
                        {isArabic ? cfg.labelAr : cfg.labelFr}
                      </span>
                      <CornerDownLeft
                        size={13}
                        strokeWidth={1.75}
                        className={cn(
                          'shrink-0 transition-opacity',
                          isActive ? 'text-primary opacity-100' : 'text-foreground-tertiary/40 opacity-0',
                        )}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function KbdHint({
  label,
  keys,
  icon: Icon,
}: {
  label: string
  keys: string[]
  icon?: typeof CornerDownLeft
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {keys.map((k) => (
          <kbd
            key={k}
            className="inline-flex h-4 min-w-[16px] select-none items-center justify-center rounded border border-border bg-background px-1 font-mono text-[10px] text-foreground-secondary"
          >
            {Icon ? <Icon size={9} strokeWidth={2.25} /> : k}
          </kbd>
        ))}
      </span>
      <span>{label}</span>
    </span>
  )
}
