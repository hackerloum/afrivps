import { BearHostProvider } from "./bearhost";
import { ManualProvider } from "./manual";
import type {
  InfrastructureProvider,
  ProviderCapabilitySet,
  ProviderMode,
} from "./types";

/**
 * Provider registry. Business logic resolves providers by code and never
 * hardcodes a specific implementation (Section 24).
 */
const providers: Record<string, () => InfrastructureProvider> = {
  manual: () => new ManualProvider(),
  bearhost: () => new BearHostProvider(),
};

export function getInfrastructureProvider(code: string): InfrastructureProvider {
  const factory = providers[code];
  if (!factory) {
    throw new Error(`Unknown infrastructure provider: ${code}`);
  }
  return factory();
}

export function listInfrastructureProviders(): string[] {
  return Object.keys(providers);
}

/**
 * Honest, capability-aware description of each registered provider. Admin UI
 * uses this so it never presents an unavailable capability as a working
 * feature (Section 29).
 */
export interface InfrastructureProviderDescriptor {
  code: string;
  mode: ProviderMode;
  capabilities: ProviderCapabilitySet;
}

export function describeInfrastructureProviders(): InfrastructureProviderDescriptor[] {
  return listInfrastructureProviders().map((code) => {
    const provider = getInfrastructureProvider(code);
    return {
      code: provider.code,
      mode: provider.mode,
      capabilities: provider.capabilities,
    };
  });
}
