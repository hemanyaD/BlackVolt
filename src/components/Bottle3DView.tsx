"use client";

import dynamic from "next/dynamic";

// WebGL needs the browser — load the Canvas scene only on the client. The
// fallback fills the (sized) parent so there's no layout shift.
const Bottle3D = dynamic(
  () => import("@/components/Bottle3D").then((m) => m.Bottle3D),
  {
    ssr: false,
    loading: () => <div className="h-full w-full animate-pulse bg-charcoal/30" />,
  },
);

export function Bottle3DView({
  accent,
  className = "h-full w-full",
}: {
  accent?: string;
  className?: string;
}) {
  return <Bottle3D accent={accent} className={className} />;
}
