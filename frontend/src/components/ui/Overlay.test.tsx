import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Overlay";

describe("Drawer", () => {
  it("xử lý sự kiện cancel do phím Escape và yêu cầu đóng", () => {
    const handleClose = vi.fn();
    render(
      <Drawer
        open
        onClose={handleClose}
        title="Thêm phòng mới"
        description="Tạo phòng trong dữ liệu bản mẫu."
      >
        <p>Nội dung biểu mẫu</p>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog", { name: "Thêm phòng mới" });
    const cancelEvent = new Event("cancel", { cancelable: true });

    fireEvent(dialog, cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(handleClose).toHaveBeenCalledOnce();
  });
});
