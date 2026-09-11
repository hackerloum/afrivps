import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActivePlansSafe } from "@/lib/data/plans";
import { formatMoney, money } from "@/lib/money";
import { requireStaff } from "@/lib/session";
import type { Plan, ProductType } from "@/types";

export const dynamic = "force-dynamic";

const PRODUCT_LINES: { type: ProductType; label: string; blurb: string }[] = [
  { type: "linux_vps", label: "Linux VPS", blurb: "KVM Linux virtual servers" },
  {
    type: "windows_vps",
    label: "Windows VPS",
    blurb: "Licensed Windows Server instances",
  },
  { type: "windows_rdp", label: "Windows RDP", blurb: "Remote desktop servers" },
  { type: "cpanel", label: "cPanel Hosting", blurb: "Managed cPanel hosting" },
];

/** Cheapest monthly price within a product line, formatted for display. */
function priceFrom(plans: Plan[]): string | null {
  if (plans.length === 0) return null;
  const cheapest = plans.reduce((min, p) =>
    p.monthlyPrice < min.monthlyPrice ? p : min,
  );
  return formatMoney(money(cheapest.monthlyPrice, cheapest.currency));
}

export default async function AdminProductsPage() {
  await requireStaff();
  const plans = await getActivePlansSafe();

  return (
    <div>
      <PageHeader
        title="Products"
        description="Product lines summarised from Firestore plans. Manage individual plans under Plans."
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products published"
          description="Run the development seed script to load demo plans into the emulator."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {PRODUCT_LINES.map((line) => {
            const linePlans = plans.filter((p) => p.productType === line.type);
            const from = priceFrom(linePlans);
            return (
              <Card key={line.type} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Package className="size-4 text-accent" />
                      <h2 className="text-sm font-semibold text-foreground">
                        {line.label}
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {line.blurb}
                    </p>
                  </div>
                  <Badge variant={linePlans.length > 0 ? "success" : "outline"}>
                    {linePlans.length} plan{linePlans.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-lg font-semibold text-foreground">
                      {from ?? "—"}
                      {from && (
                        <span className="text-sm text-muted-foreground">
                          /mo
                        </span>
                      )}
                    </p>
                  </div>
                  <Link
                    href="/admin/plans"
                    className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                  >
                    View plans <ArrowRight className="size-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
