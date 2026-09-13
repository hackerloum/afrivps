import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Derive up to two uppercase initials from a name or email — used for compact
 * avatars in the app shell. Falls back gracefully for single words / emails.
 */
export function initials(value: string): string {
  const source = (value.includes("@") ? value.split("@")[0] : value) ?? value;
  const parts = source
    .split(/[\s._-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const first = parts[0];
  if (!first) return "?";
  const last = parts.length > 1 ? parts[parts.length - 1] : undefined;
  if (!last) return first.slice(0, 2).toUpperCase();
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

/**
 * Shared keyboard focus-ring classes for bespoke interactive elements that are
 * not built on the Button/Input primitives. Keeps focus styling consistent and
 * accessible (Section 13 / a11y).
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
