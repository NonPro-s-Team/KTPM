import type { ReactNode } from "react";

export type BadgeTone = "success" | "info" | "warning" | "danger" | "neutral";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  withDot?: boolean;
}

export function Badge({
  children,
  tone = "neutral",
  withDot = true,
}: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {withDot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
