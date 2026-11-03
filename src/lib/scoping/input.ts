import { z } from "zod";
import {
  FacingSchema,
  PurposeSchema,
  QualityTierSchema,
  ZoneSlugSchema,
} from "./rules";

export const ScopingInputSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    plotWidthFt: z.number().finite().min(15).max(200),
    plotLengthFt: z.number().finite().min(15).max(200),
    facing: FacingSchema,
    zoneSlug: ZoneSlugSchema,
    pincode: z
      .string()
      .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian pincode"),
    locality: z.string().trim().max(80).optional(),
    roadWidthFt: z.number().finite().min(15).max(120),
    totalFloors: z.number().int().min(1).max(4),
    hasBasement: z.boolean(),
    purpose: PurposeSchema,
    qualityTier: QualityTierSchema,
    vastuPreferred: z.boolean(),
  })
  .refine((value) => value.plotLengthFt >= value.plotWidthFt, {
    message: "Plot length should be greater than or equal to plot width",
    path: ["plotLengthFt"],
  });

export type ScopingInput = z.infer<typeof ScopingInputSchema>;

export const DEFAULT_SCOPING_INPUT: ScopingInput = {
  plotWidthFt: 30,
  plotLengthFt: 40,
  facing: "EAST",
  zoneSlug: "sarjapur-road",
  pincode: "560035",
  roadWidthFt: 30,
  totalFloors: 2,
  hasBasement: false,
  purpose: "SELF_USE",
  qualityTier: "STANDARD",
  vastuPreferred: true,
};
