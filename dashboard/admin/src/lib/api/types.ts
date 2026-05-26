// Shared types for the real API layer.
//
// The backend wraps lists with Laravel pagination
// (`{data, links, meta}`) and most resource items with status enums encoded as
// `{value, label_ar, label_fr}`. These helpers describe that shape so the rest
// of the codebase can stay strict.

export type Enum = {
  value: string
  label_ar: string
  label_fr: string
}

export type Paginated<T> = {
  data: T[]
  links?: {
    first: string | null
    last: string | null
    prev: string | null
    next: string | null
  }
  meta?: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export type ListParams = {
  page?: number
  per_page?: number
  q?: string
  [key: string]: unknown
}
