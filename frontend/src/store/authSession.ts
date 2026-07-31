import type { LoginResponse } from "../types/api";

export const AUTH_STORAGE_KEY = "rms-auth-session";
export const AUTH_SESSION_CLEARED_EVENT = "rms:auth-session-cleared";

export interface StoredAuthSession extends LoginResponse {}

function parseSession(value: string | null): StoredAuthSession | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "accessToken" in parsed &&
      "expiresAt" in parsed &&
      "userId" in parsed &&
      "username" in parsed &&
      "role" in parsed &&
      typeof parsed.accessToken === "string" &&
      typeof parsed.expiresAt === "string" &&
      typeof parsed.userId === "string" &&
      typeof parsed.username === "string" &&
      (parsed.role === "admin" ||
        parsed.role === "staff" ||
        parsed.role === "tenant")
    ) {
      return parsed as StoredAuthSession;
    }
  } catch {
    return null;
  }

  return null;
}

export function readStoredSession(): StoredAuthSession | null {
  return (
    parseSession(window.localStorage.getItem(AUTH_STORAGE_KEY)) ??
    parseSession(window.sessionStorage.getItem(AUTH_STORAGE_KEY))
  );
}

export function writeStoredSession(
  session: StoredAuthSession,
  remember: boolean,
) {
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  target.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  other.removeItem(AUTH_STORAGE_KEY);
}

export function clearStoredSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isSessionExpired(session: StoredAuthSession, now = Date.now()) {
  const expiresAt = Date.parse(session.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= now;
}

export function notifySessionCleared() {
  window.dispatchEvent(new Event(AUTH_SESSION_CLEARED_EVENT));
}
