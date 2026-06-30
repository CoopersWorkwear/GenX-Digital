import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://gen-x-digital.vercel.app";

const ROUTES = [
  "",
  "/domains",
  "/hosting",
  "/ssl",
  "/email",
  "/website-builder",
  "/about",
  "/contact",
  "/support",
  "/terms",
  "/privacy",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
