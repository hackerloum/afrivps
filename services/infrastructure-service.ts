import {
  getInfrastructureProvider,
  type InfrastructureProvider,
  type ProviderCapabilitySet,
  type ProvisionRequest,
  type ProvisionResult,
  type ServiceUsage,
} from "@/providers/infrastructure";
import { getCredentialVault, type CredentialVault } from "./credentials/vault";

/**
 * InfrastructureService (Sections 24, 66, 65).
 *
 * Application-facing wrapper over the provider-agnostic InfrastructureProvider
 * registry. Business code calls this service and never hardcodes an upstream
 * provider (BearHost stays invisible to customers, Section 77). Unsupported
 * operations propagate `ProviderCapabilityError` / `NotImplementedError` rather
 * than faking success.
 *
 * This is a real Phase 1 wrapper: the provider abstraction itself is delivered
 * in Phase 1, so lifecycle calls delegate directly. Persisting the resulting
 * state (services / provisioningJobs) belongs to ProvisioningService.
 */
export class InfrastructureService {
  resolveProvider(providerCode: string): InfrastructureProvider {
    return getInfrastructureProvider(providerCode);
  }

  capabilitiesOf(providerCode: string): ProviderCapabilitySet {
    return this.resolveProvider(providerCode).capabilities;
  }

  provision(
    providerCode: string,
    request: ProvisionRequest,
  ): Promise<ProvisionResult> {
    return this.resolveProvider(providerCode).createService(request);
  }

  getService(
    providerCode: string,
    providerServiceReference: string,
  ): Promise<ProvisionResult> {
    return this.resolveProvider(providerCode).getService(
      providerServiceReference,
    );
  }

  suspend(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).suspendService(ref);
  }
  unsuspend(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).unsuspendService(ref);
  }
  terminate(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).terminateService(ref);
  }
  reboot(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).rebootService(ref);
  }
  shutdown(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).shutdownService(ref);
  }
  start(providerCode: string, ref: string): Promise<void> {
    return this.resolveProvider(providerCode).startService(ref);
  }
  reinstall(
    providerCode: string,
    ref: string,
    operatingSystemId: string,
  ): Promise<void> {
    return this.resolveProvider(providerCode).reinstallService(
      ref,
      operatingSystemId,
    );
  }
  getUsage(providerCode: string, ref: string): Promise<ServiceUsage> {
    return this.resolveProvider(providerCode).getUsage(ref);
  }

  /**
   * The credential vault used to persist any server credentials produced by
   * provisioning. Disabled until a secret-management mechanism is configured
   * (Section 21) — callers must handle `CredentialStorageUnavailableError`.
   */
  credentialVault(): CredentialVault {
    return getCredentialVault();
  }
}
