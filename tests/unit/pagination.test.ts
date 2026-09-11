import { describe, expect, it } from "vitest";

import {
  buildPage,
  decodeCursor,
  emptyPage,
  encodeCursor,
} from "@/lib/data/pagination";

describe("pagination cursors", () => {
  it("round-trips ordered cursor values", () => {
    const cursor = encodeCursor([5, "plan_x", true]);
    expect(decodeCursor(cursor)).toEqual([5, "plan_x", true]);
  });

  it("returns null for malformed cursors", () => {
    expect(decodeCursor("!!!not-base64!!!")).toBeNull();
    expect(decodeCursor(encodeCursor([]))).toEqual([]);
  });

  it("produces a URL-safe token", () => {
    const cursor = encodeCursor(["a/b+c=d"]);
    expect(cursor).not.toMatch(/[+/=]/);
  });
});

describe("buildPage", () => {
  const rows = [
    { id: "a", order: 1 },
    { id: "b", order: 2 },
    { id: "c", order: 3 },
  ];

  it("detects more pages when over-fetched and trims the extra row", () => {
    const page = buildPage(rows, 2, (item) => [item.order, item.id]);
    expect(page.items.map((i) => i.id)).toEqual(["a", "b"]);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe(encodeCursor([2, "b"]));
  });

  it("marks the last page with no cursor", () => {
    const page = buildPage(rows, 5, (item) => [item.order, item.id]);
    expect(page.items).toHaveLength(3);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
  });

  it("returns an empty page for non-positive limits", () => {
    expect(buildPage(rows, 0, (item) => [item.id])).toEqual(emptyPage());
  });
});
