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
  { href: "/dashboard", label: "Overview", icon: "overview" },
  { href: "/dashboard/services", label: "Services", icon: "services" },
  { href: "/dashboard/orders", label: "Orders", icon: "orders" },
  { href: "/dashboard/billing", label: "Billing", icon: "billing" },
  { href: "/dashboard/support", label: "Support", icon: "support" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "notifications" },
  { href: "/dashboard/account", label: "Account", icon: "account" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Staff belong in the admin area, but may still view their customer dashboard.
  const roleLabel = isStaffRole(session.role) ? "Staff" : "Customer";

  return (
    <AppShell
      areaLabel="Control Panel"
      navItems={NAV_ITEMS}
      user={{
        name: session.email?.split("@")[0] ?? "Customer",
        email: session.email ?? "",
        roleLabel,
      }}
    >
      {children}
    </AppShell>
  );
}
