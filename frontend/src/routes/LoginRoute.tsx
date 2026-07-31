import { useEffect, type ReactElement } from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "../store/authStore";

export function defaultRouteForRole(role: "admin" | "staff" | "tenant" | null) {
  return role === "tenant" ? "/invoices" : "/dashboard";
}

export function LoginRoute({ children }: { children: ReactElement }) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.role);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [hydrate, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span />
        <p>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <Navigate to={defaultRouteForRole(role)} replace />
  ) : (
    children
  );
}
