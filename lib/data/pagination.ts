import type { Page } from "@/types";

/**
 * Cursor-pagination helpers (Section 47).
 *
 * Cursors are opaque, URL-safe base64 encodings of the ordered field values
 * that a Firestore `startAfter(...)` needs. They are pure/serializable so they
 * can round-trip through query strings and server-action arguments. This module
 * has NO Firebase dependency and is safe to import anywhere.
 */

/** Primitive values that may appear in an orderBy cursor. */
export type CursorValue = string | number | boolean;

function toBase64Url(input: string): string {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(input, "utf8").toString("base64")
      : btoa(input);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  return typeof Buffer !== "undefined"
    ? Buffer.from(b64, "base64").toString("utf8")
    : atob(b64);
}

/** Encode ordered cursor values into an opaque token. */
export function encodeCursor(values: readonly CursorValue[]): string {
  return toBase64Url(JSON.stringify(values));
}

/** Decode an opaque cursor token, or null when malformed. */
export function decodeCursor(cursor: string): CursorValue[] | null {
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(cursor));
    if (!Array.isArray(parsed)) return null;
    if (
      !parsed.every(
        (v) =>
          typeof v === "string" ||
          typeof v === "number" ||
          typeof v === "boolean",
      )
    ) {
      return null;
    }
    return parsed as CursorValue[];
  } catch {
    return null;
  }
}

/** An empty, terminal page. */
export function emptyPage<T>(): Page<T> {
  return { items: [], nextCursor: null, hasMore: false };
}

/**
 * Build a page from `limit + 1` fetched rows. Callers should over-fetch by one
 * to detect `hasMore` without a second round-trip. `deriveCursor` maps the last
 * returned item to its ordered cursor values.
 */
export function buildPage<T>(
  rows: readonly T[],
  limit: number,
  deriveCursor: (item: T) => readonly CursorValue[],
): Page<T> {
  if (limit <= 0) return emptyPage<T>();
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : [...rows];
  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last !== undefined ? encodeCursor(deriveCursor(last)) : null;
  return { items, nextCursor, hasMore };
}
