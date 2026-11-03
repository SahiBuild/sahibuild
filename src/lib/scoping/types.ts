import type {
  DeterministicEstimate,
  RiskFlag,
  StageKey,
} from "./pricing";

export type FinalStage = StageKey | "APPROVALS" | "CONTINGENCY" | "TAX";

export type FinalCategory =
  | "MATERIAL"
  | "LABOR"
  | "EQUIPMENT"
  | "COMPOSITE"
  | "PROFESSIONAL"
  | "APPROVAL"
  | "OVERHEAD"
  | "CONTINGENCY"
  | "TAX";

export interface FinalLineItem {
  stage: FinalStage;
  category: FinalCategory;
  code: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  source: "LLM" | "DETERMINISTIC";
  sortOrder: number;
}

export interface ScopingResult {
  estimate: DeterministicEstimate;
  lineItems: FinalLineItem[];
  narrative: string;
  assumptions: string[];
  exclusions: string[];
  riskFlags: RiskFlag[];
  confidence: number;
  aiMode: "llm" | "deterministic";
  aiModel: string;
  engineVersion: string;
  generatedAt: string;
  disclaimer: string;
}

export interface SavedProject {
  id: string;
  createdAt: string;
  input: {
    title?: string;
    plotWidthFt: number;
    plotLengthFt: number;
    totalFloors: number;
    zoneSlug: string;
    locality?: string;
    pincode: string;
    qualityTier: string;
    purpose: string;
    facing: string;
    roadWidthFt: number;
  };
  result: ScopingResult;
}
