import { z } from "zod";

import {
  currencySchema,
  nonNegativeMinorUnitsSchema,
  productTypeSchema,
  provisioningModeSchema,
  providerCapabilitySchema,
  referenceSchema,
  slugSchema,
  timestampSchema,
} from "@/schemas/common";

/**
 * Catalog schemas (Section 17). Validate documents at the trust boundary before
 * they are written to Firestore or trusted from an untyped source.
 *
 * NOTE: the customer-safe {@link planSchema} deliberately does NOT include
 * provider cost/id — that lives in `providerProducts` ({@link providerProductSchema}).
 */

export const storageTypeSchema = z.enum(["nvme", "ssd", "hdd"]);
export const planAvailabilitySchema = z.enum([
  "available",
  "sold_out",
  "coming_soon",
]);

export const planSchema = z.object({
  id: z.string().min(1),
  publicReference: z.string().min(1),
  name: z.string().min(1).max(120),
  slug: slugSchema,
  productType: productTypeSchema,
  description: z.string().max(2000),
  cpuCores: z.number().int().positive(),
  ramMB: z.number().int().positive(),
  storageGB: z.number().int().positive(),
  storageType: storageTypeSchema,
  bandwidthGB: z.number().int().nonnegative(),
  portSpeedMbps: z.number().int().positive(),
  ipv4Count: z.number().int().nonnegative(),
  ipv6Enabled: z.boolean(),
  supportedOperatingSystems: z.array(z.string().min(1)),
  windowsEnabled: z.boolean(),
  locationIds: z.array(z.string().min(1)),
  monthlyPrice: nonNegativeMinorUnitsSchema,
  quarterlyPrice: nonNegativeMinorUnitsSchema,
  annualPrice: nonNegativeMinorUnitsSchema,
  currency: currencySchema,
  setupFee: nonNegativeMinorUnitsSchema,
  active: z.boolean(),
  featured: z.boolean(),
  displayOrder: z.number().int(),
  availability: planAvailabilitySchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type PlanInput = z.infer<typeof planSchema>;

/** Server-only cost mapping — never sent to customer clients. */
export const providerProductSchema = z.object({
  id: z.string().min(1),
  planId: z.string().min(1),
  providerId: z.string().min(1),
  providerProductId: z.string().min(1),
  providerCost: nonNegativeMinorUnitsSchema,
  currency: currencySchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const locationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1).max(16),
  country: z.string().min(1),
  city: z.string().min(1),
  active: z.boolean(),
  displayOrder: z.number().int(),
});

export const operatingSystemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  family: z.enum(["linux", "windows"]),
  version: z.string().min(1),
  active: z.boolean(),
});

export const providerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  enabled: z.boolean(),
  provisioningMode: provisioningModeSchema,
  supportedProducts: z.array(productTypeSchema),
  priority: z.number().int(),
  capabilities: z.array(providerCapabilitySchema),
  healthStatus: z.enum(["healthy", "degraded", "down", "unknown"]),
  configurationReference: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

/** Guard: catalog references match the AF- reference format when present. */
export const publicReferenceSchema = referenceSchema.or(z.string().min(1));
