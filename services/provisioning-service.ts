import { ServiceNotImplementedError } from "./errors";
import type { ProvisioningJob, ProvisioningJobStatus } from "./types";

/**
 * ProvisioningService (Sections 25, 26, 65).
 *
 * Owns the `provisioningJobs` lifecycle. Provisioning MUST be idempotent: a
 * duplicate webhook, API retry, page refresh, or function retry must never
 * create multiple servers (Section 26). Callers therefore pass an
 * `idempotencyKey`; the implementation (Phase 3) upserts on it inside a
 * transaction.
 *
 * ManualProvider is the launch path: a job is created `awaiting_manual_action`
 * and an operator completes it via the admin panel, which flips the service to
 * active, updates the order, notifies the customer, and writes an audit log
 * (Section 25). This service is the single place those transitions happen.
 *
 * Phase 1: typed contract + stubs. Firestore transactions land in Phase 3.
 */

export interface EnqueueProvisioningInput {
  orderId: string;
  serviceId: string;
  providerId: string;
  /** Guarantees idempotent creation (Section 26). */
  idempotencyKey: string;
}

export interface CompleteManualProvisioningInput {
  jobId: string;
  serviceId: string;
  hostname: string;
  ipv4?: string;
  ipv6?: string;
  operatingSystemId: string;
  serverUsername?: string;
  /** Opaque vault handle — never the raw password (Section 21). */
  credentialReference?: string;
  providerServiceReference: string;
  startDate: number;
  nextBillingDate: number;
  /** Internal operator notes (never surfaced to customers, Section 77). */
  internalNotes?: string;
}

export interface ProvisioningService {
  /** Idempotently create/return a provisioning job for an order+service. */
  enqueue(input: EnqueueProvisioningInput): Promise<ProvisioningJob>;
  getJob(jobId: string): Promise<ProvisioningJob | null>;
  transition(
    jobId: string,
    next: ProvisioningJobStatus,
    safeErrorMessage?: string,
  ): Promise<ProvisioningJob>;
  /** Operator finishes manual provisioning and activates the service. */
  completeManualProvisioning(
    input: CompleteManualProvisioningInput,
  ): Promise<ProvisioningJob>;
}

const SERVICE = "ProvisioningService";

export class Phase1ProvisioningService implements ProvisioningService {
  async enqueue(): Promise<ProvisioningJob> {
    throw new ServiceNotImplementedError(SERVICE, "enqueue", "Phase 3");
  }
  async getJob(): Promise<ProvisioningJob | null> {
    throw new ServiceNotImplementedError(SERVICE, "getJob", "Phase 3");
  }
  async transition(): Promise<ProvisioningJob> {
    throw new ServiceNotImplementedError(SERVICE, "transition", "Phase 3");
  }
  async completeManualProvisioning(): Promise<ProvisioningJob> {
    throw new ServiceNotImplementedError(
      SERVICE,
      "completeManualProvisioning",
      "Phase 3",
    );
  }
}
