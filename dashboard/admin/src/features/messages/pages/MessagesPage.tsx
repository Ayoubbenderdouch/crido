import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import {
  CheckCheck,
  ChevronLeft,
  Inbox,
  MessageSquare,
  Phone,
  Search,
  Send,
  Store,
  User as UserIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar } from '@/components/data/Avatar'
import { EmptyState } from '@/components/data/EmptyState'
import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  type Conversation,
  type Message,
} from '@/lib/mock/data'
import { findClientByName, findMerchantByName } from '@/lib/financingLookup'
import { cn } from '@/lib/utils'
import { ConversationListItem } from '../components/ConversationListItem'
import { MessageBubble } from '../components/MessageBubble'

const FILTERS = ['all', 'unread', 'merchants', 'customers'] as const
type FilterId = (typeof FILTERS)[number]

// Arabic-first inline fallbacks — used as `defaultValue` so the inbox
// is readable without editing `i18n/{ar,fr}.json` (per task spec).
const FALLBACK = {
  title: 'الرسائل',
  subtitle: 'محادثات مع التجار والعملاء.',
  markAllRead: 'تعليم الكل كمقروء',
  markAllReadSuccess: 'تم تعليم كل الرسائل كمقروءة.',
  searchPlaceholder: 'بحث في المحادثات…',
  composerPlaceholder: 'اكتب ردًا…',
  send: 'إرسال',
  viewProfile: 'عرض الملف',
  delivered: 'تم التسليم',
  filters: { all: 'الكل', unread: 'غير مقروء', merchants: 'التجار', customers: 'العملاء' },
  type: { merchant: 'تاجر', customer: 'عميل' },
  empty: { title: 'لا توجد محادثات', hint: 'اختر فلترًا مختلفًا أو ابدأ محادثة جديدة.' },
  threadEmpty: { title: 'لا توجد رسائل بعد', hint: 'ابدأ بكتابة رد لبدء المحادثة.' },
} as const

function dayHeaderLabel(iso: string, locale: 'ar' | 'fr'): string {
  const d = dayjs(iso)
  const now = dayjs('2026-05-27T10:00:00')
  if (d.isSame(now, 'day')) return locale === 'ar' ? 'اليوم' : "Aujourd'hui"
  if (d.isSame(now.subtract(1, 'day'), 'day')) return locale === 'ar' ? 'أمس' : 'Hier'
  const months = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return locale === 'ar' ? `${d.date()} ${months[d.month()]}` : d.format('DD/MM/YYYY')
}

export default function MessagesPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as 'ar' | 'fr'
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId?: string }>()

  // Local state — in a real build these would live in TanStack Query.
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    [...MOCK_CONVERSATIONS].sort((a, b) =>
      b.last_message_at.localeCompare(a.last_message_at),
    ),
  )
  const [messages, setMessages] = useState<Message[]>(() => MOCK_MESSAGES)
  const [filter, setFilter] = useState<FilterId>('all')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unread_count, 0),
    [conversations],
  )

  // The active conversation comes from the URL when present, else the first row.
  const activeId = conversationId ?? conversations[0]?.id

  // Filter the sidebar conversation list.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return conversations.filter((c) => {
      if (filter === 'unread' && c.unread_count === 0) return false
      if (filter === 'merchants' && c.type !== 'merchant') return false
      if (filter === 'customers' && c.type !== 'customer') return false
      if (q) {
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.last_message.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [conversations, filter, search])

  const active = conversations.find((c) => c.id === activeId)

  const threadMessages = useMemo(
    () =>
      messages
        .filter((m) => m.conversation_id === activeId)
        .sort((a, b) => a.sent_at.localeCompare(b.sent_at)),
    [messages, activeId],
  )

  // Group messages by day for the date separators.
  const grouped = useMemo(() => {
    const out: { label: string; rows: Message[] }[] = []
    let currentDay: string | null = null
    for (const m of threadMessages) {
      const day = m.sent_at.slice(0, 10)
      if (day !== currentDay) {
        out.push({ label: dayHeaderLabel(m.sent_at, locale), rows: [m] })
        currentDay = day
      } else {
        out[out.length - 1].rows.push(m)
      }
    }
    return out
  }, [threadMessages, locale])

  // Auto-scroll to the bottom when the active conversation changes or a
  // new message lands. We pin the scroll container, not the page.
  const threadRef = useRef<HTMLDivElement>(null)
  // Monotonic counter so locally-sent message IDs stay stable across renders
  // without calling impure Date.now()/Math.random() in the render path.
  const localMsgCounterRef = useRef(0)
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    // Wait one frame so freshly-rendered bubbles are measured.
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'auto' })
    })
  }, [activeId, threadMessages.length])

  function selectConversation(id: string) {
    // Mark the chosen conversation as read immediately — feels more responsive
    // than waiting for an effect after the navigation settles.
    setConversations((prev) =>
      prev.map((c) => (c.id === id && c.unread_count > 0 ? { ...c, unread_count: 0 } : c)),
    )
    navigate(`/messages/${id}`, { replace: !!conversationId })
  }

  function markAllAsRead() {
    if (totalUnread === 0) return
    setConversations((prev) => prev.map((c) => ({ ...c, unread_count: 0 })))
    toast.success(t('messages.markAllReadSuccess', { defaultValue: FALLBACK.markAllReadSuccess }))
  }

  function sendDraft(e: React.FormEvent) {
    e.preventDefault()
    const body = draft.trim()
    if (!body || !active) return
    const now = new Date().toISOString()
    localMsgCounterRef.current += 1
    const id = `msg-local-${localMsgCounterRef.current}`
    setMessages((prev) => [...prev, { id, conversation_id: active.id, sender: 'us', body, sent_at: now }])
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id ? { ...c, last_message: body, last_message_at: now, unread_count: 0 } : c,
      ),
    )
    setDraft('')
  }

  function profileHref(): string | null {
    if (!active) return null
    if (active.type === 'customer') {
      const client = findClientByName(active.name)
      return client ? `/clients/${client.id}` : null
    }
    const merchant = findMerchantByName(active.name)
    return merchant ? `/merchants/${merchant.id}` : null
  }

  const filterCounts: Record<FilterId, number> = {
    all: conversations.length,
    unread: conversations.filter((c) => c.unread_count > 0).length,
    merchants: conversations.filter((c) => c.type === 'merchant').length,
    customers: conversations.filter((c) => c.type === 'customer').length,
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            {t('messages.title', { defaultValue: FALLBACK.title })}
          </h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {t('messages.subtitle', { defaultValue: FALLBACK.subtitle })}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={totalUnread === 0}
          className={cn(
            'inline-flex items-center gap-2 self-start rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground-secondary transition-colors sm:self-auto',
            totalUnread === 0 ? 'cursor-not-allowed opacity-50' : 'hover:border-primary/40 hover:text-primary',
          )}
        >
          <CheckCheck size={14} />
          {t('messages.markAllRead', { defaultValue: FALLBACK.markAllRead })}
          {totalUnread > 0 ? (
            <span className="ms-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-surface px-1.5 text-[11px] font-semibold tabular-nums text-primary">
              {totalUnread}
            </span>
          ) : null}
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid h-[calc(100vh-220px)] min-h-[560px] grid-cols-1 lg:grid-cols-[320px_1fr]">
          {/* ── Left column: conversation list ─────────────────── */}
          <div className="flex min-h-0 flex-col border-b border-border lg:border-b-0 lg:border-e">
            <div className="space-y-3 border-b border-border bg-background-secondary/40 p-3">
              <div className="relative">
                <Search
                  size={15}
                  className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('messages.searchPlaceholder', { defaultValue: FALLBACK.searchPlaceholder })}
                  className="h-9 w-full rounded-lg border border-border bg-card ps-9 pe-3 text-sm placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      'inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition-all',
                      filter === f
                        ? 'bg-primary text-primary-fg shadow-sm'
                        : 'bg-card text-foreground-secondary border border-border hover:border-primary/30 hover:text-primary',
                    )}
                  >
                    {t(`messages.filters.${f}`, { defaultValue: FALLBACK.filters[f] })}
                    <span
                      className={cn(
                        'tabular-nums',
                        filter === f ? 'opacity-80' : 'text-foreground-tertiary',
                      )}
                    >
                      ({filterCounts[f]})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-10">
                  <EmptyState
                    icon={Inbox}
                    title={t('messages.empty.title', { defaultValue: FALLBACK.empty.title })}
                    hint={t('messages.empty.hint', { defaultValue: FALLBACK.empty.hint })}
                  />
                </div>
              ) : (
                filtered.map((c) => (
                  <ConversationListItem
                    key={c.id}
                    conversation={c}
                    active={c.id === activeId}
                    onClick={() => selectConversation(c.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right column: conversation thread ──────────────── */}
          {active ? (
            <div className="flex min-h-0 flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
                <Avatar name={active.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{active.name}</p>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                        active.type === 'merchant'
                          ? 'bg-primary-surface text-primary'
                          : 'bg-info/10 text-info',
                      )}
                    >
                      {active.type === 'merchant' ? <Store size={10} /> : <UserIcon size={10} />}
                      {t(`messages.type.${active.type}`, { defaultValue: FALLBACK.type[active.type] })}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-foreground-tertiary">
                    <a
                      href={`tel:${active.phone}`}
                      className="inline-flex items-center gap-1 tabular-nums hover:text-primary"
                      dir="ltr"
                    >
                      <Phone size={11} />
                      {active.phone}
                    </a>
                    {profileHref() ? (
                      <button
                        type="button"
                        onClick={() => navigate(profileHref()!)}
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {t('messages.viewProfile', { defaultValue: FALLBACK.viewProfile })}
                        <ChevronLeft size={11} className="ltr:rotate-180" />
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Thread */}
              <div
                ref={threadRef}
                className="min-h-0 flex-1 overflow-y-auto bg-background-secondary/40 px-4 py-5"
              >
                {threadMessages.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title={t('messages.threadEmpty.title', { defaultValue: FALLBACK.threadEmpty.title })}
                    hint={t('messages.threadEmpty.hint', { defaultValue: FALLBACK.threadEmpty.hint })}
                  />
                ) : (
                  <div className="space-y-4">
                    {grouped.map((g) => (
                      <div key={g.label} className="space-y-2">
                        <div className="flex justify-center">
                          <span className="inline-block rounded-full bg-card px-3 py-0.5 text-[10.5px] font-medium uppercase tracking-wider text-foreground-tertiary shadow-sm">
                            {g.label}
                          </span>
                        </div>
                        {g.rows.map((m) => (
                          <MessageBubble key={m.id} message={m} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Composer */}
              <form
                onSubmit={sendDraft}
                className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('messages.composerPlaceholder', { defaultValue: FALLBACK.composerPlaceholder })}
                  className="h-11 w-full rounded-full border border-border bg-background-secondary/50 px-4 text-sm placeholder:text-foreground-tertiary focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                <button
                  type="submit"
                  disabled={draft.trim().length === 0}
                  className={cn(
                    'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg transition-all',
                    draft.trim().length === 0
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-primary-hover',
                  )}
                  aria-label={t('messages.send', { defaultValue: FALLBACK.send })}
                >
                  <Send size={17} strokeWidth={2} className="rtl:rotate-180" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center">
              <EmptyState
                icon={MessageSquare}
                title={t('messages.empty.title', { defaultValue: FALLBACK.empty.title })}
                hint={t('messages.empty.hint', { defaultValue: FALLBACK.empty.hint })}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
