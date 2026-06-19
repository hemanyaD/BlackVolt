"use client";

import { usePathname } from "next/navigation";

/*
  Wraps the page in the marketing navbar/footer — except on /admin routes, which
  have their own self-contained chrome. `navbar` and `footer` are passed in as
  rendered elements (the Footer stays a server component) so this gate only
  decides whether to include them.
*/
export function SiteChrome({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const isAdmin = usePathname()?.startsWith("/admin") ?? false;
  return (
    <>
      {!isAdmin && navbar}
      <main className="flex-1">{children}</main>
      {!isAdmin && footer}
    </>
  );
}
