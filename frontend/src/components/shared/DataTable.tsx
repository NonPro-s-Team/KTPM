import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  header: string
  render: (row: T) => ReactNode
  /** Ẩn cột này ở dạng card mobile (vd: cột đã lặp lại ý nghĩa với tiêu đề card) */
  hideOnCard?: boolean
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyField: (row: T) => string
  actions?: (row: T) => ReactNode
  /** Dùng làm tiêu đề card ở layout mobile */
  cardTitle: (row: T) => ReactNode
}

// >=768px: table thường. <768px: chuyển sang danh sách card key/value (UX guideline "Table Handling")
export function DataTable<T>({
  columns,
  data,
  keyField,
  actions,
  cardTitle,
}: DataTableProps<T>) {
  return (
    <div>
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.header}
                className="px-3 py-3 text-xs font-semibold tracking-widest text-muted uppercase"
              >
                {col.header}
              </th>
            ))}
            {actions && (
              <th className="px-3 py-3 text-xs font-semibold tracking-widest text-muted uppercase">
                Hành động
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={keyField(row)} className="border-b border-border">
              {columns.map((col) => (
                <td key={col.header} className="px-3 py-3">
                  {col.render(row)}
                </td>
              ))}
              {actions && (
                <td className="px-3 py-3">
                  <div className="flex items-center gap-4">{actions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row) => (
          <div key={keyField(row)} className="border border-border p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="font-semibold">{cardTitle(row)}</div>
              {actions && (
                <div className="flex items-center gap-4">{actions(row)}</div>
              )}
            </div>
            <dl className="flex flex-col gap-1.5">
              {columns
                .filter((col) => !col.hideOnCard)
                .map((col) => (
                  <div key={col.header} className="flex justify-between gap-3 text-sm">
                    <dt className="text-muted">{col.header}</dt>
                    <dd>{col.render(row)}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
