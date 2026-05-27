import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Store, User } from 'lucide-react'
import { Avatar } from '@/components/data/Avatar'
import type { Conversation } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

type Props = {
  conversation: Conversation
  active?: boolean
  onClick?: () => void
}

/** Format the sidebar timestamp — "09:42", "Yesterday", "23 ماي". */
function formatPreviewTime(iso: string, locale: 'ar' | 'fr'): string {
  const d = dayjs(iso)
  const now = dayjs('2026-05-27T10:00:00')
  if (d.isSame(now, 'day')) return d.format('HH:mm')
  if (d.isSame(now.subtract(1, 'day'), 'day')) {
    return locale === 'ar' ? 'أمس' : 'Hier'
  }
  if (now.diff(d, 'day') < 7) {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    const daysFr = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    return locale === 'ar' ? days[d.day()] : daysFr[d.day()]
  }
  const months = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
  return locale === 'ar' ? `${d.date()} ${months[d.month()]}` : d.format('DD/MM')
}

export function ConversationListItem({ conversation, active, onClick }: Props) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language as 'ar' | 'fr'
  const TypeIcon = conversation.type === 'merchant' ? Store : User

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 border-b border-border/60 px-3 py-3 text-start transition-colors last:border-0',
        active ? 'bg-primary-surface/70' : 'hover:bg-background-secondary',
      )}
    >
      <div className="relative shrink-0">
        <Avatar name={conversation.name} size={44} />
        <span
          className={cn(
            'absolute -bottom-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-card',
            conversation.type === 'merchant' ? 'bg-primary' : 'bg-info',
          )}
          title={t(`messages.type.${conversation.type}`, {
            defaultValue: conversation.type === 'merchant' ? 'تاجر' : 'عميل',
          })}
        >
          <TypeIcon size={9} strokeWidth={2.5} className="text-white" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('truncate text-sm', conversation.unread_count > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
            {conversation.name}
          </p>
          <span className="ms-auto shrink-0 text-[11px] tabular-nums text-foreground-tertiary">
            {formatPreviewTime(conversation.last_message_at, locale)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p
            className={cn(
              'truncate text-xs',
              conversation.unread_count > 0 ? 'font-medium text-foreground-secondary' : 'text-foreground-tertiary',
            )}
          >
            {conversation.last_message}
          </p>
          {conversation.unread_count > 0 ? (
            <span className="ms-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-fg">
              {conversation.unread_count}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  )
}
