import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatTrend {
  direction: "up" | "down" | "neutral";
  label: string;
  /** When true, a downward movement is styled as positive (e.g. costs). */
  invert?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  trend?: StatTrend;
  className?: string;
}) {
  const positive = trend
    ? trend.invert
      ? trend.direction === "down"
      : trend.direction === "up"
    : false;

  return (
    <Card
      className={cn(
        "card-hover relative overflow-hidden p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
          <Icon className="size-4 text-accent" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
        {value}
      </p>
      {(trend || hint) && (
      <div className="mt-1 flex items-center gap-2">
        {trend && trend.direction !== "neutral" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
              positive ? "text-success" : "text-destructive",
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {trend.label}
          </span>
        )}
        {trend?.direction === "neutral" && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {trend.label}
          </span>
        )}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      )}
    </Card>
  );
}
