import * as React from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Centralized status system (Section 51). Every domain status — services,
 * orders, invoices, payments, tickets, provider health and plan availability —
 * resolves to a single, consistent badge style and label here, so status
 * presentation never drifts between the customer panel, admin, and public site.
 *
 * The status union is derived from the map keys, giving compile-time safety
 * while accepting the narrower domain unions (ServiceStatus, InvoiceStatus, …)
 * defined in `@/types`.
 */

type Variant = NonNullable<BadgeProps["variant"]>;

interface StatusMeta {
  label: string;
  variant: Variant;
  /** In-progress states get a gently pulsing indicator dot. */
  active?: boolean;
}

const STATUS_META = {
  // Services / orders lifecycle
  pending_payment: { label: "Pending payment", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  awaiting_provisioning: { label: "Awaiting provisioning", variant: "info" },
  provisioning: { label: "Provisioning", variant: "info", active: true },
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "warning" },
  expired: { label: "Expired", variant: "neutral" },
  cancelled: { label: "Cancelled", variant: "neutral" },
  failed: { label: "Failed", variant: "destructive" },
  completed: { label: "Completed", variant: "success" },

  // Invoices
  draft: { label: "Draft", variant: "neutral" },
  unpaid: { label: "Unpaid", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
  refunded: { label: "Refunded", variant: "neutral" },

  // Payments
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "info", active: true },

  // Support tickets
  open: { label: "Open", variant: "info" },
  customer_reply: { label: "Customer reply", variant: "warning" },
  staff_reply: { label: "Staff reply", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
  closed: { label: "Closed", variant: "neutral" },

  // Provider health
  healthy: { label: "Healthy", variant: "success" },
  degraded: { label: "Degraded", variant: "warning" },
  down: { label: "Down", variant: "destructive" },
  unknown: { label: "Unknown", variant: "neutral" },

  // Plan availability
  available: { label: "Available", variant: "success" },
  sold_out: { label: "Sold out", variant: "warning" },
  coming_soon: { label: "Coming soon", variant: "info" },
} satisfies Record<string, StatusMeta>;

export type StatusValue = keyof typeof STATUS_META;

const DOT_CLASS: Record<Variant, string> = {
  default: "bg-muted-foreground",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  neutral: "bg-muted-foreground",
  outline: "bg-muted-foreground",
};

/** Resolve the presentation metadata for a status (label + variant). */
export function statusMeta(status: StatusValue): StatusMeta {
  return STATUS_META[status];
}

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  status: StatusValue;
  /** Override the derived label (e.g. localized copy). */
  label?: string;
  /** Show the leading indicator dot. Defaults to true. */
  dot?: boolean;
}

export function StatusBadge({
  status,
  label,
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const meta: StatusMeta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className} {...props}>
      {dot && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            DOT_CLASS[meta.variant],
            meta.active && "animate-pulse",
          )}
        />
      )}
      {label ?? meta.label}
    </Badge>
  );
}
