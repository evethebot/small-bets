import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession, type PlanInterval } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const plan = body.plan as PlanInterval;

  if (!["monthly", "yearly", "lifetime"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Get customer ID if exists
  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  const checkoutSession = await createCheckoutSession({
    userId: session.user.id,
    email: session.user.email,
    plan,
    customerId: user?.stripe_customer_id,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
