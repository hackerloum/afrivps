"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Boxes,
  CreditCard,
  FileText,
  LayoutDashboard,
  Layers,
  LifeBuoy,
  Menu,
  Package,
  ScrollText,
  Server,
  Settings,
  ShieldCheck,
  ShoppingCart,
  TicketPercent,
  UserCog,
  Users,
  Wallet,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/shell/logout-button";
import { Badge } from "@/components/ui/badge";
import { cn, focusRing, initials } from "@/lib/utils";

// Icon names are passed across the server/client boundary as strings (React
// forbids passing component functions from Server to Client Components).
const ICONS = {
  overview: LayoutDashboard,
  services: Server,
  orders: ShoppingCart,
  billing: CreditCard,
  support: LifeBuoy,
  notifications: Bell,
  account: UserCog,
  customers: Users,
  provisioning: Wrench,
  products: Package,
  plans: Layers,
  invoices: FileText,
  payments: Wallet,
  providers: Boxes,
  discounts: TicketPercent,
  security: ShieldCheck,
  audit: ScrollText,
  settings: Settings,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIcon;
}

export interface AppShellUser {
  name: string;
  email: string;
  roleLabel: string;
}

export function AppShell({
  navItems,
  user,
  areaLabel,
  children,
}: {
  navItems: NavItem[];
  user: AppShellUser;
  areaLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Close on Escape and lock body scroll while the drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/" aria-label="AfriVPS home" className={cn("rounded-[var(--radius)]", focusRing)}>
          <Logo />
        </Link>
      </div>

      <div className="px-4 py-4">
        <Badge
          variant="outline"
          className="w-full justify-center py-1 uppercase tracking-wide"
        >
          {areaLabel}
        </Badge>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                focusRing,
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active
                    ? "text-accent"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-[var(--radius)] bg-surface px-3 py-2">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-elevated text-xs font-semibold text-accent"
          >
            {initials(user.name || user.email)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-overlay/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-surface shadow-2xl animate-rise">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border text-foreground transition-colors hover:bg-secondary lg:hidden",
              focusRing,
            )}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {areaLabel}
            </span>
            <span aria-hidden className="text-border-strong">
              /
            </span>
            <Badge variant="accent">{user.roleLabel}</Badge>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
