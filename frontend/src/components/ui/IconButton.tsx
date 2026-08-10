import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  active?: boolean
}

export function IconButton({
  icon,
  label,
  active = false,
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-control border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active
          ? 'border-transparent bg-primary-soft text-primary'
          : 'border-border bg-surface text-text-secondary hover:bg-bg'
      } ${className}`}
      {...rest}
    >
      {icon}
    </button>
  )
}
