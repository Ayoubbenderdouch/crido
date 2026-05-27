import { forwardRef } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  count: number
  onClick?: () => void
  active?: boolean
  className?: string
}

/**
 * Reusable bell button with an unread-count badge. Renders nothing
 * special if `count === 0` — just the bell. When `count > 99` the
 * badge collapses to `99+`.
 */
export const NotificationBell = forwardRef<HTMLButtonElement, Props>(
  function NotificationBell({ count, onClick, active, className }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label="notifications"
        aria-haspopup="menu"
        aria-expanded={active}
        className={cn(
          'relative flex h-9 w-9 items-center justify-center rounded-md transition-colors',
          active
            ? 'bg-primary-surface text-primary'
            : 'text-foreground-secondary hover:bg-background-secondary',
          className,
        )}
      >
        <Bell size={19} strokeWidth={1.5} />
        {count > 0 && (
          <span
            className="absolute -top-1 -end-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-background"
            aria-hidden="true"
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    )
  },
)
