import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        accent: "border-transparent bg-primary-muted text-accent",
        success:
          "border-[color-mix(in_oklab,var(--color-success)_25%,transparent)] bg-primary-muted text-success",
        warning:
          "border-[color-mix(in_oklab,var(--color-warning)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-warning",
        destructive:
          "border-[color-mix(in_oklab,var(--color-destructive)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-destructive)_18%,transparent)] text-destructive",
        info: "border-[color-mix(in_oklab,var(--color-info)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-info)_16%,transparent)] text-info",
        neutral:
          "border-transparent bg-muted text-muted-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
