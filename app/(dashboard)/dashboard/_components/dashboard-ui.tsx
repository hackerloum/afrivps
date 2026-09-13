import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { StatCard } from "@/components/shell/stat-card";
import { cn } from "@/lib/utils";

/**
 * Small, dashboard-local presentation helpers shared across the customer
 * control-panel pages. These compose the shared shell/UI primitives
 * (owned by other sections) and add no business logic.
 */

export function SectionHeading({
  icon: Icon,
  title,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {Icon && <Icon className="size-4 text-accent" />}
        {title}
      </h2>
      {action}
    </div>
  );
}

/**
 * A stat tile that links to its detail section. Wraps the shared `StatCard`
 * so keyboard focus and hover affordances stay consistent.
 */
export function StatLink({
  href,
  label,
  value,
  icon,
  hint,
}: {
  href: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-[var(--radius)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <StatCard
        label={label}
        value={value}
        icon={icon}
        hint={hint}
        className="h-full transition-colors group-hover:border-accent/40"
      />
    </Link>
  );
}
