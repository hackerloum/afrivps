import { Package } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActivePlansSafe } from "@/lib/data/plans";
import { formatMoney, money } from "@/lib/money";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireStaff();
  const plans = await getActivePlansSafe();

  return (
    <div>
      <PageHeader
        title="Products & Plans"
        description="Plans are stored in Firestore and power the public catalog."
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No plans published"
          description="Run the development seed script to load demo plans into the emulator."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Specs</th>
                  <th className="px-5 py-3 font-medium">Monthly</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">
                        {plan.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {plan.publicReference}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {plan.productType.replace("_", " ")}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {plan.cpuCores} vCPU · {plan.ramMB / 1024} GB ·{" "}
                      {plan.storageGB} GB
                    </td>
                    <td className="px-5 py-3 text-foreground">
                      {formatMoney(money(plan.monthlyPrice, plan.currency))}
                    </td>
                    <td className="px-5 py-3">
                      {plan.featured ? (
                        <Badge variant="accent">Featured</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
