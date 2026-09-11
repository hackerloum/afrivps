/**
 * Application-service layer (Sections 64, 65).
 *
 * Reusable business services that centralize important state transitions so
 * Firestore mutations never scatter across pages/components. Phase 1 ships the
 * typed contracts and the parts that are genuinely available today (provider/
 * payment delegation via the registries, money-safe invoice totals, and the
 * disabled-by-default credential vault). Persistence-bound methods throw
 * `ServiceNotImplementedError` until their phase.
 */

export * from "./errors";
export * from "./types";

export * from "./order-service";
export * from "./invoice-service";
export * from "./payment-service";
export * from "./provisioning-service";
export * from "./infrastructure-service";
export * from "./notification-service";
export * from "./support-service";
export * from "./audit-service";
export * from "./customer-service";

export * from "./credentials/vault";
