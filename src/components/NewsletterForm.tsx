"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

/**
 * Client-side newsletter signup. No backend yet — on submit it validates the
 * email and shows a confirmation. Wire `onSubmit` to a real endpoint later.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setDone(true);
  }

  if (done) {
    return (
      <p className="font-display text-lg font-bold text-gold">
        You&apos;re in. Watch your inbox for the first jolt. ⚡
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <div className="flex-1">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "newsletter-error" : undefined}
          className="w-full rounded-full bg-cream/10 px-5 py-3 text-cream placeholder:text-cream/40 ring-1 ring-cream/20 focus:ring-gold"
        />
        {error && (
          <p id="newsletter-error" className="mt-2 px-2 text-sm text-gold">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" size="lg">
        Get the jolt
      </Button>
    </form>
  );
}
