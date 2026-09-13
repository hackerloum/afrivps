import { z } from "zod";

import {
  currencySchema,
  staffRoleSchema,
  timestampSchema,
  userRoleSchema,
} from "@/schemas/common";

/**
 * People schemas (Sections 42, 43). These validate application profile data
 * only — authentication secrets never live here (Firebase Auth is the identity
 * source of truth).
 */

const phoneSchema = z
  .string()
  .min(6)
  .max(32)
  .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number");

export const userProfileSchema = z.object({
  uid: z.string().min(1),
  customerReference: z.string().min(1),
  email: z.string().email(),
  emailVerified: z.boolean(),
  fullName: z.string().min(2).max(120),
  phone: phoneSchema.optional(),
  company: z.string().max(160).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  address: z.string().max(240).optional(),
  role: userRoleSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const customerSchema = z.object({
  uid: z.string().min(1),
  customerReference: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  phone: phoneSchema.optional(),
  company: z.string().max(160).optional(),
  country: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
  address: z.string().max(240).optional(),
  preferredCurrency: currencySchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const staffSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  role: staffRoleSchema,
  active: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type StaffInput = z.infer<typeof staffSchema>;
