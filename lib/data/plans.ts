import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import type { Plan, ProductType } from "@/types";

/**
 * Server-side plan access. Plans are loaded from Firestore (never hardcoded in
 * components). Only customer-safe fields are returned — provider cost/config is
 * stored separately in `providerProducts` and never fetched here.
 */

const SAFE_FIELDS: (keyof Plan)[] = [
  "id",
  "publicReference",
  "name",
  "slug",
  "productType",
  "description",
  "cpuCores",
  "ramMB",
  "storageGB",
  "storageType",
  "bandwidthGB",
  "portSpeedMbps",
  "ipv4Count",
  "ipv6Enabled",
  "supportedOperatingSystems",
  "windowsEnabled",
  "locationIds",
  "monthlyPrice",
  "quarterlyPrice",
  "annualPrice",
  "currency",
  "setupFee",
  "active",
  "featured",
  "displayOrder",
  "availability",
  "createdAt",
  "updatedAt",
];

function toSafePlan(id: string, data: FirebaseFirestore.DocumentData): Plan {
  const out = { id } as Record<string, unknown>;
  for (const field of SAFE_FIELDS) {
    if (field === "id") continue;
    out[field] = data[field];
  }
  return out as unknown as Plan;
}

export async function getActivePlans(): Promise<Plan[]> {
  const snapshot = await adminDb()
    .collection("plans")
    .where("active", "==", true)
    .get();

  return snapshot.docs
    .map((doc) => toSafePlan(doc.id, doc.data()))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function getPlansByType(type: ProductType): Promise<Plan[]> {
  const plans = await getActivePlans();
  return plans.filter((p) => p.productType === type);
}

/**
 * Non-throwing variants for public pages: if Firestore/emulator is unreachable
 * (e.g. during a build with no emulator running) we render the empty state
 * rather than failing the render.
 */
export async function getActivePlansSafe(): Promise<Plan[]> {
  try {
    return await getActivePlans();
  } catch {
    return [];
  }
}

export async function getPlansByTypeSafe(type: ProductType): Promise<Plan[]> {
  try {
    return await getPlansByType(type);
  } catch {
    return [];
  }
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  const snapshot = await adminDb()
    .collection("plans")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  const first = snapshot.docs[0];
  if (!first) return null;
  return toSafePlan(first.id, first.data());
}
