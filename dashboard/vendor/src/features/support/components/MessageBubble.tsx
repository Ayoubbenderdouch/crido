import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SupportMessage } from '@/lib/mock/data'

type Props = {
  message: SupportMessage
  showAvatar?: boolean
  showTime?: boolean
}

/** Format an ISO datetime to `HH:mm` in 24-hour, locale-agnostic form. */
function formatClock(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function MessageBubble({ message, showAvatar = true, showTime = true }: Props) {
  const isVendor = message.sender === 'vendor'

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2',
        isVendor ? 'justify-end' : 'justify-start',
      )}
    >
      {!isVendor && showAvatar ? (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-surface ring-1 ring-primary/20">
          <img
            src="/crido-logo.png"
            alt=""
            className="h-5 w-5 object-contain"
            loading="lazy"
          />
        </span>
      ) : null}

      {!isVendor && !showAvatar ? <span className="w-8 shrink-0" aria-hidden /> : null}

      <div
        className={cn(
          'group max-w-[78%] sm:max-w-[68%]',
          isVendor ? 'items-end' : 'items-start',
        )}
      >
        <div
          className={cn(
            'relative whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isVendor
              ? 'bg-primary text-primary-fg rounded-ee-md'
              : 'bg-card text-foreground border border-border rounded-es-md',
          )}
        >
          {message.body}
        </div>

        {showTime ? (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 px-1 text-[11px] text-foreground-tertiary',
              isVendor ? 'justify-end' : 'justify-start',
            )}
          >
            <span className="tabular-nums">{formatClock(message.sent_at)}</span>
            {isVendor ? (
              message.read ? (
                <CheckCheck size={14} className="text-primary-light" strokeWidth={2.2} />
              ) : (
                <Check size={14} className="text-foreground-tertiary" strokeWidth={2.2} />
              )
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
