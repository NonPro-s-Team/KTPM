import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { DropdownMenu } from "./DropdownMenu";
import { Tooltip } from "./Tooltip";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const ActiveIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <Tooltip content="Đổi giao diện">
      <span>
        <DropdownMenu
          label="Chọn giao diện"
          trigger={
            <span className="theme-toggle__trigger">
              <ActiveIcon size={18} aria-hidden="true" />
            </span>
          }
          items={[
            {
              label: "Sáng",
              icon: Sun,
              checked: theme === "light",
              onSelect: () => setTheme("light"),
            },
            {
              label: "Tối",
              icon: Moon,
              checked: theme === "dark",
              onSelect: () => setTheme("dark"),
            },
            {
              label: "Theo hệ thống",
              icon: Monitor,
              checked: theme === "system",
              onSelect: () => setTheme("system"),
            },
          ]}
        />
      </span>
    </Tooltip>
  );
}
