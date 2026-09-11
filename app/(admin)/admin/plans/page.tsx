import { Info, Package } from "lucide-react";

import { EmptyState, PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActivePlansSafe } from "@/lib/data/plans";
import { can } from "@/lib/firebase/permissions";
import { formatMoney, money } from "@/lib/money";
import { requireStaff } from "@/lib/session";

export const dynamic = "force-dynamic";

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  linux_vps: "Linux VPS",
  windows_vps: "Windows VPS",
  windows_rdp: "Windows RDP",
  cpanel: "cPanel Hosting",
};

type AvailabilityBadge = {
  label: string;
  variant: "success" | "outline" | "default";
};

const AVAILABILITY: Record<string, AvailabilityBadge> = {
  available: { label: "Available", variant: "success" },
  sold_out: { label: "Sold out", variant: "outline" },
  coming_soon: { label: "Coming soon", variant: "default" },
};

const DEFAULT_AVAILABILITY: AvailabilityBadge = {
  label: "Available",
  variant: "success",
};

export default async function AdminPlansPage() {
  const session = await requireStaff();
  const plans = await getActivePlansSafe();

  // Section 46: only roles with provider_costs.read may see internal financials.
  // Support is excluded by the permission layer, so the note never renders for
  // them. No cost figures are fabricated — the mapping wiring is Phase 2/3.
  const canSeeCosts = can(session.role, "provider_costs.read");

  return (
    <div>
      <PageHeader
        title="Plans"
        description="Every plan is stored in Firestore and powers the public catalog. Retail pricing only — provider cost stays server-side."
      />

      {canSeeCosts && (
        <Card className="mb-6 flex items-start gap-3 border-dashed p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <p className="text-sm text-muted-foreground">
            Internal cost &amp; margin (retail − upstream cost) are visible to
            your role but require the server-side cost mapping to be wired before
            real figures appear here. No placeholder numbers are shown.
          </p>
        </Card>
      )}

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
                  <th className="px-5 py-3 font-medium">Annual</th>
                  <th className="px-5 py-3 font-medium">Availability</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((plan) => {
                  const availability =
                    AVAILABILITY[plan.availability] ?? DEFAULT_AVAILABILITY;
                  return (
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
                        {PRODUCT_TYPE_LABELS[plan.productType] ??
                          plan.productType}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {plan.cpuCores} vCPU · {plan.ramMB / 1024} GB ·{" "}
                        {plan.storageGB} GB {plan.storageType.toUpperCase()}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {formatMoney(money(plan.monthlyPrice, plan.currency))}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatMoney(money(plan.annualPrice, plan.currency))}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={availability.variant}>
                          {availability.label}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {plan.featured ? (
                          <Badge variant="accent">Featured</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
