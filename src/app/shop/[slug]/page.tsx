import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Section } from "@/components/Section";
import { ProductImage } from "@/components/ProductImage";
import { Bolt } from "@/components/Logo";
import { Accordion, type AccordionItem } from "@/components/Accordion";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { Bottle3DView } from "@/components/Bottle3DView";
import { MaskReveal } from "@/components/MaskReveal";
import { getAllProducts, getProductBySlug } from "@/data/products";
import { PRODUCT_TYPE_LABELS } from "@/types";

// Prerender a static page per SKU at build time.
export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/shop/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  return {
    title: product.name,
    description: product.shortDesc,
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      type: "website",
    },
  };
}

function faqFor(name: string): AccordionItem[] {
  return [
    {
      question: "How do I make a cup?",
      answer:
        "Pour about one ounce (30ml) of concentrate into a glass, then top with cold water or milk over ice, or hot water/milk for a warm cup. Adjust the ratio to taste; more concentrate for a stronger jolt.",
    },
    {
      question: "How long does a bottle last once opened?",
      answer:
        "Keep it refrigerated and use within 14 days of opening. Unopened, the concentrate stays fresh for several months. Check the date on the bottle.",
    },
    {
      question: `Is ${name} strong enough to replace my café order?`,
      answer:
        "Yes, that's the whole point. This is concentrate, not ready-to-drink coffee, so it's built to stand up to milk and ice without tasting watery.",
    },
    {
      question: "Can I pause or cancel a subscription?",
      answer:
        "Anytime. Subscriptions are designed to be flexible, so skip a month or cancel from your account with no penalty.",
    },
  ];
}

export default async function ProductDetailPage(
  props: PageProps<"/shop/[slug]">,
) {
  const { slug } = await props.params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Section tone="cream" className="pt-28">
      <nav className="mb-8 text-sm text-charcoal/60">
        <Link href="/shop" className="hover:text-gold">
          Shop
        </Link>
        <span className="px-2">/</span>
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery — interactive 3D bottle + placeholder thumbnails */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-b from-charcoal to-charcoal-800">
            <Bottle3DView className="h-full w-full" />
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-display text-xs font-bold uppercase tracking-[0.2em] text-cream/40">
              Drag to rotate
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {(["charcoal", "gold", "charcoal"] as const).map((tone, i) => (
              <ProductImage
                key={i}
                name={product.name}
                placeholder={tone}
                className="aspect-square w-full rounded-xl opacity-80"
              />
            ))}
          </div>
        </div>

        {/* Details + buy box */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-[0.15em] text-gold">
              {PRODUCT_TYPE_LABELS[product.type]}
            </span>
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-charcoal px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide text-cream"
              >
                {badge}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight sm:text-5xl">
            <MaskReveal>{product.name}</MaskReveal>
          </h1>
          <p className="mt-4 text-lg text-charcoal/75">{product.longDesc}</p>

          {/* Spec strip */}
          <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-charcoal/15 py-5">
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal/50">
                Cups / bottle
              </dt>
              <dd className="mt-1 font-display text-xl font-bold">
                {product.cupsPerBottle}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal/50">
                Size
              </dt>
              <dd className="mt-1 font-display text-xl font-bold">
                {product.sizeMl}ml
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-charcoal/50">
                Strength
              </dt>
              <dd
                className="mt-1 flex gap-0.5"
                aria-label={`Strength ${product.strength} of 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Bolt
                    key={i}
                    className={`h-5 w-5 ${
                      i < product.strength ? "text-gold" : "text-charcoal/20"
                    }`}
                  />
                ))}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <ProductPurchase product={product} />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-3xl">
        <h2 className="text-3xl font-black uppercase tracking-tight">
          <MaskReveal>Frequently asked</MaskReveal>
        </h2>
        <div className="mt-6">
          <Accordion items={faqFor(product.name)} />
        </div>
      </div>
    </Section>
  );
}
