import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: { text: string; linkText: string; href: string };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
        {footer && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footer.text}{" "}
            <Link
              href={footer.href}
              className="font-medium text-accent hover:underline"
            >
              {footer.linkText}
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-destructive">{message}</p>;
}

export function FormAlert({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-[var(--radius)] border border-destructive/40 bg-[color-mix(in_oklab,var(--color-destructive)_12%,transparent)] px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}

export function FormSuccess({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-[var(--radius)] border border-success/40 bg-primary-muted px-3 py-2 text-sm text-success">
      {message}
    </div>
  );
}
