import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Gauge,
  Headphones,
  Layers,
  Lock,
  MonitorSmartphone,
  Server,
  ShieldCheck,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";

import { PlanCard } from "@/components/marketing/plan-card";
import { EmptyPlans } from "@/components/marketing/pricing-plans";
import { Section, SectionHeading } from "@/components/marketing/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getActivePlansSafe } from "@/lib/data/plans";

export const dynamic = "force-dynamic";

const WHY = [
  {
    icon: Zap,
    title: "Fast NVMe compute",
    body: "KVM virtual machines on NVMe storage with generous transfer allowances.",
  },
  {
    icon: MonitorSmartphone,
    title: "Linux & Windows",
    body: "Deploy popular Linux distributions or licensed Windows Server and RDP.",
  },
  {
    icon: Wallet,
    title: "Straightforward pricing",
    body: "Clear monthly, quarterly and annual pricing in TZS and USD. No surprises.",
  },
  {
    icon: Headphones,
    title: "Support that responds",
    body: "Real humans for billing and technical questions, built for African time zones.",
  },
] as const;

const DEPLOY_STEPS = [
  {
    step: "01",
    title: "Choose a plan",
    body: "Pick a VPS plan and billing cycle that fits your workload.",
  },
  {
    step: "02",
    title: "Configure",
    body: "Select your operating system, location and hostname at checkout.",
  },
  {
    step: "03",
    title: "Pay securely",
    body: "Pay by Mobile Money or bank transfer. Payments are confirmed before setup.",
  },
  {
    step: "04",
    title: "Get access",
    body: "Your server details arrive in your dashboard and by email once ready.",
  },
] as const;

const PAYMENT_METHODS = [
  "Mobile Money",
  "Bank Transfer",
  "Card (coming soon)",
] as const;

const FAQ = [
  {
    q: "Where are servers located?",
    a: "Available locations are listed on each plan and on the network page. Infrastructure details are kept current from our systems, never fabricated.",
  },
  {
    q: "Which operating systems can I run?",
    a: "Popular Linux distributions are supported on all VPS plans. Windows Server and RDP are available on Windows-enabled plans.",
  },
  {
    q: "How do I pay?",
    a: "You can pay using Mobile Money or bank transfer today. Every payment is verified before your service is provisioned.",
  },
  {
    q: "Is remote server control automated?",
    a: "During onboarding, provisioning is handled by our operations team. Automated power and reinstall controls are enabled as our infrastructure automation rolls out.",
  },
] as const;

export default async function HomePage() {
  const plans = await getActivePlansSafe();
  const featured = plans.filter((p) => p.productType === "linux_vps").slice(0, 4);
  const showcasePlans = featured.length > 0 ? featured : plans.slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" aria-hidden />
        <div className="absolute inset-0 bg-radial-fade" aria-hidden />
        <Section className="relative py-24 sm:py-32">
          <Badge variant="accent" className="mb-6">
            <span className="size-1.5 rounded-full bg-accent" />
            Cloud Infrastructure for Africa
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            Cloud Infrastructure{" "}
            <span className="text-gradient">for Africa.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Fast VPS, Windows servers and hosting with straightforward pricing
            and support built for African businesses and developers.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Deploy a Server <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">View VPS Plans</Link>
            </Button>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Server, label: "Linux VPS" },
              { icon: MonitorSmartphone, label: "Windows VPS" },
              { icon: Terminal, label: "Full root access" },
              { icon: ShieldCheck, label: "Secure by design" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="size-4 text-accent" />
                {item.label}
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* VPS plans */}
      <Section className="py-20">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="VPS Plans"
            title="Compute that scales with you"
            description="Plans are managed centrally and always reflect live catalog data — never hardcoded."
          />
          <Button asChild variant="outline">
            <Link href="/pricing">See all pricing</Link>
          </Button>
        </div>
        <div className="mt-10">
          {showcasePlans.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {showcasePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <EmptyPlans />
          )}
        </div>
      </Section>

      {/* Why AfriVPS */}
      <div className="border-y border-border bg-surface">
        <Section className="py-20">
          <SectionHeading
            eyebrow="Why AfriVPS"
            title="Serious infrastructure, minus the friction"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <Card key={item.title} className="p-6">
                <div className="flex size-10 items-center justify-center rounded-[var(--radius)] border border-border bg-elevated">
                  <item.icon className="size-5 text-accent" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </div>

      {/* Deployment process */}
      <Section className="py-20">
        <SectionHeading
          eyebrow="Deployment"
          title="From plan to server in four steps"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEPLOY_STEPS.map((step) => (
            <div key={step.step} className="relative">
              <span className="font-mono text-sm text-accent">{step.step}</span>
              <h3 className="mt-2 font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Infrastructure + dashboard preview */}
      <div className="border-y border-border bg-surface">
        <Section className="grid gap-10 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Infrastructure"
              title="A control panel built for operators"
              description="Manage services, invoices and support from one clean dashboard. Data tables, status badges and clear empty states — no clutter."
            />
            <ul className="mt-6 space-y-3">
              {[
                { icon: Layers, label: "Services, orders and invoices in one place" },
                { icon: Gauge, label: "Clear service status and renewals" },
                { icon: Lock, label: "Ownership enforced by security rules" },
              ].map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 text-sm text-foreground"
                >
                  <item.icon className="size-4 text-accent" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="flex items-center gap-1.5 border-b border-border bg-background px-4 py-3">
              <span className="size-2.5 rounded-full bg-destructive/70" />
              <span className="size-2.5 rounded-full bg-warning/70" />
              <span className="size-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                dashboard.afrivps
              </span>
            </div>
            <div className="space-y-3 p-5">
              {[
                { name: "web-01", status: "active", plan: "Growth VPS" },
                { name: "db-primary", status: "active", plan: "Business VPS" },
                { name: "win-rdp", status: "provisioning", plan: "Windows VPS" },
              ].map((row) => (
                <div
                  key={row.name}
                  className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Server className="size-4 text-accent" />
                    <div>
                      <p className="font-mono text-sm text-foreground">
                        {row.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.plan}</p>
                    </div>
                  </div>
                  <Badge variant={row.status === "active" ? "success" : "warning"}>
                    {row.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </Section>
      </div>

      {/* Payment + support */}
      <Section className="grid gap-6 py-20 lg:grid-cols-2">
        <Card className="p-8">
          <CreditCard className="size-6 text-accent" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            Pay the way Africa pays
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mobile Money and bank transfer today, with card gateways rolling out.
            Every payment is verified server-side before provisioning.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <Badge key={method} variant="outline">
                {method}
              </Badge>
            ))}
          </div>
        </Card>
        <Card className="p-8">
          <Headphones className="size-6 text-accent" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            Support that understands your market
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Billing, technical and general support through a proper ticketing
            system. Open a ticket and track every reply from your dashboard.
          </p>
          <Button asChild variant="outline" className="mt-5">
            <Link href="/support">Visit support</Link>
          </Button>
        </Card>
      </Section>

      {/* FAQ */}
      <div className="border-t border-border bg-surface">
        <Section className="py-20">
          <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="font-semibold text-foreground">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* CTA */}
      <Section className="py-20">
        <Card className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="absolute inset-0 bg-radial-fade" aria-hidden />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Ready to deploy?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Create your AfriVPS account and launch your first server in
              minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Deploy a Server <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/pricing">View VPS Plans</Link>
              </Button>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}
