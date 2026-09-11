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

/** All staff roles, ordered from most to least privileged (Section 5). */
export const STAFF_ROLE_LIST: readonly StaffRole[] = [
  "super_admin",
  "admin",
  "support",
  "finance",
];

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

/** True when the role holds at least one of the given permissions. */
export function canAny(
  role: UserRole | undefined | null,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => can(role, permission));
}

/** True when the role holds every one of the given permissions. */
export function canAll(
  role: UserRole | undefined | null,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) => can(role, permission));
}

/**
 * The full set of permissions granted to a role. Non-staff roles (e.g.
 * `customer`) always resolve to an empty set — staff capabilities never leak
 * to customers.
 */
export function permissionsForRole(
  role: UserRole | undefined | null,
): ReadonlySet<Permission> {
  if (!isStaffRole(role)) return EMPTY_PERMISSIONS;
  return ROLE_PERMISSIONS[role];
}

/**
 * A serializable snapshot of the role → permissions matrix (Section 5). Useful
 * for admin tooling / documentation. Returns sorted arrays; mutating the result
 * does not affect the underlying policy.
 */
export function getRolePermissionMatrix(): Record<StaffRole, Permission[]> {
  const matrix = {} as Record<StaffRole, Permission[]>;
  for (const role of STAFF_ROLE_LIST) {
    matrix[role] = [...ROLE_PERMISSIONS[role]].sort();
  }
  return matrix;
}

/**
 * Convenience guard for the sensitive internal financial data described in
 * Section 46 (upstream provider cost / margin). Support staff are deliberately
 * excluded; customers can never qualify.
 */
export function canViewProviderCosts(
  role: UserRole | undefined | null,
): boolean {
  return can(role, "provider_costs.read");
}

const EMPTY_PERMISSIONS: ReadonlySet<Permission> = new Set<Permission>();

export class PermissionError extends Error {
  readonly permission: Permission;
  constructor(permission: Permission) {
    super(`Missing permission: ${permission}`);
    this.name = "PermissionError";
    this.permission = permission;
  }
}
