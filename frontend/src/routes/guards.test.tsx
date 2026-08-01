import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import { useAuthStore } from "../store/authStore";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";

describe("route guards", () => {
  it("ProtectedRoute chuyển phiên ẩn danh về login", async () => {
    useAuthStore.setState({ isHydrated: true, isAuthenticated: false });
    render(
      <MemoryRouter initialEntries={["/rooms"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/rooms" element={<p>Danh sách phòng</p>} />
          </Route>
          <Route path="/login" element={<p>Trang đăng nhập</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Trang đăng nhập")).toBeInTheDocument();
    expect(screen.queryByText("Danh sách phòng")).not.toBeInTheDocument();
  });

  it("RoleGuard chuyển vai trò không được phép tới 403", async () => {
    useAuthStore.setState({ isHydrated: true, isAuthenticated: true, role: "tenant" });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["admin", "staff"]} />}>
            <Route path="/dashboard" element={<p>Tổng quan quản trị</p>} />
          </Route>
          <Route path="/403" element={<p>Không có quyền</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Không có quyền")).toBeInTheDocument();
  });

  it.each(["admin", "staff", "tenant"] as const)(
    "RoleGuard cho route /rooms cho phép role %s truy cập",
    async (role) => {
      useAuthStore.setState({ isHydrated: true, isAuthenticated: true, role });
      render(
        <MemoryRouter initialEntries={["/rooms"]}>
          <Routes>
            <Route element={<RoleGuard allowedRoles={["admin", "staff", "tenant"]} />}>
              <Route path="/rooms" element={<p>Danh sách phòng</p>} />
            </Route>
            <Route path="/403" element={<p>Không có quyền</p>} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Danh sách phòng")).toBeInTheDocument();
    },
  );

  it("RoleGuard vẫn chuyển tới 403 khi role chưa xác định, kể cả trên route mới được bọc guard (/rooms)", async () => {
    useAuthStore.setState({ isHydrated: true, isAuthenticated: true, role: null });
    render(
      <MemoryRouter initialEntries={["/rooms"]}>
        <Routes>
          <Route element={<RoleGuard allowedRoles={["admin", "staff", "tenant"]} />}>
            <Route path="/rooms" element={<p>Danh sách phòng</p>} />
          </Route>
          <Route path="/403" element={<p>Không có quyền</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Không có quyền")).toBeInTheDocument();
    expect(screen.queryByText("Danh sách phòng")).not.toBeInTheDocument();
  });
});
