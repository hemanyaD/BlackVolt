"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { useUser } from "@/context/UserContext";

function nextTarget(): string {
  if (typeof window === "undefined") return "/account";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") ? n : "/account";
}

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, signup } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace(nextTarget());
  }, [loading, user, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signup(email, password, name);
      router.replace(nextTarget());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
      setSubmitting(false);
    }
  }

  const loginHref =
    typeof window !== "undefined" && nextTarget() !== "/account"
      ? `/login?next=${encodeURIComponent(nextTarget())}`
      : "/login";

  return (
    <Section tone="cream" className="min-h-[80vh] pt-28">
      <div className="mx-auto max-w-sm">
        <h1 className="text-3xl font-black uppercase tracking-tight">
          Create account
        </h1>
        <p className="mt-2 text-sm text-charcoal/60">
          Save your details, track orders, and check out in a tap.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <Field
            label="Full name"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
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
            autoComplete="new-password"
            minLength={6}
          />
          <p className="text-xs text-charcoal/50">At least 6 characters.</p>
          {error && (
            <p className="text-sm font-medium text-red-700">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-charcoal/60">
          Already have an account?{" "}
          <Link href={loginHref} className="font-bold text-gold hover:underline">
            Sign in
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
