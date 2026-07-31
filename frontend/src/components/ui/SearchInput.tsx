import { Search, X } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { IconButton } from "./Button";

export interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  onClear?: () => void;
}

export function SearchInput({
  label = "Tìm kiếm",
  value,
  onClear,
  className = "",
  ...props
}: SearchInputProps) {
  const hasValue = typeof value === "string" && value.length > 0;

  return (
    <label className={`search-input ${className}`}>
      <span className="sr-only">{label}</span>
      <Search size={17} aria-hidden="true" />
      <input type="search" value={value} {...props} />
      {hasValue && onClear ? (
        <IconButton
          icon={X}
          label="Xóa nội dung tìm kiếm"
          size="sm"
          onClick={onClear}
        />
      ) : null}
    </label>
  );
}
