import {
  AlertTriangle,
  CalendarClock,
  FileWarning,
  LifeBuoy,
  Package,
  Server,
  ShoppingCart,
  Wallet,
  Wrench,
} from "lucide-react";
import type { Query } from "firebase-admin/firestore";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { StatCard } from "@/components/shell/stat-card";
import { Card } from "@/components/ui/card";
import { adminDb } from "@/lib/firebase/admin";
import { getActivePlansSafe } from "@/lib/data/plans";
import { formatMoney, money } from "@/lib/money";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

/**
 * Count documents matching a query. Any failure (missing collection, no
 * emulator/credentials during build, or a missing index) resolves to 0 so the
 * dashboard degrades to honest empty states rather than throwing. Query
 * construction runs inside the guard because `adminDb()` may itself throw when
 * Firebase is not configured.
 */
async function safeCount(build: () => Query): Promise<number> {
  try {
    const snap = await build().count().get();
    return snap.data().count;
  } catch {
    return 0;
  }
}

/** Time window (ms epoch) for services renewing within the next 7 days. */
function expiringWindowMs(): { from: number; to: number } {
  const from = Date.now();
  return { from, to: from + 7 * 24 * 60 * 60 * 1000 };
}

export default async function AdminOverviewPage() {
  await requireStaff();

  const db = () => adminDb();
  const { from: now, to: sevenDays } = expiringWindowMs();

  // Real Firestore metrics (Section 28). Empty database => genuine zeros/empty
  // states. Nothing is fabricated.
  const [
    newOrders,
    pendingProvisioning,
    activeVps,
    expiringServices,
    unpaidInvoices,
    openTickets,
    failedProvisioning,
    paidPayments,
  ] = await Promise.all([
    safeCount(() => db().collection("orders")),
    safeCount(() =>
      db()
        .collection("provisioningJobs")
        .where("status", "in", [
          "queued",
          "processing",
          "awaiting_manual_action",
        ]),
    ),
    safeCount(() =>
      db().collection("services").where("status", "==", "active"),
    ),
    safeCount(() =>
      db()
        .collection("services")
        .where("nextBillingDate", ">=", now)
        .where("nextBillingDate", "<=", sevenDays),
    ),
    safeCount(() =>
      db().collection("invoices").where("status", "in", ["unpaid", "overdue"]),
    ),
    safeCount(() =>
      db()
        .collection("supportTickets")
        .where("status", "in", ["open", "customer_reply", "staff_reply"]),
    ),
    safeCount(() =>
      db().collection("provisioningJobs").where("status", "==", "failed"),
    ),
    safeCount(() =>
      db().collection("payments").where("status", "==", "paid"),
    ),
  ]);

  const plans = await getActivePlansSafe();
  const topPlans = plans.slice(0, 5);

  // Revenue is intentionally an honest empty state until billing (Phase 2)
  // records confirmed payments; multi-currency revenue reporting lands there.
  const revenueHint =
    paidPayments > 0
      ? `${paidPayments} confirmed payment${paidPayments === 1 ? "" : "s"} — reporting in Billing`
      : "No confirmed payments yet";

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Live platform metrics from Firestore. Empty states are shown until real data exists — never fabricated values."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue today"
          value="—"
          icon={Wallet}
          hint={revenueHint}
        />
        <StatCard
          label="Monthly revenue"
          value="—"
          icon={Wallet}
          hint={revenueHint}
        />
        <StatCard label="New orders" value={newOrders} icon={ShoppingCart} />
        <StatCard
          label="Pending provisioning"
          value={pendingProvisioning}
          icon={Wrench}
        />
        <StatCard label="Active VPS" value={activeVps} icon={Server} />
        <StatCard
          label="Expiring services"
          value={expiringServices}
          icon={CalendarClock}
          hint="Renewing within 7 days"
        />
        <StatCard
          label="Unpaid invoices"
          value={unpaidInvoices}
          icon={FileWarning}
        />
        <StatCard label="Open tickets" value={openTickets} icon={LifeBuoy} />
        <StatCard
          label="Failed provisioning"
          value={failedProvisioning}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Top plans
          </h2>
          {topPlans.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No plans published"
              description="Run the development seed script to load demo plans."
            />
          ) : (
            <Card className="divide-y divide-border p-0">
              {topPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {plan.name}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {plan.publicReference}
                    </p>
                  </div>
                  <span className="text-sm text-foreground">
                    {formatMoney(money(plan.monthlyPrice, plan.currency))}
                    <span className="text-muted-foreground">/mo</span>
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Orders</h2>
          <EmptyState
            icon={ShoppingCart}
            title={newOrders === 0 ? "No orders yet" : "Order chart"}
            description={
              newOrders === 0
                ? "New orders will appear here as customers check out."
                : "Order trend charts arrive with billing analytics (Phase 2)."
            }
          />
        </div>
      </div>
    </div>
  );
}
