import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export type DonutSlice = { name: string; value: number; color: string }

type Props = {
  data: DonutSlice[]
  centerValue: string
  centerLabel: string
  height?: number
}

/** Ring chart with a value stacked in the middle. */
export function DonutChart({ data, centerValue, centerLabel, height = 210 }: Props) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="64%"
            outerRadius="94%"
            paddingAngle={data.length > 1 ? 3 : 0}
            strokeWidth={0}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.08)',
              fontSize: 12,
              padding: '6px 10px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-medium tabular-nums text-foreground">{centerValue}</span>
        <span className="mt-0.5 text-xs text-foreground-tertiary">{centerLabel}</span>
      </div>
    </div>
  )
}
