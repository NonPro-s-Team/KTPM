import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center gap-1.5 rounded-control px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2'
  const variants = {
    primary:
      'bg-primary text-white hover:bg-(--color-primary-hover)',
    outline:
      'border border-border bg-surface text-text-primary hover:bg-bg',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}
