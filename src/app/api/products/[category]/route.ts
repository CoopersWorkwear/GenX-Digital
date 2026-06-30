import { NextResponse } from "next/server";
import { getProductPlans } from "@/lib/dreamscape/products";
import { DreamscapeApiError } from "@/lib/dreamscape/client";
import { isDreamscapeConfigured } from "@/lib/dreamscape/config";
import { retailPrice, formatAud } from "@/lib/pricing";
import type { ProductCategory } from "@/lib/dreamscape/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: ProductCategory[] = ["hosting", "ssl", "email"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  if (!VALID.includes(category as ProductCategory)) {
    return NextResponse.json({ error: "Unknown product category." }, { status: 404 });
  }

  if (!isDreamscapeConfigured()) {
    return NextResponse.json({ configured: false, plans: [] }, { status: 200 });
  }

  try {
    const plans = await getProductPlans(category as ProductCategory);
    const result = plans.map((plan) => {
      const price = retailPrice(plan.costPrice);
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description ?? null,
        features: plan.features ?? [],
        billingCycle: plan.billingCycle ?? "annually",
        price: price ?? null,
        priceFormatted: formatAud(price),
      };
    });
    return NextResponse.json({ configured: true, plans: result });
  } catch (err) {
    if (err instanceof DreamscapeApiError) {
      console.error("[dreamscape] products error", {
        category,
        status: err.status,
        message: err.message,
      });
      return NextResponse.json(
        { error: "Couldn't load plans right now." },
        { status: 502 },
      );
    }
    throw err;
  }
}
