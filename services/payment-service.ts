import {
  getPaymentProvider,
  type InitializePaymentInput,
  type InitializePaymentResult,
  type VerifyPaymentResult,
  type WebhookVerification,
} from "@/providers/payments";
import { ServiceNotImplementedError } from "./errors";
import type { Payment } from "./types";

/**
 * PaymentService (Sections 30, 31, 32, 65).
 *
 * Orchestrates payments through the provider-agnostic PaymentProvider registry.
 * Payment status is NEVER trusted from the browser — confirmation always flows
 * through `verifyPayment` / `handleWebhook` server-side (Section 30), and
 * webhooks must verify signature/amount/currency/reference and stay idempotent
 * (Section 32).
 *
 * Phase 1: initialize / verify / webhook / getTransaction are real, thin
 * delegations to the provider (no fabricated endpoints — placeholder providers
 * throw). The DB-mutating manual-confirmation path is a Phase 2 stub.
 */

export interface ConfirmManualPaymentInput {
  paymentId: string;
  /** Staff UID performing the confirmation (audited). */
  verifiedBy: string;
  transactionReference: string;
}

export interface PaymentService {
  initializePayment(
    providerCode: string,
    input: InitializePaymentInput,
  ): Promise<InitializePaymentResult>;
  verifyPayment(
    providerCode: string,
    providerReference: string,
  ): Promise<VerifyPaymentResult>;
  handleWebhook(
    providerCode: string,
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookVerification>;
  getTransaction(
    providerCode: string,
    providerReference: string,
  ): Promise<VerifyPaymentResult>;
  /** Server-only, audited manual confirmation (Section 31). */
  confirmManualPayment(input: ConfirmManualPaymentInput): Promise<Payment>;
}

const SERVICE = "PaymentService";

export class DefaultPaymentService implements PaymentService {
  initializePayment(
    providerCode: string,
    input: InitializePaymentInput,
  ): Promise<InitializePaymentResult> {
    return getPaymentProvider(providerCode).initializePayment(input);
  }

  verifyPayment(
    providerCode: string,
    providerReference: string,
  ): Promise<VerifyPaymentResult> {
    return getPaymentProvider(providerCode).verifyPayment(providerReference);
  }

  handleWebhook(
    providerCode: string,
    rawBody: string,
    headers: Record<string, string>,
  ): Promise<WebhookVerification> {
    return getPaymentProvider(providerCode).handleWebhook(rawBody, headers);
  }

  getTransaction(
    providerCode: string,
    providerReference: string,
  ): Promise<VerifyPaymentResult> {
    return getPaymentProvider(providerCode).getTransaction(providerReference);
  }

  async confirmManualPayment(): Promise<Payment> {
    // Mutating the payment/invoice/order atomically + audit log is Phase 2.
    throw new ServiceNotImplementedError(
      SERVICE,
      "confirmManualPayment",
      "Phase 2",
    );
  }
}
