import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { analyzeQuote } from "@/lib/audit/analyze";
import {
  BENGALURU_ZONES,
  BASE_RATE_2026,
  QualityTierSchema,
  ZoneSlugSchema,
} from "@/lib/scoping/rules";

export const maxDuration = 30;

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const quotedRaw = form.get("quotedTotal");
  const builtupRaw = form.get("builtupSqft");
  const tierRaw = form.get("qualityTier");
  const zoneRaw = form.get("zoneSlug");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload a PDF quote to audit." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "PDF is larger than 10 MB. Please upload a smaller file." },
      { status: 413 },
    );
  }

  if (file.type && file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported." },
      { status: 415 },
    );
  }

  const tier = QualityTierSchema.safeParse(tierRaw);
  const zone = ZoneSlugSchema.safeParse(zoneRaw);
  const builtup = Number(builtupRaw);
  const quotedTotal = Number(quotedRaw);

  let text = "";
  let totalPages: number | null = null;

  try {
    const buffer = new Uint8Array(await file.arrayBuffer());
    const pdf = await getDocumentProxy(buffer);
    const extracted = await extractText(pdf, { mergePages: true });
    text = extracted.text;
    totalPages = extracted.totalPages;
  } catch (error) {
    console.error("[audit:extract]", error);
    return NextResponse.json(
      {
        error:
          "Could not read this PDF. It may be password-protected or corrupted. Try exporting it again.",
      },
      { status: 422 },
    );
  }

  let benchmarkTotal: number | null = null;
  if (Number.isFinite(builtup) && builtup >= 200 && tier.success && zone.success) {
    const rate =
      BASE_RATE_2026[tier.data] * BENGALURU_ZONES[zone.data].multiplier;
    const construction = builtup * rate;
    const approvals = Math.max(25000, builtup * 12) + 110000;
    benchmarkTotal = Math.round(
      construction + construction * 0.03 + approvals + (construction * 1.03) * 0.18,
    );
  }

  const result = analyzeQuote(text, {
    quotedTotal:
      Number.isFinite(quotedTotal) && quotedTotal > 0 ? quotedTotal : null,
    benchmarkTotal,
    pages: totalPages,
  });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
