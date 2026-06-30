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

  const name = brief.businessName;
  const domain = brief.domain ? brief.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;

  return {
    tagline: name,
    heroHeadline: name,
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
    stats: [
      { value: "5.0", label: "Customer rating" },
      { value: "100%", label: "Local & trusted" },
      { value: "Fast", label: "Friendly service" },
    ],
    testimonials: [
      {
        quote: `${name} made the whole thing easy from start to finish. Highly recommend.`,
        name: "Sarah M.",
        role: "Local customer",
      },
      {
        quote: "Professional, friendly and great value. Couldn't be happier.",
        name: "James T.",
        role: "Local customer",
      },
      {
        quote: "Exactly what we needed — fast, reliable and a pleasure to deal with.",
        name: "Priya N.",
        role: "Local customer",
      },
    ],
    faqs: [
      {
        question: `What does ${name} offer?`,
        answer: brief.description,
      },
      {
        question: "How can I get in touch?",
        answer: domain
          ? `Reach out any time at hello@${domain} and we'll get back to you quickly.`
          : "Get in touch through our contact section and we'll get back to you quickly.",
      },
      {
        question: "Where are you based?",
        answer: "We're a proud Australian business serving customers locally.",
      },
      {
        question: "How do I get started?",
        answer: "Just send us a message — we'll talk through what you need and take it from there.",
      },
    ],
  };
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]?/);
  return (m?.[0] ?? text).trim();
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
