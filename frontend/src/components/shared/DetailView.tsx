import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export interface DetailField {
  label: string
  value: ReactNode
  /** Cho field dài (địa chỉ, quê quán...) chiếm trọn hàng thay vì 1 cột */
  fullWidth?: boolean
}

interface DetailViewProps {
  backTo: string
  backLabel: string
  title: string
  subtitle?: ReactNode
  /** Nút Sửa/Xoá... đặt góc trên phải */
  actions?: ReactNode
  fields: DetailField[]
  /** Khối phụ dưới danh sách field (vd: link sang danh sách con) */
  children?: ReactNode
}

// Khung chung cho mọi trang chi tiết (Nhà trọ / Phòng / Người thuê) để 3 module hiển thị
// đồng nhất. Field xếp 1 cột ở mobile, 2 cột từ 640px, 3 cột từ 1024px.
export function DetailView({
  backTo,
  backLabel,
  title,
  subtitle,
  actions,
  fields,
  children,
}: DetailViewProps) {
  return (
    <>
      <Link
        to={backTo}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {backLabel}
      </Link>

      <div className="border border-border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field) => (
            <div
              key={field.label}
              className={`flex flex-col gap-1 ${field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}`}
            >
              <dt className="text-xs font-semibold tracking-widest text-muted uppercase">
                {field.label}
              </dt>
              <dd className="text-sm break-words">{field.value}</dd>
            </div>
          ))}
        </dl>

        {children && <div className="mt-6 border-t border-border pt-6">{children}</div>}
      </div>
    </>
  )
}
