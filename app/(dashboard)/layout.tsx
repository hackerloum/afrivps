import { redirect } from "next/navigation";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Server,
  ShoppingCart,
  UserCog,
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
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: Server },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/account", label: "Account", icon: UserCog },
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
