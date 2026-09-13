import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Minimal loading indicator for buttons and inline async states. Uses the
 * Lucide spinner so it stays visually consistent with the rest of the icon set.
 */
export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <Loader2 className={cn("size-4 animate-spin text-current", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
