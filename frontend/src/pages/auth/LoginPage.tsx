import {
  BarChart3,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Checkbox,
  IconButton,
  Input,
  ThemeToggle,
} from "../../components/ui";
import "../../styles/auth.css";

interface LoginErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string) {
  if (!email.trim()) return "Hãy nhập email công việc.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Email chưa đúng định dạng. Ví dụ: ten@donvi.vn";
  }
  return undefined;
}

function validatePassword(password: string) {
  if (!password) return "Hãy nhập mật khẩu.";
  if (password.length < 6) return "Mật khẩu cần có ít nhất 6 ký tự.";
  return undefined;
}

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;

    setLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    navigate("/dashboard");
  };

  return (
    <main className="login-page">
      <section className="login-panel" aria-labelledby="login-title">
        <header className="login-panel__header">
          <a className="brand" href="/login" aria-label="RMS - Đăng nhập">
            <span className="brand__mark" aria-hidden="true">
              R
            </span>
            <span className="brand__copy">
              <strong>RMS</strong>
              <small>Quản lý phòng trọ</small>
            </span>
          </a>
          <ThemeToggle />
        </header>

        <div className="login-panel__body">
          <div className="login-intro">
            <p className="login-eyebrow">Cổng vận hành</p>
            <h1 id="login-title">Chào mừng bạn trở lại</h1>
            <p>
              Đăng nhập để theo dõi phòng, hợp đồng, hóa đơn và công việc cần xử
              lý trong hôm nay.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <Input
              id="login-email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="ten@donvi.vn"
              value={email}
              error={errors.email}
              required
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((current) => ({
                    ...current,
                    email: undefined,
                  }));
                }
              }}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  email: validateEmail(email),
                }))
              }
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
              suffix={
                <IconButton
                  icon={showPassword ? EyeOff : Eye}
                  label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  size="sm"
                  onClick={() => setShowPassword((current) => !current)}
                />
              }
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((current) => ({
                    ...current,
                    password: undefined,
                  }));
                }
              }}
              onBlur={() =>
                setErrors((current) => ({
                  ...current,
                  password: validatePassword(password),
                }))
              }
            />
            <div className="login-form__options">
              <Checkbox
                label="Ghi nhớ đăng nhập"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <button
                className="login-form__link"
                type="button"
                onClick={() => setErrors({})}
              >
                Quên mật khẩu?
              </button>
            </div>
            <Button type="submit" loading={loading}>
              Đăng nhập
            </Button>
          </form>

          <p className="login-note">
            <ShieldCheck size={15} aria-hidden="true" />
            Phiên truy cập được bảo vệ. Đây là bản giao diện dùng dữ liệu mô
            phỏng.
          </p>
        </div>

        <footer className="login-panel__footer">
          © 2026 RMS
          <span aria-hidden="true">·</span>
          Hệ thống quản lý phòng trọ
        </footer>
      </section>

      <aside className="login-context" aria-label="Thông tin hệ thống">
        <div className="login-context__content">
          <div>
            <p className="login-eyebrow">Một không gian làm việc</p>
            <h2>Nắm toàn bộ vận hành trong một nhịp nhìn.</h2>
            <p>
              Dữ liệu được tổ chức theo công việc cần làm, giúp đội ngũ xử lý
              nhanh mà không bỏ sót công nợ hay yêu cầu khẩn cấp.
            </p>
          </div>
          <div className="login-context__preview" aria-hidden="true">
            <div className="login-preview__top">
              <span />
              <span />
            </div>
            <div className="login-preview__stats">
              <div>
                <Building2 size={17} />
                <span />
                <strong />
              </div>
              <div>
                <BarChart3 size={17} />
                <span />
                <strong />
              </div>
            </div>
            <div className="login-preview__rows">
              <span />
              <span />
              <span />
            </div>
          </div>
          <ul className="login-context__list">
            <li>
              <CheckCircle2 size={17} aria-hidden="true" />
              Tổng quan vận hành theo thời gian thực
            </li>
            <li>
              <CheckCircle2 size={17} aria-hidden="true" />
              Theo dõi công nợ và hợp đồng tập trung
            </li>
            <li>
              <KeyRound size={17} aria-hidden="true" />
              Phân quyền theo vai trò nghiệp vụ
            </li>
          </ul>
        </div>
      </aside>
    </main>
  );
}
