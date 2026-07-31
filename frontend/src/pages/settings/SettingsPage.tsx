import { Check, Monitor, Moon, Sun } from "lucide-react";
import { Card, PageHeader } from "../../components/ui";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeMode } from "../../providers/themeContext";
import "../../styles/settings.css";

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  { id: "light", label: "Giao diện sáng", description: "Tương phản rõ trên nền trung tính sáng.", icon: Sun },
  { id: "dark", label: "Giao diện tối", description: "Giảm độ chói trong môi trường thiếu sáng.", icon: Moon },
  { id: "system", label: "Theo hệ thống", description: "Tự động theo cài đặt của thiết bị.", icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="settings-page">
      <PageHeader title="Cài đặt" description="Tùy chọn giao diện được lưu cục bộ trong trình duyệt; Backend chưa có Settings API." />
      <Card className="settings-card settings-card--narrow">
        <div className="settings-card__header"><div><h2>Chế độ màu</h2><p>Thay đổi được áp dụng ngay và không gửi lên máy chủ.</p></div></div>
        <div className="theme-options">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const selected = theme === option.id;
            return (
              <button key={option.id} type="button" className={selected ? "theme-option theme-option--active" : "theme-option"} aria-pressed={selected} onClick={() => setTheme(option.id)}>
                <span className="theme-option__preview"><i /><i /><i /></span>
                <span className="theme-option__copy"><span><Icon size={17} aria-hidden="true" /><strong>{option.label}</strong></span><small>{option.description}</small></span>
                {selected ? <span className="theme-option__check"><Check size={15} aria-hidden="true" /><span className="sr-only">Đang chọn</span></span> : null}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
