import { cn } from "@/lib/utils";

/**
 * Base skeleton block with an animated shimmer (Section 13). Respects
 * `prefers-reduced-motion` (see `.skeleton-shimmer` in globals.css).
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "skeleton-shimmer rounded-[var(--radius)]",
        className,
      )}
      {...props}
    />
  );
}

/** Multi-line text placeholder; the last line is shortened for realism. */
function SkeletonText({
  lines = 3,
  className,
  ...props
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonText };
