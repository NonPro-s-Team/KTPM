import { useId, type ReactElement } from "react";

export interface TooltipProps {
  content: string;
  children: ReactElement;
}

export function Tooltip({ content, children }: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className="tooltip" aria-describedby={tooltipId}>
      {children}
      <span id={tooltipId} role="tooltip" className="tooltip__content">
        {content}
      </span>
    </span>
  );
}
