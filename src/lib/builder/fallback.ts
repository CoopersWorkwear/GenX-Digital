import type { BuilderBrief, SiteContent } from "./types";

/** Build reasonable website content from the brief when AI isn't configured. */
export function fallbackContent(brief: BuilderBrief): SiteContent {
  const first = firstSentence(brief.description) || `Welcome to ${brief.businessName}`;
  const phrases = brief.description
    .split(/[,.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4 && s.length < 46);

  const serviceTitles = phrases.length >= 3 ? phrases.slice(0, 3) : ["What we do", "How we help", "Our promise"];
  const services = serviceTitles.map((title) => ({
    title: capitalise(title),
    description: "Professional, reliable and tailored to exactly what you need.",
  }));

  return {
    tagline: brief.businessName,
    heroHeadline: brief.businessName,
    heroSubheadline: first,
    ctaText: "Get in touch",
    aboutTitle: "About us",
    aboutBody: brief.description,
    services,
    whyTitle: "Why choose us",
    features: [
      "Quality you can trust",
      "Friendly, local service",
      "Great value",
      "Reliable and on time",
    ],
    stats: [],
    testimonials: [],
    faqs: [],
  };
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]?/);
  return (m?.[0] ?? text).trim();
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
