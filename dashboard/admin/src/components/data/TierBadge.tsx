// Credit tier chip — see docs/BUSINESS_RULES.md §8 (score → tier).
const TIER_COLOR: Record<string, string> = {
  A: '#0F6E56',
  B: '#1D9E75',
  C: '#378ADD',
  D: '#EF9F27',
  E: '#E24B4A',
}

export function TierBadge({ tier }: { tier: string }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: TIER_COLOR[tier] ?? '#888780' }}
    >
      {tier}
    </span>
  )
}
