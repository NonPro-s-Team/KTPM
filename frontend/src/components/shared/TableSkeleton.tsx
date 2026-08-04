interface TableSkeletonProps {
  rows?: number
  columns?: number
}

// Khung loading cho DataTable — cùng breakpoint responsive (table >=768px, card <768px)
export function TableSkeleton({ rows = 4, columns = 4 }: TableSkeletonProps) {
  return (
    <div aria-hidden>
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-3 py-4">
                  <div className="h-4 w-full max-w-32 animate-pulse bg-border" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 border border-border p-4">
            <div className="h-4 w-2/3 animate-pulse bg-border" />
            <div className="h-3 w-1/2 animate-pulse bg-border" />
            <div className="h-3 w-1/3 animate-pulse bg-border" />
          </div>
        ))}
      </div>
    </div>
  )
}
