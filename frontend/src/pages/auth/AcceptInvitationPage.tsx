import { Eye, EyeOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { invitationsApi } from "../../api/invitationsApi";
import { normalizeApiError } from "../../api/httpClient";
import { BrandLogo } from "../../components/BrandLogo";
import { Alert, Button, IconButton, Input, ThemeToggle } from "../../components/ui";
import type { InvitationPreviewResponse } from "../../types/api";
import { userRoleMap } from "../../utils/status";
import "../../styles/auth.css";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_INVITATION_TOKEN: "Lời mời không hợp lệ hoặc đã được sử dụng.",
  INVITATION_EXPIRED: "Lời mời này đã hết hạn. Hãy liên hệ quản trị viên để được mời lại.",
};

export function AcceptInvitationPage() {
  const { token = "" } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<InvitationPreviewResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingPreview(true);
    invitationsApi
      .getByToken(token)
      .then((result) => { if (!cancelled) setPreview(result); })
      .catch((requestError) => {
        if (cancelled) return;
        const apiError = normalizeApiError(requestError);
        setLoadError(ERROR_MESSAGES[apiError.code ?? ""] ?? apiError.detail);
      })
      .finally(() => { if (!cancelled) setLoadingPreview(false); });
    return () => { cancelled = true; };
  }, [token]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    if (!username.trim()) {
      setError("Hãy nhập tên đăng nhập.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu chưa khớp.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await invitationsApi.accept({ token, username: username.trim(), password });
      setSuccess(true);
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setError(ERROR_MESSAGES[apiError.code ?? ""] ?? apiError.detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-standalone-page">
      <section className="auth-standalone-card" aria-labelledby="accept-invitation-title">
        <header className="login-panel__header">
          <a className="brand" href="/login" aria-label="TroConnect"><BrandLogo /></a>
          <ThemeToggle />
        </header>
        <div className="login-intro">
          <p className="login-eyebrow">Lời mời tạo tài khoản</p>
          <h1 id="accept-invitation-title">Tạo tài khoản TroConnect</h1>
        </div>

        {loadingPreview ? (
          <p>Đang kiểm tra lời mời...</p>
        ) : loadError ? (
          <Alert title="Không thể sử dụng lời mời này" tone="danger">{loadError}</Alert>
        ) : success ? (
          <>
            <Alert title="Tạo tài khoản thành công" tone="success">
              Tài khoản của bạn đã được tạo. Hãy đăng nhập để bắt đầu sử dụng.
            </Alert>
            <Button onClick={() => navigate("/login", { replace: true })}>Đến trang đăng nhập</Button>
          </>
        ) : preview ? (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <p>
              Bạn được mời tạo tài khoản <strong>{userRoleMap[preview.role].label}</strong> cho email <strong>{preview.email}</strong>.
            </p>
            {error ? <Alert title="Không thể tạo tài khoản" tone="danger">{error}</Alert> : null}
            <Input
              id="accept-invitation-username"
              label="Tên đăng nhập"
              autoComplete="username"
              value={username}
              required
              onChange={(event) => { setUsername(event.target.value); setError(""); }}
            />
            <Input
              id="accept-invitation-password"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              required
              suffix={<IconButton icon={showPassword ? EyeOff : Eye} label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} size="sm" onClick={() => setShowPassword((current) => !current)} />}
              onChange={(event) => { setPassword(event.target.value); setError(""); }}
            />
            <Input
              id="accept-invitation-confirm"
              label="Xác nhận mật khẩu"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              required
              onChange={(event) => { setConfirmPassword(event.target.value); setError(""); }}
            />
            <Button type="submit" loading={submitting}>Tạo tài khoản</Button>
          </form>
        ) : null}

        {!success ? (
          <Link className="login-form__link" to="/login">Quay lại đăng nhập</Link>
        ) : null}
      </section>
    </main>
  );
}
