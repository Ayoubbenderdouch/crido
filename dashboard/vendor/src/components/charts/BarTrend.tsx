import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

type Props = {
  data: Array<Record<string, string | number>>
  dataKey: string
  xKey: string
  color?: string
  height?: number
  valueFormatter?: (value: number) => string
}

/** Rounded bar chart for weekly / categorical counts. */
export function BarTrend({
  data, dataKey, xKey, color = '#0F6E56', height = 240, valueFormatter,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="26%">
        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          width={32}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          contentStyle={{
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: 12,
            padding: '8px 10px',
          }}
          formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined}
        />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={46} />
      </BarChart>
    </ResponsiveContainer>
  )
}
