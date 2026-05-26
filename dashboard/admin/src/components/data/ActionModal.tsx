import { X } from 'lucide-react'

type Props = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
  footer: React.ReactNode
  size?: 'md' | 'lg'
}

export function ActionModal({ open, title, subtitle, onClose, children, footer, size = 'md' }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
        aria-label="close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl ${size === 'lg' ? 'max-w-lg' : 'max-w-md'}`}
      >
        <div className="border-b border-border bg-gradient-to-r from-primary-surface/80 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {subtitle ? (
                <p className="mt-1 text-xs text-foreground-tertiary">{subtitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-foreground-tertiary transition hover:bg-background-secondary"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="px-5 py-4">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">{footer}</div>
      </div>
    </div>
  )
}

export const MODAL_TEXTAREA =
  'w-full rounded-xl border border-border-strong bg-background px-3.5 py-2.5 text-sm text-foreground transition placeholder:text-foreground-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none'
