import { LoaderCircle, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`button button--${variant} button--${size} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle
          className="button__spinner"
          size={16}
          aria-hidden="true"
        />
      ) : LeadingIcon ? (
        <LeadingIcon size={16} aria-hidden="true" />
      ) : null}
      <span>{children}</span>
      {TrailingIcon && !loading ? (
        <TrailingIcon size={16} aria-hidden="true" />
      ) : null}
      {loading ? <span className="sr-only">Đang xử lý</span> : null}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  icon: LucideIcon;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`icon-button icon-button--${variant} icon-button--${size} ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon size={18} aria-hidden="true" />
    </button>
  );
}
