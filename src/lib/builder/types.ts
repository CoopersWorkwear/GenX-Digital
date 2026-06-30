/** Shared types for the AI website builder. */

export interface ColorScheme {
  primary: string;
  accent: string;
}

export interface SiteService {
  title: string;
  description: string;
}

/** AI-generated website copy, rendered into the preview template. */
export interface SiteContent {
  heroHeadline: string;
  heroSubheadline: string;
  aboutTitle: string;
  aboutBody: string;
  services: SiteService[];
  whyTitle: string;
  whyPoints: string[];
  ctaText: string;
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
