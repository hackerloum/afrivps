import { z } from "zod";

/**
 * Shared, hardened field schemas for the authentication flows (Sections 3, 6).
 *
 * Email is trimmed + lower-cased so the same address never creates duplicate
 * accounts and lookups are stable. Passwords for account creation / reset must
 * meet a minimum strength policy; the login password only needs to be present
 * (existing passwords must never be rejected retroactively).
 */

const emailField = z
  .string()
  .trim()
  .min(1, "Enter your email address")
  .max(254, "That email address is too long")
  .email("Enter a valid email address")
  .toLowerCase();

const fullNameField = z
  .string()
  .trim()
  .min(2, "Please enter your full name")
  .max(120, "That name is too long");

const strongPasswordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

export const registerSchema = z
  .object({
    fullName: fullNameField,
    email: emailField,
    password: strongPasswordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: strongPasswordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
