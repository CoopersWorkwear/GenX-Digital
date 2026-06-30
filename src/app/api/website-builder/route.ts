import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { uploadBuilderObjects, type UploadedFile } from "@/lib/supabase/storage";
import { safeScheme } from "@/lib/builder/schemes";
import { encodeBrief } from "@/lib/builder/encode";
import type { BuilderBrief } from "@/lib/builder/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      return NextResponse.json({ ok: true, previewUrl: `/preview?id=${id}` });
    }
  } catch (err) {
    console.error("[website-builder] storage error", (err as Error).message);
    // fall through to stateless preview
  }

  // Fallback: no storage — encode the text brief in the URL (no images).
  logRequest(id, f.email, brief);
  return NextResponse.json({
    ok: true,
    previewUrl: `/preview?d=${encodeURIComponent(encodeBrief(brief))}`,
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
