import {
  getFloorLabel,
  getSetbacks,
  type Facing,
} from "@/lib/scoping/rules";

export type RoomType =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bath"
  | "dining"
  | "pooja"
  | "parking"
  | "stair"
  | "balcony"
  | "utility"
  | "terrace"
  | "family";

export interface PlanRoom {
  id: string;
  label: string;
  type: RoomType;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FloorPlan {
  floorIndex: number;
  label: string;
  rooms: PlanRoom[];
  vastuScore: number;
  notes: string[];
  footprint: { widthFt: number; lengthFt: number };
  setbacks: { frontFt: number; rearFt: number; sideFt: number };
  facing: Facing;
}

export const ROOM_COLORS: Record<RoomType, { fill: string; stroke: string }> = {
  living: { fill: "#E8E1CF", stroke: "#C9BFA7" },
  bedroom: { fill: "#DCE5D6", stroke: "#AEBFA5" },
  kitchen: { fill: "#F0DDD2", stroke: "#D8B8A6" },
  bath: { fill: "#D8E4E7", stroke: "#AFC5CB" },
  dining: { fill: "#EDE5C9", stroke: "#D0C294" },
  pooja: { fill: "#F5E7B8", stroke: "#D9BD69" },
  parking: { fill: "#DDDCD5", stroke: "#B9B7AC" },
  stair: { fill: "#E2DDD0", stroke: "#BBB3A0" },
  balcony: { fill: "#D9E7D4", stroke: "#AEC5A5" },
  utility: { fill: "#E5E2D8", stroke: "#C2BDAD" },
  terrace: { fill: "#E8E6D5", stroke: "#C7C2AB" },
  family: { fill: "#E4E0CE", stroke: "#C4BE9F" },
};

const GROUND_ROOMS: PlanRoom[] = [
  { id: "bed1", label: "Bedroom", type: "bedroom", x: 0, y: 0, w: 46, h: 32 },
  { id: "bath1", label: "Bath", type: "bath", x: 46, y: 0, w: 16, h: 16 },
  { id: "pooja", label: "Pooja", type: "pooja", x: 62, y: 0, w: 16, h: 16 },
  { id: "util", label: "Utility", type: "utility", x: 78, y: 0, w: 22, h: 16 },
  { id: "bath2", label: "Bath", type: "bath", x: 46, y: 16, w: 16, h: 16 },
  { id: "stair", label: "Stair", type: "stair", x: 62, y: 16, w: 16, h: 16 },
  { id: "store", label: "Store", type: "utility", x: 78, y: 16, w: 22, h: 16 },
  { id: "bed2", label: "Bedroom", type: "bedroom", x: 0, y: 32, w: 38, h: 26 },
  { id: "bath3", label: "Bath", type: "bath", x: 38, y: 32, w: 16, h: 13 },
  { id: "stair2", label: "Stair", type: "stair", x: 54, y: 32, w: 16, h: 26 },
  { id: "kitchen", label: "Kitchen", type: "kitchen", x: 70, y: 32, w: 30, h: 26 },
  { id: "living", label: "Living", type: "living", x: 0, y: 58, w: 68, h: 20 },
  { id: "dining", label: "Dining", type: "dining", x: 68, y: 58, w: 32, h: 20 },
  { id: "parking", label: "Parking", type: "parking", x: 0, y: 78, w: 40, h: 22 },
  { id: "porch", label: "Porch", type: "terrace", x: 40, y: 78, w: 30, h: 22 },
  { id: "garden", label: "Garden", type: "balcony", x: 70, y: 78, w: 30, h: 22 },
];

const UPPER_ROOMS: PlanRoom[] = [
  { id: "bed1", label: "Bedroom", type: "bedroom", x: 0, y: 0, w: 48, h: 36 },
  { id: "bath1", label: "Bath", type: "bath", x: 48, y: 0, w: 16, h: 18 },
  { id: "balcony", label: "Balcony", type: "balcony", x: 64, y: 0, w: 36, h: 18 },
  { id: "bed2", label: "Bedroom", type: "bedroom", x: 0, y: 36, w: 40, h: 32 },
  { id: "bath2", label: "Bath", type: "bath", x: 40, y: 36, w: 16, h: 32 },
  { id: "family", label: "Family", type: "family", x: 56, y: 18, w: 44, h: 50 },
  { id: "bed3", label: "Bedroom", type: "bedroom", x: 0, y: 68, w: 48, h: 32 },
  { id: "bath3", label: "Bath", type: "bath", x: 48, y: 68, w: 16, h: 16 },
  { id: "terrace", label: "Terrace", type: "terrace", x: 64, y: 68, w: 36, h: 32 },
];

const VASTU_FACING_SCORE: Record<Facing, number> = {
  NORTH_EAST: 14,
  NORTH: 12,
  EAST: 11,
  NORTH_WEST: 7,
  SOUTH_EAST: 6,
  WEST: 6,
  SOUTH: 4,
  SOUTH_WEST: 3,
};

export function generateFloorPlan(input: {
  widthFt: number;
  lengthFt: number;
  totalFloors: number;
  facing: Facing;
  vastuPreferred: boolean;
  floorIndex: number;
}): FloorPlan {
  const area = input.widthFt * input.lengthFt;
  const setbacks = getSetbacks(area);
  const floorLabel =
    input.floorIndex === 0
      ? getFloorLabel(input.totalFloors)
      : `Typical floor ${input.floorIndex}`;

  const rooms =
    input.floorIndex === 0
      ? GROUND_ROOMS
      : UPPER_ROOMS;

  let score = 70 + VASTU_FACING_SCORE[input.facing];
  if (input.vastuPreferred) score += 6;
  if (input.floorIndex === 0) score += 2;
  score = Math.min(96, score);

  const notes = [
    input.floorIndex === 0
      ? "Pooja room is placed in the north-east zone of the plan."
      : "Master bedroom occupies the south-west zone for Vastu alignment.",
    "Kitchen is pencilled into the south-east, away from toilets.",
    `${input.facing.replace("_", "-").toLowerCase()} facing entry with a shaded porch.`,
    "Conceptual layout only — a licensed architect must validate structure, setbacks, and light/ventilation.",
  ];

  return {
    floorIndex: input.floorIndex,
    label: floorLabel,
    rooms,
    vastuScore: score,
    notes,
    footprint: {
      widthFt: Math.max(1, input.widthFt - setbacks.sideFt * 2),
      lengthFt: Math.max(
        1,
        input.lengthFt - setbacks.frontFt - setbacks.rearFt,
      ),
    },
    setbacks,
    facing: input.facing,
  };
}
