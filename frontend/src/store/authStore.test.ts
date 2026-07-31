import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTH_STORAGE_KEY } from "./authSession";
import { useAuthStore } from "./authStore";

const session = {
  accessToken: "token",
  expiresAt: "2026-08-01T00:01:00.000Z",
  userId: "user-1",
  username: "staff",
  role: "staff" as const,
};

describe("authStore hydrate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-01T00:00:00.000Z"));
    window.history.replaceState({}, "", "/login");
    useAuthStore.setState({ isHydrated: false });
  });

  it("khôi phục phiên hợp lệ từ sessionStorage và tự xóa khi hết hạn", () => {
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({
      isHydrated: true,
      isAuthenticated: true,
      username: "staff",
      role: "staff",
    });

    vi.advanceTimersByTime(60_001);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(window.sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("từ chối và xóa phiên đã hết hạn", () => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ ...session, expiresAt: "2026-07-31T23:59:59.000Z" }),
    );

    useAuthStore.getState().hydrate();

    expect(useAuthStore.getState()).toMatchObject({
      isHydrated: true,
      isAuthenticated: false,
      accessToken: null,
    });
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
