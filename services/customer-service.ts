import type { UserProfile } from "@/types";
import { ServiceNotImplementedError } from "./errors";

/**
 * CustomerService (Sections 43, 65).
 *
 * Manages the application profile that complements Firebase Auth (the identity
 * source of truth). New profiles are always created with `role: "customer"` —
 * staff roles are custom claims changed only by a super_admin server-side
 * (Section 42), never through this path.
 *
 * Phase 1: typed contract + stub. Profile persistence is wired in Phase 2.
 */

export interface CreateCustomerProfileInput {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  country?: string;
  city?: string;
  address?: string;
}

export type UpdateCustomerProfileInput = Partial<
  Omit<CreateCustomerProfileInput, "uid" | "email">
>;

export interface CustomerService {
  createProfile(input: CreateCustomerProfileInput): Promise<UserProfile>;
  getProfile(uid: string): Promise<UserProfile | null>;
  updateProfile(
    uid: string,
    input: UpdateCustomerProfileInput,
  ): Promise<UserProfile>;
}

const SERVICE = "CustomerService";

export class Phase1CustomerService implements CustomerService {
  async createProfile(): Promise<UserProfile> {
    throw new ServiceNotImplementedError(SERVICE, "createProfile", "Phase 2");
  }
  async getProfile(): Promise<UserProfile | null> {
    throw new ServiceNotImplementedError(SERVICE, "getProfile", "Phase 2");
  }
  async updateProfile(): Promise<UserProfile> {
    throw new ServiceNotImplementedError(SERVICE, "updateProfile", "Phase 2");
  }
}
