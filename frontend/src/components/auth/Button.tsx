import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  isLoading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  // Hover đảo màu tức thì — nền fg/chữ bg thành nền bg/chữ fg
  primary:
    'border border-fg bg-fg text-bg hover:bg-bg hover:text-fg',
  secondary:
    'border border-border-strong bg-bg text-fg hover:bg-fg hover:text-bg',
  ghost: 'border border-transparent text-muted hover:text-fg',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold tracking-wider uppercase transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
