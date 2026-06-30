import "server-only";

/**
 * AI image generation for the website builder ("create a logo / images for me").
 *
 * Provider-agnostic: targets any OpenAI-compatible `/images/generations`
 * endpoint, configured via env so you can point it at your chosen provider
 * without code changes. Returns null when not configured so the builder
 * gracefully falls back to capturing the request for manual fulfilment.
 */

export function isImageGenConfigured(): boolean {
  return Boolean(process.env.AI_IMAGE_API_KEY);
}

interface GenOptions {
  prompt: string;
  size?: string;
}

export async function generateImage({
  prompt,
  size = "1024x1024",
}: GenOptions): Promise<Blob | null> {
  const key = process.env.AI_IMAGE_API_KEY;
  if (!key) return null;

  const baseUrl = (process.env.AI_IMAGE_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_IMAGE_MODEL || "gpt-image-1";

  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
  });
  if (!res.ok) throw new Error(`image generation failed (${res.status})`);

  const data = await res.json();
  const item = data?.data?.[0];
  if (item?.b64_json) {
    return new Blob([Buffer.from(item.b64_json, "base64")], { type: "image/png" });
  }
  if (item?.url) {
    const img = await fetch(item.url);
    return new Blob([await img.arrayBuffer()], { type: "image/png" });
  }
  return null;
}

/** Prompt builders kept here so they're easy to tune in one place. */
export function logoPrompt(business: string, description: string): string {
  return `A minimalist, modern flat vector logo for a business called "${business}". ${description}. Simple, clean, memorable, centered on a plain white background. No surrounding text or watermark.`;
}

export function heroImagePrompt(business: string, description: string): string {
  return `A professional, photographic hero image representing the business "${business}". ${description}. Bright, high quality, no text overlay.`;
}
