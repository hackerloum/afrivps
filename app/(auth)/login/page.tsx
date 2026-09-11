import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to manage your AfriVPS services."
      footer={{
        text: "New to AfriVPS?",
        linkText: "Create an account",
        href: "/register",
      }}
    >
      <LoginForm />
    </AuthCard>
  );
}
