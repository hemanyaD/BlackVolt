/**
 * Client-side helpers for the demo admin gate. The password the user types is
 * stored verbatim in localStorage and replayed as the API auth header — this is
 * the agreed demo-grade approach, not real security (see `src/lib/admin.ts`).
 */
import { ADMIN_SESSION_KEY, ADMIN_AUTH_HEADER } from "@/lib/admin";

/** The stored admin token (the password), or null if not signed in. */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ADMIN_SESSION_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    window.localStorage.setItem(ADMIN_SESSION_KEY, token);
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function clearAdminToken(): void {
  try {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

/** `fetch` with the admin auth header attached. Throws on non-OK responses. */
export async function adminFetch<T>(
  input: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getAdminToken() ?? "";
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      [ADMIN_AUTH_HEADER]: token,
      ...(init.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? `Request failed (${res.status})`,
    );
  }
  return data as T;
}
