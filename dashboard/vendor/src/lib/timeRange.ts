/** Dashboard time-range helpers — filter & aggregate chart series. */

export const ANCHOR_DATE = '2026-05-20'

export type TimeRangeId = '1d' | '7d' | '30d' | '90d' | '6m' | '1y' | 'all'

export const TIME_RANGE_ORDER: TimeRangeId[] = ['1d', '7d', '30d', '90d', '6m', '1y', 'all']

export function daysForRange(range: TimeRangeId): number {
  switch (range) {
    case '1d':
      return 1
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    case '6m':
      return 180
    case '1y':
      return 365
    case 'all':
      return 365
  }
}

export function filterByRange<T extends { date: string }>(
  series: T[],
  range: TimeRangeId,
  anchor = ANCHOR_DATE,
): T[] {
  const days = daysForRange(range)
  const end = new Date(`${anchor}T12:00:00`)
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))
  const startIso = start.toISOString().slice(0, 10)
  return series.filter((p) => p.date >= startIso && p.date <= anchor)
}

export function computeTrendPct(values: number[]): number {
  if (values.length < 2) return 0
  const mid = Math.max(1, Math.floor(values.length / 2))
  const first = values.slice(0, mid)
  const second = values.slice(mid)
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)
  const a = avg(first)
  const b = avg(second)
  if (a === 0) return b > 0 ? 100 : 0
  return Math.round(((b - a) / a) * 100)
}

export function sumNumeric(series: Record<string, string | number>[], key: string): number {
  return series.reduce((sum, row) => sum + Number(row[key] ?? 0), 0)
}

type BucketMode = 'hourly' | 'daily' | 'weekly' | 'monthly'

function bucketModeForRange(range: TimeRangeId): BucketMode {
  if (range === '1d') return 'hourly'
  if (range === '7d' || range === '30d') return 'daily'
  if (range === '90d' || range === '6m') return 'weekly'
  return 'monthly'
}

function buildHourlyFromDay(
  day: Record<string, string | number> | undefined,
  valueKeys: string[],
): Array<Record<string, string | number>> {
  const base: Record<string, number> = {}
  for (const key of valueKeys) {
    base[key] = Number(day?.[key] ?? 0)
  }
  const out: Array<Record<string, string | number>> = []
  for (let h = 0; h < 24; h++) {
    const wave = 0.72 + Math.sin((h / 24) * Math.PI * 2) * 0.18 + (h % 5) * 0.02
    const row: Record<string, string | number> = {
      date: `${String(h).padStart(2, '0')}:00`,
    }
    for (const key of valueKeys) {
      row[key] = Math.round((base[key] / 24) * wave)
    }
    out.push(row)
  }
  return out
}

function weekKey(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().slice(0, 10)
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

function rowValue(row: { date: string }, key: string): number {
  return Number((row as Record<string, string | number>)[key] ?? 0)
}

function aggregateBuckets<T extends { date: string }>(
  filtered: T[],
  range: TimeRangeId,
  valueKeys: string[],
): Array<Record<string, string | number>> {
  const mode = bucketModeForRange(range)
  if (mode === 'hourly') {
    return buildHourlyFromDay(filtered[filtered.length - 1] as Record<string, string | number>, valueKeys)
  }
  if (mode === 'daily') {
    return filtered.map((row) => ({ ...row }) as Record<string, string | number>)
  }

  const groups = new Map<string, Record<string, number>>()
  for (const row of filtered) {
    const key = mode === 'weekly' ? weekKey(row.date) : monthKey(row.date)
    const g = groups.get(key) ?? Object.fromEntries(valueKeys.map((k) => [k, 0])) as Record<string, number>
    for (const vk of valueKeys) {
      g[vk] = (g[vk] ?? 0) + rowValue(row, vk)
    }
    groups.set(key, g)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({ date, ...vals }))
}

export function chartPointsForRange<T extends { date: string }>(
  fullSeries: T[],
  range: TimeRangeId,
  valueKeys: string[],
  anchor = ANCHOR_DATE,
): Array<Record<string, string | number>> {
  const filtered = filterByRange(fullSeries, range, anchor)
  if (filtered.length === 0) return []
  return aggregateBuckets(filtered, range, valueKeys)
}

export function barPointsForRange<T extends { date: string }>(
  fullSeries: T[],
  range: TimeRangeId,
  valueKey: string,
  anchor = ANCHOR_DATE,
): { label: string; value: number }[] {
  const points = chartPointsForRange(fullSeries, range, [valueKey], anchor)
  return points.map((p) => ({
    label: formatBucketLabel(String(p.date), range),
    value: Number(p[valueKey] ?? 0),
  }))
}

export function formatBucketLabel(dateOrKey: string, range: TimeRangeId): string {
  if (range === '1d') return dateOrKey
  if (dateOrKey.includes(':')) return dateOrKey
  if (dateOrKey.length === 7) {
    const [, m] = dateOrKey.split('-')
    return m
  }
  return `${dateOrKey.slice(8, 10)}/${dateOrKey.slice(5, 7)}`
}

export function formatChartAxisLabel(dateOrKey: string, range: TimeRangeId): string {
  return formatBucketLabel(dateOrKey, range)
}

const STORAGE_KEY = 'crido_time_range'

export function loadStoredTimeRange(fallback: TimeRangeId = '30d'): TimeRangeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && TIME_RANGE_ORDER.includes(raw as TimeRangeId)) return raw as TimeRangeId
  } catch {
    /* ignore */
  }
  return fallback
}

export function storeTimeRange(range: TimeRangeId): void {
  try {
    localStorage.setItem(STORAGE_KEY, range)
  } catch {
    /* ignore */
  }
}
