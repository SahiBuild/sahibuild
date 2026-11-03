import { z } from "zod";

export const FACINGS = [
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "NORTH_EAST",
  "NORTH_WEST",
  "SOUTH_EAST",
  "SOUTH_WEST",
] as const;

export type Facing = (typeof FACINGS)[number];

export const FacingSchema = z.enum(FACINGS);

export const FACING_LABELS: Record<Facing, string> = {
  NORTH: "North",
  SOUTH: "South",
  EAST: "East",
  WEST: "West",
  NORTH_EAST: "North-East",
  NORTH_WEST: "North-West",
  SOUTH_EAST: "South-East",
  SOUTH_WEST: "South-West",
};

export const QUALITY_TIERS = [
  "BASIC",
  "STANDARD",
  "PREMIUM",
  "LUXURY",
] as const;

export type QualityTier = (typeof QUALITY_TIERS)[number];

export const QualityTierSchema = z.enum(QUALITY_TIERS);

export const QUALITY_META: Record<
  QualityTier,
  {
    label: string;
    range: string;
    blurb: string;
    points: string[];
    accent: string;
  }
> = {
  BASIC: {
    label: "Basic",
    range: "₹1,950–2,150 / sq.ft",
    blurb: "Solid, rent-ready construction with reliable basics.",
    points: [
      "Vitrified tiles, emulsion paint",
      "Standard CP fittings",
      "MS railings, teak-frame doors",
    ],
    accent: "#D8D3C4",
  },
  STANDARD: {
    label: "Standard",
    range: "₹2,300–2,550 / sq.ft",
    blurb: "The Bengaluru family default — durable and well finished.",
    points: [
      "Large-format vitrified tiles",
      "Jaguar / Cera sanitaryware",
      "UPVC windows, granite counters",
    ],
    accent: "#B8CBA7",
  },
  PREMIUM: {
    label: "Premium",
    range: "₹2,750–3,100 / sq.ft",
    blurb: "Design-led finishes for a home you plan to keep.",
    points: [
      "Engineered wood in bedrooms",
      "Kohler / Grohe fittings",
      "Modular kitchen, false ceiling",
    ],
    accent: "#E4C38F",
  },
  LUXURY: {
    label: "Luxury",
    range: "₹3,200–3,500 / sq.ft",
    blurb: "High-spec materials, imported finishes, custom joinery.",
    points: [
      "Imported marble and veneers",
      "Smart home + VRV provisions",
      "Landscaped terrace, lift shaft",
    ],
    accent: "#DD9B84",
  },
};

export const BASE_RATE_2026: Record<QualityTier, number> = {
  BASIC: 1950,
  STANDARD: 2400,
  PREMIUM: 2900,
  LUXURY: 3500,
};

export const PURPOSES = ["SELF_USE", "RENTAL", "MIXED"] as const;
export type Purpose = (typeof PURPOSES)[number];
export const PurposeSchema = z.enum(PURPOSES);

export const PURPOSE_META: Record<
  Purpose,
  { label: string; description: string; multiplier: number }
> = {
  SELF_USE: {
    label: "Self-use",
    description: "A home for your family",
    multiplier: 1,
  },
  RENTAL: {
    label: "Rental units",
    description: "Optimised for yield",
    multiplier: 0.95,
  },
  MIXED: {
    label: "Mixed use",
    description: "Family home + rental floor",
    multiplier: 0.975,
  },
};

const ZONE_KEYS = [
  "whitefield",
  "sarjapur-road",
  "yelahanka",
  "electronic-city",
  "hebbal",
  "hsr-layout",
  "indiranagar",
  "jayanagar",
  "jp-nagar",
  "rajajinagar",
  "bannerghatta-road",
  "kengeri",
  "thanisandra",
  "hennur",
  "other",
] as const;

export type ZoneSlug = (typeof ZONE_KEYS)[number];

export const ZoneSlugSchema = z.enum(ZONE_KEYS);

export interface ZoneMeta {
  name: string;
  multiplier: number;
  pincodeHints: string[];
  note: string;
}

export const BENGALURU_ZONES: Record<ZoneSlug, ZoneMeta> = {
  whitefield: {
    name: "Whitefield",
    multiplier: 1.04,
    pincodeHints: ["560066", "560067", "560048"],
    note: "High demand, premium finish expectations",
  },
  "sarjapur-road": {
    name: "Sarjapur Road",
    multiplier: 1.02,
    pincodeHints: ["560035", "560087", "562125"],
    note: "Fast-growing corridor, mid-to-premium builds",
  },
  yelahanka: {
    name: "Yelahanka",
    multiplier: 0.98,
    pincodeHints: ["560064", "560065"],
    note: "North Bengaluru value zone",
  },
  "electronic-city": {
    name: "Electronic City",
    multiplier: 1.01,
    pincodeHints: ["560100", "560099"],
    note: "Rental demand from tech workforce",
  },
  hebbal: {
    name: "Hebbal",
    multiplier: 1.05,
    pincodeHints: ["560024", "560092"],
    note: "North corridor with premium land rates",
  },
  "hsr-layout": {
    name: "HSR Layout",
    multiplier: 1.07,
    pincodeHints: ["560102", "560034"],
    note: "Premium rentals and redevelopment",
  },
  indiranagar: {
    name: "Indiranagar",
    multiplier: 1.09,
    pincodeHints: ["560038", "560008"],
    note: "Central premium, tight sites",
  },
  jayanagar: {
    name: "Jayanagar",
    multiplier: 1.06,
    pincodeHints: ["560041", "560011"],
    note: "Established south Bengaluru market",
  },
  "jp-nagar": {
    name: "JP Nagar",
    multiplier: 1.03,
    pincodeHints: ["560078", "560069"],
    note: "Family homes and rental floors",
  },
  rajajinagar: {
    name: "Rajajinagar",
    multiplier: 1.03,
    pincodeHints: ["560010", "560044"],
    note: "West Bengaluru redevelopment zone",
  },
  "bannerghatta-road": {
    name: "Bannerghatta Road",
    multiplier: 0.99,
    pincodeHints: ["560076", "560083"],
    note: "Value corridor with gated layouts",
  },
  kengeri: {
    name: "Kengeri",
    multiplier: 0.97,
    pincodeHints: ["560060", "560059"],
    note: "West Bengaluru value zone",
  },
  thanisandra: {
    name: "Thanisandra",
    multiplier: 1.0,
    pincodeHints: ["560077", "560064"],
    note: "North-east growth corridor",
  },
  hennur: {
    name: "Hennur",
    multiplier: 1.0,
    pincodeHints: ["560043", "560084"],
    note: "North-east residential belt",
  },
  other: {
    name: "Elsewhere in Bengaluru",
    multiplier: 1.0,
    pincodeHints: ["560"],
    note: "Neutral Bengaluru average",
  },
};

export const FLOOR_OPTIONS = [
  { totalFloors: 1, label: "Ground floor", short: "G" },
  { totalFloors: 2, label: "G + 1", short: "G+1" },
  { totalFloors: 3, label: "G + 2", short: "G+2" },
  { totalFloors: 4, label: "G + 3", short: "G+3" },
] as const;

export const PLOT_PRESETS = [
  { label: "30 × 40", widthFt: 30, lengthFt: 40, note: "1,200 sq.ft" },
  { label: "30 × 50", widthFt: 30, lengthFt: 50, note: "1,500 sq.ft" },
  { label: "40 × 60", widthFt: 40, lengthFt: 60, note: "2,400 sq.ft" },
  { label: "50 × 80", widthFt: 50, lengthFt: 80, note: "4,000 sq.ft" },
] as const;

export function getFloorLabel(totalFloors: number): string {
  return totalFloors <= 1 ? "Ground" : `G+${totalFloors - 1}`;
}

export function getFarLimit(roadWidthFt: number): number {
  if (roadWidthFt < 30) return 1.75;
  if (roadWidthFt < 40) return 2.25;
  return 2.75;
}

export function getSetbacks(plotAreaSqft: number) {
  if (plotAreaSqft <= 1500) {
    return { frontFt: 5, rearFt: 4, sideFt: 3 };
  }
  if (plotAreaSqft <= 3000) {
    return { frontFt: 6, rearFt: 5, sideFt: 4 };
  }
  return { frontFt: 8, rearFt: 6, sideFt: 5 };
}

export interface AreaInput {
  plotWidthFt: number;
  plotLengthFt: number;
  totalFloors: number;
  roadWidthFt: number;
  hasBasement: boolean;
}

export interface AreaResult {
  plotAreaSqft: number;
  footprintSqft: number;
  builtupSqft: number;
  requestedBuiltupSqft: number;
  basementSqft: number;
  coveragePct: number;
  farLimit: number;
  farUsed: number;
  maxFarAreaSqft: number;
  maxFloorsByFar: number;
  farCapped: boolean;
  totalFloors: number;
  floorLabel: string;
  setbacks: { frontFt: number; rearFt: number; sideFt: number };
  notes: string[];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateBuiltupArea(input: AreaInput): AreaResult {
  const plotAreaSqft = round2(input.plotLengthFt * input.plotWidthFt);
  const coveragePct = plotAreaSqft > 4000 ? 65 : 70;
  const footprintSqft = Math.floor(plotAreaSqft * (coveragePct / 100));
  const farLimit = getFarLimit(input.roadWidthFt);
  const maxFarAreaSqft = Math.floor(plotAreaSqft * farLimit);
  const requestedBuiltupSqft = footprintSqft * Math.max(1, input.totalFloors);
  const builtupSqft = Math.min(requestedBuiltupSqft, maxFarAreaSqft);
  const farCapped = requestedBuiltupSqft > maxFarAreaSqft;
  const basementSqft = input.hasBasement
    ? Math.floor(plotAreaSqft * 0.6)
    : 0;
  const maxFloorsByFar = Math.max(
    1,
    Math.floor(maxFarAreaSqft / Math.max(1, footprintSqft)),
  );
  const setbacks = getSetbacks(plotAreaSqft);
  const notes: string[] = [];

  if (farCapped) {
    notes.push(
      `Requested ${input.totalFloors} floors exceed the planning FAR of ${farLimit}. Built-up area is capped at ${maxFarAreaSqft.toLocaleString(
        "en-IN",
      )} sq.ft; ${maxFloorsByFar} floors fit within the envelope.`,
    );
  }
  if (basementSqft > 0) {
    notes.push(
      "Basement area is costed separately at ~55% of the superstructure rate and is not counted in FAR.",
    );
  }
  if (plotAreaSqft > 4000) {
    notes.push(
      "Plots above 4,000 sq.ft use a 65% coverage assumption; confirm with your BBMP plan consultant.",
    );
  }

  return {
    plotAreaSqft,
    footprintSqft,
    builtupSqft,
    requestedBuiltupSqft,
    basementSqft,
    coveragePct,
    farLimit,
    farUsed: round2(builtupSqft / plotAreaSqft),
    maxFarAreaSqft,
    maxFloorsByFar,
    farCapped,
    totalFloors: input.totalFloors,
    floorLabel: getFloorLabel(input.totalFloors),
    setbacks,
    notes,
  };
}
