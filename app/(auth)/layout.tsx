import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-grid opacity-[0.25]" aria-hidden />
      <div className="absolute inset-0 bg-radial-fade" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="AfriVPS home">
            <Logo />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
