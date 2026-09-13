import { z } from "zod";

import { currencySchema, timestampSchema } from "@/schemas/common";

/** Feature flags (Section 52). New integrations stay disabled until ready. */
export const featureFlagsSchema = z.object({
  automaticProvisioning: z.boolean(),
  automaticSuspension: z.boolean(),
  automaticTermination: z.boolean(),
  flutterwavePayments: z.boolean(),
  pesapalPayments: z.boolean(),
  windowsVps: z.boolean(),
  cpanelHosting: z.boolean(),
  coupons: z.boolean(),
  referrals: z.boolean(),
  pushNotifications: z.boolean(),
});

/** Renewal lifecycle windows in whole days (Section 34). */
export const renewalSettingsSchema = z.object({
  invoiceLeadDays: z.number().int().nonnegative(),
  firstReminderDays: z.number().int().nonnegative(),
  secondReminderDays: z.number().int().nonnegative(),
  graceDays: z.number().int().nonnegative(),
  suspensionThresholdDays: z.number().int().nonnegative(),
  terminationThresholdDays: z.number().int().nonnegative(),
});

export const systemSettingsSchema = z.object({
  featureFlags: featureFlagsSchema,
  renewal: renewalSettingsSchema,
  defaultCurrency: currencySchema,
  defaultGatewayFeeBps: z.number().int().min(0).max(10000).optional(),
  updatedAt: timestampSchema,
});

export type FeatureFlagsInput = z.infer<typeof featureFlagsSchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
