import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg";

const MARK_SIZE: Record<LogoSize, string> = {
  sm: "h-7 w-7",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const WORD_SIZE: Record<LogoSize, string> = {
  sm: "text-sm",
  md: "text-[15px]",
  lg: "text-lg",
};

const GLYPH_SIZE: Record<LogoSize, number> = {
  sm: 16,
  md: 18,
  lg: 22,
};

/**
 * AfriVPS wordmark + mark. The mark is an abstract stacked-node motif
 * (interconnected infrastructure) — deliberately no Africa clichés (Section 12).
 */
export function Logo({
  className,
  showWord = true,
  size = "md",
}: {
  className?: string;
  showWord?: boolean;
  size?: LogoSize;
}) {
  const glyph = GLYPH_SIZE[size];
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative inline-flex items-center justify-center rounded-[var(--radius)] border border-border bg-elevated",
          MARK_SIZE[size],
        )}
      >
        <svg
          width={glyph}
          height={glyph}
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
          <circle cx="12" cy="12" r="1.7" fill="var(--color-accent)" />
          <circle cx="3" cy="6.5" r="1.1" fill="var(--color-accent)" opacity="0.9" />
          <circle cx="21" cy="6.5" r="1.1" fill="var(--color-accent)" opacity="0.9" />
        </svg>
        <span className="absolute inset-0 rounded-[var(--radius)] bg-radial-fade" />
      </span>
      {showWord && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            WORD_SIZE[size],
          )}
        >
          Afri<span className="text-accent">VPS</span>
        </span>
      )}
    </span>
  );
}
