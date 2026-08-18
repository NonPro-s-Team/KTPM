import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-card border border-border bg-surface p-[22px] shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
