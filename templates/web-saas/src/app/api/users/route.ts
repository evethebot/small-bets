import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/db";
import { z } from "zod";

// ============================================
// GET /api/users - Get current user profile
// ============================================

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// ============================================
// PATCH /api/users - Update current user profile
// ============================================

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ user });
}

// ============================================
// DELETE /api/users - Delete current user account
// ============================================

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();

  // TODO: Cancel Stripe subscription if active
  // TODO: Delete associated data

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", session.user.id);

  if (error) {
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
