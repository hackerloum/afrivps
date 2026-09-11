/**
 * Core domain types for AfriVPS.
 *
 * These describe the shape of Firestore documents and the safe view-models
 * returned to clients. Internal financial fields (provider cost, margin) are
 * intentionally kept OUT of customer-facing types.
 *
 * The status/enum unions are derived from `as const` arrays so that a single
 * source of truth serves both the type system and runtime validation (Zod
 * schemas, badge maps, seed scripts). Every previously-exported name and shape
 * is preserved — additions here are additive only.
 */

/* -------------------------------------------------------------------------- */
/* Enumerations (single source of truth: const tuple + derived union)         */
/* -------------------------------------------------------------------------- */

export const CURRENCIES = ["TZS", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const STAFF_ROLES = [
  "super_admin",
  "admin",
  "support",
  "finance",
] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const USER_ROLES = ["customer", ...STAFF_ROLES] as const;
export type UserRole = "customer" | StaffRole;

export const PRODUCT_TYPES = [
  "linux_vps",
  "windows_vps",
  "windows_rdp",
  "cpanel",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const BILLING_CYCLES = ["monthly", "quarterly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

export const SERVICE_STATUSES = [
  "pending_payment",
  "paid",
  "awaiting_provisioning",
  "provisioning",
  "active",
  "suspended",
  "expired",
  "cancelled",
  "failed",
] as const;
export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "provisioning",
  "completed",
  "cancelled",
  "failed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "unpaid",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "cancelled",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TICKET_STATUSES = [
  "open",
  "customer_reply",
  "staff_reply",
  "resolved",
  "closed",
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const PROVISIONING_JOB_STATUSES = [
  "queued",
  "processing",
  "awaiting_manual_action",
  "completed",
  "failed",
  "cancelled",
] as const;
export type ProvisioningJobStatus =
  (typeof PROVISIONING_JOB_STATUSES)[number];

export const PROVISIONING_MODES = ["manual", "api", "hybrid"] as const;
export type ProvisioningMode = (typeof PROVISIONING_MODES)[number];

export const PROVIDER_CAPABILITIES = [
  "create",
  "reboot",
  "shutdown",
  "start",
  "reinstall",
  "suspend",
  "unsuspend",
  "terminate",
  "passwordReset",
  "usage",
] as const;
export type ProviderCapability = (typeof PROVIDER_CAPABILITIES)[number];

export const TICKET_DEPARTMENTS = [
  "sales",
  "billing",
  "technical",
  "general",
] as const;
export type TicketDepartment = (typeof TICKET_DEPARTMENTS)[number];

export const TICKET_PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/**
 * Payment methods supported by the initial ManualPaymentProvider (Section 31).
 */
export const PAYMENT_METHODS = [
  "mobile_money",
  "bank_transfer",
  "admin_confirmation",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/* -------------------------------------------------------------------------- */
/* Shared field mixins                                                        */
/* -------------------------------------------------------------------------- */

/** Millisecond epoch timestamps carried by every stored document. */
export interface Timestamps {
  createdAt: number;
  updatedAt: number;
}

/* -------------------------------------------------------------------------- */
/* Identity & people                                                          */
/* -------------------------------------------------------------------------- */

export interface UserProfile {
  uid: string;
  customerReference: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  phone?: string;
  company?: string;
  country?: string;
  city?: string;
  address?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

/**
 * Application-level customer profile (Section 43). The `users` collection holds
 * identity/role; `customers` holds richer billing metadata. Kept intentionally
 * free of authentication secrets — Firebase Auth remains the identity source.
 */
export interface Customer {
  uid: string;
  customerReference: string;
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  country?: string;
  city?: string;
  address?: string;
  /** Optional default billing currency preference. */
  preferredCurrency?: Currency;
  createdAt: number;
  updatedAt: number;
}

/**
 * Safe staff metadata (Section 42). The authoritative role lives in verified
 * custom claims — this document is a convenience mirror for admin listings and
 * MUST NOT be trusted for authorization.
 */
export interface Staff {
  uid: string;
  email: string;
  fullName: string;
  role: StaffRole;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Customer-safe plan view. NOTE: providerId / providerProductId / providerCost
 * are deliberately absent — those live in the server-only `providerProducts`
 * collection and must never reach the browser.
 */
export interface Plan {
  id: string;
  publicReference: string;
  name: string;
  slug: string;
  productType: ProductType;
  description: string;
  cpuCores: number;
  ramMB: number;
  storageGB: number;
  storageType: "nvme" | "ssd" | "hdd";
  bandwidthGB: number;
  portSpeedMbps: number;
  ipv4Count: number;
  ipv6Enabled: boolean;
  supportedOperatingSystems: string[];
  windowsEnabled: boolean;
  locationIds: string[];
  /** Integer minor units (e.g. cents / TZS). */
  monthlyPrice: number;
  quarterlyPrice: number;
  annualPrice: number;
  currency: Currency;
  /** Integer minor units. */
  setupFee: number;
  active: boolean;
  featured: boolean;
  displayOrder: number;
  availability: PlanAvailability;
  createdAt: number;
  updatedAt: number;
}

export const PLAN_AVAILABILITIES = [
  "available",
  "sold_out",
  "coming_soon",
] as const;
export type PlanAvailability = (typeof PLAN_AVAILABILITIES)[number];

/**
 * Server-only cost mapping. Stored in `providerProducts`, never exposed to
 * customer-facing clients.
 */
export interface ProviderProduct {
  id: string;
  planId: string;
  providerId: string;
  providerProductId: string;
  /** Integer minor units. */
  providerCost: number;
  currency: Currency;
  createdAt: number;
  updatedAt: number;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  active: boolean;
  displayOrder: number;
}

export interface OperatingSystem {
  id: string;
  name: string;
  family: "linux" | "windows";
  version: string;
  active: boolean;
}

export interface Provider {
  id: string;
  name: string;
  code: string;
  enabled: boolean;
  provisioningMode: ProvisioningMode;
  supportedProducts: ProductType[];
  priority: number;
  capabilities: ProviderCapability[];
  healthStatus: "healthy" | "degraded" | "down" | "unknown";
  configurationReference?: string;
  createdAt: number;
  updatedAt: number;
}

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

export interface FeatureFlags {
  automaticProvisioning: boolean;
  automaticSuspension: boolean;
  automaticTermination: boolean;
  flutterwavePayments: boolean;
  pesapalPayments: boolean;
  windowsVps: boolean;
  cpanelHosting: boolean;
  coupons: boolean;
  referrals: boolean;
  pushNotifications: boolean;
}

/**
 * Renewal lifecycle windows (Section 34), expressed in whole days. These gate
 * reminder emails and grace periods; automatic provider actions stay disabled
 * behind {@link FeatureFlags} until API automation is validated.
 */
export interface RenewalSettings {
  invoiceLeadDays: number;
  firstReminderDays: number;
  secondReminderDays: number;
  graceDays: number;
  suspensionThresholdDays: number;
  terminationThresholdDays: number;
}

/**
 * The single `systemSettings` document (Section 52 / 34). Server-only writes.
 */
export interface SystemSettings {
  featureFlags: FeatureFlags;
  renewal: RenewalSettings;
  defaultCurrency: Currency;
  /** Percentage gateway fee applied to retail, in basis points (server-only). */
  defaultGatewayFeeBps?: number;
  updatedAt: number;
}

/* -------------------------------------------------------------------------- */
/* Admin / internal financial view-models (Section 46)                        */
/* -------------------------------------------------------------------------- */

/**
 * Internal financial breakdown for a single price point. Built server-side from
 * a {@link Plan} + {@link ProviderProduct}. This DTO is for authorized admins
 * ONLY (support excluded) and must NEVER be serialized to customer clients.
 * All amounts are integer minor units in a single currency.
 */
export interface FinancialBreakdown {
  currency: Currency;
  /** Retail price charged to the customer. */
  retail: number;
  /** Upstream provider (wholesale) cost. */
  providerCost: number;
  /** Payment gateway fee. */
  gatewayFee: number;
  /** retail - providerCost - gatewayFee. */
  grossProfit: number;
  /** Gross margin relative to retail, in basis points (100% = 10000). */
  marginBps: number;
}

/**
 * Admin-facing plan view combining the customer-safe {@link Plan} with the
 * per-cycle financial breakdowns. Server-internal only (Section 46).
 */
export interface AdminPlanView {
  plan: Plan;
  providerId: string;
  providerProductId: string;
  financials: {
    monthly: FinancialBreakdown;
    quarterly: FinancialBreakdown;
    annual: FinancialBreakdown;
  };
}

/* -------------------------------------------------------------------------- */
/* Pagination (Section 47) — no full-collection scans                         */
/* -------------------------------------------------------------------------- */

export type SortDirection = "asc" | "desc";

/** Parameters for a bounded, ordered, cursor-paginated query. */
export interface PageParams {
  /** Max documents to return. Callers MUST always supply a sane bound. */
  limit: number;
  /** Opaque cursor from a previous page's {@link Page.nextCursor}. */
  cursor?: string;
  direction?: SortDirection;
}

/** A single page of results plus an opaque forward cursor. */
export interface Page<T> {
  items: T[];
  /** Cursor to fetch the next page, or null when the page is the last one. */
  nextCursor: string | null;
  hasMore: boolean;
}
