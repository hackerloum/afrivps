import { FlutterwaveProvider } from "./flutterwave";
import { ManualPaymentProvider } from "./manual";
import { PesapalProvider } from "./pesapal";
import type { PaymentProvider } from "./types";

/**
 * Payment provider registry. Checkout resolves providers by code and stays
 * agnostic to implementation details (Section 67).
 */
const providers: Record<string, () => PaymentProvider> = {
  manual: () => new ManualPaymentProvider(),
  flutterwave: () => new FlutterwaveProvider(),
  pesapal: () => new PesapalProvider(),
};

export function getPaymentProvider(code: string): PaymentProvider {
  const factory = providers[code];
  if (!factory) {
    throw new Error(`Unknown payment provider: ${code}`);
  }
  return factory();
}

export function listPaymentProviders(): string[] {
  return Object.keys(providers);
}

/**
 * Description of each registered payment provider for admin/config surfaces.
 * `mode` distinguishes the manual (staff-confirmed) provider from API adapters
 * that stay disabled until configured (Section 67).
 */
export interface PaymentProviderDescriptor {
  code: string;
  mode: "manual" | "api";
}

export function describePaymentProviders(): PaymentProviderDescriptor[] {
  return listPaymentProviders().map((code) => {
    const provider = getPaymentProvider(code);
    return { code: provider.code, mode: provider.mode };
  });
}
