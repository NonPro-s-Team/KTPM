import { type ReactNode } from 'react'
import { Check, CircleAlert, Info, type LucideIcon } from 'lucide-react'

type Variant = 'success' | 'error' | 'info'

interface AlertProps {
  variant: Variant
  children: ReactNode
}

// Phân biệt trạng thái bằng độ đậm viền + tiêu đề in hoa — không dùng màu semantic
const config: Record<
  Variant,
  { title: string; Icon: LucideIcon; box: string }
> = {
  success: { title: 'Thành công', Icon: Check, box: 'border border-border-strong' },
  error: { title: 'Lỗi', Icon: CircleAlert, box: 'border-2 border-border-strong' },
  info: { title: 'Thông báo', Icon: Info, box: 'border border-border' },
}

export function Alert({ variant, children }: AlertProps) {
  const { title, Icon, box } = config[variant]

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`flex gap-3 px-4 py-3 ${box}`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-bold tracking-widest uppercase">
          {title}
        </span>
        <p className="text-sm text-muted">{children}</p>
      </div>
    </div>
  )
}
