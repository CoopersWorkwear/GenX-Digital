import { NextResponse } from "next/server";
import { isDreamscapeConfigured } from "@/lib/dreamscape/config";
import { getSupabaseAdminConfig } from "@/lib/supabase/config";
import { isSiteGenConfigured } from "@/lib/ai/generateSite";
import { isImageGenConfigured } from "@/lib/ai/images";
import { isEmailConfigured } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Read-only integration status. Reports which features are switched on (by env)
 * WITHOUT exposing any key values. Visit /api/debug/status to confirm what's
 * live — handy after adding keys in Vercel.
 */
export function GET() {
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY);
  return NextResponse.json({
    dreamscape: isDreamscapeConfigured(),
    supabase: Boolean(getSupabaseAdminConfig()),
    supabaseAuth: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
    stripe,
    stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    aiCopy: isSiteGenConfigured(), // ANTHROPIC_API_KEY — AI website copy
    aiImages: isImageGenConfigured(), // AI_IMAGE_API_KEY — AI logo + hero images
    email: isEmailConfigured(), // RESEND_API_KEY + EMAIL_FROM
    companyAbn: Boolean(process.env.NEXT_PUBLIC_COMPANY_ABN),
    notes: {
      logo: isImageGenConfigured()
        ? "AI-generated logos are ON (real images)."
        : "AI image generation is OFF — logos fall back to an instant themed monogram. Add AI_IMAGE_API_KEY to switch on real AI logos.",
      images: isImageGenConfigured()
        ? "AI hero/section images are ON."
        : "Add AI_IMAGE_API_KEY (OpenAI-compatible image API) to generate hero images.",
      copy: isSiteGenConfigured()
        ? "AI website copy is ON (tailored content)."
        : "Add ANTHROPIC_API_KEY to generate tailored copy; otherwise smart fallback copy is used.",
    },
  });
}
