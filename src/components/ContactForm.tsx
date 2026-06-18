"use client";

import { useState } from "react";
import { Button } from "@/components/Button";

interface Fields {
  name: string;
  email: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const empty: Fields = { name: "", email: "", message: "" };

/**
 * Contact form with client-side validation. No backend yet — a valid submission
 * shows a confirmation. Wire the submit handler to an API route later.
 */
export function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(values: Fields): Errors {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Enter a valid email address.";
    if (values.message.trim().length < 10)
      next.message = "A few more words, please (10+ characters).";
    return next;
  }

  function update<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    // Clear a field's error as the user corrects it.
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate(fields);
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      setFields(empty);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl bg-white p-8 ring-1 ring-charcoal/10">
        <p className="font-display text-2xl font-bold text-gold">
          Message sent ⚡
        </p>
        <p className="mt-2 text-charcoal/75">
          Thanks for reaching out. We&apos;ll get back to you within a working
          day or two.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 text-sm text-charcoal/60 underline-offset-4 hover:text-gold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl bg-white p-6 ring-1 ring-charcoal/10 sm:p-8"
    >
      <Field
        id="name"
        label="Name"
        value={fields.name}
        error={errors.name}
        onChange={(v) => update("name", v)}
      />
      <Field
        id="email"
        label="Email"
        type="email"
        value={fields.email}
        error={errors.email}
        onChange={(v) => update("email", v)}
      />
      <div>
        <label
          htmlFor="message"
          className="font-display text-sm font-bold uppercase tracking-wide"
        >
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          value={fields.message}
          onChange={(e) => update("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          className="mt-2 w-full rounded-xl bg-cream px-4 py-3 ring-1 ring-charcoal/15 focus:ring-gold"
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-gold">
            {errors.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-display text-sm font-bold uppercase tracking-wide"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full rounded-xl bg-cream px-4 py-3 ring-1 ring-charcoal/15 focus:ring-gold"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-gold">
          {error}
        </p>
      )}
    </div>
  );
}
