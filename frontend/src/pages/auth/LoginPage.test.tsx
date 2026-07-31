import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  it("hiển thị lỗi tại field khi gửi form trống", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ThemeProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(screen.getByText("Hãy nhập email công việc.")).toBeInTheDocument();
    expect(screen.getByText("Hãy nhập mật khẩu.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^Email/ })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
