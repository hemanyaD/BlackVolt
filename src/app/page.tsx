import { Hero } from "@/components/home/Hero";
import { Section, Eyebrow } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ProductCard } from "@/components/ProductCard";
import { ButtonLink } from "@/components/Button";
import { NewsletterForm } from "@/components/NewsletterForm";
import { WhySection } from "@/components/WhySection";
import { WaveDivider } from "@/components/WaveDivider";
import { FlipCard } from "@/components/FlipCard";
import { MarqueeWall } from "@/components/MarqueeWall";
import { ReviewsShowcase } from "@/components/ReviewsShowcase";
import { BrewStory } from "@/components/BrewStory";
import { Marquee } from "@/components/Marquee";
import { Counter } from "@/components/Counter";
import { MaskReveal } from "@/components/MaskReveal";
import { colors } from "@/lib/theme";
import {
  EspressoMachine,
  MokaPot,
  AeroPress,
  ColdBrewTower,
} from "@/components/MachineIllustrations";
import { getFeaturedProducts } from "@/data/products";

const methods = [
  {
    Icon: EspressoMachine,
    title: "Espresso",
    body: "High-pressure extraction, fast. Rich, intense, unmistakably concentrated.",
  },
  {
    Icon: MokaPot,
    title: "Moka pot",
    body: "Stovetop pressure brewing for a bold, traditional, full-flavoured cup.",
  },
  {
    Icon: AeroPress,
    title: "AeroPress",
    body: "Immersion plus hand pressure. Strong, clean, and endlessly controllable.",
  },
  {
    Icon: ColdBrewTower,
    title: "Cold brew",
    body: "Time, not heat. Slow-dripped for a smooth concentrate with low acidity.",
  },
];

const reviews = [
  {
    quote:
      "I cancelled my morning café run. One bottle lasted me three weeks and tasted better than the ₹300 cups.",
    name: "Aarti M.",
    city: "Bengaluru",
  },
  {
    quote:
      "High Voltage over ice is unreal. Genuinely the smoothest cold coffee I've made at home.",
    name: "Rohan D.",
    city: "Mumbai",
  },
  {
    quote:
      "The spiced one tastes like my grandmother's kitchen but with a serious kick. Obsessed.",
    name: "Neha K.",
    city: "Delhi",
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <Hero />

      <Marquee
        items={[
          "A jolt in every drop",
          "Estate-direct beans",
          "15–20 cups a bottle",
          "≈ ₹25 a cup",
          "Café-grade at home",
        ]}
      />

      {/* Why concentrate — interactive savings calculator */}
      <WhySection />

      <WaveDivider top={colors.cream} bottom={colors.charcoal} />

      {/* Featured products */}
      <Section tone="charcoal">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Featured</Eyebrow>
              <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
                <MaskReveal>Start with a bestseller</MaskReveal>
              </h2>
            </div>
            <ButtonLink href="/shop" variant="secondary">
              View all
            </ButtonLink>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Bold typographic statement band */}
      <MarqueeWall />

      {/* How it works — interactive scroll brew story */}
      <BrewStory />

      <WaveDivider top={colors.charcoal} bottom={colors.cream} flip />

      {/* Methods — line-art machines that make concentrate */}
      <Section tone="cream">
        <Reveal>
          <Eyebrow>The methods</Eyebrow>
          <h2 className="max-w-2xl text-4xl font-black uppercase tracking-tight sm:text-5xl">
            <MaskReveal>Concentrated by real machines</MaskReveal>
          </h2>
          <p className="mt-4 max-w-xl text-charcoal/70">
            Every BlackVolt blend is built on a proven brewing method, each one
            forcing more coffee into less liquid.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((method, i) => {
            const { Icon } = method;
            return (
              <Reveal key={method.title} delay={i * 0.08}>
                <FlipCard
                  className="h-72"
                  front={
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-6 text-center text-charcoal ring-1 ring-charcoal/10">
                      <Icon className="h-28 w-28" />
                      <h3 className="mt-4 font-display text-xl font-bold">
                        {method.title}
                      </h3>
                      <p className="mt-3 font-display text-xs font-bold uppercase tracking-wide text-gold">
                        Hover to flip
                      </p>
                    </div>
                  }
                  back={
                    <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-charcoal p-6 text-center text-cream ring-1 ring-cream/10">
                      <Icon className="h-16 w-16 text-cream" />
                      <h3 className="mt-3 font-display text-xl font-bold text-gold">
                        {method.title}
                      </h3>
                      <p className="mt-2 text-sm text-cream/80">{method.body}</p>
                    </div>
                  }
                />
              </Reveal>
            );
          })}
        </div>
      </Section>

      <WaveDivider top={colors.cream} bottom={colors.charcoal} />

      {/* Social proof — floating cards over a giant "REVIEWS" word */}
      <ReviewsShowcase reviews={reviews} />

      <WaveDivider top={colors.charcoal} bottom={colors.cream} flip />

      {/* Sustainability */}
      <Section tone="cream">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <Eyebrow>Sourcing & sustainability</Eyebrow>
            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              <MaskReveal>Estate-direct. Recyclable. Honest.</MaskReveal>
            </h2>
            <p className="mt-5 text-charcoal/75">
              We buy green coffee straight from estates in Chikmagalur and
              Coorg, paying growers directly and roasting in small batches. Every
              bottle is recyclable glass. Concentrate means less packaging,
              less waste, and a lot less single-use café cups.
            </p>
            <div className="mt-7">
              <ButtonLink href="/story">Read our story</ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 gap-4">
              {[
                { to: 100, suffix: "%", label: "Estate-direct beans" },
                { to: 18, suffix: "hr", label: "Slow cold brew" },
                { to: 20, suffix: "", label: "Cups per bottle" },
                { to: 500, suffix: "ml", label: "Recyclable glass" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-charcoal p-6 text-cream"
                >
                  <p className="font-display text-3xl font-black text-gold">
                    <Counter to={item.to} suffix={item.suffix} />
                  </p>
                  <p className="mt-1 text-sm text-cream/70">{item.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      <WaveDivider top={colors.cream} bottom={colors.charcoal} />

      {/* Newsletter */}
      <Section tone="charcoal">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <Eyebrow>Join the grid</Eyebrow>
            <h2 className="max-w-2xl text-4xl font-black uppercase tracking-tight sm:text-5xl">
              <MaskReveal>Get the jolt in your inbox</MaskReveal>
            </h2>
            <p className="mt-4 max-w-xl text-cream/75">
              New drops, brewing tips, and subscriber-only pricing. No spam,
              just coffee worth waking up for.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="w-full">
            <NewsletterForm />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
