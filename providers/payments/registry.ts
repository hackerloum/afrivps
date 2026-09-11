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
