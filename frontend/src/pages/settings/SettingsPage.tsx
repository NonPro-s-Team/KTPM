import {
  Bell,
  Check,
  LayoutPanelLeft,
  Monitor,
  Moon,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
} from "lucide-react";
import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  PageHeader,
  Switch,
  Tabs,
} from "../../components/ui";
import { useTheme } from "../../hooks/useTheme";
import type { ThemeMode } from "../../providers/themeContext";
import "../../styles/settings.css";

const themeOptions: Array<{
  id: ThemeMode;
  label: string;
  description: string;
  icon: typeof Sun;
}> = [
  {
    id: "light",
    label: "Giao diện sáng",
    description: "Tương phản rõ trên nền trung tính sáng.",
    icon: Sun,
  },
  {
    id: "dark",
    label: "Giao diện tối",
    description: "Giảm độ chói, phân lớp bằng surface và border.",
    icon: Moon,
  },
  {
    id: "system",
    label: "Theo hệ thống",
    description: "Tự động theo cài đặt của thiết bị.",
    icon: Monitor,
  },
];

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");
  const [compact, setCompact] = useState(false);
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const [invoiceNotifications, setInvoiceNotifications] = useState(true);
  const [maintenanceNotifications, setMaintenanceNotifications] =
    useState(true);
  const [contractNotifications, setContractNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="settings-page">
      <PageHeader
        title="Cài đặt"
        description="Tùy chỉnh giao diện, thông báo và lựa chọn bảo mật cho không gian làm việc."
        actions={<Button onClick={() => setSaved(true)}>Lưu thay đổi</Button>}
      />
      {saved ? (
        <Alert title="Đã lưu tùy chọn" tone="success">
          Các lựa chọn giao diện đã được lưu trong trình duyệt này.
        </Alert>
      ) : null}
      <Tabs
        label="Nhóm cài đặt"
        activeId={activeTab}
        onChange={(id) => {
          setActiveTab(id);
          setSaved(false);
        }}
        items={[
          {
            id: "appearance",
            label: "Giao diện",
            icon: SlidersHorizontal,
          },
          { id: "notifications", label: "Thông báo", icon: Bell },
          { id: "security", label: "Bảo mật", icon: ShieldCheck },
        ]}
      />

      {activeTab === "appearance" ? (
        <div className="settings-layout">
          <Card className="settings-card">
            <div className="settings-card__header">
              <div>
                <h2>Chế độ màu</h2>
                <p>
                  Giao diện được áp dụng ngay và lưu vào trình duyệt hiện tại.
                </p>
              </div>
            </div>
            <div className="theme-options">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const selected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={
                      selected
                        ? "theme-option theme-option--active"
                        : "theme-option"
                    }
                    aria-pressed={selected}
                    onClick={() => {
                      setTheme(option.id);
                      setSaved(false);
                    }}
                  >
                    <span className="theme-option__preview">
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className="theme-option__copy">
                      <span>
                        <Icon size={17} aria-hidden="true" />
                        <strong>{option.label}</strong>
                      </span>
                      <small>{option.description}</small>
                    </span>
                    {selected ? (
                      <span className="theme-option__check">
                        <Check size={15} aria-hidden="true" />
                        <span className="sr-only">Đang chọn</span>
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="settings-card">
            <div className="settings-card__header">
              <div>
                <h2>Mật độ hiển thị</h2>
                <p>Điều chỉnh cách bố trí phù hợp với thói quen làm việc.</p>
              </div>
            </div>
            <div className="settings-list">
              <Switch
                label="Bảng dữ liệu thu gọn"
                description="Giảm nhẹ khoảng cách hàng để hiển thị thêm dữ liệu."
                checked={compact}
                onChange={(event) => {
                  setCompact(event.target.checked);
                  setSaved(false);
                }}
              />
              <Switch
                label="Mặc định thu gọn thanh bên"
                description="Mở ứng dụng với sidebar dạng icon ở màn hình lớn."
                checked={collapsedSidebar}
                onChange={(event) => {
                  setCollapsedSidebar(event.target.checked);
                  setSaved(false);
                }}
              />
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "notifications" ? (
        <Card className="settings-card settings-card--narrow">
          <div className="settings-card__header">
            <div>
              <h2>Thông báo nghiệp vụ</h2>
              <p>Chọn các thay đổi cần hiển thị trong trung tâm thông báo.</p>
            </div>
          </div>
          <div className="settings-list">
            <Switch
              label="Hóa đơn và công nợ"
              description="Thông báo hóa đơn mới, sắp đến hạn và đã quá hạn."
              checked={invoiceNotifications}
              onChange={(event) => {
                setInvoiceNotifications(event.target.checked);
                setSaved(false);
              }}
            />
            <Switch
              label="Yêu cầu sửa chữa"
              description="Thông báo yêu cầu mới, thay đổi ưu tiên và hoàn tất."
              checked={maintenanceNotifications}
              onChange={(event) => {
                setMaintenanceNotifications(event.target.checked);
                setSaved(false);
              }}
            />
            <Switch
              label="Hợp đồng sắp hết hạn"
              description="Nhắc trước 30 ngày để chuẩn bị gia hạn."
              checked={contractNotifications}
              onChange={(event) => {
                setContractNotifications(event.target.checked);
                setSaved(false);
              }}
            />
          </div>
        </Card>
      ) : null}

      {activeTab === "security" ? (
        <div className="settings-layout settings-layout--single">
          <Alert title="Bảo mật theo vai trò" tone="info">
            Quyền truy cập được xác định từ vai trò Chủ nhà, Quản lý, Kế toán
            hoặc Quản trị viên.
          </Alert>
          <Card className="settings-card settings-card--narrow">
            <div className="settings-security">
              <span>
                <ShieldCheck size={21} aria-hidden="true" />
              </span>
              <div>
                <h2>Quản lý quyền truy cập</h2>
                <p>
                  Xem tài khoản, vai trò và khóa quyền truy cập khi cần thiết.
                </p>
              </div>
              <a href="/users" className="button button--secondary button--md">
                <LayoutPanelLeft size={16} aria-hidden="true" />
                <span>Mở phân quyền</span>
              </a>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
