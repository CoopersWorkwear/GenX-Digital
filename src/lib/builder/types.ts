/** Shared types for the AI website builder. */

export interface ColorScheme {
  primary: string;
  accent: string;
}

export interface SiteService {
  title: string;
  description: string;
}

export interface SiteStat {
  value: string;
  label: string;
}

export interface SiteTestimonial {
  quote: string;
  name: string;
  role: string;
}

export interface SiteFaqItem {
  question: string;
  answer: string;
}

/** AI-generated website content, rendered into the preview template. */
export interface SiteContent {
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  aboutTitle: string;
  aboutBody: string;
  services: SiteService[];
  whyTitle: string;
  features: string[];
  stats: SiteStat[];
  testimonials: SiteTestimonial[];
  faqs: SiteFaqItem[];
}

export interface BuilderBrief {
  businessName: string;
  /** Optional — not all customers have a domain yet. */
  domain?: string;
  description: string;
  scheme: ColorScheme;
  /** Public URL of the uploaded logo, if any. */
  logoUrl?: string;
  /** Public URLs of any uploaded images. */
  imageUrls?: string[];
  /** Customer asked us to design a logo for them. */
  wantsLogo?: boolean;
  /** Customer asked us to source/create images for them. */
  wantsImages?: boolean;
  /** Customer wants help choosing a colour scheme. */
  wantsColourHelp?: boolean;
  /** AI-generated copy (present once generated). */
  content?: SiteContent;
}
