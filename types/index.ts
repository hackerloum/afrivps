/**
 * Core domain types for AfriVPS.
 *
 * These describe the shape of Firestore documents and the safe view-models
 * returned to clients. Internal financial fields (provider cost, margin) are
 * intentionally kept OUT of customer-facing types.
 */

export type Currency = "TZS" | "USD";

export type StaffRole = "super_admin" | "admin" | "support" | "finance";
export type UserRole = "customer" | StaffRole;

export type ProductType = "linux_vps" | "windows_vps" | "windows_rdp" | "cpanel";

export type BillingCycle = "monthly" | "quarterly" | "annual";

export type ServiceStatus =
  | "pending_payment"
  | "paid"
  | "awaiting_provisioning"
  | "provisioning"
  | "active"
  | "suspended"
  | "expired"
  | "cancelled"
  | "failed";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "provisioning"
  | "completed"
  | "cancelled"
  | "failed";

export type InvoiceStatus =
  | "draft"
  | "unpaid"
  | "paid"
  | "overdue"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled";

export type TicketStatus =
  | "open"
  | "customer_reply"
  | "staff_reply"
  | "resolved"
  | "closed";

export type ProvisioningMode = "manual" | "api" | "hybrid";

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
  availability: "available" | "sold_out" | "coming_soon";
  createdAt: number;
  updatedAt: number;
}

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

export type ProviderCapability =
  | "create"
  | "reboot"
  | "shutdown"
  | "start"
  | "reinstall"
  | "suspend"
  | "unsuspend"
  | "terminate"
  | "passwordReset"
  | "usage";

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
