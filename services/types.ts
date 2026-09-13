/**
 * Service-layer entity shapes (Section 65).
 *
 * These compose the CANONICAL enums/value types exported from `@/types`
 * (`OrderStatus`, `InvoiceStatus`, `Currency`, `BillingCycle`, ...) — they do
 * not redefine them. They describe the documents the application-service layer
 * reads/writes so the Phase 1 service contracts are fully typed.
 *
 * CROSS-AREA NOTE: the full document interfaces (Order, Invoice, Payment,
 * ServiceRecord, ProvisioningJob, SupportTicket, Notification, AuditLogEntry)
 * are not yet present in `types/**`. When the domain-types owner adds them,
 * these should be promoted/consolidated there and re-imported here.
 *
 * MONEY: all monetary fields are INTEGER minor units (see `lib/money.ts`).
 * INTERNAL FINANCIALS: provider cost / margin never appear on customer-facing
 * shapes and are intentionally absent here (Sections 18, 46, 77).
 */

import type {
  BillingCycle,
  Currency,
  InvoiceStatus,
  OrderStatus,
  PaymentStatus,
  ProductType,
  ProvisioningMode,
  ServiceStatus,
  TicketStatus,
} from "@/types";

export interface Order {
  id: string;
  orderReference: string;
  customerId: string;
  planId: string;
  productType: ProductType;
  billingCycle: BillingCycle;
  operatingSystemId: string;
  locationId: string;
  hostname: string;
  /** Server-computed retail total, integer minor units. */
  amount: number;
  currency: Currency;
  status: OrderStatus;
  invoiceId?: string;
  discountCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  /** Integer minor units. */
  unitAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  orderId: string;
  items: InvoiceLineItem[];
  /** All integer minor units. */
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: Currency;
  status: InvoiceStatus;
  issueDate: number;
  dueDate: number;
  paidAt?: number;
  transactionReference?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Payment {
  id: string;
  paymentReference: string;
  customerId: string;
  orderId: string;
  invoiceId: string;
  /** Registry code, e.g. "manual" | "flutterwave" | "pesapal". */
  provider: string;
  /** e.g. "mobile_money" | "bank_transfer" | "admin_confirmation". */
  method: string;
  transactionReference?: string;
  /** Integer minor units. */
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentDate?: number;
  /** UID of the staff member who verified a manual payment. */
  verifiedBy?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceRecord {
  id: string;
  serviceReference: string;
  customerId: string;
  orderId: string;
  productId: string;
  planId: string;
  hostname: string;
  operatingSystemId: string;
  locationId: string;
  ipv4?: string;
  ipv6?: string;
  serverUsername?: string;
  /** Opaque handle into the secure credential vault — never the raw secret. */
  credentialReference?: string;
  status: ServiceStatus;
  startDate?: number;
  nextBillingDate?: number;
  expiryDate?: number;
  billingCycle: BillingCycle;
  /** Integer minor units. */
  renewalAmount: number;
  currency: Currency;
  /** Internal-only upstream linkage; never returned to customers (Section 77). */
  providerId?: string;
  providerServiceReference?: string;
  createdAt: number;
  updatedAt: number;
}

export type ProvisioningJobStatus =
  | "queued"
  | "processing"
  | "awaiting_manual_action"
  | "completed"
  | "failed"
  | "cancelled";

export interface ProvisioningJob {
  id: string;
  jobReference: string;
  orderId: string;
  serviceId: string;
  providerId: string;
  providerMode: ProvisioningMode;
  status: ProvisioningJobStatus;
  attemptCount: number;
  providerReference?: string;
  errorCode?: string;
  /** Customer-safe error text only — never provider internals (Section 58). */
  safeErrorMessage?: string;
  /** Dedupe key guaranteeing idempotent provisioning (Section 26). */
  idempotencyKey: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export type TicketDepartment =
  | "sales"
  | "billing"
  | "technical"
  | "general";

export interface SupportTicket {
  id: string;
  ticketReference: string;
  customerId: string;
  serviceId?: string;
  department: TicketDepartment;
  subject: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: TicketStatus;
  assignedStaffId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorUid: string;
  authorRole: "customer" | "staff";
  body: string;
  attachmentPaths?: string[];
  createdAt: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ip?: string;
  /** Sanitized metadata ONLY — never secrets/credentials (Section 41). */
  safeMetadata?: Record<string, string | number | boolean>;
  timestamp: number;
}
