import type { LucideIcon } from 'lucide-react'

type Props = {
  icon: LucideIcon
  title: string
  hint?: string
}

export function EmptyState({ icon: Icon, title, hint }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary text-foreground-tertiary">
        <Icon size={26} strokeWidth={1.5} />
      </span>
      <p className="mt-4 text-md font-medium text-foreground">{title}</p>
      {hint ? (
        <p className="mt-1 max-w-sm text-sm text-foreground-secondary">{hint}</p>
      ) : null}
    </div>
  )
}
