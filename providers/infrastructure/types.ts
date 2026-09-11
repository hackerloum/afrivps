/**
 * Infrastructure provider abstraction (Sections 24, 66).
 *
 * AfriVPS is NOT coupled to any single upstream provider. All provisioning
 * flows through this interface. The upstream provider (e.g. BearHost) remains
 * invisible to customers.
 */

export type ProviderMode = "manual" | "api" | "hybrid";

export interface ProvisionRequest {
  serviceId: string;
  planProviderProductId?: string;
  hostname: string;
  operatingSystemId: string;
  locationId: string;
  customerReference: string;
}

export interface ProvisionResult {
  providerServiceReference: string;
  status: "provisioned" | "awaiting_manual_action" | "failed";
  ipv4?: string;
  ipv6?: string;
  serverUsername?: string;
  /**
   * Reference to securely-stored credentials. Raw credentials are NEVER
   * returned through this interface (Section 21).
   */
  credentialReference?: string;
  safeMessage?: string;
}

export interface ServiceUsage {
  cpuPercent?: number;
  memoryPercent?: number;
  diskUsedGB?: number;
  bandwidthUsedGB?: number;
}

export interface ProviderCapabilitySet {
  create: boolean;
  reboot: boolean;
  shutdown: boolean;
  start: boolean;
  reinstall: boolean;
  suspend: boolean;
  unsuspend: boolean;
  terminate: boolean;
  resetPassword: boolean;
  usage: boolean;
}

/**
 * The provisioning contract. Implementations that cannot perform an operation
 * (e.g. ManualProvider) must throw `ProviderCapabilityError` rather than
 * pretending to succeed.
 */
export interface InfrastructureProvider {
  readonly code: string;
  readonly mode: ProviderMode;
  readonly capabilities: ProviderCapabilitySet;

  createService(request: ProvisionRequest): Promise<ProvisionResult>;
  getService(providerServiceReference: string): Promise<ProvisionResult>;
  suspendService(providerServiceReference: string): Promise<void>;
  unsuspendService(providerServiceReference: string): Promise<void>;
  terminateService(providerServiceReference: string): Promise<void>;
  rebootService(providerServiceReference: string): Promise<void>;
  shutdownService(providerServiceReference: string): Promise<void>;
  startService(providerServiceReference: string): Promise<void>;
  reinstallService(
    providerServiceReference: string,
    operatingSystemId: string,
  ): Promise<void>;
  resetPassword(providerServiceReference: string): Promise<{
    credentialReference: string;
  }>;
  getUsage(providerServiceReference: string): Promise<ServiceUsage>;
}

export class ProviderCapabilityError extends Error {
  readonly capability: keyof ProviderCapabilitySet;
  constructor(providerCode: string, capability: keyof ProviderCapabilitySet) {
    super(
      `Provider "${providerCode}" does not support capability "${capability}".`,
    );
    this.name = "ProviderCapabilityError";
    this.capability = capability;
  }
}
