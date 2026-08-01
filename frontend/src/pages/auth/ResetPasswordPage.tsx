import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { authApi } from "../../api/authApi";
import { normalizeApiError } from "../../api/httpClient";
import { BrandLogo } from "../../components/BrandLogo";
import { Alert, Button, IconButton, Input, ThemeToggle } from "../../components/ui";
import "../../styles/auth.css";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_RESET_TOKEN: "Liên kết đặt lại mật khẩu không hợp lệ. Hãy yêu cầu một liên kết mới.",
  RESET_TOKEN_EXPIRED: "Liên kết đặt lại mật khẩu đã hết hạn. Hãy yêu cầu một liên kết mới.",
};

export function ResetPasswordPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (newPassword.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setError(ERROR_MESSAGES[apiError.code ?? ""] ?? apiError.detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-standalone-page">
      <section className="auth-standalone-card" aria-labelledby="reset-password-title">
        <header className="login-panel__header">
          <a className="brand" href="/login" aria-label="TroConnect"><BrandLogo /></a>
          <ThemeToggle />
        </header>
        <div className="login-intro">
          <p className="login-eyebrow">Khôi phục truy cập</p>
          <h1 id="reset-password-title">Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        {success ? (
          <>
            <Alert title="Đặt lại mật khẩu thành công" tone="success">
              Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập lại bằng mật khẩu mới.
            </Alert>
            <Button onClick={() => navigate("/login", { replace: true })}>Đến trang đăng nhập</Button>
          </>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error ? <Alert title="Không thể đặt lại mật khẩu" tone="danger">{error}</Alert> : null}
            <Input
              id="reset-password-new"
              label="Mật khẩu mới"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              required
              suffix={<IconButton icon={showPassword ? EyeOff : Eye} label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} size="sm" onClick={() => setShowPassword((current) => !current)} />}
              onChange={(event) => { setNewPassword(event.target.value); setError(""); }}
            />
            <Input
              id="reset-password-confirm"
              label="Xác nhận mật khẩu mới"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              required
              onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }}
            />
            <Button type="submit" loading={loading}>Đặt lại mật khẩu</Button>
          </form>
        )}
        {!success ? (
          <Link className="login-form__link login-form__link--with-icon" to="/login">
            <ArrowLeft size={15} aria-hidden="true" />Quay lại đăng nhập
          </Link>
        ) : null}
      </section>
    </main>
  );
}
