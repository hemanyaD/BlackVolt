/**
 * BlackVolt brand tokens for use in JS/TS (e.g. inline SVG fills, Framer Motion).
 *
 * These mirror the CSS custom properties defined in `src/app/globals.css`.
 * When you change a brand color, update BOTH places (CSS drives Tailwind
 * utilities; this object is for code that can't reach a CSS variable).
 */
export const colors = {
  charcoal: "#281A0F",
  charcoal800: "#34251A",
  charcoal700: "#46331F",
  gold: "#C9A24B",
  goldBright: "#E0BD6A",
  cream: "#ECE9E1",
  bone: "#F5F3ED",
  white: "#FFFFFF",
} as const;

/** Brand-wide copy used in metadata and the footer. */
export const brand = {
  name: "BlackVolt",
  tagline: "A jolt in every drop.",
  description:
    "BlackVolt is a premium Indian liquid coffee concentrate. One bottle makes 15–20 café-grade cups at home for about ₹25 a cup.",
  url: "https://blackvolt.example",
} as const;
