import type { InternalAxiosRequestConfig } from "axios";
import { describe, expect, it } from "vitest";
import { AUTH_STORAGE_KEY } from "../store/authSession";
import { httpClient, normalizeApiError } from "./httpClient";

describe("httpClient", () => {
  it("gắn Authorization Bearer từ phiên đã lưu", async () => {
    window.sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: "jwt-test",
        expiresAt: "2099-01-01T00:00:00.000Z",
        userId: "user-1",
        username: "staff",
        role: "staff",
      }),
    );
    let captured: InternalAxiosRequestConfig | undefined;

    await httpClient.get("/rooms", {
      adapter: async (config) => {
        captured = config;
        return { data: {}, status: 200, statusText: "OK", headers: {}, config };
      },
    });

    expect(captured?.headers.get("Authorization")).toBe("Bearer jwt-test");
  });

  it("không gắn Authorization cho các endpoint public (forgot-password, invite)", async () => {
    window.sessionStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        accessToken: "jwt-test",
        expiresAt: "2099-01-01T00:00:00.000Z",
        userId: "user-1",
        username: "staff",
        role: "staff",
      }),
    );

    for (const url of [
      "/auth/forgot-password",
      "/auth/reset-password",
      "/invitations/some-token",
      "/invitations/accept",
    ]) {
      let captured: InternalAxiosRequestConfig | undefined;
      await httpClient.post(url, undefined, {
        adapter: async (config) => {
          captured = config;
          return { data: {}, status: 200, statusText: "OK", headers: {}, config };
        },
      });

      expect(captured?.headers.get("Authorization")).toBeUndefined();
    }
  });

  it("chuẩn hóa ValidationProblemDetails thành ApiError", () => {
    const result = normalizeApiError({
      isAxiosError: true,
      response: {
        status: 400,
        data: {
          title: "Validation failed",
          detail: "One or more validation errors occurred.",
          status: 400,
          code: "VALIDATION_ERROR",
          traceId: "trace-1",
          errors: { roomNumber: ["Room number is required."] },
        },
      },
    });

    expect(result).toEqual({
      status: 400,
      title: "Validation failed",
      detail: "One or more validation errors occurred.",
      code: "VALIDATION_ERROR",
      traceId: "trace-1",
      fieldErrors: { roomNumber: ["Room number is required."] },
    });
  });
});
