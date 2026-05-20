import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  align?: 'start' | 'end' | 'center'
}

type Props<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}

const ALIGN = { start: 'text-start', end: 'text-end', center: 'text-center' }

export function DataTable<T>({ columns, rows, rowKey, onRowClick }: Props<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-background-secondary">
            {columns.map((c) => (
              <th
                key={c.key}
                className={cn(
                  'px-4 py-3 text-xs font-medium text-foreground-secondary',
                  ALIGN[c.align ?? 'start'],
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'border-b border-border transition-colors last:border-0',
                onRowClick && 'cursor-pointer hover:bg-background-secondary',
              )}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    'px-4 py-3.5 align-middle text-foreground',
                    ALIGN[c.align ?? 'start'],
                  )}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
