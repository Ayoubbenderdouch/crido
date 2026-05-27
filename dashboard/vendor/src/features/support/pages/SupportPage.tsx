import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare } from 'lucide-react'
import { EmptyState } from '@/components/data/EmptyState'
import {
  MOCK_SUPPORT_MESSAGES,
  SUPPORT_CANNED_REPLIES,
  SUPPORT_QUICK_REPLIES,
  type SupportMessage,
} from '@/lib/mock/data'
import { MessageBubble } from '../components/MessageBubble'
import { SupportInput } from '../components/SupportInput'

const STRINGS = {
  ar: {
    title: 'دعم Crido',
    online: 'متّصل الآن',
    replyTime: 'نرد عادة في خلال ساعة',
    today: 'اليوم',
    typing: 'يكتب...',
    emptyTitle: 'ابدأ محادثة مع فريق الدعم',
    emptyHint: 'نحن هنا للمساعدة في أي وقت — لا تتردد في طرح أي سؤال.',
  },
  fr: {
    title: 'Support Crido',
    online: 'En ligne',
    replyTime: 'Nous répondons en moins d’une heure',
    today: 'Aujourd’hui',
    typing: 'écrit...',
    emptyTitle: 'Démarrez une conversation avec le support',
    emptyHint: 'Nous sommes là pour vous aider — n’hésitez pas à poser vos questions.',
  },
} as const

/** A reply latency that feels "human" — between 1.6s and 2.8s. */
function pickReplyDelayMs(): number {
  return 1600 + Math.floor(Math.random() * 1200)
}

function pickCannedReply(): string {
  return SUPPORT_CANNED_REPLIES[Math.floor(Math.random() * SUPPORT_CANNED_REPLIES.length)]
}

function nowIso(): string {
  return new Date().toISOString()
}

/**
 * Group messages so that consecutive messages from the same sender within
 * a short window collapse the avatar/time on intermediate bubbles for
 * a tidier chat (à la WhatsApp).
 */
function decorate(messages: SupportMessage[]) {
  return messages.map((m, i) => {
    const next = messages[i + 1]
    const prev = messages[i - 1]
    const isLastInGroup = !next || next.sender !== m.sender
    const isFirstInGroup = !prev || prev.sender !== m.sender
    return { message: m, showAvatar: isLastInGroup, showTime: isLastInGroup, isFirstInGroup }
  })
}

/** Day separator label — "اليوم" for today, otherwise short date. */
function formatDayLabel(iso: string, todayLabel: string): string {
  const d = new Date(iso)
  const today = new Date()
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  if (isToday) return todayLabel
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default function SupportPage() {
  const { i18n } = useTranslation()
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : 'ar') as 'ar' | 'fr'
  const s = STRINGS[lang]

  const [messages, setMessages] = useState<SupportMessage[]>(() =>
    // Mark everything as read on mount (vendor opened the conversation).
    MOCK_SUPPORT_MESSAGES.map((m) => ({ ...m, read: true })),
  )
  const [adminTyping, setAdminTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingReplyRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const decorated = useMemo(() => decorate(messages), [messages])

  // Auto-scroll to bottom whenever the message list grows or admin starts typing.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Use rAF so the new node is in the DOM before scrolling.
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    })
  }, [messages, adminTyping])

  // Cleanup pending reply timer on unmount.
  useEffect(() => {
    return () => {
      if (pendingReplyRef.current) clearTimeout(pendingReplyRef.current)
    }
  }, [])

  function appendMessage(body: string, sender: SupportMessage['sender'], read: boolean) {
    const msg: SupportMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender,
      body,
      sent_at: nowIso(),
      read,
    }
    setMessages((prev) => [...prev, msg])
    return msg
  }

  function handleSend(body: string) {
    appendMessage(body, 'vendor', false)

    // Mark vendor msg as "read" by admin a moment later (single → double check).
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.sender === 'vendor' && !m.read ? { ...m, read: true } : m)),
      )
    }, 900)

    // Cancel any in-flight reply and schedule a new canned admin reply.
    if (pendingReplyRef.current) clearTimeout(pendingReplyRef.current)
    setAdminTyping(true)
    pendingReplyRef.current = setTimeout(() => {
      setAdminTyping(false)
      appendMessage(pickCannedReply(), 'admin', true)
    }, pickReplyDelayMs())
  }

  function handleQuickReply(label: string) {
    handleSend(label)
  }

  const isEmpty = messages.length === 0

  // We only show one day label for the whole conversation in mock mode —
  // all messages happen "today" in the prototype.
  const dayLabel = isEmpty ? null : formatDayLabel(messages[0].sent_at, s.today)

  return (
    <div className="animate-fade-up">
      {/* Header card: branding + presence + reply time. */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary-hover to-[#084A3A] text-primary-fg shadow-md">
        <div className="relative px-5 py-4 sm:px-6 sm:py-5">
          <div
            className="pointer-events-none absolute -end-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-center gap-4">
            <div className="relative shrink-0">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white/40 sm:h-14 sm:w-14">
                <img
                  src="/crido-logo.png"
                  alt="Crido"
                  className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                />
              </span>
              <span
                className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0C5B47] bg-success shadow-sm"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold sm:text-xl">{s.title}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-white/85 sm:text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span>{s.online}</span>
                <span className="text-white/45">·</span>
                <span>{s.replyTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat surface */}
      <div className="flex h-[calc(100vh-13rem)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-sm">
        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-4 sm:px-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          {isEmpty ? (
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title={s.emptyTitle}
                hint={s.emptyHint}
              />
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
              {dayLabel ? (
                <div className="mb-2 flex justify-center">
                  <span className="rounded-full bg-card px-3 py-1 text-[11px] font-medium text-foreground-tertiary shadow-sm ring-1 ring-border">
                    {dayLabel}
                  </span>
                </div>
              ) : null}

              {decorated.map(({ message, showAvatar, showTime, isFirstInGroup }) => (
                <div
                  key={message.id}
                  className={isFirstInGroup ? 'mt-2 first:mt-0' : ''}
                >
                  <MessageBubble
                    message={message}
                    showAvatar={showAvatar}
                    showTime={showTime}
                  />
                </div>
              ))}

              {adminTyping ? (
                <div className="mt-1 flex items-end gap-2" aria-live="polite">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-surface ring-1 ring-primary/20">
                    <img
                      src="/crido-logo.png"
                      alt=""
                      className="h-5 w-5 object-contain"
                      loading="lazy"
                    />
                  </span>
                  <div className="rounded-2xl rounded-es-md border border-border bg-card px-4 py-3 shadow-sm">
                    <span className="flex items-center gap-1" aria-label={s.typing}>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-tertiary [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-tertiary [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-tertiary" />
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Quick replies — horizontal scroll on small screens. */}
        <div className="border-t border-border bg-card/60 px-3 py-2.5 sm:px-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUPPORT_QUICK_REPLIES.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickReply(label)}
                className="shrink-0 rounded-full border border-primary/25 bg-primary-surface/60 px-3.5 py-1.5 text-xs font-medium text-primary transition hover:border-primary/50 hover:bg-primary-surface active:scale-95"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <SupportInput onSend={handleSend} />
      </div>
    </div>
  )
}
