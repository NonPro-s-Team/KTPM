import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useTheme } from "../hooks/useTheme";
import { ThemeProvider } from "./ThemeProvider";

function ThemeProbe() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <p>
        {theme}:{resolvedTheme}
      </p>
      <button type="button" onClick={() => setTheme("dark")}>
        Chọn tối
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  it("lưu và áp dụng lựa chọn giao diện", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(screen.getByText("system:light")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Chọn tối" }));

    expect(screen.getByText("dark:dark")).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("rms-theme")).toBe("dark");
  });
});
