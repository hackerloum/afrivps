import {
  ProviderCapabilityError,
  type InfrastructureProvider,
  type ProviderCapabilitySet,
  type ProvisionRequest,
  type ProvisionResult,
  type ServiceUsage,
} from "./types";

/**
 * ManualProvider (Section 25).
 *
 * Fully functional at launch: provisioning is completed by a human operator via
 * the admin panel. Remote control operations are NOT supported and must throw
 * rather than fake success — the UI surfaces this to customers honestly.
 */
export class ManualProvider implements InfrastructureProvider {
  readonly code = "manual";
  readonly mode = "manual" as const;

  readonly capabilities: ProviderCapabilitySet = {
    create: true, // via human operator
    reboot: false,
    shutdown: false,
    start: false,
    reinstall: false,
    suspend: true, // operator-driven
    unsuspend: true, // operator-driven
    terminate: true, // operator-driven
    resetPassword: false,
    usage: false,
  };

  async createService(request: ProvisionRequest): Promise<ProvisionResult> {
    // Manual provisioning does not auto-create a server. It queues the job for
    // a human operator to complete through the admin panel.
    return {
      providerServiceReference: "",
      status: "awaiting_manual_action",
      safeMessage:
        `Manual provisioning queued for ${request.hostname}. An operator will complete setup.`,
    };
  }

  async getService(): Promise<ProvisionResult> {
    return {
      providerServiceReference: "",
      status: "awaiting_manual_action",
      safeMessage: "Managed manually by AfriVPS operations.",
    };
  }

  async suspendService(): Promise<void> {
    // Operator performs the suspension out-of-band; no automated action here.
  }

  async unsuspendService(): Promise<void> {
    // Operator performs the reactivation out-of-band.
  }

  async terminateService(): Promise<void> {
    // Operator performs the termination out-of-band.
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
