import { create } from "zustand";
import { authApi } from "../api/authApi";
import type { LoginResponse, UserRole } from "../types/api";
import {
  AUTH_SESSION_CLEARED_EVENT,
  clearStoredSession,
  isSessionExpired,
  readStoredSession,
  writeStoredSession,
} from "./authSession";

export interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  userId: string | null;
  username: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (
    username: string,
    password: string,
    remember: boolean,
  ) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  clearSession: () => void;
  hydrate: () => void;
}

const anonymousState = {
  accessToken: null,
  expiresAt: null,
  userId: null,
  username: null,
  role: null,
  isAuthenticated: false,
} as const;

let expirationTimer: ReturnType<typeof window.setTimeout> | undefined;

function cancelExpirationTimer() {
  if (expirationTimer !== undefined) {
    window.clearTimeout(expirationTimer);
    expirationTimer = undefined;
  }
}

function scheduleExpiration(expiresAt: string, clearSession: () => void) {
  cancelExpirationTimer();
  const delay = Date.parse(expiresAt) - Date.now();
  if (delay <= 0) {
    clearSession();
    return;
  }

  expirationTimer = window.setTimeout(() => {
    clearSession();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }, Math.min(delay, 2_147_000_000));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...anonymousState,
  isHydrated: false,

  async login(username, password, remember) {
    const session = await authApi.login({ username, password });
    writeStoredSession(session, remember);
    set({ ...session, isAuthenticated: true, isHydrated: true });
    scheduleExpiration(session.expiresAt, get().clearSession);
    return session;
  },

  async logout() {
    let requestError: unknown;
    try {
      await authApi.logout();
    } catch (error) {
      requestError = error;
    } finally {
      get().clearSession();
    }

    if (requestError) throw requestError;
  },

  clearSession() {
    cancelExpirationTimer();
    clearStoredSession();
    set({ ...anonymousState, isHydrated: true });
  },

  hydrate() {
    const session = readStoredSession();
    if (!session || isSessionExpired(session)) {
      get().clearSession();
      return;
    }

    set({ ...session, isAuthenticated: true, isHydrated: true });
    scheduleExpiration(session.expiresAt, get().clearSession);
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener(AUTH_SESSION_CLEARED_EVENT, () => {
    useAuthStore.getState().clearSession();
  });
}
