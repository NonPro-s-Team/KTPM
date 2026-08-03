import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  /** Nút/icon gắn mép phải bên trong input (vd: toggle hiện mật khẩu) */
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, trailing, id, className = '', ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={inputId}
        className="cursor-pointer text-xs font-semibold tracking-widest uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={`w-full border bg-bg px-3 py-2.5 text-sm text-fg transition-colors duration-150 placeholder:text-muted focus:border-border-strong ${
            error ? 'border-border-strong' : 'border-border'
          } ${trailing ? 'pr-11' : ''} ${className}`}
          {...rest}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-stretch">
            {trailing}
          </div>
        )}
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
})
