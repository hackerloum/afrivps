"use client";

import * as React from "react";
import { ServerCrash } from "lucide-react";

import { PlanCard } from "@/components/marketing/plan-card";
import { cn } from "@/lib/utils";
import type { BillingCycle, Plan } from "@/types";

const CYCLES: { value: BillingCycle; label: string; note?: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual", note: "Best value" },
];

export function PricingPlans({ plans }: { plans: Plan[] }) {
  const [cycle, setCycle] = React.useState<BillingCycle>("monthly");

  if (plans.length === 0) {
    return <EmptyPlans />;
  }

  return (
    <div>
      <div className="inline-flex rounded-[var(--radius)] border border-border bg-surface p-1">
        {CYCLES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => setCycle(c.value)}
            className={cn(
              "rounded-[calc(var(--radius)-2px)] px-4 py-1.5 text-sm font-medium transition-colors",
              cycle === c.value
                ? "bg-elevated text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {c.label}
            {c.note && (
              <span className="ml-1.5 text-[10px] font-semibold uppercase text-accent">
                {c.note}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} />
        ))}
      </div>
    </div>
  );
}

export function EmptyPlans() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full border border-border bg-elevated">
        <ServerCrash className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">
        No plans published yet
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Plans are managed in Firestore. Run the development seed script to load
        demo plans into the emulator.
      </p>
      <code className="mt-4 rounded-[var(--radius)] border border-border bg-background px-3 py-1.5 text-xs text-accent">
        pnpm seed
      </code>
    </div>
  );
}
