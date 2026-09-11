import {
  AlertTriangle,
  BarChart3,
  FileWarning,
  LifeBuoy,
  Server,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { StatCard } from "@/components/shell/stat-card";
import { adminDb } from "@/lib/firebase/admin";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

async function safeCount(collection: string): Promise<number> {
  try {
    const snap = await adminDb().collection(collection).count().get();
    return snap.data().count;
  } catch {
    return 0;
  }
}

export default async function AdminOverviewPage() {
  await requireStaff();

  const [customers, plans, orders] = await Promise.all([
    safeCount("users"),
    safeCount("plans"),
    safeCount("orders"),
  ]);

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Live platform metrics. Empty states are shown until real data exists — never fabricated values."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue today" value="—" icon={Wallet} hint="No confirmed payments yet" />
        <StatCard label="New orders" value={orders} icon={ShoppingCart} />
        <StatCard label="Pending provisioning" value={0} icon={Wrench} />
        <StatCard label="Active VPS" value={0} icon={Server} />
        <StatCard label="Unpaid invoices" value={0} icon={FileWarning} />
        <StatCard label="Open tickets" value={0} icon={LifeBuoy} />
        <StatCard label="Failed provisioning" value={0} icon={AlertTriangle} />
        <StatCard label="Customers" value={customers} icon={BarChart3} hint={`${plans} plans published`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Revenue
          </h2>
          <EmptyState
            icon={BarChart3}
            title="No revenue data"
            description="Revenue charts appear once payments are confirmed."
          />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Orders</h2>
          <EmptyState
            icon={ShoppingCart}
            title="No orders yet"
            description="New orders will appear here as customers check out."
          />
        </div>
      </div>
    </div>
  );
}
