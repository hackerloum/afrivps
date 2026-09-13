import "server-only";

import type { Query } from "firebase-admin/firestore";

import type { Page, SortDirection } from "@/types";
import {
  buildPage,
  decodeCursor,
  emptyPage,
  type CursorValue,
} from "@/lib/data/pagination";

/**
 * Server-side, bounded, cursor-paginated Firestore reads (Section 47).
 *
 * Enforces `orderBy` + `limit` (+ `startAfter` for cursors) so privileged
 * datasets are never fully scanned or filtered in memory. Over-fetches one row
 * to compute `hasMore` without a second round-trip.
 */

export interface OrderByClause {
  field: string;
  direction?: SortDirection;
}

export interface PaginateOptions<T> {
  orderBy: OrderByClause[];
  limit: number;
  cursor?: string;
  /** Map a Firestore document to the returned item. */
  map: (id: string, data: FirebaseFirestore.DocumentData) => T;
  /**
   * Extract the ordered cursor values from an item, in the SAME order as
   * `orderBy`. Used to build the next-page cursor.
   */
  cursorFields: (item: T) => readonly CursorValue[];
}

export async function paginateQuery<T>(
  baseQuery: Query,
  options: PaginateOptions<T>,
): Promise<Page<T>> {
  const { orderBy, limit, cursor, map, cursorFields } = options;
  if (limit <= 0 || orderBy.length === 0) return emptyPage<T>();

  let query: Query = baseQuery;
  for (const clause of orderBy) {
    query = query.orderBy(clause.field, clause.direction ?? "asc");
  }

  if (cursor) {
    const values = decodeCursor(cursor);
    if (values && values.length === orderBy.length) {
      query = query.startAfter(...values);
    }
  }

  // Over-fetch by one to detect a further page.
  const snapshot = await query.limit(limit + 1).get();
  const rows = snapshot.docs.map((doc) => map(doc.id, doc.data()));
  return buildPage(rows, limit, cursorFields);
}
