import { z } from "zod";
import { STAGE_KEYS } from "./pricing";

export const LlmLineItemSchema = z.object({
  stage: z.enum(STAGE_KEYS),
  category: z.enum(["COMPOSITE", "MATERIAL", "LABOR", "EQUIPMENT"]),
  description: z.string().min(8).max(240),
  quantity: z.number().positive(),
  unit: z.string().min(1).max(24),
  amount: z.number().nonnegative(),
});

export const LlmRiskSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  title: z.string().min(3).max(120),
  detail: z.string().min(10).max(400),
});

export const LlmBoqSchema = z.object({
  narrative: z.string().min(40).max(1200),
  lineItems: z.array(LlmLineItemSchema).min(11).max(80),
  assumptions: z.array(z.string().min(5).max(240)).max(10),
  exclusions: z.array(z.string().min(5).max(240)).max(10),
  riskFlags: z.array(LlmRiskSchema).max(8),
  confidence: z.number().min(0).max(1),
});

export type LlmBoq = z.infer<typeof LlmBoqSchema>;
export type LlmLineItem = z.infer<typeof LlmLineItemSchema>;
