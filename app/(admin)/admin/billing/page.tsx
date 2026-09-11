import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * Billing has been split into dedicated Invoices and Payments sections
 * (Sections 27, 73). This route is kept for backward-compatible links and
 * redirects to Invoices.
 */
export default async function AdminBillingPage() {
  redirect("/admin/invoices");
}
