import Link from "next/link";

import { Logo } from "@/components/brand/logo";

const FOOTER_SECTIONS = [
  {
    title: "Products",
    links: [
      { href: "/vps", label: "Linux VPS" },
      { href: "/windows-vps", label: "Windows VPS & RDP" },
      { href: "/web-hosting", label: "Web Hosting" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/network", label: "Network" },
      { href: "/status", label: "Status" },
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/support", label: "Support Center" },
      { href: "/login", label: "Customer Login" },
      { href: "/register", label: "Create Account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of Service" },
      { href: "/legal/privacy", label: "Privacy Policy" },
      { href: "/legal/aup", label: "Acceptable Use" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Cloud Infrastructure for Africa. VPS, Windows servers and hosting
              built for African businesses and developers.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-foreground">
                {section.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AfriVPS. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Cloud Infrastructure for Africa.
          </p>
        </div>
      </div>
    </footer>
  );
}
