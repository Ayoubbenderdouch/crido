import { ANCHOR_DATE } from '@/lib/timeRange'

export type ExpenseCategory =
  | 'rent'
  | 'salaries'
  | 'marketing'
  | 'technology'
  | 'legal'
  | 'operations'
  | 'other'

export type OperatingExpense = {
  id: string
  category: ExpenseCategory
  label: string
  amountDzd: number
  /** YYYY-MM */
  period: string
  recurring: boolean
  note: string | null
  createdAt: string
}

const STORAGE_KEY = 'crido_admin_expenses_v1'

const DEFAULT_EXPENSES: OperatingExpense[] = [
  {
    id: 'exp-rent-may',
    category: 'rent',
    label: 'إيجار المكتب — أدرار',
    amountDzd: 85000,
    period: '2026-05',
    recurring: true,
    note: 'عقد سنوي',
    createdAt: '2026-05-01',
  },
  {
    id: 'exp-salaries-may',
    category: 'salaries',
    label: 'رواتب الفريق (5)',
    amountDzd: 320000,
    period: '2026-05',
    recurring: true,
    note: null,
    createdAt: '2026-05-01',
  },
  {
    id: 'exp-tech-may',
    category: 'technology',
    label: 'سيرفرات + SMS + أدوات',
    amountDzd: 45000,
    period: '2026-05',
    recurring: true,
    note: null,
    createdAt: '2026-05-05',
  },
  {
    id: 'exp-marketing-may',
    category: 'marketing',
    label: 'إعلانات فيسبوك + توات',
    amountDzd: 28000,
    period: '2026-05',
    recurring: false,
    note: null,
    createdAt: '2026-05-10',
  },
  {
    id: 'exp-legal-may',
    category: 'legal',
    label: 'محاسب + استشارات قانونية',
    amountDzd: 15000,
    period: '2026-05',
    recurring: false,
    note: null,
    createdAt: '2026-05-12',
  },
  {
    id: 'exp-ops-may',
    category: 'operations',
    label: 'نقل + مستلزمات مكتب',
    amountDzd: 12000,
    period: '2026-05',
    recurring: false,
    note: null,
    createdAt: '2026-05-15',
  },
]

function read(): OperatingExpense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as OperatingExpense[]
  } catch {
    /* ignore */
  }
  return [...DEFAULT_EXPENSES]
}

function write(rows: OperatingExpense[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
  } catch {
    /* ignore */
  }
}

export function getOperatingExpenses(): OperatingExpense[] {
  return read().sort((a, b) => b.period.localeCompare(a.period) || b.createdAt.localeCompare(a.createdAt))
}

export function addOperatingExpense(
  input: Omit<OperatingExpense, 'id' | 'createdAt'>,
): OperatingExpense {
  const row: OperatingExpense = {
    ...input,
    id: `exp-${Date.now()}`,
    createdAt: ANCHOR_DATE,
  }
  const all = read()
  all.push(row)
  write(all)
  return row
}

export function updateOperatingExpense(id: string, patch: Partial<OperatingExpense>): void {
  const all = read().map((e) => (e.id === id ? { ...e, ...patch } : e))
  write(all)
}

export function deleteOperatingExpense(id: string): void {
  write(read().filter((e) => e.id !== id))
}

export function resetExpensesToDemo(): void {
  write([...DEFAULT_EXPENSES])
}
