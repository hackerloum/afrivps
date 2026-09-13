import {
  ProviderCapabilityError,
  type InfrastructureProvider,
  type ProviderCapabilitySet,
  type ProvisionResult,
  type ServiceUsage,
} from "./types";

/**
 * BearHostProvider — SAFE PLACEHOLDER ONLY (Sections 24, 66, 76).
 *
 * BearHost reseller API access is NOT yet available. This adapter deliberately
 * contains NO invented endpoints, authentication schemes, or request/response
 * shapes. Every operation throws `NotImplementedError` until official BearHost
 * API documentation is provided.
 *
 * DO NOT add fabricated BearHost URLs, headers, or payloads here.
 */
export class BearHostProvider implements InfrastructureProvider {
  readonly code = "bearhost";
  readonly mode = "api" as const;

  // Until the real API is integrated, no capability is actually available.
  readonly capabilities: ProviderCapabilitySet = {
    create: false,
    reboot: false,
    shutdown: false,
    start: false,
    reinstall: false,
    suspend: false,
    unsuspend: false,
    terminate: false,
    resetPassword: false,
    usage: false,
  };

  private unavailable(operation: string): never {
    throw new NotImplementedError(operation);
  }

  async createService(): Promise<ProvisionResult> {
    this.unavailable("createService");
  }
  async getService(): Promise<ProvisionResult> {
    this.unavailable("getService");
  }
  async suspendService(): Promise<void> {
    this.unavailable("suspendService");
  }
  async unsuspendService(): Promise<void> {
    this.unavailable("unsuspendService");
  }
  async terminateService(): Promise<void> {
    this.unavailable("terminateService");
  }
  async rebootService(): Promise<void> {
    throw new ProviderCapabilityError(this.code, "reboot");
  }
  async shutdownService(): Promise<void> {
    throw new ProviderCapabilityError(this.code, "shutdown");
  }
  async startService(): Promise<void> {
    throw new ProviderCapabilityError(this.code, "start");
  }
  async reinstallService(): Promise<void> {
    throw new ProviderCapabilityError(this.code, "reinstall");
  }
  async resetPassword(): Promise<{ credentialReference: string }> {
    throw new ProviderCapabilityError(this.code, "resetPassword");
  }
  async getUsage(): Promise<ServiceUsage> {
    throw new ProviderCapabilityError(this.code, "usage");
  }
}

export class NotImplementedError extends Error {
  constructor(operation: string) {
    super(
      `BearHost API is not yet available. "${operation}" will be implemented once official BearHost API documentation is provided.`,
    );
    this.name = "NotImplementedError";
  }
}
