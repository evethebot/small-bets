import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton, PortalButton } from "./billing-actions";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const session = await auth();
  const plan = (session as any)?.subscriptionPlan || "free";
  const status = (session as any)?.subscriptionStatus || "inactive";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your subscription and payment details.
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the {plan} plan.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge variant={status === "active" ? "success" : "secondary"}>
            {status}
          </Badge>
          <span className="text-sm text-gray-500 capitalize">{plan}</span>
          {status === "active" && <PortalButton />}
        </CardContent>
      </Card>

      {/* Upgrade options */}
      {plan === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade</CardTitle>
            <CardDescription>Choose a plan to unlock all features.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <CheckoutButton plan="monthly" label="Monthly - $19/mo" />
            <CheckoutButton plan="yearly" label="Yearly - $15/mo (billed yearly)" />
            <CheckoutButton plan="lifetime" label="Lifetime - $299 one-time" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
