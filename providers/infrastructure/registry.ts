import { BearHostProvider } from "./bearhost";
import { ManualProvider } from "./manual";
import type { InfrastructureProvider } from "./types";

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
