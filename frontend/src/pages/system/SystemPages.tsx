import { ArrowLeft, Ban, SearchX } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "../../store/authStore";

function SystemPage({
  code,
  title,
  description,
  icon: Icon,
}: {
  code: string;
  title: string;
  description: string;
  icon: typeof Ban;
}) {
  const role = useAuthStore((state) => state.role);
  const destination = role === "tenant" ? "/invoices" : role ? "/dashboard" : "/login";

  return (
    <main className="system-page">
      <section>
        <div className="system-page__mark">
          <Icon size={22} aria-hidden="true" />
          <span>{code}</span>
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="button button--primary button--md" to={destination}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Quay lại ứng dụng</span>
        </Link>
      </section>
    </main>
  );
}

export function ForbiddenPage() {
  return (
    <SystemPage
      code="403"
      title="Bạn không có quyền truy cập"
      description="Tài khoản hiện tại chưa được cấp quyền xem nội dung này. Hãy liên hệ quản trị viên nếu bạn cần hỗ trợ."
      icon={Ban}
    />
  );
}

export function NotFoundPage() {
  return (
    <SystemPage
      code="404"
      title="Không tìm thấy trang"
      description="Đường dẫn có thể đã thay đổi hoặc không còn tồn tại. Bạn có thể quay về trang tổng quan để tiếp tục."
      icon={SearchX}
    />
  );
}
