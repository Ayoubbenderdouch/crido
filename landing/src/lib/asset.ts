/**
 * Resolve a public-folder asset URL relative to Vite's configured `base`.
 *
 * Use this for every runtime image reference so the same code works at the
 * root (`/`) in dev and under a sub-path (e.g. `/crido/`) on GitHub Pages.
 *
 * @example
 * <img src={asset('/images/hero-character.png')} />
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${cleanBase}${cleanPath}`
}
