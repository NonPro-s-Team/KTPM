import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  color?: string
  background?: string
  className?: string
}

export function Badge({
  children,
  color = 'var(--color-primary)',
  background = 'var(--color-primary-soft)',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${className}`}
      style={{ color, background }}
    >
      {children}
    </span>
  )
}
