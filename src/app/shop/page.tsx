import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/Section";
import { ProductCard } from "@/components/ProductCard";
import { MaskReveal } from "@/components/MaskReveal";
import { getAllProducts } from "@/data/products";
import { PRODUCT_TYPE_LABELS, type ProductType } from "@/types";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse BlackVolt liquid coffee concentrates: cold brew, hot, and flavoured. Each bottle makes 15–20 café-grade cups.",
};

const filters: { value: ProductType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "cold-brew", label: PRODUCT_TYPE_LABELS["cold-brew"] },
  { value: "hot", label: PRODUCT_TYPE_LABELS.hot },
  { value: "flavoured", label: PRODUCT_TYPE_LABELS.flavoured },
];

export default async function ShopPage(props: PageProps<"/shop">) {
  const { type } = await props.searchParams;
  const active = typeof type === "string" ? type : "all";

  const products = getAllProducts().filter((p) =>
    active === "all" ? true : p.type === active,
  );

  return (
    <Section tone="cream" className="pt-28">
      <Eyebrow>The lineup</Eyebrow>
      <h1 className="text-4xl font-black uppercase tracking-tight sm:text-6xl">
        <MaskReveal>Shop the concentrate</MaskReveal>
      </h1>
      <p className="mt-4 max-w-xl text-charcoal/70">
        Every bottle is 500ml of pure concentrate. 15–20 cups, hot or cold,
        your way.
      </p>

      {/* Filter pills. Plain links keep this server-rendered and shareable. */}
      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = active === filter.value;
          const href =
            filter.value === "all" ? "/shop" : `/shop?type=${filter.value}`;
          return (
            <Link
              key={filter.value}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full px-5 py-2 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-charcoal text-cream"
                  : "bg-white text-charcoal ring-1 ring-charcoal/15 hover:bg-charcoal/5"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-charcoal/60">
          No concentrates in this category yet. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </Section>
  );
}
