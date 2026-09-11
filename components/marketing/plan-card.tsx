import Link from "next/link";
import { Check, Cpu, HardDrive, MemoryStick, Network } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatMoney, money } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { BillingCycle, Plan } from "@/types";

function priceFor(plan: Plan, cycle: BillingCycle): number {
  switch (cycle) {
    case "monthly":
      return plan.monthlyPrice;
    case "quarterly":
      return plan.quarterlyPrice;
    case "annual":
      return plan.annualPrice;
  }
}

const CYCLE_LABEL: Record<BillingCycle, string> = {
  monthly: "/mo",
  quarterly: "/qtr",
  annual: "/yr",
};

function formatRam(ramMB: number): string {
  return ramMB >= 1024 ? `${ramMB / 1024} GB` : `${ramMB} MB`;
}

export function PlanCard({
  plan,
  cycle = "monthly",
}: {
  plan: Plan;
  cycle?: BillingCycle;
}) {
  const specs = [
    { icon: Cpu, label: `${plan.cpuCores} vCPU` },
    { icon: MemoryStick, label: `${formatRam(plan.ramMB)} RAM` },
    {
      icon: HardDrive,
      label: `${plan.storageGB} GB ${plan.storageType.toUpperCase()}`,
    },
    { icon: Network, label: `${plan.bandwidthGB} GB transfer` },
  ];

  return (
    <Card
      className={cn(
        "relative flex flex-col p-6 transition-colors",
        plan.featured
          ? "border-accent/40 glow-accent"
          : "hover:border-border/80",
      )}
    >
      {plan.featured && (
        <Badge variant="accent" className="absolute -top-2.5 left-6">
          Most popular
        </Badge>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
        {plan.availability !== "available" && (
          <Badge variant="warning">
            {plan.availability === "sold_out" ? "Sold out" : "Coming soon"}
          </Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{plan.description}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight text-foreground">
          {formatMoney(money(priceFor(plan, cycle), plan.currency))}
        </span>
        <span className="text-sm text-muted-foreground">
          {CYCLE_LABEL[cycle]}
        </span>
      </div>
      {plan.setupFee > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          + {formatMoney(money(plan.setupFee, plan.currency))} setup
        </p>
      ) : (
        <p className="mt-1 text-xs text-success">No setup fee</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        {specs.map((spec) => (
          <div
            key={spec.label}
            className="flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2"
          >
            <spec.icon className="size-4 text-accent" />
            <span className="text-xs font-medium text-foreground">
              {spec.label}
            </span>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="size-4 text-accent" />
          {plan.ipv4Count} IPv4{plan.ipv6Enabled ? " + IPv6" : ""}
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-accent" />
          {plan.portSpeedMbps} Mbps port
        </li>
        <li className="flex items-center gap-2">
          <Check className="size-4 text-accent" />
          {plan.windowsEnabled ? "Windows or Linux" : "Linux images"}
        </li>
      </ul>

      <div className="mt-6 flex-1" />
      <Button asChild className="w-full" variant={plan.featured ? "primary" : "secondary"}>
        <Link href={{ pathname: "/register", query: { plan: plan.slug } }}>
          Deploy {plan.name}
        </Link>
      </Button>
    </Card>
  );
}
