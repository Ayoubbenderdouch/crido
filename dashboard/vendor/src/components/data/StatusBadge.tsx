import { useTranslation } from 'react-i18next'

// Exact tone palette from docs/DESIGN_SYSTEM.md §6 (status badge color map).
const TONES = {
  gray: { bg: '#F1EFE8', text: '#444441' },
  blue: { bg: '#E6F1FB', text: '#0C447C' },
  teal: { bg: '#E1F5EE', text: '#085041' },
  amber: { bg: '#FAEEDA', text: '#633806' },
  red: { bg: '#FCEBEB', text: '#791F1F' },
  green: { bg: '#9FE1CB', text: '#04342C' },
  mute: { bg: '#D3D1C7', text: '#444441' },
} as const

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  draft: 'gray', pending: 'gray', not_started: 'gray', pending_proof: 'gray',
  submitted: 'blue', under_review: 'blue', merchant_confirmed: 'blue',
  contracts_generated: 'blue', contracts_signed: 'blue', pending_verification: 'blue',
  approved: 'teal', verified: 'teal', active: 'teal',
  late: 'amber', documents_required: 'amber',
  rejected: 'red', defaulted: 'red', merchant_rejected: 'red', suspended: 'red',
  completed: 'green', paid: 'green',
  processing: 'amber',
  cancelled: 'mute', cancelled_by_client: 'mute', expired: 'mute', inactive: 'mute',
}

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const tone = TONES[STATUS_TONE[status] ?? 'gray']

  return (
    <span
      className="inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: tone.bg, color: tone.text }}
    >
      {t(`status.${status}`)}
    </span>
  )
}
