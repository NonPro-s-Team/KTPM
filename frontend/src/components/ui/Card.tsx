import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "article" | "div";
}

export function Card({
  children,
  as: Component = "section",
  className = "",
  ...props
}: CardProps) {
  return (
    <Component className={`card ${className}`} {...props}>
      {children}
    </Component>
  );
}

export interface StatCardProps {
  label: string;
  value: string;
  meta: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
}

export function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone = "neutral",
}: StatCardProps) {
  return (
    <Card className="stat-card">
      <div className="stat-card__header">
        <p>{label}</p>
        <span className={`stat-card__icon stat-card__icon--${tone}`}>
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <strong className="stat-card__value tabular">{value}</strong>
      <p className={`stat-card__meta stat-card__meta--${tone}`}>{meta}</p>
    </Card>
  );
}
