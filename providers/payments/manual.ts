import {
  type InitializePaymentInput,
  type InitializePaymentResult,
  type PaymentProvider,
  type VerifyPaymentResult,
  type WebhookVerification,
} from "./types";

/**
 * ManualPaymentProvider (Section 31).
 *
 * Supports Mobile Money / Bank Transfer / Admin Confirmation. A manual payment
 * is created in a `pending` state and only marked `paid` after an authorized
 * staff member verifies it server-side (Phase 2 wires the admin confirmation
 * flow). This adapter never auto-confirms payment.
 */
export class ManualPaymentProvider implements PaymentProvider {
  readonly code = "manual";
  readonly mode = "manual" as const;

  async initializePayment(
    input: InitializePaymentInput,
  ): Promise<InitializePaymentResult> {
    return {
      providerReference: input.reference,
      status: "awaiting_confirmation",
      instructions:
        "Complete payment via Mobile Money or Bank Transfer using the invoice reference. An AfriVPS agent will confirm your payment.",
    };
  }

  async verifyPayment(providerReference: string): Promise<VerifyPaymentResult> {
    // Manual payments are never auto-verified; confirmation is an explicit,
    // audited staff action performed server-side.
    return {
      status: "pending",
      providerReference,
      amount: 0,
      currency: "TZS",
    };
  }

  async handleWebhook(): Promise<WebhookVerification> {
    // No webhooks for manual payments.
    return { valid: false };
  }

  async refundPayment(): Promise<void> {
    // Refunds are handled operationally and recorded by staff.
  }

  async getTransaction(
    providerReference: string,
  ): Promise<VerifyPaymentResult> {
    return {
      status: "pending",
      providerReference,
      amount: 0,
      currency: "TZS",
    };
  }
}
