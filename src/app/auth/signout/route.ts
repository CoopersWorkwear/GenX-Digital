import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** POST /auth/signout — clear the session and redirect home. */
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
