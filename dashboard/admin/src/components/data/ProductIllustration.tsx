import type { ProductCategory } from '@/lib/productVisuals'
import { cn } from '@/lib/utils'

type Props = {
  category: ProductCategory
  className?: string
}

/** Lokale SVG — lädt ohne Internet / Unsplash. */
export function ProductIllustration({ category, className }: Props) {
  const base = cn('aspect-square w-full rounded-xl', className)

  if (category === 'phone') {
    return (
      <svg viewBox="0 0 200 200" className={base} aria-hidden>
        <defs>
          <linearGradient id="ph-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E1F5EE" />
            <stop offset="100%" stopColor="#F1EFE8" />
          </linearGradient>
          <linearGradient id="ph-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#333" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#ph-bg)" rx="16" />
        <rect x="62" y="28" width="76" height="144" rx="14" fill="url(#ph-body)" />
        <rect x="66" y="40" width="68" height="108" rx="8" fill="#0F6E56" opacity="0.15" />
        <rect x="66" y="40" width="68" height="108" rx="8" fill="#fff" opacity="0.95" />
        <circle cx="100" cy="158" r="6" fill="#1a1a1a" opacity="0.4" />
        <rect x="78" y="48" width="44" height="8" rx="4" fill="#1D9E75" opacity="0.5" />
        <rect x="78" y="68" width="36" height="4" rx="2" fill="#D3D1C7" />
        <rect x="78" y="78" width="48" height="4" rx="2" fill="#D3D1C7" />
        <rect x="78" y="88" width="40" height="4" rx="2" fill="#D3D1C7" />
      </svg>
    )
  }

  if (category === 'pc') {
    return (
      <svg viewBox="0 0 200 200" className={base} aria-hidden>
        <defs>
          <linearGradient id="pc-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6F1FB" />
            <stop offset="100%" stopColor="#F1EFE8" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#pc-bg)" rx="16" />
        <rect x="36" y="48" width="128" height="82" rx="8" fill="#2d3748" />
        <rect x="42" y="54" width="116" height="66" rx="4" fill="#1D9E75" opacity="0.2" />
        <rect x="42" y="54" width="116" height="66" rx="4" fill="#fff" opacity="0.92" />
        <rect x="70" y="132" width="60" height="8" rx="2" fill="#4a5568" />
        <rect x="56" y="140" width="88" height="6" rx="3" fill="#718096" />
        <rect x="52" y="62" width="40" height="3" rx="1.5" fill="#1D9E75" opacity="0.6" />
        <rect x="52" y="72" width="56" height="3" rx="1.5" fill="#D3D1C7" />
        <rect x="52" y="82" width="48" height="3" rx="1.5" fill="#D3D1C7" />
      </svg>
    )
  }

  if (category === 'appliance') {
    return (
      <svg viewBox="0 0 200 200" className={base} aria-hidden>
        <rect width="200" height="200" fill="#FAEEDA" rx="16" />
        <rect x="48" y="32" width="104" height="136" rx="12" fill="#fff" stroke="#EF9F27" strokeWidth="2" />
        <circle cx="100" cy="108" r="36" fill="#E6F1FB" stroke="#378ADD" strokeWidth="3" />
        <circle cx="100" cy="108" r="24" fill="#fff" opacity="0.8" />
        <rect x="88" y="24" width="24" height="12" rx="4" fill="#EF9F27" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 200 200" className={base} aria-hidden>
      <rect width="200" height="200" fill="#F1EFE8" rx="16" />
      <rect x="50" y="50" width="100" height="100" rx="12" fill="#E1F5EE" stroke="#1D9E75" strokeWidth="2" />
      <path
        d="M85 95h30M100 80v30"
        stroke="#1D9E75"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
