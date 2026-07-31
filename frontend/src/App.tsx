import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppShell } from "./components/layout/AppShell";
import { ForbiddenPage, NotFoundPage } from "./pages/system/SystemPages";
import { LoginRoute, defaultRouteForRole } from "./routes/LoginRoute";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleGuard } from "./routes/RoleGuard";
import { useAuthStore } from "./store/authStore";

const LoginPage = lazy(() => import("./pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const RoomsPage = lazy(() => import("./pages/rooms/RoomsPage").then((module) => ({ default: module.RoomsPage })));
const PropertiesPage = lazy(() => import("./pages/properties/PropertiesPage").then((module) => ({ default: module.PropertiesPage })));
const TenantsPage = lazy(() => import("./pages/tenants/TenantsPage").then((module) => ({ default: module.TenantsPage })));
const ContractsPage = lazy(() => import("./pages/contracts/ContractsPage").then((module) => ({ default: module.ContractsPage })));
const InvoicesPage = lazy(() => import("./pages/invoices/InvoicesPage").then((module) => ({ default: module.InvoicesPage })));
const PaymentsPage = lazy(() => import("./pages/payments/PaymentsPage").then((module) => ({ default: module.PaymentsPage })));
const MaintenancePage = lazy(() => import("./pages/maintenance/MaintenancePage").then((module) => ({ default: module.MaintenancePage })));
const UsersPage = lazy(() => import("./pages/users/UsersPage").then((module) => ({ default: module.UsersPage })));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage").then((module) => ({ default: module.SettingsPage })));

function HomeRedirect() {
  const role = useAuthStore((state) => state.role);
  return <Navigate to={defaultRouteForRole(role)} replace />;
}

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
        <Route
          path="/login"
          element={
            <LoginRoute>
              <LoginPage />
            </LoginRoute>
          }
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />
            <Route element={<RoleGuard allowedRoles={["admin", "staff"]} />}>
              <Route path="dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="rooms" element={<RoomsPage />} />
            <Route path="tenants" element={<TenantsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="maintenance" element={<MaintenancePage />} />
            <Route path="properties" element={<PropertiesPage />} />
            <Route path="account" element={<UsersPage />} />
            <Route path="users" element={<Navigate to="/account" replace />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
