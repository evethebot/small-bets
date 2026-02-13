import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/db";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      // ---- Checkout completed ----
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;

        if (!userId || !plan) break;

        const updateData: Record<string, unknown> = {
          stripe_customer_id: session.customer as string,
          subscription_plan: plan,
          subscription_status: "active",
        };

        // For subscriptions, get the current period end
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          updateData.subscription_current_period_end = new Date(
            subscription.current_period_end * 1000
          ).toISOString();
        }

        // For lifetime, set far future
        if (plan === "lifetime") {
          updateData.subscription_current_period_end = new Date(
            "2099-12-31"
          ).toISOString();
        }

        await supabase.from("users").update(updateData).eq("id", userId);
        break;
      }

      // ---- Subscription updated ----
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from("users")
          .update({
            subscription_status: subscription.status === "active" ? "active" : subscription.status,
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("id", userId);
        break;
      }

      // ---- Subscription deleted ----
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from("users")
          .update({
            subscription_status: "canceled",
            subscription_plan: "free",
          })
          .eq("id", userId);
        break;
      }

      // ---- Invoice payment failed ----
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        await supabase
          .from("users")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
