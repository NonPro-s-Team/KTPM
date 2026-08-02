import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { invitationsApi } from "../../api/invitationsApi";
import { normalizeApiError } from "../../api/httpClient";
import { Alert, Button, Card, Input, PageHeader, Select } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import "../../styles/settings.css";

const invitationRoleOptions = [
  { value: "staff", label: "Nhân viên" },
  { value: "admin", label: "Quản trị viên" },
];

function InviteUserCard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!email.trim()) {
      setError("Hãy nhập email của người được mời.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      await invitationsApi.create({ email: email.trim(), role });
      setEmail("");
      setMessage(`Đã gửi lời mời tới ${email.trim()}.`);
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setError(
        apiError.code === "EMAIL_ALREADY_EXISTS"
          ? "Email này đã được sử dụng bởi một tài khoản khác."
          : apiError.detail,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="settings-card settings-card--narrow">
      <div className="settings-card__header">
        <div>
          <h2>Mời tài khoản mới</h2>
          {/* <p>Gửi lời mời qua email để tạo tài khoản Nhân viên hoặc Quản trị viên.</p> */}
        </div>
      </div>
      <form className="management-form" onSubmit={handleSubmit} noValidate>
        {message ? <Alert title="Đã gửi lời mời" tone="success">{message}</Alert> : null}
        {error ? <Alert title="Không thể gửi lời mời" tone="danger">{error}</Alert> : null}
        <Input
          label="Email"
          type="email"
          placeholder="nhanvien@vidu.com"
          value={email}
          required
          onChange={(event) => { setEmail(event.target.value); setError(""); }}
        />
        <Select
          label="Vai trò"
          options={invitationRoleOptions}
          value={role}
          onChange={(event) => setRole(event.target.value as "staff" | "admin")}
        />
        <Button type="submit" leadingIcon={UserPlus} loading={submitting}>Gửi lời mời</Button>
      </form>
    </Card>
  );
}

export function SettingsPage() {
  // const { theme, setTheme } = useTheme();
  const role = useAuthStore((state) => state.role);
  return (
    <div className="settings-page">
      <PageHeader title="Cài đặt"/>
      {/* <Card className="settings-card settings-card--narrow">
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
      </Card> */}
      {role === "admin" ? <InviteUserCard /> : null}
    </div>
  );
}
