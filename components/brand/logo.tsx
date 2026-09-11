import { cn } from "@/lib/utils";

/**
 * AfriVPS wordmark + mark. The mark is an abstract stacked-node motif
 * (interconnected infrastructure) — no Africa clichés (Section 12).
 */
export function Logo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 2 3 6.5v11L12 22l9-4.5v-11L12 2Z"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M12 12 3 6.5M12 12l9-5.5M12 12v10"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <circle cx="12" cy="12" r="1.6" fill="var(--color-accent)" />
        </svg>
        <span className="absolute inset-0 rounded-[var(--radius)] bg-radial-fade" />
      </span>
      {showWord && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Afri<span className="text-accent">VPS</span>
        </span>
      )}
    </span>
  );
}
