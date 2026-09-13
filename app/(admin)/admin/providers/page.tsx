import { Boxes, Check, X } from "lucide-react";

import { PageHeader } from "@/components/shell/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  getInfrastructureProvider,
  listInfrastructureProviders,
} from "@/providers/infrastructure/registry";
import type { ProviderCapabilitySet } from "@/providers/infrastructure/types";
import { listPaymentProviders } from "@/providers/payments/registry";
import { requirePermission } from "@/lib/session";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Human labels for every capability in the provider contract. We render the
// FULL matrix so unavailable operations are never presented as working
// features (Section 29).
const CAPABILITY_LABELS: { key: keyof ProviderCapabilitySet; label: string }[] =
  [
    { key: "create", label: "Create" },
    { key: "reboot", label: "Reboot" },
    { key: "shutdown", label: "Shutdown" },
    { key: "start", label: "Start" },
    { key: "reinstall", label: "Reinstall" },
    { key: "suspend", label: "Suspend" },
    { key: "unsuspend", label: "Unsuspend" },
    { key: "terminate", label: "Terminate" },
    { key: "resetPassword", label: "Reset password" },
    { key: "usage", label: "Usage" },
  ];

const MODE_NOTES: Record<string, string> = {
  manual: "Provisioning completed by a human operator via the admin panel.",
  api: "Automated API provisioning — unavailable until upstream API access is enabled.",
  hybrid: "Mix of automated and operator-driven provisioning.",
};

export default async function AdminProvidersPage() {
  // Only admins may view provider configuration (support is excluded by the
  // permission layer). Upstream provider identities stay invisible to customers.
  await requirePermission("providers.read");

  const infraProviders = listInfrastructureProviders().map((code) => {
    const provider = getInfrastructureProvider(code);
    return {
      code,
      mode: provider.mode,
      capabilities: provider.capabilities,
    };
  });

  const paymentProviders = listPaymentProviders();

  return (
    <div>
      <PageHeader
        title="Providers"
        description="Infrastructure and payment adapters. Capabilities reflect what is actually supported — unavailable operations are shown as such, never faked."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Boxes className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">
              Infrastructure providers
            </h2>
          </div>
          <div className="space-y-4">
            {infraProviders.map((p) => {
              const activeCount = CAPABILITY_LABELS.filter(
                ({ key }) => p.capabilities[key],
              ).length;
              return (
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
                  <p className="mt-1 text-xs text-muted-foreground">
                    {MODE_NOTES[p.mode]}
                  </p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    Capabilities ({activeCount}/{CAPABILITY_LABELS.length}{" "}
                    available)
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {CAPABILITY_LABELS.map(({ key, label }) => {
                      const available = p.capabilities[key];
                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center gap-1.5 text-xs",
                            available
                              ? "text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {available ? (
                            <Check className="size-3.5 text-accent" />
                          ) : (
                            <X className="size-3.5 text-muted-foreground" />
                          )}
                          <span
                            className={cn(!available && "line-through")}
                            title={
                              available
                                ? undefined
                                : "Not available with this provider"
                            }
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
