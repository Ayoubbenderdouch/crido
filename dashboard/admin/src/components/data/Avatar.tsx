import { useState } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  name: string
  size?: number
  className?: string
}

/**
 * Person avatar — an illustrated portrait generated deterministically
 * from the name (DiceBear). Falls back to an initials circle if the
 * image can't load (e.g. offline).
 */
export function Avatar({ name, size = 36, className }: Props) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }

  if (failed) {
    return (
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full bg-primary-surface font-medium text-primary',
          className,
        )}
        style={{ ...box, fontSize: Math.round(size * 0.4) }}
      >
        {name.trim().charAt(0)}
      </span>
    )
  }

  const url =
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name)}` +
    `&backgroundColor=e1f5ee&radius=50`

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full bg-primary-surface object-cover', className)}
      style={box}
    />
  )
}
