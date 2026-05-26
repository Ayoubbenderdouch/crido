// Shared helpers / types used across the real-API modules.

export type EnumValue = {
  value: string
  label_ar?: string
  label_fr?: string
} | string | null | undefined

/** Pulls a plain string out of either an enum-shaped object or a raw string. */
export function unwrapValue(input: EnumValue): string | null {
  if (input == null) return null
  if (typeof input === 'string') return input
  return input.value ?? null
}

/** Standard pagination wrapper Laravel emits for resource collections. */
export type Paginated<T> = {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
}
