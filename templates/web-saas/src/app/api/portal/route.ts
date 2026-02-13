import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/db";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", session.user.id)
    .single();

  if (!user?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 }
    );
  }

  const portalSession = await createPortalSession(user.stripe_customer_id);

  return NextResponse.json({ url: portalSession.url });
}
