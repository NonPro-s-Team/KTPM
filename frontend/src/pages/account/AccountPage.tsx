import { KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { authApi } from "../../api/authApi";
import { normalizeApiError } from "../../api/httpClient";
import { Alert, Badge, Button, Card, Input, PageHeader } from "../../components/ui";
import { useAuthStore } from "../../store/authStore";
import { userRoleMap } from "../../utils/status";
import "../../styles/management.css";
import "../../styles/settings.css";

export function AccountPage() {
  const username = useAuthStore((state) => state.username) ?? "";
  const role = useAuthStore((state) => state.role) ?? "tenant";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!currentPassword || !newPassword) {
      setError("Hãy nhập mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu mới chưa khớp.");
      return;
    }
    setSubmitting(true);
    setError("");
    setMessage("");
    setFieldErrors({});
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Mật khẩu đã được thay đổi.");
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setError(apiError.detail);
      setFieldErrors(apiError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  const roleDefinition = userRoleMap[role];
  return (
    <div className="management-page">
      <PageHeader title="Tài khoản" description="Thông tin tài khoản hiện tại từ phiên đăng nhập và chức năng đổi mật khẩu." />
      {message ? <Alert title="Cập nhật thành công" tone="success">{message}</Alert> : null}
      <div className="settings-layout">
        <Card className="settings-card">
          <div className="settings-card__header"><div><h2>Thông tin đăng nhập</h2><p>Backend hiện chưa có API danh sách, mời, khóa hoặc sửa vai trò người dùng.</p></div></div>
          <div className="settings-list">
            <div className="settings-security"><span><UserRound size={21} aria-hidden="true" /></span><div><h2>{username}</h2><p>Tên đăng nhập hiện tại</p></div></div>
            <div className="settings-security"><span><ShieldCheck size={21} aria-hidden="true" /></span><div><h2><Badge tone={roleDefinition.tone}>{roleDefinition.label}</Badge></h2><p>Vai trò do Backend trả về khi đăng nhập</p></div></div>
          </div>
        </Card>
        <Card className="settings-card">
          <div className="settings-card__header"><div><h2>Đổi mật khẩu</h2><p>Mật khẩu mới được gửi trực tiếp tới endpoint bảo mật của RMS.</p></div></div>
          <form className="management-form" onSubmit={handleSubmit} noValidate>
            {error ? <Alert title="Không thể đổi mật khẩu" tone="danger">{error}</Alert> : null}
            <Input label="Mật khẩu hiện tại" type="password" autoComplete="current-password" value={currentPassword} error={fieldErrors.currentPassword?.[0]} required onChange={(event) => setCurrentPassword(event.target.value)} />
            <Input label="Mật khẩu mới" type="password" autoComplete="new-password" value={newPassword} error={fieldErrors.newPassword?.[0]} required onChange={(event) => setNewPassword(event.target.value)} />
            <Input label="Xác nhận mật khẩu mới" type="password" autoComplete="new-password" value={confirmPassword} required onChange={(event) => setConfirmPassword(event.target.value)} />
            <Button type="submit" leadingIcon={KeyRound} loading={submitting}>Đổi mật khẩu</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
