import type { StaffRole, UserRole } from "@/types";

/**
 * Centralized, server-side permission layer (Sections 4, 5, 42).
 *
 * Roles come from verified Firebase custom claims — NEVER from client input.
 * This module maps roles to capabilities so role checks are not scattered
 * throughout components.
 */

export type Permission =
  | "customers.read"
  | "customers.manage"
  | "orders.read"
  | "orders.manage"
  | "services.read"
  | "services.manage"
  | "provisioning.manage"
  | "products.manage"
  | "plans.manage"
  | "invoices.read"
  | "invoices.manage"
  | "payments.read"
  | "payments.manage"
  | "providers.read"
  | "providers.manage"
  | "provider_costs.read"
  | "discounts.manage"
  | "support.read"
  | "support.manage"
  | "audit.read"
  | "settings.manage"
  | "staff.manage";

const ROLE_PERMISSIONS: Record<StaffRole, ReadonlySet<Permission>> = {
  super_admin: new Set<Permission>([
    "customers.read",
    "customers.manage",
    "orders.read",
    "orders.manage",
    "services.read",
    "services.manage",
    "provisioning.manage",
    "products.manage",
    "plans.manage",
    "invoices.read",
    "invoices.manage",
    "payments.read",
    "payments.manage",
    "providers.read",
    "providers.manage",
    "provider_costs.read",
    "discounts.manage",
    "support.read",
    "support.manage",
    "audit.read",
    "settings.manage",
    "staff.manage",
  ]),
  admin: new Set<Permission>([
    "customers.read",
    "customers.manage",
    "orders.read",
    "orders.manage",
    "services.read",
    "services.manage",
    "provisioning.manage",
    "products.manage",
    "plans.manage",
    "invoices.read",
    "invoices.manage",
    "payments.read",
    "providers.read",
    "provider_costs.read",
    "discounts.manage",
    "support.read",
    "support.manage",
    "audit.read",
  ]),
  support: new Set<Permission>([
    "customers.read",
    "services.read",
    "support.read",
    "support.manage",
  ]),
  finance: new Set<Permission>([
    "invoices.read",
    "invoices.manage",
    "payments.read",
    "payments.manage",
    "provider_costs.read",
  ]),
};

const STAFF_ROLES: ReadonlySet<UserRole> = new Set<UserRole>([
  "super_admin",
  "admin",
  "support",
  "finance",
]);

export function isStaffRole(role: UserRole | undefined | null): role is StaffRole {
  return role != null && STAFF_ROLES.has(role);
}

export function can(
  role: UserRole | undefined | null,
  permission: Permission,
): boolean {
  if (!isStaffRole(role)) return false;
  return ROLE_PERMISSIONS[role].has(permission);
}

export function assertCan(
  role: UserRole | undefined | null,
  permission: Permission,
): void {
  if (!can(role, permission)) {
    throw new PermissionError(permission);
  }
}

export class PermissionError extends Error {
  readonly permission: Permission;
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "PermissionError";
    this.permission = permission;
  }
}
