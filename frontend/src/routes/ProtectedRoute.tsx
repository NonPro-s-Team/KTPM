import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";

export function ProtectedRoute() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const location = useLocation();

  useEffect(() => {
    if (!isHydrated) hydrate();
  }, [hydrate, isHydrated]);

  if (!isHydrated) {
    return (
      <div className="route-loading" role="status" aria-live="polite">
        <span />
        <p>Đang khôi phục phiên đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ returnTo }} />;
  }

  return <Outlet />;
}
