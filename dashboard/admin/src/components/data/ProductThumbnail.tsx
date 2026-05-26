import { useState } from 'react'
import { getProductVisual } from '@/lib/productVisuals'
import { ProductIllustration } from './ProductIllustration'
import { cn } from '@/lib/utils'

type Props = {
  productName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = { sm: 'h-16 w-16', md: 'aspect-square w-full', lg: 'aspect-square w-full' }

export function ProductThumbnail({ productName, className, size = 'md' }: Props) {
  const visual = getProductVisual(productName)
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = visual.imageSrc && !photoFailed

  if (!showPhoto) {
    return (
      <ProductIllustration
        category={visual.category}
        className={cn(SIZE[size], className)}
      />
    )
  }

  return (
    <img
      src={visual.imageSrc!}
      alt=""
      className={cn('rounded-xl object-cover bg-background-secondary', SIZE[size], className)}
      loading="eager"
      decoding="async"
      onError={() => setPhotoFailed(true)}
    />
  )
}
