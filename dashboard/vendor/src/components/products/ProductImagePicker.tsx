import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Camera, ImagePlus, Sparkles, Star, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { compressImageFile, getCategoryStyle } from '@/lib/productVisuals'
import { cn } from '@/lib/utils'

const MAX_GALLERY = 4
const MAX_MB = 4

type Props = {
  category: string
  coverImage?: string
  gallery?: string[]
  onChange: (next: { coverImage?: string; gallery: string[] }) => void
}

export default function ProductImagePicker({
  category,
  coverImage,
  gallery = [],
  onChange,
}: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const style = getCategoryStyle(category)

  const allImages = [
    ...(coverImage ? [coverImage] : []),
    ...gallery.filter((g) => g !== coverImage),
  ].slice(0, MAX_GALLERY)

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith('image/'))
      if (!list.length) return

      const room = MAX_GALLERY - allImages.length
      if (room <= 0) {
        toast.error(t('products.images.maxReached', { count: MAX_GALLERY }))
        return
      }

      const picked = list.slice(0, room)
      for (const file of picked) {
        if (file.size > MAX_MB * 1024 * 1024) {
          toast.error(t('products.images.tooLarge', { mb: MAX_MB }))
          return
        }
      }

      try {
        const encoded = await Promise.all(picked.map((f) => compressImageFile(f)))
        const merged = [...allImages, ...encoded].slice(0, MAX_GALLERY)
        onChange({
          coverImage: merged[0],
          gallery: merged.slice(1),
        })
        toast.success(t('products.images.added'))
      } catch {
        toast.error(t('products.images.failed'))
      }
    },
    [allImages, onChange, t],
  )

  const setAsCover = (url: string) => {
    const rest = allImages.filter((u) => u !== url)
    onChange({ coverImage: url, gallery: rest })
  }

  const removeImage = (url: string) => {
    const next = allImages.filter((u) => u !== url)
    onChange({ coverImage: next[0], gallery: next.slice(1) })
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void addFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'group relative overflow-hidden rounded-2xl border-2 border-dashed transition-all',
          dragOver
            ? 'border-primary bg-primary-surface scale-[1.01]'
            : 'border-border-strong bg-background hover:border-primary/40 hover:bg-primary-surface/30',
          coverImage ? 'min-h-[220px]' : 'min-h-[200px]',
        )}
        style={
          !coverImage
            ? {
                background: `linear-gradient(135deg, ${style.accent} 0%, ${style.from}12 50%, transparent 100%)`,
              }
            : undefined
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files)
            e.target.value = ''
          }}
        />

        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt=""
              className="h-full min-h-[220px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 start-0 end-0 flex items-center justify-between gap-2 p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                <Star size={12} fill="currentColor" />
                {t('products.images.cover')}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  inputRef.current?.click()
                }}
                className="rounded-full bg-white/90 p-2 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white"
              >
                <Camera size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
              style={{ background: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
            >
              <Upload size={24} className="text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t('products.images.dropTitle')}
              </p>
              <p className="mt-1 text-xs text-foreground-tertiary">
                {t('products.images.dropHint')}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-surface px-3 py-1 text-xs font-medium text-primary">
              <ImagePlus size={14} />
              {t('products.images.cta')}
            </span>
          </div>
        )}
      </div>

      {allImages.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-foreground-secondary">
            <Sparkles size={14} className="text-primary" />
            {t('products.images.gallery')} ({allImages.length}/{MAX_GALLERY})
          </p>
          <div className="flex flex-wrap gap-2">
            {allImages.map((url) => {
              const isCover = url === coverImage
              return (
                <div
                  key={url.slice(0, 40)}
                  className={cn(
                    'group/thumb relative h-20 w-20 overflow-hidden rounded-xl border-2 transition',
                    isCover ? 'border-primary ring-2 ring-primary/20' : 'border-border',
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover/thumb:bg-black/45 group-hover/thumb:opacity-100">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setAsCover(url)}
                        className="rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-medium text-primary"
                      >
                        {t('products.images.setCover')}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="rounded-md bg-danger/90 p-1 text-white"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {isCover && (
                    <span className="absolute start-1 top-1 rounded bg-primary px-1 py-0.5 text-[9px] font-semibold text-white">
                      ★
                    </span>
                  )}
                </div>
              )
            })}
            {allImages.length < MAX_GALLERY && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-strong text-foreground-tertiary transition hover:border-primary hover:text-primary"
              >
                <ImagePlus size={18} />
                <span className="text-[10px]">{t('products.images.add')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
