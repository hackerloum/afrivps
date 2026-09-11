import { redirect } from "next/navigation";
import {
  Boxes,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Package,
  ScrollText,
  Server,
  Settings,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";

import { AppShell, type NavItem } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/firebase/permissions";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/services", label: "Services", icon: Server },
  { href: "/admin/provisioning", label: "Provisioning", icon: Wrench },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/billing", label: "Billing", icon: CreditCard },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/providers", label: "Providers", icon: Boxes },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  support: "Support",
  finance: "Finance",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify staff status SERVER-SIDE before rendering any sensitive admin UI.
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!isStaffRole(session.role)) {
    redirect("/dashboard");
  }

  return (
    <AppShell
      areaLabel="AfriVPS Admin"
      navItems={NAV_ITEMS}
      user={{
        name: session.email?.split("@")[0] ?? "Staff",
        email: session.email ?? "",
        roleLabel: ROLE_LABELS[session.role] ?? session.role,
      }}
    >
      {children}
    </AppShell>
  );
}
