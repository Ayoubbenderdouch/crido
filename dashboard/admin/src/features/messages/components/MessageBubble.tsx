import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Check, CheckCheck } from 'lucide-react'
import type { Message } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

type Props = {
  message: Message
  /** When true the timestamp + read receipt are shown beneath the bubble. */
  showMeta?: boolean
}

export function MessageBubble({ message, showMeta = true }: Props) {
  const { t } = useTranslation()
  const isOut = message.sender === 'us'

  return (
    <div className={cn('flex w-full', isOut ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex max-w-[78%] flex-col gap-1', isOut ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm',
            isOut
              ? 'bg-primary text-primary-fg rounded-ee-md'
              : 'bg-card text-foreground border border-border/60 rounded-es-md',
          )}
        >
          {message.body}
        </div>
        {showMeta ? (
          <div
            className={cn(
              'flex items-center gap-1 px-1 text-[10.5px] tabular-nums',
              isOut ? 'text-foreground-tertiary' : 'text-foreground-tertiary',
            )}
          >
            <span>{dayjs(message.sent_at).format('HH:mm')}</span>
            {isOut ? (
              <CheckCheck
                size={13}
                strokeWidth={2}
                className="text-primary"
                aria-label={t('messages.delivered', { defaultValue: 'تم التسليم' })}
              />
            ) : (
              <Check size={13} strokeWidth={2} aria-hidden="true" className="opacity-0" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
