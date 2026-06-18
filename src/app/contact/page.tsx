import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/Section";
import { ContactForm } from "@/components/ContactForm";
import { MaskReveal } from "@/components/MaskReveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about BlackVolt concentrate, subscriptions, or wholesale? Send us a message.",
};

export default function ContactPage() {
  return (
    <Section tone="cream" className="pt-28">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <Eyebrow>Get in touch</Eyebrow>
          <h1 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
            <MaskReveal>Say hello</MaskReveal>
          </h1>
          <p className="mt-4 text-charcoal/75">
            Questions about brewing, subscriptions, or stocking BlackVolt in
            your café? Drop us a line and a real person will reply.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-display font-bold uppercase tracking-wide text-charcoal/50">
                Email
              </dt>
              <dd className="mt-1">hello@blackvolt.example</dd>
            </div>
            <div>
              <dt className="font-display font-bold uppercase tracking-wide text-charcoal/50">
                Wholesale
              </dt>
              <dd className="mt-1">trade@blackvolt.example</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
