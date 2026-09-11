"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";
import { completePasswordReset, verifyResetCode } from "@/lib/firebase/auth";
import { authErrorMessage } from "@/lib/firebase/errors";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/schemas/auth";

type CodeState =
  | { status: "checking" }
  | { status: "valid"; email: string }
  | { status: "invalid"; message: string };

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [codeState, setCodeState] = React.useState<CodeState>(() =>
    oobCode
      ? { status: "checking" }
      : {
          status: "invalid",
          message:
            "This reset link is invalid. Please request a new password reset.",
        },
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  React.useEffect(() => {
    if (!oobCode) return;
    let active = true;
    verifyResetCode(oobCode)
      .then((email) => {
        if (active) setCodeState({ status: "valid", email });
      })
      .catch((error) => {
        if (active) {
          setCodeState({ status: "invalid", message: authErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [oobCode]);

  async function onSubmit(values: ResetPasswordValues) {
    setFormError(null);
    if (!oobCode) {
      setFormError("This reset link is missing its code. Request a new one.");
      return;
    }
    try {
      await completePasswordReset(oobCode, values.password);
      setDone(true);
    } catch (error) {
      setFormError(authErrorMessage(error));
    }
  }

  if (codeState.status === "checking") {
    return <Skeleton className="h-40 w-full" />;
  }

  if (codeState.status === "invalid") {
    return (
      <div className="space-y-4">
        <FormAlert message={codeState.message} />
        <Button asChild variant="secondary" className="w-full">
          <Link href="/forgot-password">Request a new reset link</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <FormSuccess message="Your password has been updated." />
        <Button asChild className="w-full">
          <Link href="/login">Continue to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormAlert message={formError} />
      <p className="text-sm text-muted-foreground">
        Resetting the password for{" "}
        <span className="font-medium text-foreground">{codeState.email}</span>.
      </p>
      <div>
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          className="mt-1.5"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className="mt-1.5"
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Update password
      </Button>
    </form>
  );
}
