import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

type AlertTone = "success" | "info" | "warning" | "danger";

const alertIcons: Record<AlertTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  danger: AlertCircle,
};

export interface AlertProps {
  title: string;
  children: ReactNode;
  tone?: AlertTone;
}

export function Alert({ title, children, tone = "info" }: AlertProps) {
  const Icon = alertIcons[tone];

  return (
    <div
      className={`alert alert--${tone}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: Pick<
    ButtonProps,
    "children" | "onClick" | "leadingIcon" | "variant"
  >;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <Button {...action} /> : null}
    </div>
  );
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
}

export function Skeleton({
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
}
