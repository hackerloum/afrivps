"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import {
  FieldError,
  FormAlert,
  FormSuccess,
} from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/errors";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/schemas/auth";

export function ForgotPasswordForm() {
  const [formError, setFormError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setFormError(null);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      // Avoid leaking whether an account exists; only surface transport errors.
      setFormError(authErrorMessage(error));
    }
  }

  if (sent) {
    return (
      <FormSuccess message="If an account exists for that email, a password reset link is on its way. Check your inbox (and the emulator UI in development)." />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormAlert message={formError} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="mt-1.5"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
