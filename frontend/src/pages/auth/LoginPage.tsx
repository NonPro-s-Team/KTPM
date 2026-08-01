import { BarChart3, Building2, CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { normalizeApiError } from "../../api/httpClient";
import { BrandLogo } from "../../components/BrandLogo";
import { Alert, Button, Checkbox, IconButton, Input, ThemeToggle } from "../../components/ui";
import { defaultRouteForRole } from "../../routes/LoginRoute";
import { useAuthStore } from "../../store/authStore";
import "../../styles/auth.css";

interface LoginErrors {
  username?: string;
  password?: string;
}

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && value !== "/login"
    ? value
    : null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [requestError, setRequestError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors: LoginErrors = {
      username: username.trim() ? undefined : "Hãy nhập tên đăng nhập.",
      password: password ? undefined : "Hãy nhập mật khẩu.",
    };
    setErrors(nextErrors);
    setRequestError("");
    if (nextErrors.username || nextErrors.password) return;

    setLoading(true);
    try {
      const session = await login(username.trim(), password, remember);
      const returnTo = safeReturnTo(
        (location.state as { returnTo?: unknown } | null)?.returnTo,
      );
      navigate(returnTo ?? defaultRouteForRole(session.role), { replace: true });
    } catch (error) {
      const apiError = normalizeApiError(error);
      setRequestError(
        apiError.code === "ACCOUNT_LOCKED"
          ? "Tài khoản đã bị khóa do nhập sai quá nhiều lần. Hãy liên hệ admin để mở khóa."
          : apiError.status === 401
            ? "Tên đăng nhập hoặc mật khẩu không chính xác."
            : apiError.detail,
      );
      setErrors({
        username: apiError.fieldErrors?.username?.[0],
        password: apiError.fieldErrors?.password?.[0],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <header className="login-panel__header">
          <a className="brand" href="/login" aria-label="TroConnect - Đăng nhập"><BrandLogo /></a>
          <ThemeToggle />
        </header>
        <div className="login-panel__body">
          <div className="login-intro">
            <p className="login-eyebrow">Cổng vận hành</p>
            <h1 id="login-title">Chào mừng bạn trở lại</h1>
            <p>Đăng nhập để truy cập thông tin phòng, hợp đồng, hóa đơn và yêu cầu sửa chữa theo quyền của bạn.</p>
          </div>
          {requestError ? <Alert title="Đăng nhập không thành công" tone="danger">{requestError}</Alert> : null}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Input
              id="login-username"
              label="Tên đăng nhập"
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              value={username}
              error={errors.username}
              required
              onChange={(event) => { setUsername(event.target.value); setErrors((current) => ({ ...current, username: undefined })); }}
            />
            <Input
              id="login-password"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={password}
              error={errors.password}
              required
              suffix={<IconButton icon={showPassword ? EyeOff : Eye} label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} size="sm" onClick={() => setShowPassword((current) => !current)} />}
              onChange={(event) => { setPassword(event.target.value); setErrors((current) => ({ ...current, password: undefined })); }}
            />
            <div className="login-form__options">
              <Checkbox label="Ghi nhớ đăng nhập" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <Link className="login-form__link" to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            <Button type="submit" loading={loading}>Đăng nhập</Button>
          </form>
          <p className="login-note"><ShieldCheck size={15} aria-hidden="true" />Phiên truy cập được bảo vệ bằng JWT và tự kết thúc khi token hết hạn.</p>
        </div>
        <footer className="login-panel__footer">© 2026 TroConnect<span aria-hidden="true">·</span>Hệ thống quản lý phòng trọ</footer>
      </section>
      <aside className="login-context" aria-label="Thông tin hệ thống">
        <div className="login-context__content">
          <div><p className="login-eyebrow">Một không gian làm việc</p><h2>Nắm toàn bộ vận hành trong một nhịp nhìn.</h2><p>Dữ liệu được tải trực tiếp từ hệ thống và giới hạn theo vai trò của tài khoản đang đăng nhập.</p></div>
          <div className="login-context__preview" aria-hidden="true"><div className="login-preview__top"><span /><span /></div><div className="login-preview__stats"><div><Building2 size={17} /><span /><strong /></div><div><BarChart3 size={17} /><span /><strong /></div></div><div className="login-preview__rows"><span /><span /><span /></div></div>
          <ul className="login-context__list">
            <li><CheckCircle2 size={17} aria-hidden="true" />Tổng quan vận hành theo dữ liệu hiện tại</li>
            <li><CheckCircle2 size={17} aria-hidden="true" />Theo dõi công nợ và hợp đồng tập trung</li>
            <li><KeyRound size={17} aria-hidden="true" />Phân quyền theo vai trò nghiệp vụ</li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
