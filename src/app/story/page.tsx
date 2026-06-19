import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/Button";
import { MaskReveal } from "@/components/MaskReveal";
import { TestimonialList } from "@/components/TestimonialList";
import { WaveDivider } from "@/components/WaveDivider";
import { colors } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Why BlackVolt exists: estate-direct Indian coffee, concentrated so a great cup costs about ₹25 and ten seconds, not ₹300 and a queue.",
};

const testimonials = [
  {
    name: "Aarti M.",
    city: "Bengaluru",
    quote:
      "I cancelled my morning café run. One bottle lasted three weeks and tasted better than the ₹300 cups.",
  },
  {
    name: "Rohan D.",
    city: "Mumbai",
    quote:
      "High Voltage over ice is unreal. The smoothest cold coffee I've made at home.",
  },
  {
    name: "Neha K.",
    city: "Delhi",
    quote:
      "The spiced one tastes like my grandmother's kitchen but with a serious kick. Obsessed.",
  },
  {
    name: "Kabir S.",
    city: "Pune",
    quote:
      "One ounce, hot water, done. I haven't touched my French press since.",
  },
  {
    name: "Ishita R.",
    city: "Hyderabad",
    quote:
      "Decaf After Dark is my evening ritual now. All the flavour, none of the 2 a.m. wakefulness.",
  },
  {
    name: "Arjun V.",
    city: "Chennai",
    quote:
      "Cheaper than my old café habit and honestly better. The crema is real.",
  },
];

export default function StoryPage() {
  return (
    <>
      <Section tone="charcoal" className="pt-28">
        <Reveal>
          <Eyebrow>Our story</Eyebrow>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl">
            <MaskReveal>
              We were tired of choosing between good coffee and a fair price.
            </MaskReveal>
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-cream/80 sm:text-2xl">
            BlackVolt started with a simple frustration: brilliant Indian coffee
            grows a few hours from our cities, yet a decent cup means a ₹300 bill
            or a fussy machine. So we concentrated it, literally.
          </p>
        </Reveal>
      </Section>

      <WaveDivider top={colors.charcoal} bottom={colors.cream} />

      <Section tone="cream">
        <div className="grid gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              The jolt idea
            </h2>
            <p className="mt-5 text-lg text-charcoal/75">
              Coffee shops sell you water, milk, and convenience at a steep
              markup. The actual coffee is a tiny fraction of the cost. We asked:
              what if we sold you just the coffee, brewed properly and
              concentrated hard, then let you add the water and milk at home?
            </p>
            <p className="mt-4 text-lg text-charcoal/75">
              One 500ml bottle becomes 15–20 café-grade cups. That&apos;s about
              ₹25 a cup, made in ten seconds, with no machine and no queue. A
              jolt in every drop.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Estate to bottle
            </h2>
            <p className="mt-5 text-lg text-charcoal/75">
              We buy green coffee directly from estates in Chikmagalur and Coorg,
              paying growers fairly and skipping the middlemen. Beans are roasted
              in small batches specifically for concentration, a profile that
              stays bold and smooth even after you drown it in milk and ice.
            </p>
            <p className="mt-4 text-lg text-charcoal/75">
              Everything ships in recyclable glass. Concentrate means a fraction
              of the packaging of ready-to-drink cans, and a lot fewer single-use
              café cups in the bin.
            </p>
          </Reveal>
        </div>
      </Section>

      <WaveDivider top={colors.cream} bottom={colors.charcoal} flip />

      <TestimonialList reviews={testimonials} />

      <Section tone="charcoal">
        <Reveal>
          <div className="flex flex-col items-start gap-6">
            <h2 className="max-w-3xl text-4xl font-black uppercase tracking-tight sm:text-6xl">
              <MaskReveal>Ready to taste the difference?</MaskReveal>
            </h2>
            <ButtonLink href="/shop" size="lg">
              Shop the concentrate
            </ButtonLink>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
