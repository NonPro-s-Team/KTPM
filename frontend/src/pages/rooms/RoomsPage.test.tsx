import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { roomsApi } from "../../api/roomsApi";
import { ApiClientError } from "../../api/httpClient";
import { useAuthStore } from "../../store/authStore";
import type { PagedResult, RoomResponse } from "../../types/api";
import { RoomsPage } from "./RoomsPage";

const room = (id: string, roomNumber: string): RoomResponse => ({
  id,
  roomNumber,
  monthlyRent: 3_000_000,
  description: null,
  status: "available",
  createdAt: "2026-07-31T00:00:00Z",
  updatedAt: null,
});

const page = (item: RoomResponse): PagedResult<RoomResponse> => ({
  items: [item],
  pageNumber: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
});

describe("RoomsPage API states", () => {
  it("chuyển loading → data → error → retry → data", async () => {
    const user = userEvent.setup();
    useAuthStore.setState({ role: "tenant", isAuthenticated: true, isHydrated: true });
    let resolveInitial: ((value: PagedResult<RoomResponse>) => void) | undefined;
    vi.spyOn(roomsApi, "list")
      .mockImplementationOnce(() => new Promise((resolve) => { resolveInitial = resolve; }))
      .mockRejectedValueOnce(new ApiClientError({ title: "Lỗi tải", detail: "Máy chủ tạm thời không phản hồi." }))
      .mockResolvedValueOnce(page(room("2", "P-102")));

    const { container } = render(<RoomsPage />);
    expect(container.querySelector(".data-table")).toHaveAttribute("aria-busy", "true");

    await act(async () => { resolveInitial?.(page(room("1", "P-101"))); });
    expect(await screen.findByText("P-101")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Phòng trống" }));
    expect(await screen.findByText("Máy chủ tạm thời không phản hồi.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(await screen.findByText("P-102")).toBeInTheDocument();
  });
});
