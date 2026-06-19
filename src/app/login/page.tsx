"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { useUser } from "@/context/UserContext";

/** Post-auth redirect target from ?next=, defaulting to /account. */
function nextTarget(): string {
  if (typeof window === "undefined") return "/account";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/account";
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already signed in — skip the form.
  useEffect(() => {
    if (!loading && user) router.replace(nextTarget());
  }, [loading, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      router.replace(nextTarget());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setSubmitting(false);
    }
  }

  const signupHref =
    typeof window !== "undefined" && nextTarget() !== "/account"
      ? `/signup?next=${encodeURIComponent(nextTarget())}`
      : "/signup";

  return (
    <Section tone="cream" className="min-h-[80vh] pt-28">
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl font-black uppercase tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Welcome back. Sign in to track orders and check out faster.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm font-medium text-red-700">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-charcoal/60">
          New to BlackVolt?{" "}
          <Link href={signupHref} className="font-bold text-gold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </Section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-charcoal/70">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-charcoal/20 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/30"
        {...rest}
      />
    </label>
  );
}
