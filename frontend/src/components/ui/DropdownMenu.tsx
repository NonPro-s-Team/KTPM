import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, type LucideIcon } from "lucide-react";

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  checked?: boolean;
  separatorBefore?: boolean;
}

export interface DropdownMenuProps {
  trigger: ReactNode;
  label: string;
  items: DropdownMenuItem[];
  align?: "start" | "end";
  triggerClassName?: string;
}

export function DropdownMenu({
  trigger,
  label,
  items,
  align = "end",
  triggerClassName = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        rootRef.current
          ?.querySelector<HTMLButtonElement>(".dropdown__trigger")
          ?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    const activeIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      activeIndex < 0
        ? direction > 0
          ? 0
          : items.length - 1
        : (activeIndex + direction + items.length) % items.length;
    itemRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        type="button"
        className={`dropdown__trigger ${triggerClassName}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        {trigger}
      </button>
      {open ? (
        <div
          id={menuId}
          className={`dropdown__menu dropdown__menu--${align}`}
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.label}>
                {item.separatorBefore ? (
                  <div className="dropdown__separator" role="separator" />
                ) : null}
                <button
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                  role="menuitem"
                  className={`dropdown__item ${
                    item.danger ? "dropdown__item--danger" : ""
                  }`}
                  onClick={() => {
                    item.onSelect();
                    setOpen(false);
                  }}
                >
                  {Icon ? <Icon size={16} aria-hidden="true" /> : null}
                  <span>{item.label}</span>
                  {item.checked ? (
                    <span className="dropdown__check" aria-label="đang chọn">
                      <Check size={15} aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
