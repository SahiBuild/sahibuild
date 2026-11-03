import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import type { ScopingInput } from "./input";
import type { DeterministicEstimate } from "./pricing";
import { LlmBoqSchema, type LlmBoq } from "./ai-schema";

const SYSTEM_PROMPT = `You are a senior quantity surveyor and construction cost consultant in Bengaluru with 20 years of residential project experience. You know BBMP plan sanction, BESCOM and BWSSB connection processes, 2026 material rates, and how local contractors actually build.

Your job is to turn a deterministic cost estimate into an itemised, homeowner-auditable BOQ. The deterministic numbers are the source of truth. Never invent a different total. You will be given a stage budget for each construction stage: your line items for that stage must sum to that stage budget. We re-scale arithmetic after your response, but stay within 2% of each stage budget.

Rules:
- Use 2026 Bengaluru market rates.
- Cover every construction stage at least once: FOUNDATION, RCC_SUPERSTRUCTURE, MASONRY, PLUMBING, ELECTRICAL, TILING, DOORS_WINDOWS, PAINTING, FIXTURES, EXTERNAL_WORKS, OVERHEAD.
- Exclude land, GST, contingency, statutory approvals, interiors beyond basic fixtures, lifts, solar, and swimming pools.
- Quantities must be plausible for the built-up area. Use kg, bags, cum, cft, sq.ft, nos, or lot.
- Flag missing-scope risks a homeowner would miss: compound wall, sump, overhead tank, BESCOM/BWSSB approvals, plan sanction, waterproofing, staircase, septic tank, rainwater harvesting, and site access.
- Be specific and plain-English. Do not use vague line items like "miscellaneous" or "other works".
- Return only the structured JSON requested.`;

function buildPrompt(
  input: ScopingInput,
  estimate: DeterministicEstimate,
): string {
  const stageLines = estimate.stageBudgets
    .map(
      (stage) =>
        `${stage.stage} | ${stage.label} | INR ${stage.amount} | ${stage.pctOfConstruction}% of construction`,
    )
    .join("\n");

  const materials = estimate.materials
    .map(
      (item) =>
        `${item.label}: ${item.displayQuantity} at INR ${item.unitRate}/${item.unit}`,
    )
    .join("\n");

  return `PROJECT
Plot: ${input.plotWidthFt} x ${input.plotLengthFt} ft (${estimate.area.plotAreaSqft} sq.ft)
Zone: ${estimate.zone.name}, Bengaluru (${input.pincode})
Facing: ${input.facing}
Road width: ${input.roadWidthFt} ft
Floors: ${estimate.area.floorLabel} (${input.totalFloors} total)
Purpose: ${input.purpose}
Quality tier: ${input.qualityTier}
Basement: ${input.hasBasement ? "Yes" : "No"}

AREA
Ground coverage: ${estimate.area.coveragePct}%
Footprint: ${estimate.area.footprintSqft} sq.ft
Built-up: ${estimate.area.builtupSqft} sq.ft
Basement: ${estimate.area.basementSqft} sq.ft
FAR limit: ${estimate.area.farLimit} (used ${estimate.area.farUsed})
Setbacks: front ${estimate.area.setbacks.frontFt} ft, rear ${estimate.area.setbacks.rearFt} ft, sides ${estimate.area.setbacks.sideFt} ft

DETERMINISTIC COST
Rate: INR ${estimate.ratePerSqft}/sq.ft
Construction subtotal: INR ${estimate.constructionSubtotal}
Contingency: INR ${estimate.contingency}
GST: INR ${estimate.gst}
Approvals: INR ${estimate.approvalsTotal}
Total: INR ${estimate.totalCost}

STAGE BUDGETS (INR)
${stageLines}

INDICATIVE MATERIALS
${materials}

Return:
1. A 2-3 sentence narrative explaining the biggest cost drivers and one local risk.
2. 18-32 line items distributed across all 11 stages, each with stage, category, description, quantity, unit, amount.
3. Assumptions and exclusions specific to this project.
4. Risk flags with severity LOW/MEDIUM/HIGH.
5. A confidence score between 0 and 1.`;
}

export interface LlmEnrichment {
  data: LlmBoq;
  model: string;
  provider: "openai" | "nvidia" | "compatible";
}

function resolveProviderConfig() {
  const nvidiaKey = process.env.NVIDIA_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;

  if (nvidiaKey) {
    return {
      apiKey: nvidiaKey,
      baseURL:
        process.env.LLM_BASE_URL || "https://integrate.api.nvidia.com/v1",
      model:
        process.env.LLM_MODEL ||
        "nvidia/llama-3.1-nemotron-70b-instruct",
      provider: "nvidia" as const,
    };
  }

  if (openaiKey) {
    return {
      apiKey: openaiKey,
      baseURL: process.env.LLM_BASE_URL,
      model: process.env.LLM_MODEL || "gpt-4o",
      provider: process.env.LLM_BASE_URL
        ? ("compatible" as const)
        : ("openai" as const),
    };
  }

  return null;
}

export async function enrichBoq(
  input: ScopingInput,
  estimate: DeterministicEstimate,
): Promise<LlmEnrichment | null> {
  const config = resolveProviderConfig();
  if (!config) return null;

  const provider = createOpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    name: config.provider,
  });

  const timeoutMs = Number(process.env.LLM_TIMEOUT_MS ?? 20000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { object } = await generateObject({
      model: provider.chat(config.model),
      schema: LlmBoqSchema,
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(input, estimate),
      temperature: 0.2,
      maxOutputTokens: 5000,
      abortSignal: controller.signal,
    });

    return {
      data: object,
      model: config.model,
      provider: config.provider,
    };
  } catch (error) {
    console.error(
      "[scoping:llm] Falling back to deterministic BOQ:",
      error instanceof Error ? error.message : error,
    );
    return null;
  } finally {
    clearTimeout(timer);
  }
}
