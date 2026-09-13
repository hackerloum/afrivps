import { z } from "zod";

import {
  BILLING_CYCLES,
  CURRENCIES,
  INVOICE_STATUSES,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCT_TYPES,
  PROVIDER_CAPABILITIES,
  PROVISIONING_JOB_STATUSES,
  PROVISIONING_MODES,
  SERVICE_STATUSES,
  STAFF_ROLES,
  TICKET_DEPARTMENTS,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  USER_ROLES,
} from "@/types";

/**
 * Shared Zod primitives for AfriVPS domain validation.
 *
 * Enum schemas are built directly from the `as const` arrays exported by
 * `@/types`, keeping the type system, runtime validation and seed data in
 * lock-step (a change to a status list only needs editing once).
 */

export const currencySchema = z.enum(CURRENCIES);
export const staffRoleSchema = z.enum(STAFF_ROLES);
export const userRoleSchema = z.enum(USER_ROLES);
export const productTypeSchema = z.enum(PRODUCT_TYPES);
export const billingCycleSchema = z.enum(BILLING_CYCLES);
export const serviceStatusSchema = z.enum(SERVICE_STATUSES);
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export const invoiceStatusSchema = z.enum(INVOICE_STATUSES);
export const paymentStatusSchema = z.enum(PAYMENT_STATUSES);
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export const ticketStatusSchema = z.enum(TICKET_STATUSES);
export const ticketDepartmentSchema = z.enum(TICKET_DEPARTMENTS);
export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES);
export const provisioningModeSchema = z.enum(PROVISIONING_MODES);
export const provisioningJobStatusSchema = z.enum(PROVISIONING_JOB_STATUSES);
export const providerCapabilitySchema = z.enum(PROVIDER_CAPABILITIES);

/** Integer minor units — the ONLY accepted representation of money. */
export const minorUnitsSchema = z
  .number()
  .int("Money must be stored as integer minor units");

/** Non-negative integer minor units (prices, fees). */
export const nonNegativeMinorUnitsSchema = minorUnitsSchema.min(
  0,
  "Amount cannot be negative",
);

/** Millisecond epoch timestamp. */
export const timestampSchema = z.number().int().nonnegative();

export const timestampsSchema = z.object({
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

/** Slug: lowercase alphanumerics and dashes. */
export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug");

/** Human-readable reference token, e.g. `AF-CUS-X9A72`. */
export const referenceSchema = z
  .string()
  .regex(/^AF-[A-Z]{3}-[0-9A-HJKMNP-TV-Z]+$/, "Invalid reference");

/** Sequential invoice number, e.g. `AFV-2026-000142`. */
export const invoiceNumberSchema = z
  .string()
  .regex(/^AFV-\d{4}-\d{6}$/, "Invalid invoice number");

/* -------------------------------------------------------------------------- */
/* Pagination (Section 47)                                                    */
/* -------------------------------------------------------------------------- */

export const sortDirectionSchema = z.enum(["asc", "desc"]);

/**
 * Query parameters for cursor pagination. `limit` is always bounded so callers
 * can never trigger a full-collection scan.
 */
export const pageParamsSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  direction: sortDirectionSchema.optional(),
});

export type PageParamsInput = z.input<typeof pageParamsSchema>;
export type PageParamsParsed = z.output<typeof pageParamsSchema>;
