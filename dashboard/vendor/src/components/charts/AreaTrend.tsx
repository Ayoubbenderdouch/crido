import { useId } from 'react'
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'

type Props = {
  data: Array<Record<string, string | number>>
  dataKey: string
  xKey: string
  color?: string
  height?: number
  yWidth?: number
  xTickFormatter?: (value: string) => string
  yTickFormatter?: (value: number) => string
  valueFormatter?: (value: number) => string
  labelFormatter?: (label: string) => string
}

/** Smooth area chart with a soft vertical fade. */
export function AreaTrend({
  data,
  dataKey,
  xKey,
  color = '#0F6E56',
  height = 240,
  yWidth = 38,
  xTickFormatter,
  yTickFormatter,
  valueFormatter,
  labelFormatter,
}: Props) {
  const gid = `area-${useId().replace(/:/g, '')}`

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="88%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey={xKey}
          tickFormatter={xTickFormatter}
          interval="preserveStartEnd"
          minTickGap={36}
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={yTickFormatter}
          width={yWidth}
          tick={{ fontSize: 11, fill: '#888780' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(0,0,0,0.14)', strokeWidth: 1 }}
          contentStyle={{
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,0.08)',
            fontSize: 12,
            padding: '8px 10px',
          }}
          labelFormatter={labelFormatter ? (l) => labelFormatter(String(l)) : undefined}
          formatter={valueFormatter ? (v) => valueFormatter(Number(v)) : undefined}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.25}
          fill={`url(#${gid})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
