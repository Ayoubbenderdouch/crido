import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, X, FileImage, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PayoutProofFile = {
  dataUrl: string
  fileName: string
  mimeType: string
}

const MAX_BYTES = 3 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf'

type Props = {
  value: PayoutProofFile | null
  onChange: (file: PayoutProofFile | null) => void
  compact?: boolean
}

export function PayoutProofUpload({ value, onChange, compact = false }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function pick() {
    inputRef.current?.click()
  }

  function onFile(file: File | undefined) {
    if (!file) return
    setError(null)
    if (file.size > MAX_BYTES) {
      setError(t('payouts.upload.tooLarge'))
      return
    }
    if (!file.type.match(/^image\/(jpeg|png|webp|heic)|application\/pdf$/)) {
      setError(t('payouts.upload.invalidType'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      onChange({ dataUrl, fileName: file.name, mimeType: file.type })
    }
    reader.onerror = () => setError(t('payouts.upload.readError'))
    reader.readAsDataURL(file)
  }

  const isPdf = value?.mimeType === 'application/pdf'
  const isImage = value?.mimeType.startsWith('image/')

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-background">
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute end-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-foreground/70 text-white transition hover:bg-foreground"
            aria-label={t('payouts.upload.remove')}
          >
            <X size={16} />
          </button>
          {isImage ? (
            <img
              src={value.dataUrl}
              alt=""
              className={cn('mx-auto w-full object-contain', compact ? 'max-h-40' : 'max-h-56')}
            />
          ) : isPdf ? (
            <div className={cn('flex flex-col items-center justify-center gap-2 px-4', compact ? 'py-8' : 'py-12')}>
              <FileText size={40} className="text-primary" />
              <p className="text-sm font-medium text-foreground">{value.fileName}</p>
              <a
                href={value.dataUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                {t('payouts.upload.openPdf')}
              </a>
            </div>
          ) : null}
          <p className="border-t border-border px-3 py-2 text-center text-xs text-foreground-tertiary">
            {value.fileName}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('border-primary', 'bg-primary-surface/50')
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-primary', 'bg-primary-surface/50')
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.currentTarget.classList.remove('border-primary', 'bg-primary-surface/50')
            onFile(e.dataTransfer.files[0])
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background-secondary/40 transition hover:border-primary/50 hover:bg-primary-surface/30',
            compact ? 'px-4 py-6' : 'px-6 py-10',
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload size={22} />
          </span>
          <span className="text-sm font-semibold text-foreground">{t('payouts.upload.title')}</span>
          <span className="text-xs text-foreground-tertiary">{t('payouts.upload.hint')}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-foreground-tertiary">
            <FileImage size={12} />
            JPG · PNG · PDF · {t('payouts.upload.maxSize')}
          </span>
        </button>
      )}

      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}
