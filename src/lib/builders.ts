import type { QualityTier, ZoneSlug } from "@/lib/scoping/rules";

export interface Builder {
  id: string;
  name: string;
  initials: string;
  tagline: string;
  zones: ZoneSlug[];
  tiers: QualityTier[];
  minRate: number;
  maxRate: number;
  rating: number;
  reviews: number;
  completed: number;
  years: number;
  verified: boolean;
  insured: boolean;
  specialties: string[];
  leadTime: string;
  accent: string;
  bio: string;
}

export const BUILDERS: Builder[] = [
  {
    id: "sattva-build-studio",
    name: "Sattva Build Studio",
    initials: "SB",
    tagline: "Architect-led turnkey homes with fixed-stage billing",
    zones: ["whitefield", "hsr-layout", "sarjapur-road", "electronic-city"],
    tiers: ["PREMIUM", "LUXURY"],
    minRate: 2850,
    maxRate: 3400,
    rating: 4.9,
    reviews: 38,
    completed: 64,
    years: 11,
    verified: true,
    insured: true,
    specialties: ["Architecture", "Turnkey", "Vastu"],
    leadTime: "Starts in 3 weeks",
    accent: "#173E2E",
    bio: "In-house architects, structural engineers, and a single project manager. Weekly photo updates and milestone-linked payments.",
  },
  {
    id: "namma-nest",
    name: "Namma Nest Projects",
    initials: "NN",
    tagline: "Rental-floor specialists for 30×40 sites",
    zones: ["yelahanka", "thanisandra", "hennur", "hebbal"],
    tiers: ["BASIC", "STANDARD"],
    minRate: 1980,
    maxRate: 2450,
    rating: 4.7,
    reviews: 52,
    completed: 91,
    years: 9,
    verified: true,
    insured: true,
    specialties: ["Rental yield", "Fast build", "BBMP liaison"],
    leadTime: "Starts in 10 days",
    accent: "#DD6B45",
    bio: "Built 90+ G+2 rental homes across north Bengaluru. Standardised 1BHK/2BHK modules with transparent per-floor costs.",
  },
  {
    id: "greenline-turnkey",
    name: "Greenline Turnkey",
    initials: "GT",
    tagline: "Sustainable builds with low-waste material planning",
    zones: ["jayanagar", "jp-nagar", "bannerghatta-road", "kengeri"],
    tiers: ["STANDARD", "PREMIUM"],
    minRate: 2400,
    maxRate: 3050,
    rating: 4.8,
    reviews: 41,
    completed: 57,
    years: 12,
    verified: true,
    insured: true,
    specialties: ["Sustainability", "Solar-ready", "Rainwater"],
    leadTime: "Starts in 4 weeks",
    accent: "#6A8D73",
    bio: "AAC blocks, low-VOC finishes, and rainwater harvesting as standard. Strong cost control through prior material procurement.",
  },
  {
    id: "vaastu-craft",
    name: "Vaastu Craft",
    initials: "VC",
    tagline: "Traditional layouts, modern engineering",
    zones: ["rajajinagar", "jayanagar", "jp-nagar", "other"],
    tiers: ["STANDARD", "PREMIUM"],
    minRate: 2450,
    maxRate: 2980,
    rating: 4.6,
    reviews: 29,
    completed: 44,
    years: 15,
    verified: true,
    insured: false,
    specialties: ["Vastu", "Heritage", "Interiors"],
    leadTime: "Starts in 5 weeks",
    accent: "#B9A15B",
    bio: "A senior Vastu consultant reviews every layout. Ideal for families who want traditional room placement without compromising structure.",
  },
  {
    id: "indus-frame",
    name: "Indus Frame Constructions",
    initials: "IF",
    tagline: "Structural-first builds for G+3 and basements",
    zones: ["whitefield", "hebbal", "indiranagar", "hsr-layout"],
    tiers: ["PREMIUM", "LUXURY"],
    minRate: 3000,
    maxRate: 3500,
    rating: 4.8,
    reviews: 33,
    completed: 39,
    years: 14,
    verified: true,
    insured: true,
    specialties: ["Structure", "Basements", "Luxury"],
    leadTime: "Starts in 6 weeks",
    accent: "#2C5A43",
    bio: "Specialises in complex sites, basements, and higher-floor homes. Includes soil testing, peer-reviewed structural drawings, and waterproofing warranties.",
  },
  {
    id: "blr-build-co",
    name: "BLR Build Co.",
    initials: "BB",
    tagline: "No-nonsense G+1 homes, on a published rate card",
    zones: ["kengeri", "bannerghatta-road", "electronic-city", "other"],
    tiers: ["BASIC", "STANDARD"],
    minRate: 1950,
    maxRate: 2380,
    rating: 4.5,
    reviews: 67,
    completed: 112,
    years: 8,
    verified: true,
    insured: true,
    specialties: ["Fixed price", "G+1", "Value builds"],
    leadTime: "Starts in 2 weeks",
    accent: "#8A8172",
    bio: "Publishes its full rate card and material brands upfront. Best fit for compact plots and first-time homeowners.",
  },
  {
    id: "terra-stone",
    name: "Terra & Stone",
    initials: "TS",
    tagline: "Design-forward homes with imported finishes",
    zones: ["indiranagar", "hsr-layout", "whitefield", "jayanagar"],
    tiers: ["LUXURY"],
    minRate: 3250,
    maxRate: 3500,
    rating: 4.9,
    reviews: 21,
    completed: 27,
    years: 10,
    verified: true,
    insured: true,
    specialties: ["Luxury", "Imported finishes", "Landscape"],
    leadTime: "Starts in 8 weeks",
    accent: "#9C5B4A",
    bio: "Boutique studio for high-spec homes. In-house joinery, imported stone sourcing, and dedicated site supervision.",
  },
  {
    id: "urban-grove",
    name: "Urban Grove Builders",
    initials: "UG",
    tagline: "Balanced homes with strong post-handover support",
    zones: ["sarjapur-road", "electronic-city", "thanisandra", "hennur"],
    tiers: ["STANDARD", "PREMIUM"],
    minRate: 2350,
    maxRate: 2950,
    rating: 4.7,
    reviews: 46,
    completed: 73,
    years: 13,
    verified: true,
    insured: true,
    specialties: ["Maintenance", "Turnkey", "Family homes"],
    leadTime: "Starts in 3 weeks",
    accent: "#5E7A5B",
    bio: "Offers a 5-year structural warranty and a 12-month snag-fix service. Good fit for NRI owners who need remote supervision.",
  },
];

export function matchBuilders(input: {
  zoneSlug: ZoneSlug;
  qualityTier: QualityTier;
  budget: number;
  limit?: number;
}): Array<Builder & { matchScore: number; matchReasons: string[] }> {
  const scored = BUILDERS.map((builder) => {
    let score = 52;
    const reasons: string[] = [];

    if (builder.zones.includes(input.zoneSlug)) {
      score += 26;
      reasons.push("Builds in your zone");
    }
    if (builder.tiers.includes(input.qualityTier)) {
      score += 16;
      reasons.push("Matches your finish tier");
    }
    const midpoint = (builder.minRate + builder.maxRate) / 2;
    const rateGap = Math.abs(midpoint - input.budget) / Math.max(1, input.budget);
    score += Math.max(0, 10 - rateGap * 30);

    if (builder.rating >= 4.8) {
      score += 6;
      reasons.push("Top-rated");
    }
    if (builder.insured) {
      score += 3;
      reasons.push("Insured");
    }
    if (builder.completed >= 60) {
      score += 3;
      reasons.push("Proven volume");
    }

    return {
      ...builder,
      matchScore: Math.min(99, Math.round(score)),
      matchReasons: reasons.slice(0, 3),
    };
  });

  return scored
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, input.limit ?? 5);
}
