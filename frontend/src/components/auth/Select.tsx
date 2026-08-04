import { useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  label: string
  value: string
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  error?: string
  hint?: string
  /** Dòng trống đầu danh sách, dùng cho field optional (value = '') */
  placeholder?: string
}

// Cùng ngôn ngữ hiển thị với Input: label uppercase, viền border-strong khi focus/lỗi
export function Select({
  label,
  options,
  error,
  hint,
  placeholder,
  id,
  className = '',
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  const messageId = `${selectId}-message`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className="cursor-pointer text-xs font-semibold tracking-widest uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`w-full cursor-pointer appearance-none border bg-bg px-3 py-2.5 pr-10 text-sm text-fg transition-colors duration-150 focus:border-border-strong ${
            error ? 'border-border-strong' : 'border-border'
          } ${className}`}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden
        />
      </div>
      {error ? (
        <p id={messageId} role="alert" className="text-xs font-medium text-fg">
          — {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
