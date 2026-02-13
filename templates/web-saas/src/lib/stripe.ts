import Stripe from "stripe";
import { absoluteUrl } from "./utils";

// ============================================
// Stripe Server Client
// ============================================

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// ============================================
// Plan Configuration
// ============================================

export type PlanInterval = "monthly" | "yearly" | "lifetime";

export interface PricingPlan {
  id: PlanInterval;
  name: string;
  priceMonthly: number; // display price in cents
  priceId: string; // Stripe price ID
  features: string[];
  popular?: boolean;
}

export function getStripePriceId(plan: PlanInterval): string {
  const prices: Record<PlanInterval, string> = {
    monthly: process.env.STRIPE_PRICE_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_YEARLY!,
    lifetime: process.env.STRIPE_PRICE_LIFETIME!,
  };
  return prices[plan];
}

// ============================================
// Checkout Session
// ============================================

export async function createCheckoutSession({
  userId,
  email,
  plan,
  customerId,
}: {
  userId: string;
  email: string;
  plan: PlanInterval;
  customerId?: string | null;
}) {
  const priceId = getStripePriceId(plan);
  const isLifetime = plan === "lifetime";

  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: customerId ? undefined : email,
    mode: isLifetime ? "payment" : "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: absoluteUrl("/dashboard/billing?success=true"),
    cancel_url: absoluteUrl("/dashboard/billing?canceled=true"),
    metadata: {
      userId,
      plan,
    },
    ...(isLifetime
      ? {}
      : {
          subscription_data: {
            metadata: { userId, plan },
          },
        }),
  });

  return session;
}

// ============================================
// Customer Portal
// ============================================

export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: absoluteUrl("/dashboard/billing"),
  });

  return session;
}

// ============================================
// Webhook Event Constructors
// ============================================

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
