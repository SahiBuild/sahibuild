import {
  BENGALURU_ZONES,
  BASE_RATE_2026,
  PURPOSE_META,
  calculateBuiltupArea,
  getFloorLabel,
  type AreaResult,
  type Facing,
  type Purpose,
  type QualityTier,
  type ZoneSlug,
} from "./rules";

export const ENGINE_VERSION = "2026.11.1";
export const DISCLAIMER =
  "Planning-grade estimate only. Not a BBMP sanction, structural certificate, or a substitute for contractor quotations. Final FAR, setbacks, and statutory fees must be verified with a licensed architect and BBMP/BESCOM/BWSSB.";

export const STAGE_KEYS = [
  "FOUNDATION",
  "RCC_SUPERSTRUCTURE",
  "MASONRY",
  "PLUMBING",
  "ELECTRICAL",
  "TILING",
  "DOORS_WINDOWS",
  "PAINTING",
  "FIXTURES",
  "EXTERNAL_WORKS",
  "OVERHEAD",
] as const;

export type StageKey = (typeof STAGE_KEYS)[number];

export type CostGroup =
  | "STRUCTURE"
  | "FINISHES"
  | "MEP"
  | "EXTERNAL"
  | "OVERHEAD";

export const STAGE_META: Record<
  StageKey,
  { label: string; group: CostGroup; weight: number; description: string }
> = {
  FOUNDATION: {
    label: "Foundation & earthwork",
    group: "STRUCTURE",
    weight: 7,
    description: "Excavation, PCC, footings, anti-termite, backfill",
  },
  RCC_SUPERSTRUCTURE: {
    label: "RCC superstructure",
    group: "STRUCTURE",
    weight: 29,
    description: "Columns, beams, slabs, staircase, shuttering",
  },
  MASONRY: {
    label: "Masonry & plastering",
    group: "STRUCTURE",
    weight: 12,
    description: "Block work, internal/external plaster, curing",
  },
  PLUMBING: {
    label: "Plumbing & sanitary",
    group: "MEP",
    weight: 6,
    description: "CPVC lines, drainage, sump, overhead tank, fittings",
  },
  ELECTRICAL: {
    label: "Electrical & wiring",
    group: "MEP",
    weight: 5,
    description: "Conduits, wiring, DB, switches, earthing, BESCOM point",
  },
  TILING: {
    label: "Flooring & tiling",
    group: "FINISHES",
    weight: 8,
    description: "Vitrified/marble flooring, wall tiles, skirting",
  },
  DOORS_WINDOWS: {
    label: "Doors, windows & joinery",
    group: "FINISHES",
    weight: 6,
    description: "Main door, internal doors, UPVC windows, railings",
  },
  PAINTING: {
    label: "Painting & finishing",
    group: "FINISHES",
    weight: 4,
    description: "Putty, primer, emulsion, enamel, waterproof coat",
  },
  FIXTURES: {
    label: "Kitchen & fixtures",
    group: "FINISHES",
    weight: 8,
    description: "Modular kitchen, wardrobes, sanitaryware, mirrors",
  },
  EXTERNAL_WORKS: {
    label: "External works",
    group: "EXTERNAL",
    weight: 5,
    description: "Compound wall, gate, sump, septic, drainage, paving",
  },
  OVERHEAD: {
    label: "Contractor overhead & profit",
    group: "OVERHEAD",
    weight: 10,
    description: "Site supervision, hoisting, scaffolding, margin",
  },
};

export const GROUP_META: Record<
  CostGroup,
  { label: string; color: string; short: string }
> = {
  STRUCTURE: { label: "Structure", color: "#173E2E", short: "STR" },
  FINISHES: { label: "Finishes", color: "#DD6B45", short: "FIN" },
  MEP: { label: "MEP", color: "#6A8D73", short: "MEP" },
  EXTERNAL: { label: "External works", color: "#B9A15B", short: "EXT" },
  OVERHEAD: { label: "Overhead & profit", color: "#8A8172", short: "OVH" },
};

export interface EstimateInput {
  plotWidthFt: number;
  plotLengthFt: number;
  facing: Facing;
  zoneSlug: ZoneSlug;
  pincode: string;
  roadWidthFt: number;
  totalFloors: number;
  hasBasement: boolean;
  purpose: Purpose;
  qualityTier: QualityTier;
}

export interface StageBudget {
  stage: StageKey;
  label: string;
  group: CostGroup;
  description: string;
  amount: number;
  pctOfConstruction: number;
}

export interface GroupBreakdown {
  group: CostGroup;
  label: string;
  color: string;
  amount: number;
  pctOfTotal: number;
}

export interface ApprovalItem {
  code: string;
  label: string;
  amount: number;
  note: string;
}

export interface MaterialLine {
  material:
    | "STEEL"
    | "CEMENT"
    | "SAND"
    | "AGGREGATE"
    | "BLOCKS"
    | "TILES"
    | "PAINT";
  label: string;
  quantity: number;
  unit: string;
  unitRate: number;
  amount: number;
  displayQuantity: string;
}

export interface RiskFlag {
  severity: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  detail: string;
}

export interface DeterministicEstimate {
  area: AreaResult;
  zone: { slug: ZoneSlug; name: string; note: string };
  qualityTier: QualityTier;
  purpose: Purpose;
  facing: Facing;
  pincode: string;
  baseRatePerSqft: number;
  ratePerSqft: number;
  zoneMultiplier: number;
  purposeMultiplier: number;
  floorMultiplier: number;
  constructionSubtotal: number;
  stageBudgets: StageBudget[];
  breakdown: GroupBreakdown[];
  approvals: ApprovalItem[];
  approvalsTotal: number;
  contingency: number;
  gst: number;
  totalCost: number;
  effectiveRatePerSqft: number;
  materials: MaterialLine[];
  riskFlags: RiskFlag[];
  assumptions: string[];
  exclusions: string[];
  summary: string;
}

const MATERIAL_FACTORS: Record<
  QualityTier,
  {
    steelKg: number;
    cementBags: number;
    sandCft: number;
    aggregateCft: number;
    blocks: number;
    tilesSqft: number;
    paintL: number;
  }
> = {
  BASIC: {
    steelKg: 4.0,
    cementBags: 0.42,
    sandCft: 1.6,
    aggregateCft: 1.25,
    blocks: 7.5,
    tilesSqft: 0.95,
    paintL: 0.1,
  },
  STANDARD: {
    steelKg: 4.4,
    cementBags: 0.45,
    sandCft: 1.75,
    aggregateCft: 1.35,
    blocks: 8,
    tilesSqft: 1.1,
    paintL: 0.12,
  },
  PREMIUM: {
    steelKg: 4.8,
    cementBags: 0.48,
    sandCft: 1.9,
    aggregateCft: 1.45,
    blocks: 8.5,
    tilesSqft: 1.25,
    paintL: 0.14,
  },
  LUXURY: {
    steelKg: 5.1,
    cementBags: 0.52,
    sandCft: 2,
    aggregateCft: 1.55,
    blocks: 9,
    tilesSqft: 1.4,
    paintL: 0.16,
  },
};

function round(value: number): number {
  return Math.round(value);
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function buildMaterials(
  materialBaseSqft: number,
  tier: QualityTier,
): MaterialLine[] {
  const f = MATERIAL_FACTORS[tier];
  const steelKg = roundTo(materialBaseSqft * f.steelKg, 10);
  const cementBags = roundTo(materialBaseSqft * f.cementBags, 1);
  const sandCft = roundTo(materialBaseSqft * f.sandCft, 10);
  const aggregateCft = roundTo(materialBaseSqft * f.aggregateCft, 10);
  const blocks = roundTo(materialBaseSqft * f.blocks, 10);
  const tilesSqft = roundTo(materialBaseSqft * f.tilesSqft, 10);
  const paintL = roundTo(materialBaseSqft * f.paintL, 1);

  return [
    {
      material: "STEEL",
      label: "TMT Fe500D steel",
      quantity: steelKg,
      unit: "kg",
      unitRate: 74,
      amount: round(steelKg * 74),
      displayQuantity: `${(steelKg / 1000).toFixed(2)} tonnes`,
    },
    {
      material: "CEMENT",
      label: "OPC / PPC cement",
      quantity: cementBags,
      unit: "50 kg bags",
      unitRate: 440,
      amount: round(cementBags * 440),
      displayQuantity: `${round(cementBags)} bags`,
    },
    {
      material: "SAND",
      label: "M-sand / river sand",
      quantity: sandCft,
      unit: "cft",
      unitRate: 68,
      amount: round(sandCft * 68),
      displayQuantity: `${round(sandCft)} cft`,
    },
    {
      material: "AGGREGATE",
      label: "20mm & 40mm aggregate",
      quantity: aggregateCft,
      unit: "cft",
      unitRate: 52,
      amount: round(aggregateCft * 52),
      displayQuantity: `${round(aggregateCft)} cft`,
    },
    {
      material: "BLOCKS",
      label: "Solid / AAC blocks",
      quantity: blocks,
      unit: "nos",
      unitRate: 45,
      amount: round(blocks * 45),
      displayQuantity: `${round(blocks)} blocks`,
    },
    {
      material: "TILES",
      label: "Floor + wall tiles",
      quantity: tilesSqft,
      unit: "sq.ft",
      unitRate: 95,
      amount: round(tilesSqft * 95),
      displayQuantity: `${round(tilesSqft)} sq.ft`,
    },
    {
      material: "PAINT",
      label: "Emulsion + primer",
      quantity: paintL,
      unit: "litres",
      unitRate: 340,
      amount: round(paintL * 340),
      displayQuantity: `${round(paintL)} L`,
    },
  ];
}

function buildApprovals(
  builtupSqft: number,
  totalFloors: number,
  constructionSubtotal: number,
  hasBasement: boolean,
): ApprovalItem[] {
  const floorPremium = Math.max(0, totalFloors - 1);
  const items: ApprovalItem[] = [
    {
      code: "BBMP_PLAN",
      label: "BBMP plan sanction & infrastructure cess",
      amount: round(Math.max(25000, builtupSqft * 12)),
      note: "Indicative; depends on plot area, road width, and zone",
    },
    {
      code: "BESCOM",
      label: "BESCOM service connection",
      amount: round(35000 + floorPremium * 7500 + (hasBasement ? 5000 : 0)),
      note: "Load-based deposit; 3-phase assumed",
    },
    {
      code: "BWSSB",
      label: "BWSSB water & sanitary connection",
      amount: round(45000 + floorPremium * 9000),
      note: "Deposit varies by fixture count and area",
    },
    {
      code: "KHATA_LEGAL",
      label: "Khata, EC & documentation",
      amount: 15000,
      note: "Legal verification and khata transfer support",
    },
    {
      code: "LABOUR_CESS",
      label: "Labour cess (1% of construction)",
      amount: round(constructionSubtotal * 0.01),
      note: "Statutory cess on construction works",
    },
    {
      code: "DESIGN_LIAISON",
      label: "Architect, structural design & liaison",
      amount: round(constructionSubtotal * 0.015),
      note: "Concept design, structural drawings, plan liaison",
    },
  ];

  return items;
}

export function buildEstimate(input: EstimateInput): DeterministicEstimate {
  const area = calculateBuiltupArea({
    plotWidthFt: input.plotWidthFt,
    plotLengthFt: input.plotLengthFt,
    totalFloors: input.totalFloors,
    roadWidthFt: input.roadWidthFt,
    hasBasement: input.hasBasement,
  });

  const zone = BENGALURU_ZONES[input.zoneSlug];
  const baseRatePerSqft = BASE_RATE_2026[input.qualityTier];
  const purposeMultiplier = PURPOSE_META[input.purpose].multiplier;
  const floorMultiplier = 1 + 0.012 * Math.max(0, input.totalFloors - 1);
  const rawRate =
    baseRatePerSqft *
    zone.multiplier *
    purposeMultiplier *
    floorMultiplier;
  const ratePerSqft = Math.round(Math.min(3500, Math.max(1950, rawRate)));

  const mainConstruction = area.builtupSqft * ratePerSqft;
  const basementConstruction = area.basementSqft * ratePerSqft * 0.55;
  const constructionSubtotal = round(mainConstruction + basementConstruction);

  const stageBudgets: StageBudget[] = STAGE_KEYS.map((stage) => {
    const meta = STAGE_META[stage];
    return {
      stage,
      label: meta.label,
      group: meta.group,
      description: meta.description,
      amount: round((constructionSubtotal * meta.weight) / 100),
      pctOfConstruction: meta.weight,
    };
  });

  const stageSum = stageBudgets.reduce((sum, item) => sum + item.amount, 0);
  const overhead = stageBudgets.find((item) => item.stage === "OVERHEAD");
  if (overhead) overhead.amount += constructionSubtotal - stageSum;

  const groupTotals = stageBudgets.reduce(
    (acc, item) => {
      acc[item.group] = (acc[item.group] ?? 0) + item.amount;
      return acc;
    },
    {} as Record<CostGroup, number>,
  );

  const approvals = buildApprovals(
    area.builtupSqft,
    input.totalFloors,
    constructionSubtotal,
    input.hasBasement,
  );
  const approvalsTotal = approvals.reduce((sum, item) => sum + item.amount, 0);
  const contingency = round(constructionSubtotal * 0.03);
  const gst = round((constructionSubtotal + contingency) * 0.18);
  const totalCost =
    constructionSubtotal + contingency + approvalsTotal + gst;

  const breakdown: GroupBreakdown[] = (
    ["STRUCTURE", "FINISHES", "MEP", "EXTERNAL", "OVERHEAD"] as CostGroup[]
  ).map((group) => ({
    group,
    label: GROUP_META[group].label,
    color: GROUP_META[group].color,
    amount: groupTotals[group] ?? 0,
    pctOfTotal: totalCost > 0 ? ((groupTotals[group] ?? 0) / totalCost) * 100 : 0,
  }));

  const materialBase =
    area.builtupSqft + area.basementSqft * 0.6;
  const materials = buildMaterials(materialBase, input.qualityTier);

  const riskFlags: RiskFlag[] = [];
  if (area.farCapped) {
    riskFlags.push({
      severity: "HIGH",
      title: "Requested floors exceed the FAR envelope",
      detail: `At a ${input.roadWidthFt} ft road, the planning FAR assumption is ${area.farLimit}. Only ${area.maxFloorsByFar} floors fit within the permissible built-up area. Reduce floors or appoint an architect to explore a relaxation.`,
    });
  }
  if (area.plotAreaSqft < 800) {
    riskFlags.push({
      severity: "MEDIUM",
      title: "Tight site, higher logistics cost",
      detail:
        "Small plots often need manual excavation, restricted material storage, and careful shuttering. Keep a 3–5% site logistics buffer.",
    });
  }
  if (input.roadWidthFt < 30) {
    riskFlags.push({
      severity: "MEDIUM",
      title: "Narrow road access",
      detail:
        "Roads under 30 ft can reduce permissible FAR and make RMC truck access difficult. Confirm road width in the khata/plan documents.",
    });
  }
  if (input.totalFloors >= 4) {
    riskFlags.push({
      severity: "MEDIUM",
      title: "G+3 needs enhanced structural design",
      detail:
        "Higher structures need a licensed structural engineer, soil test, and additional hoisting/scaffolding provisions. Budget for a stability certificate.",
    });
  }
  if (input.hasBasement) {
    riskFlags.push({
      severity: "MEDIUM",
      title: "Basement waterproofing is critical",
      detail:
        "Bengaluru's water table and clayey soil make basement tanking and drainage a common cost overrun. Get a geotechnical report before excavation.",
    });
  }
  if (riskFlags.length === 0) {
    riskFlags.push({
      severity: "LOW",
      title: "Standard site risk",
      detail:
        "No major planning red flags from the inputs. Site access, soil condition, and actual khata setbacks still need verification.",
    });
  }

  const assumptions = [
    "Ground coverage is assumed at 70% for plots up to 4,000 sq.ft (65% above), consistent with common BBMP planning envelopes.",
    `FAR is assumed at ${area.farLimit} for a ${input.roadWidthFt} ft road; actual FAR depends on plot area, zone, and the latest BBMP/KMC bylaws.`,
    "Rates are 2026 Bengaluru market bands, indexed quarterly. Final quotes typically vary by ±10–15% with site conditions and finish selection.",
    "GST at 18% is shown separately and calculated on construction + contingency; statutory fees are indicative.",
    "Material quantities use standard residential consumption norms and include normal wastage. They are for procurement planning, not a purchase order.",
    "Contractor overhead includes site supervision, scaffolding, hoisting, and a typical margin. It is not a hidden charge.",
  ];

  const exclusions = [
    "Land cost, stamp duty, registration, and khata transfer charges",
    "Interior decoration, loose furniture, appliances, and art",
    "Lift, solar, borewell, swimming pool, and landscaping",
    "Premium smart-home integration beyond basic conduits",
    "Statutory delays, penalties, and variations after plan sanction",
    "BESCOM/BWSSB deposits beyond the indicative connection allowance",
  ];

  const summary = `A ${input.qualityTier.toLowerCase()} ${getFloorLabel(
    input.totalFloors,
  )} home on a ${input.plotWidthFt}×${input.plotLengthFt} ft plot in ${
    zone.name
  } pencils out at ${round(area.builtupSqft).toLocaleString(
    "en-IN",
  )} sq.ft built-up. At ₹${ratePerSqft.toLocaleString(
    "en-IN",
  )}/sq.ft, construction is about ₹${(constructionSubtotal / 100000).toFixed(
    1,
  )} L before GST, contingency, and statutory fees.`;

  return {
    area,
    zone: { slug: input.zoneSlug, name: zone.name, note: zone.note },
    qualityTier: input.qualityTier,
    purpose: input.purpose,
    facing: input.facing,
    pincode: input.pincode,
    baseRatePerSqft,
    ratePerSqft,
    zoneMultiplier: zone.multiplier,
    purposeMultiplier,
    floorMultiplier,
    constructionSubtotal,
    stageBudgets,
    breakdown,
    approvals,
    approvalsTotal,
    contingency,
    gst,
    totalCost,
    effectiveRatePerSqft: Math.round(totalCost / Math.max(1, area.builtupSqft)),
    materials,
    riskFlags,
    assumptions,
    exclusions,
    summary,
  };
}
