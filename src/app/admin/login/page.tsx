"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { ADMIN_PASSWORD } from "@/lib/admin";
import { setAdminToken } from "@/lib/admin-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAdminToken(password);
      router.replace("/admin");
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <Section tone="charcoal" className="min-h-[80vh] pt-28">
      <div className="mx-auto max-w-sm">
        <p className="font-display text-sm font-bold uppercase tracking-[0.25em] text-gold">
          BlackVolt
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm text-cream/60">
          Orders, inventory and logistics. Demo gate — not real authentication.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-cream/70">
              Password
            </span>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full rounded-lg border border-cream/20 bg-charcoal-800 px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </label>
          {error && (
            <p className="mt-3 text-sm font-medium text-red-400">{error}</p>
          )}
          <Button type="submit" size="lg" className="mt-6 w-full">
            Sign in
          </Button>
        </form>
      </div>
    </Section>
  );
}
