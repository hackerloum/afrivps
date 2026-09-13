import {
  PaymentProviderNotConfiguredError,
  type InitializePaymentResult,
  type PaymentProvider,
  type VerifyPaymentResult,
  type WebhookVerification,
} from "./types";

/**
 * FlutterwaveProvider — PLACEHOLDER (Section 67).
 *
 * Structurally present so checkout stays provider-agnostic, but disabled until
 * API credentials and integration are configured. No fabricated endpoints.
 */
export class FlutterwaveProvider implements PaymentProvider {
  readonly code = "flutterwave";
  readonly mode = "api" as const;

  async initializePayment(): Promise<InitializePaymentResult> {
    throw new PaymentProviderNotConfiguredError(this.code, "initializePayment");
  }
  async verifyPayment(): Promise<VerifyPaymentResult> {
    throw new PaymentProviderNotConfiguredError(this.code, "verifyPayment");
  }
  async handleWebhook(): Promise<WebhookVerification> {
    throw new PaymentProviderNotConfiguredError(this.code, "handleWebhook");
  }
  async refundPayment(): Promise<void> {
    throw new PaymentProviderNotConfiguredError(this.code, "refundPayment");
  }
  async getTransaction(): Promise<VerifyPaymentResult> {
    throw new PaymentProviderNotConfiguredError(this.code, "getTransaction");
  }
}
