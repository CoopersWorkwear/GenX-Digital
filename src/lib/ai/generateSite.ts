import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { BuilderBrief, SiteContent } from "@/lib/builder/types";

/**
 * Generate a full set of tailored website content for a customer's business
 * using the Claude API, validated against our template's shape. Pay-as-you-go;
 * gated on ANTHROPIC_API_KEY with graceful fallback.
 */

export function isSiteGenConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const SiteContentSchema = z.object({
  tagline: z.string(),
  heroHeadline: z.string(),
  heroSubheadline: z.string(),
  ctaText: z.string(),
  aboutTitle: z.string(),
  aboutBody: z.string(),
  services: z.array(z.object({ title: z.string(), description: z.string() })),
  whyTitle: z.string(),
  features: z.array(z.string()),
  stats: z.array(z.object({ value: z.string(), label: z.string() })),
  testimonials: z.array(
    z.object({ quote: z.string(), name: z.string(), role: z.string() }),
  ),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
});

const strArr = (items: object) => ({ type: "array", items });
const obj = (properties: Record<string, unknown>, required: string[]) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required,
});

const SITE_JSON_SCHEMA = obj(
  {
    tagline: { type: "string" },
    heroHeadline: { type: "string" },
    heroSubheadline: { type: "string" },
    ctaText: { type: "string" },
    aboutTitle: { type: "string" },
    aboutBody: { type: "string" },
    services: strArr(
      obj({ title: { type: "string" }, description: { type: "string" } }, ["title", "description"]),
    ),
    whyTitle: { type: "string" },
    features: strArr({ type: "string" }),
    stats: strArr(
      obj({ value: { type: "string" }, label: { type: "string" } }, ["value", "label"]),
    ),
    testimonials: strArr(
      obj(
        { quote: { type: "string" }, name: { type: "string" }, role: { type: "string" } },
        ["quote", "name", "role"],
      ),
    ),
    faqs: strArr(
      obj({ question: { type: "string" }, answer: { type: "string" } }, ["question", "answer"]),
    ),
  },
  [
    "tagline",
    "heroHeadline",
    "heroSubheadline",
    "ctaText",
    "aboutTitle",
    "aboutBody",
    "services",
    "whyTitle",
    "features",
    "stats",
    "testimonials",
    "faqs",
  ],
);

export async function generateSiteContent(
  brief: BuilderBrief,
): Promise<SiteContent | null> {
  if (!isSiteGenConfigured()) return null;

  const client = new Anthropic();

  try {
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 6000,
      output_config: {
        format: { type: "json_schema", schema: SITE_JSON_SCHEMA },
        effort: "medium",
      },
      system:
        "You are an award-winning web copywriter and brand strategist for Australian " +
        "small businesses. Write specific, vivid, benefit-led copy in Australian " +
        "English — never generic filler, clichés, lorem ipsum or emoji. Make every " +
        "line feel written for THIS business.",
      messages: [
        {
          role: "user",
          content:
            `Create complete website content for this business.\n\n` +
            `Business: ${brief.businessName}\n` +
            `Domain: ${brief.domain ?? "(not chosen yet)"}\n` +
            `What they do: ${brief.description}\n\n` +
            `Produce:\n` +
            `- tagline: a short brand line (≤6 words)\n` +
            `- heroHeadline: bold, benefit-driven (≤9 words)\n` +
            `- heroSubheadline: one compelling sentence\n` +
            `- ctaText: a button label (≤3 words)\n` +
            `- aboutTitle + aboutBody: a warm 2-3 sentence about section\n` +
            `- services: 4-6 services, each a specific title + one-sentence benefit\n` +
            `- whyTitle + features: a "why choose us" title and 4 short, concrete points\n` +
            `- stats: 3 credible-looking stats (value + label), e.g. years, clients, rating\n` +
            `- testimonials: 3 realistic short customer quotes with first name + suburb/role\n` +
            `- faqs: 4 relevant question/answer pairs\n` +
            `Tailor everything to the business described.`,
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
