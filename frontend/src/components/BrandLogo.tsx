import troConnectIcon from "../assets/brand/troconnect-icon.png";
import troConnectWordmark from "../assets/brand/troconnect-wordmark.png";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  const variant = compact ? "icon" : "wordmark";

  return (
    <span
      className={`brand-logo brand-logo--${variant} ${className}`.trim()}
      aria-hidden="true"
    >
      <img
        src={compact ? troConnectIcon : troConnectWordmark}
        alt=""
        draggable="false"
      />
    </span>
  );
}
