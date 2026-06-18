import Link from "next/link";
import { Logo } from "@/components/Logo";
import { brand } from "@/lib/theme";
import { BeanField } from "@/components/BeanField";

const groups = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All concentrate" },
      { href: "/shop?type=cold-brew", label: "Cold brew" },
      { href: "/shop?type=hot", label: "Hot" },
      { href: "/shop?type=flavoured", label: "Flavoured" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/story", label: "Our story" },
      { href: "/contact", label: "Contact" },
      { href: "/cart", label: "Cart" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-cream">
      <BeanField className="opacity-60" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo tone="onDark" />
          <p className="mt-4 max-w-xs text-sm text-cream/70">
            {brand.tagline} Café-grade liquid coffee concentrate, brewed in
            India and built for your kitchen counter.
          </p>
        </div>

        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.15em] text-gold">
              {group.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/80 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {brand.name}. All rights reserved. A placeholder brand for demo
            purposes.
          </p>
          <p>Brewed in India · Recyclable glass</p>
        </div>
      </div>
    </footer>
  );
}
