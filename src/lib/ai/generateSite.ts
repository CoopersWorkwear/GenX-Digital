import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { BuilderBrief, SiteContent } from "@/lib/builder/types";

/**
 * Generate tailored website copy for a customer's business using the Claude API.
 *
 * Uses structured outputs (a JSON schema) so the response matches our template's
 * shape, then validates it. Pay-as-you-go (no per-site credits); gated on
 * ANTHROPIC_API_KEY so the builder degrades gracefully to a heuristic template
 * when it isn't configured.
 */

export function isSiteGenConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Zod schema validates the model's output before we trust it.
const SiteContentSchema = z.object({
  heroHeadline: z.string().min(1),
  heroSubheadline: z.string().min(1),
  aboutTitle: z.string().min(1),
  aboutBody: z.string().min(1),
  services: z.array(z.object({ title: z.string(), description: z.string() })),
  whyTitle: z.string().min(1),
  whyPoints: z.array(z.string()),
  ctaText: z.string().min(1),
});

// JSON Schema constrains the model's response format (structured outputs).
const SITE_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    heroHeadline: { type: "string" },
    heroSubheadline: { type: "string" },
    aboutTitle: { type: "string" },
    aboutBody: { type: "string" },
    services: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { title: { type: "string" }, description: { type: "string" } },
        required: ["title", "description"],
      },
    },
    whyTitle: { type: "string" },
    whyPoints: { type: "array", items: { type: "string" } },
    ctaText: { type: "string" },
  },
  required: [
    "heroHeadline",
    "heroSubheadline",
    "aboutTitle",
    "aboutBody",
    "services",
    "whyTitle",
    "whyPoints",
    "ctaText",
  ],
} as const;

export async function generateSiteContent(
  brief: BuilderBrief,
): Promise<SiteContent | null> {
  if (!isSiteGenConfigured()) return null;

  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      // Effort low keeps latency low for an interactive request; the prompt
      // carries the quality.
      output_config: {
        format: { type: "json_schema", schema: SITE_JSON_SCHEMA },
        effort: "low",
      },
      system:
        "You are an expert Australian web copywriter. Write warm, concrete, " +
        "benefit-led copy for a small-business website in Australian English. " +
        "No clichés, no lorem ipsum, no emoji. Keep every field tight and specific " +
        "to the business described.",
      messages: [
        {
          role: "user",
          content:
            `Write website copy for this business.\n\n` +
            `Business name: ${brief.businessName}\n` +
            `Domain: ${brief.domain ?? "(none yet)"}\n` +
            `What they do: ${brief.description}\n\n` +
            `Produce: a punchy hero headline (max ~8 words); a one-sentence ` +
            `subheadline; an About title and a 2-3 sentence body; exactly 3 ` +
            `services (each a short title + one-sentence description); a ` +
            `"why choose us" title with 3 short points; and a call-to-action ` +
            `button label.`,
        },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text;
    if (!text) return null;

    const parsed = SiteContentSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch (err) {
    console.error("[website-builder] site generation failed", (err as Error).message);
    return null;
  }
}
