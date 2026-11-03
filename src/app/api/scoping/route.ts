import { NextResponse } from "next/server";
import { ScopingInputSchema } from "@/lib/scoping/input";
import { buildEstimate } from "@/lib/scoping/pricing";
import { enrichBoq } from "@/lib/scoping/llm";
import { finalizeEstimate } from "@/lib/scoping/reconcile";

export const maxDuration = 30;

const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const limit = rateLimit(`scope:${ip}`);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many estimates. Please try again in a minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = ScopingInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the plot details.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    const estimate = buildEstimate(parsed.data);
    const ai = await enrichBoq(parsed.data, estimate);
    const result = finalizeEstimate(estimate, ai);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-AI-Mode": result.aiMode,
      },
    });
  } catch (error) {
    console.error("[scoping:route]", error);
    return NextResponse.json(
      { error: "Could not generate the estimate. Please retry." },
      { status: 500 },
    );
  }
}
