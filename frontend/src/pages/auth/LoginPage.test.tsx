import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { authApi } from "../../api/authApi";
import { ApiClientError } from "../../api/httpClient";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { AUTH_STORAGE_KEY } from "../../store/authSession";
import { LoginPage } from "./LoginPage";

function renderLogin() {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<p>Trang tổng quan</p>} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("LoginPage", () => {
  it("hiển thị lỗi tại field khi gửi form trống", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByText("Hãy nhập tên đăng nhập.")).toBeInTheDocument();
    expect(screen.getByText("Hãy nhập mật khẩu.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Tên đăng nhập/ })).toHaveAttribute("aria-invalid", "true");
  });

  it("đăng nhập thành công, lưu phiên và chuyển tới trang phù hợp", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "login").mockResolvedValue({
      accessToken: "test-token",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      userId: "user-1",
      username: "admin",
      role: "admin",
    });
    renderLogin();

    await user.type(screen.getByLabelText(/^Tên đăng nhập/), "admin");
    await user.type(screen.getByLabelText(/^Mật khẩu/), "secret");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Trang tổng quan")).toBeInTheDocument();
    expect(authApi.login).toHaveBeenCalledWith({ username: "admin", password: "secret" });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toContain("test-token");
  });

  it("hiển thị lỗi thân thiện khi API trả 401", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "login").mockRejectedValue(
      new ApiClientError({ status: 401, title: "Unauthorized", detail: "Invalid credentials" }),
    );
    renderLogin();

    await user.type(screen.getByLabelText(/^Tên đăng nhập/), "admin");
    await user.type(screen.getByLabelText(/^Mật khẩu/), "wrong");
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(await screen.findByText("Tên đăng nhập hoặc mật khẩu không chính xác.")).toBeInTheDocument();
  });
});
