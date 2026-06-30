import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { uploadBuilderObjects, type UploadedFile } from "@/lib/supabase/storage";
import { safeScheme } from "@/lib/builder/schemes";
import { encodeBrief } from "@/lib/builder/encode";
import type { BuilderBrief } from "@/lib/builder/types";
import {
  isImageGenConfigured,
  generateImage,
  logoPrompt,
  heroImagePrompt,
} from "@/lib/ai/images";
import { isSiteGenConfigured, generateSiteContent } from "@/lib/ai/generateSite";
import { sendEmail, emailLayout, escapeHtml } from "@/lib/email/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // image generation can take a while

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB per file
const MAX_IMAGES = 4;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

const fieldsSchema = z.object({
  businessName: z.string().trim().min(1).max(200),
  domain: z.string().trim().max(253).optional(),
  description: z.string().trim().min(1).max(2000),
  email: z.string().trim().email().max(320),
  primary: z.string().trim().optional(),
  accent: z.string().trim().optional(),
  wantsLogo: z.string().optional(),
  wantsImages: z.string().optional(),
  wantsColourHelp: z.string().optional(),
});

/**
 * POST /api/website-builder (multipart) — capture a build brief, store any
 * uploaded logo/images in Supabase Storage, and return a preview URL.
 *
 * If storage isn't available, falls back to a stateless preview encoded in the
 * URL (text only, no images).
 */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const parsed = fieldsSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }
  const f = parsed.data;

  const scheme = safeScheme({ primary: f.primary, accent: f.accent });
  const id = randomUUID();

  // Collect files to upload.
  const uploads: UploadedFile[] = [];
  const logo = form.get("logo");
  if (logo instanceof File && logo.size > 0) {
    const err = validateFile(logo);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    uploads.push({ blob: logo, path: `builds/${id}/logo${ext(logo)}`, contentType: logo.type });
  }

  const imageFiles = form.getAll("images").filter((x): x is File => x instanceof File && x.size > 0);
  if (imageFiles.length > MAX_IMAGES) {
    return NextResponse.json({ error: `Up to ${MAX_IMAGES} images.` }, { status: 400 });
  }
  imageFiles.forEach((img, i) => {
    const err = validateFile(img);
    if (!err) uploads.push({ blob: img, path: `builds/${id}/img-${i}${ext(img)}`, contentType: img.type });
  });

  const brief: BuilderBrief = {
    businessName: f.businessName,
    domain: f.domain || undefined,
    description: f.description,
    scheme,
    wantsLogo: f.wantsLogo === "true",
    wantsImages: f.wantsImages === "true",
    wantsColourHelp: f.wantsColourHelp === "true",
  };

  // Generate tailored website copy with the Claude API when configured.
  if (isSiteGenConfigured()) {
    brief.content = (await generateSiteContent(brief)) ?? undefined;
  }

  // Auto-generate assets when requested and an image provider is configured.
  // Falls back silently to capturing the request if generation isn't set up.
  if (isImageGenConfigured()) {
    try {
      const hasUploadedLogo = uploads.some((u) => u.path.includes("/logo"));
      if (brief.wantsLogo && !hasUploadedLogo) {
        const blob = await generateImage({ prompt: logoPrompt(f.businessName, f.description) });
        if (blob) uploads.push({ blob, path: `builds/${id}/logo.png`, contentType: "image/png" });
      }
      if (brief.wantsImages) {
        const blob = await generateImage({ prompt: heroImagePrompt(f.businessName, f.description) });
        if (blob) uploads.push({ blob, path: `builds/${id}/img-gen-0.png`, contentType: "image/png" });
      }
    } catch (err) {
      console.error("[website-builder] asset generation failed", (err as Error).message);
    }
  }

  try {
    const urls = await uploadBuilderObjects(uploads);
    if (urls) {
      // Map uploaded URLs back to logo / images by their path.
      const logoIdx = uploads.findIndex((u) => u.path.includes("/logo"));
      if (logoIdx >= 0) brief.logoUrl = urls[logoIdx];
      brief.imageUrls = urls.filter((_, i) => uploads[i].path.includes("/img-"));

      // Persist the brief as JSON so the preview can render it by id.
      await uploadBuilderObjects([
        {
          blob: new Blob([JSON.stringify(brief)], { type: "application/json" }),
          path: `builds/${id}/brief.json`,
          contentType: "application/json",
        },
      ]);

      logRequest(id, f.email, brief);
      const previewUrl = `/preview?id=${id}`;
      await sendBuilderEmail(f.email, previewUrl, f.businessName);
      return NextResponse.json({ ok: true, previewUrl });
    }
  } catch (err) {
    console.error("[website-builder] storage error", (err as Error).message);
    // fall through to stateless preview
  }

  // Fallback: no storage — encode the text brief in the URL (no images).
  logRequest(id, f.email, brief);
  const previewUrl = `/preview?d=${encodeURIComponent(encodeBrief(brief))}`;
  await sendBuilderEmail(f.email, previewUrl, f.businessName);
  return NextResponse.json({ ok: true, previewUrl });
}

async function sendBuilderEmail(
  email: string,
  previewUrl: string,
  business: string,
): Promise<void> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";
  const link = `${base}${previewUrl}`;
  await sendEmail({
    to: email,
    subject: "Your new website preview is ready",
    html: emailLayout(
      "Your website preview",
      `<p>Your starter website for <strong>${escapeHtml(business)}</strong> is ready.</p>` +
        `<p><a href="${link}" style="color:#ec008c;font-weight:bold">Open your website preview →</a></p>`,
    ),
  });
}

function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) return "Each file must be under 4MB.";
  if (!IMAGE_TYPES.includes(file.type)) return "Please upload image files only.";
  return null;
}

function ext(file: File): string {
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/gif": ".gif",
  };
  return map[file.type] ?? "";
}

function logRequest(id: string, email: string, brief: BuilderBrief) {
  console.log("[website-builder] request", {
    id,
    email,
    business: brief.businessName,
    domain: brief.domain ?? "(none yet)",
    wantsLogo: brief.wantsLogo,
    wantsImages: brief.wantsImages,
  });
}
