import type { LlmEnrichment } from "./llm";
import type { LlmLineItem } from "./ai-schema";
import {
  DISCLAIMER,
  ENGINE_VERSION,
  STAGE_KEYS,
  type DeterministicEstimate,
  type RiskFlag,
  type StageKey,
} from "./pricing";
import type {
  FinalCategory,
  FinalLineItem,
  ScopingResult,
} from "./types";

interface DefaultLine {
  description: string;
  quantity: number;
  unit: string;
  category: FinalCategory;
}

function defaultLine(
  stage: StageKey,
  estimate: DeterministicEstimate,
): DefaultLine {
  const builtup = Math.max(1, estimate.area.builtupSqft);
  const doors = Math.max(3, estimate.area.totalFloors * 5 + 2);

  switch (stage) {
    case "FOUNDATION":
      return {
        description:
          "Earthwork, excavation, PCC, isolated footings, anti-termite treatment and backfill",
        quantity: estimate.area.footprintSqft,
        unit: "sq.ft",
        category: "COMPOSITE",
      };
    case "RCC_SUPERSTRUCTURE":
      return {
        description:
          "RCC columns, beams, slabs, staircase, shuttering, reinforcement and curing",
        quantity: builtup,
        unit: "sq.ft",
        category: "COMPOSITE",
      };
    case "MASONRY":
      return {
        description:
          "AAC block masonry, internal and external plaster, lintels and curing",
        quantity: builtup,
        unit: "sq.ft",
        category: "COMPOSITE",
      };
    case "PLUMBING":
      return {
        description:
          "CPVC supply lines, PVC drainage, sump pump point, overhead tank and sanitary rough-in",
        quantity: builtup,
        unit: "sq.ft",
        category: "COMPOSITE",
      };
    case "ELECTRICAL":
      return {
        description:
          "Conduits, wiring, distribution boards, switches, earthing and BESCOM termination point",
        quantity: builtup,
        unit: "sq.ft",
        category: "COMPOSITE",
      };
    case "TILING":
      return {
        description:
          "Vitrified floor tiles, anti-skid bathroom tiles, wall tiles, skirting and grouting",
        quantity: builtup,
        unit: "sq.ft",
        category: "MATERIAL",
      };
    case "DOORS_WINDOWS":
      return {
        description:
          "Main teak door, internal flush doors, UPVC windows, MS railings and hardware",
        quantity: doors,
        unit: "nos",
        category: "MATERIAL",
      };
    case "PAINTING":
      return {
        description:
          "Wall putty, primer, interior emulsion, exterior weather coat and enamel accents",
        quantity: builtup,
        unit: "sq.ft",
        category: "LABOR",
      };
    case "FIXTURES":
      return {
        description:
          "Modular kitchen carcass, wardrobes, sanitaryware, CP fittings and mirrors",
        quantity: 1,
        unit: "lot",
        category: "COMPOSITE",
      };
    case "EXTERNAL_WORKS":
      return {
        description:
          "Compound wall, main gate, sump, septic/drainage, rainwater harvesting and paving",
        quantity: 1,
        unit: "lot",
        category: "COMPOSITE",
      };
    case "OVERHEAD":
      return {
        description:
          "Site supervision, scaffolding, material hoisting, safety, and contractor margin",
        quantity: 1,
        unit: "lot",
        category: "OVERHEAD",
      };
  }
}

function scaleStageItems(
  candidates: LlmLineItem[],
  budgetAmount: number,
  stageIndex: number,
): FinalLineItem[] {
  const usable = candidates.filter(
    (item) => item.amount > 0 && item.quantity > 0,
  );
  const total = usable.reduce((sum, item) => sum + item.amount, 0);
  const result: FinalLineItem[] = [];
  let remaining = budgetAmount;

  usable.forEach((item, index) => {
    const isLast = index === usable.length - 1;
    const slotsLeft = usable.length - index;
    const proportional =
      total > 0 ? Math.round((item.amount / total) * budgetAmount) : 0;
    const amount = isLast
      ? remaining
      : Math.max(1, Math.min(proportional, remaining - (slotsLeft - 1)));
    remaining -= amount;

    result.push({
      stage: item.stage,
      category: item.category as FinalCategory,
      code: `AI-${item.stage}-${stageIndex}-${index + 1}`,
      description: item.description,
      quantity: Math.round(item.quantity * 100) / 100,
      unit: item.unit,
      rate:
        item.quantity > 0
          ? Math.round((amount / item.quantity) * 100) / 100
          : amount,
      amount,
      source: "LLM",
      sortOrder: 0,
    });
  });

  return result;
}

function dedupe<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const id = key(item);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

export function finalizeEstimate(
  estimate: DeterministicEstimate,
  llm: LlmEnrichment | null,
): ScopingResult {
  const lineItems: FinalLineItem[] = [];

  STAGE_KEYS.forEach((stage, stageIndex) => {
    const budget = estimate.stageBudgets.find((item) => item.stage === stage);
    if (!budget) return;

    const candidates =
      llm?.data.lineItems.filter((item) => item.stage === stage) ?? [];

    if (candidates.length > 0) {
      lineItems.push(...scaleStageItems(candidates, budget.amount, stageIndex));
      return;
    }

    const fallback = defaultLine(stage, estimate);
    lineItems.push({
      stage,
      category: fallback.category,
      code: `BW-${stage}`,
      description: fallback.description,
      quantity: fallback.quantity,
      unit: fallback.unit,
      rate:
        fallback.quantity > 0
          ? Math.round((budget.amount / fallback.quantity) * 100) / 100
          : budget.amount,
      amount: budget.amount,
      source: "DETERMINISTIC",
      sortOrder: 0,
    });
  });

  estimate.approvals.forEach((approval) => {
    lineItems.push({
      stage: "APPROVALS",
      category: "APPROVAL",
      code: approval.code,
      description: `${approval.label} — ${approval.note}`,
      quantity: 1,
      unit: "lot",
      rate: approval.amount,
      amount: approval.amount,
      source: "DETERMINISTIC",
      sortOrder: 0,
    });
  });

  lineItems.push({
    stage: "CONTINGENCY",
    category: "CONTINGENCY",
    code: "CONTINGENCY",
    description:
      "Design contingency (3%) for site variations, soil surprises and finish upgrades",
    quantity: 1,
    unit: "lot",
    rate: estimate.contingency,
    amount: estimate.contingency,
    source: "DETERMINISTIC",
    sortOrder: 0,
  });

  lineItems.push({
    stage: "TAX",
    category: "TAX",
    code: "GST_18",
    description:
      "Indicative GST at 18% on construction and contingency (approvals are shown separately)",
    quantity: 1,
    unit: "lot",
    rate: estimate.gst,
    amount: estimate.gst,
    source: "DETERMINISTIC",
    sortOrder: 0,
  });

  lineItems.forEach((item, index) => {
    item.sortOrder = index;
  });

  const llmRisks: RiskFlag[] = llm?.data.riskFlags ?? [];
  const riskFlags = dedupe(
    [...estimate.riskFlags, ...llmRisks],
    (item) => item.title.toLowerCase(),
  ).slice(0, 10);

  const assumptions = dedupe(
    [...(llm?.data.assumptions ?? []), ...estimate.assumptions],
    (item) => item.toLowerCase(),
  ).slice(0, 14);

  const exclusions = dedupe(
    [...(llm?.data.exclusions ?? []), ...estimate.exclusions],
    (item) => item.toLowerCase(),
  ).slice(0, 14);

  return {
    estimate,
    lineItems,
    narrative: llm?.data.narrative ?? estimate.summary,
    assumptions,
    exclusions,
    riskFlags,
    confidence: llm?.data.confidence ?? 0.86,
    aiMode: llm ? "llm" : "deterministic",
    aiModel: llm?.model ?? "sahibuild-rules-2026",
    engineVersion: ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER,
  };
}
