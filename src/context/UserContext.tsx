"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types";

interface UserContextValue {
  user: User | null;
  /** True until the initial /api/auth/me check resolves. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Omit<User, "id" | "email">>) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

/** POST/PATCH JSON and return the parsed body, throwing the server error text. */
async function send<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
  return data as T;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Resolve the current session once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await send<{ user: User | null }>("/api/auth/me", "GET");
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await send<{ user: User }>("/api/auth/login", "POST", {
      email,
      password,
    });
    setUser(user);
  }, []);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      const { user } = await send<{ user: User }>("/api/auth/signup", "POST", {
        email,
        password,
        name,
      });
      setUser(user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await send("/api/auth/logout", "POST");
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, "id" | "email">>) => {
      const { user } = await send<{ user: User }>("/api/me", "PATCH", patch);
      setUser(user);
    },
    [],
  );

  const value = useMemo<UserContextValue>(
    () => ({ user, loading, login, signup, logout, updateProfile }),
    [user, loading, login, signup, logout, updateProfile],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** Access the current user + auth actions. Throws outside <UserProvider>. */
export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
}
