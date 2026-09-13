import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AppShell, type NavItem } from "@/components/shell/app-shell";
import { getSession } from "@/lib/session";
import { can, isStaffRole, type Permission } from "@/lib/firebase/permissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin navigation (Sections 27, 73). Each entry may carry the permission
 * required to reach it; the sidebar is filtered per-role server-side so staff
 * never see sections they cannot open. Entries without a permission are visible
 * to every staff role (e.g. read-only catalog views).
 *
 * NOTE: `icon` is constrained to the shared shell's ICON registry. Distinct
 * glyphs for Plans / Invoices / Payments / Discount Codes require new keys in
 * `components/shell/app-shell.tsx` (reported as a cross-area need); until then
 * we reuse the closest existing icons.
 */
type AdminNavItem = NavItem & { permission?: Permission };

const NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  { href: "/admin/orders", label: "Orders", icon: "orders", permission: "orders.read" },
  { href: "/admin/customers", label: "Customers", icon: "customers", permission: "customers.read" },
  { href: "/admin/services", label: "Services", icon: "services", permission: "services.read" },
  { href: "/admin/provisioning", label: "Provisioning", icon: "provisioning", permission: "provisioning.manage" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/plans", label: "Plans", icon: "plans" },
  { href: "/admin/invoices", label: "Invoices", icon: "invoices", permission: "invoices.read" },
  { href: "/admin/payments", label: "Payments", icon: "payments", permission: "payments.read" },
  { href: "/admin/support", label: "Support", icon: "support", permission: "support.read" },
  { href: "/admin/providers", label: "Providers", icon: "providers", permission: "providers.read" },
  { href: "/admin/discount-codes", label: "Discount Codes", icon: "discounts", permission: "discounts.manage" },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: "audit", permission: "audit.read" },
  { href: "/admin/settings", label: "Settings", icon: "settings", permission: "settings.manage" },
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

  // Show only the sections this role can actually open (centralized in the
  // shared permission layer — never scattered role checks).
  const navItems: NavItem[] = NAV_ITEMS.filter(
    ({ permission }) => !permission || can(session.role, permission),
  ).map(({ href, label, icon }) => ({ href, label, icon }));

  return (
    <AppShell
      areaLabel="AfriVPS Admin"
      navItems={navItems}
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
