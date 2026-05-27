import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Paperclip, Send, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  onSend: (body: string) => void
  disabled?: boolean
  placeholder?: string
}

const LINE_HEIGHT_PX = 22
const MAX_LINES = 4

const STRINGS = {
  ar: {
    placeholder: 'اكتب رسالتك...',
    label: 'مربع الرسالة',
    send: 'إرسال',
    attach: 'إرفاق ملف',
    emoji: 'الرموز التعبيرية',
  },
  fr: {
    placeholder: 'Écrivez votre message...',
    label: 'Zone de message',
    send: 'Envoyer',
    attach: 'Joindre un fichier',
    emoji: 'Emoji',
  },
} as const

export function SupportInput({ onSend, disabled, placeholder }: Props) {
  const { i18n } = useTranslation()
  const lang = (i18n.language?.startsWith('fr') ? 'fr' : 'ar') as 'ar' | 'fr'
  const s = STRINGS[lang]
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow textarea up to MAX_LINES, then scroll.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const max = LINE_HEIGHT_PX * MAX_LINES + 16
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
  }, [value])

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    // Re-focus so vendor can keep typing.
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div className="border-t border-border bg-card px-3 py-3 sm:px-4">
      <div className="flex items-end gap-2">
        {/* Attachment placeholder */}
        <button
          type="button"
          disabled
          aria-label={s.attach}
          title={s.attach}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground-tertiary transition hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:flex"
        >
          <Paperclip size={18} strokeWidth={1.75} />
        </button>

        {/* Textarea + emoji */}
        <div className="relative flex min-w-0 flex-1 items-end rounded-2xl border border-border bg-background-secondary/60 focus-within:border-primary/40 focus-within:bg-background">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? s.placeholder}
            disabled={disabled}
            aria-label={s.label}
            className="block w-full resize-none border-0 bg-transparent px-4 py-2.5 pe-11 text-sm leading-[22px] text-foreground placeholder:text-foreground-tertiary focus:outline-none disabled:opacity-60"
            style={{ maxHeight: LINE_HEIGHT_PX * MAX_LINES + 16 }}
          />
          <button
            type="button"
            disabled
            aria-label={s.emoji}
            title={s.emoji}
            className="absolute bottom-1.5 end-1.5 flex h-8 w-8 items-center justify-center rounded-full text-foreground-tertiary transition hover:bg-background-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Smile size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label={s.send}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition',
            canSend
              ? 'bg-primary text-primary-fg shadow-sm hover:bg-primary-hover active:scale-95'
              : 'bg-background-secondary text-foreground-tertiary',
          )}
        >
          <Send
            size={18}
            strokeWidth={2}
            className={cn('rtl:-scale-x-100', canSend && 'translate-x-[1px]')}
          />
        </button>
      </div>
    </div>
  )
}
