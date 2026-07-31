import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/api";

export function RoleGuard({ allowedRoles }: { allowedRoles: UserRole[] }) {
  const role = useAuthStore((state) => state.role);
  return role && allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/403" replace />;
}
