import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RoutePlaceholder } from "./pages/system/RoutePlaceholder";
import { ForbiddenPage, NotFoundPage } from "./pages/system/SystemPages";

const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);

const DashboardPage = lazy(() =>
  import("./pages/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);

const moduleRoutes = [
  {
    path: "dashboard",
    title: "Tổng quan",
    description: "Theo dõi nhanh tình hình vận hành và tài chính.",
  },
  {
    path: "properties",
    title: "Khu trọ",
    description: "Quản lý các khu nhà và địa điểm đang vận hành.",
  },
  {
    path: "rooms",
    title: "Phòng",
    description: "Quản lý tình trạng phòng và giá thuê.",
  },
  {
    path: "tenants",
    title: "Khách thuê",
    description: "Quản lý hồ sơ và lịch sử lưu trú.",
  },
  {
    path: "contracts",
    title: "Hợp đồng",
    description: "Theo dõi vòng đời hợp đồng thuê.",
  },
  {
    path: "invoices",
    title: "Hóa đơn",
    description: "Lập và theo dõi hóa đơn định kỳ.",
  },
  {
    path: "payments",
    title: "Thanh toán",
    description: "Đối soát các khoản thu và công nợ.",
  },
  {
    path: "maintenance",
    title: "Sửa chữa",
    description: "Tiếp nhận và điều phối yêu cầu sửa chữa.",
  },
  {
    path: "users",
    title: "Tài khoản & phân quyền",
    description: "Quản lý người dùng và vai trò truy cập.",
  },
  {
    path: "settings",
    title: "Cài đặt",
    description: "Thiết lập giao diện và tùy chọn hệ thống.",
  },
];

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="route-loading" role="status" aria-live="polite">
          <span />
          <p>Đang tải giao diện...</p>
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {moduleRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.path === "dashboard" ? (
                  <DashboardPage />
                ) : (
                  <RoutePlaceholder
                    title={route.title}
                    description={route.description}
                  />
                )
              }
            />
          ))}
        </Route>
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
