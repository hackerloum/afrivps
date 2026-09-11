import { Boxes } from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInfrastructureProvider, listInfrastructureProviders } from "@/providers/infrastructure/registry";
import { listPaymentProviders } from "@/providers/payments/registry";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  // Only admins may view provider configuration (support cannot).
  await requirePermission("providers.read");

  const infraProviders = listInfrastructureProviders().map((code) => {
    const provider = getInfrastructureProvider(code);
    return {
      code,
      mode: provider.mode,
      capabilities: Object.entries(provider.capabilities)
        .filter(([, enabled]) => enabled)
        .map(([cap]) => cap),
    };
  });

  const paymentProviders = listPaymentProviders();

  return (
    <div>
      <PageHeader
        title="Providers"
        description="Infrastructure and payment adapters. Upstream providers stay invisible to customers."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Boxes className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Infrastructure providers
            </h2>
          </div>
          <div className="space-y-3">
            {infraProviders.map((p) => (
              <div
                key={p.code}
                className="rounded-[var(--radius)] border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-foreground">
                    {p.code}
                  </span>
                  <Badge variant="outline">{p.mode}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.capabilities.length > 0 ? (
                    p.capabilities.map((cap) => (
                      <Badge key={cap} variant="default">
                        {cap}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No active capabilities (awaiting API access)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Payment providers
          </h2>
          <div className="space-y-3">
            {paymentProviders.map((code) => (
              <div
                key={code}
                className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-surface p-4"
              >
                <span className="font-medium capitalize text-foreground">
                  {code}
                </span>
                <Badge variant={code === "manual" ? "success" : "outline"}>
                  {code === "manual" ? "Active" : "Placeholder"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
