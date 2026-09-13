import { ServiceNotImplementedError } from "./errors";
import type { AuditLogEntry } from "./types";

/**
 * AuditService (Section 41, 65).
 *
 * Writes immutable-like administrative audit records for sensitive actions
 * (payment edited, invoice status changed, service activated/suspended/
 * terminated, plan price changed, provider changed, staff role changed).
 *
 * Audit records MUST NOT contain passwords, API tokens, provider credentials,
 * payment secret keys, or server login credentials (Section 41) — only
 * sanitized `safeMetadata`. Audit logs have no client write access (Section 10).
 *
 * Phase 1: typed contract + stub. Audit logging lands in Phase 4.
 */

export interface RecordAuditInput {
  actorUid: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ip?: string;
  safeMetadata?: Record<string, string | number | boolean>;
}

export interface AuditService {
  record(input: RecordAuditInput): Promise<AuditLogEntry>;
}

const SERVICE = "AuditService";

export class Phase1AuditService implements AuditService {
  async record(): Promise<AuditLogEntry> {
    throw new ServiceNotImplementedError(SERVICE, "record", "Phase 4");
  }
}
