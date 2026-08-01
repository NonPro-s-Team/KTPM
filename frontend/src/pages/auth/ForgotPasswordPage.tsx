import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { authApi } from "../../api/authApi";
import { normalizeApiError } from "../../api/httpClient";
import { BrandLogo } from "../../components/BrandLogo";
import { Alert, Button, Input, ThemeToggle } from "../../components/ui";
import "../../styles/auth.css";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    if (!email.trim()) {
      setError("Hãy nhập địa chỉ email.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (requestError) {
      const apiError = normalizeApiError(requestError);
      setError(apiError.detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-standalone-page">
      <section className="auth-standalone-card" aria-labelledby="forgot-password-title">
        <header className="login-panel__header">
          <a className="brand" href="/login" aria-label="TroConnect"><BrandLogo /></a>
          <ThemeToggle />
        </header>
        <div className="login-intro">
          <p className="login-eyebrow">Khôi phục truy cập</p>
          <h1 id="forgot-password-title">Quên mật khẩu?</h1>
          <p>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu email tồn tại trong hệ thống.</p>
        </div>
        {submitted ? (
          <Alert title="Đã gửi yêu cầu" tone="success">
            Nếu email này tồn tại trong hệ thống, một liên kết đặt lại mật khẩu đã được gửi tới hộp thư của bạn. Liên kết có hiệu lực trong 30 phút.
          </Alert>
        ) : (
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error ? <Alert title="Không thể gửi yêu cầu" tone="danger">{error}</Alert> : null}
            <Input
              id="forgot-password-email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="ban@vidu.com"
              value={email}
              required
              onChange={(event) => { setEmail(event.target.value); setError(""); }}
            />
            <Button type="submit" loading={loading}>Gửi liên kết đặt lại mật khẩu</Button>
          </form>
        )}
        <p className="login-note"><ShieldCheck size={15} aria-hidden="true" />Vì lý do bảo mật, chúng tôi không tiết lộ email có tồn tại trong hệ thống hay không.</p>
        <Link className="login-form__link login-form__link--with-icon" to="/login">
          <ArrowLeft size={15} aria-hidden="true" />Quay lại đăng nhập
        </Link>
      </section>
    </main>
  );
}
