import type { Currency } from "@/types";

/**
 * Payment provider abstraction (Sections 30, 67).
 *
 * Checkout does not know provider implementation details. Payment status is
 * ALWAYS confirmed server-side — never trusted from the browser.
 */

export interface InitializePaymentInput {
  invoiceId: string;
  customerId: string;
  /** Integer minor units. */
  amount: number;
  currency: Currency;
  reference: string;
  returnUrl: string;
  method?: string;
}

export interface InitializePaymentResult {
  /** Where to send the customer to complete payment (empty for manual). */
  redirectUrl?: string;
  providerReference: string;
  status: "initialized" | "awaiting_confirmation";
  instructions?: string;
}

export interface VerifyPaymentResult {
  status: "paid" | "pending" | "failed";
  providerReference: string;
  /** Integer minor units, as confirmed by the provider. */
  amount: number;
  currency: Currency;
}

export interface WebhookVerification {
  valid: boolean;
  reference?: string;
  status?: "paid" | "pending" | "failed";
  amount?: number;
  currency?: Currency;
}

export interface PaymentProvider {
  readonly code: string;
  readonly mode: "manual" | "api";

  initializePayment(
    input: InitializePaymentInput,
  ): Promise<InitializePaymentResult>;
  verifyPayment(providerReference: string): Promise<VerifyPaymentResult>;
  handleWebhook(
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookVerification>;
  refundPayment(providerReference: string, amount: number): Promise<void>;
  getTransaction(providerReference: string): Promise<VerifyPaymentResult>;
}

export class PaymentProviderNotConfiguredError extends Error {
  constructor(providerCode: string, operation: string) {
    super(
      `Payment provider "${providerCode}" is not yet configured. "${operation}" becomes available once API credentials and official documentation are supplied.`,
    );
    this.name = "PaymentProviderNotConfiguredError";
  }
}
