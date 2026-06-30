import type { ColorScheme } from "./types";
import { DEFAULT_SCHEME } from "./schemes";

/**
 * Extract a primary + accent colour from a logo image, entirely in the browser
 * (no upload needed). Draws the image to a small canvas, ignores transparent /
 * near-white / near-black pixels, buckets the rest, and picks the two most
 * prominent, visually-distinct colours.
 */
export async function extractSchemeFromFile(file: File): Promise<ColorScheme> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const counts = sampleColors(img);
    return pickScheme(counts);
  } catch {
    return DEFAULT_SCHEME;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function sampleColors(img: HTMLImageElement): Map<string, { count: number; rgb: [number, number, number] }> {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const counts = new Map<string, { count: number; rgb: [number, number, number] }>();
  if (!ctx) return counts;

  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 128) continue; // transparent
    if (r > 238 && g > 238 && b > 238) continue; // near-white
    if (r < 18 && g < 18 && b < 18) continue; // near-black
    // Bucket to reduce noise.
    const key = `${Math.round(r / 24)}-${Math.round(g / 24)}-${Math.round(b / 24)}`;
    const entry = counts.get(key);
    if (entry) entry.count++;
    else counts.set(key, { count: 1, rgb: [r, g, b] });
  }
  return counts;
}

function pickScheme(
  counts: Map<string, { count: number; rgb: [number, number, number] }>,
): ColorScheme {
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
  if (sorted.length === 0) return DEFAULT_SCHEME;

  const primary = sorted[0].rgb;
  // Accent: the most prominent colour that's visually distinct from primary.
  const accent =
    sorted.find((c) => colourDistance(c.rgb, primary) > 80)?.rgb ?? lighten(primary);

  return { primary: toHex(primary), accent: toHex(accent) };
}

function colourDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function lighten([r, g, b]: [number, number, number]): [number, number, number] {
  return [Math.min(255, r + 60), Math.min(255, g + 60), Math.min(255, b + 60)];
}

function toHex([r, g, b]: [number, number, number]): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}
