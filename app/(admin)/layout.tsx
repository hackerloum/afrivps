import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AppShell, type NavItem } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";
import { isStaffRole } from "@/lib/firebase/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/services", label: "Services", icon: "services" },
  { href: "/admin/provisioning", label: "Provisioning", icon: "provisioning" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/billing", label: "Billing", icon: "billing" },
  { href: "/admin/support", label: "Support", icon: "support" },
  { href: "/admin/providers", label: "Providers", icon: "providers" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "audit" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
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
