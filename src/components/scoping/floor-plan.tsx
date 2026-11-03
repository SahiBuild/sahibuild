"use client";

import { useMemo, useState } from "react";
import { Compass, Info } from "lucide-react";
import {
  ROOM_COLORS,
  generateFloorPlan,
} from "@/lib/floorplan";
import {
  FACING_LABELS,
  type Facing,
} from "@/lib/scoping/rules";
import { cn } from "@/lib/utils";

export function FloorPlanPreview({
  widthFt,
  lengthFt,
  totalFloors,
  facing,
  vastuPreferred,
}: {
  widthFt: number;
  lengthFt: number;
  totalFloors: number;
  facing: Facing;
  vastuPreferred: boolean;
}) {
  const [floorIndex, setFloorIndex] = useState(0);
  const floorOptions = Array.from(
    { length: Math.min(totalFloors, 4) },
    (_, index) => index,
  );
  const plan = useMemo(
    () =>
      generateFloorPlan({
        widthFt,
        lengthFt,
        totalFloors,
        facing,
        vastuPreferred,
        floorIndex,
      }),
    [widthFt, lengthFt, totalFloors, facing, vastuPreferred, floorIndex],
  );

  const viewW = 420;
  const viewH = 540;
  const maxW = 350;
  const maxH = 470;
  const scale = Math.min(maxW / widthFt, maxH / lengthFt);
  const plotW = widthFt * scale;
  const plotH = lengthFt * scale;
  const originX = (viewW - plotW) / 2;
  const originY = (viewH - plotH) / 2;
  const sideInset = plan.setbacks.sideFt * scale;
  const frontInset = plan.setbacks.frontFt * scale;
  const rearInset = plan.setbacks.rearFt * scale;
  const builtX = originX + sideInset;
  const builtY = originY + rearInset;
  const builtW = plotW - sideInset * 2;
  const builtH = plotH - rearInset - frontInset;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-[22px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Conceptual 2D layout
            </p>
            <p className="mt-1 font-display text-[24px] leading-none tracking-[-0.03em]">
              {plan.label}
            </p>
          </div>
          <div className="flex gap-1">
            {floorOptions.map((index) => (
              <button
                key={index}
                type="button"
                onClick={() => setFloorIndex(index)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[10.5px] font-bold transition-colors",
                  floorIndex === index
                    ? "bg-ink text-paper-2"
                    : "border border-ink/12 text-ink/55 hover:border-ink/30",
                )}
              >
                {index === 0 ? "Ground" : `Floor ${index}`}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-3 overflow-hidden rounded-xl border border-line bg-paper blueprint-grid-fine">
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="mx-auto block h-auto w-full max-w-[480px]"
            role="img"
            aria-label={`Conceptual floor plan for ${plan.label}`}
          >
            <rect
              x={originX}
              y={originY}
              width={plotW}
              height={plotH}
              fill="#FBF9F2"
              stroke="#173E2E"
              strokeWidth="1.5"
              strokeDasharray="5 4"
            />
            <text
              x={originX + plotW / 2}
              y={originY - 8}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#687A70"
              letterSpacing="1.2"
            >
              {widthFt} FT FRONTAGE
            </text>
            <text
              x={originX - 10}
              y={originY + plotH / 2}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#687A70"
              letterSpacing="1.2"
              transform={`rotate(-90 ${originX - 10} ${originY + plotH / 2})`}
            >
              {lengthFt} FT DEPTH
            </text>

            <rect
              x={builtX}
              y={builtY}
              width={builtW}
              height={builtH}
              fill="#F3EFE3"
              stroke="#173E2E"
              strokeWidth="2"
            />

            {plan.rooms.map((room) => {
              const x = builtX + (room.x / 100) * builtW;
              const y = builtY + (room.y / 100) * builtH;
              const w = (room.w / 100) * builtW;
              const h = (room.h / 100) * builtH;
              const colors = ROOM_COLORS[room.type];
              const showLabel = w > 30 && h > 22;
              return (
                <g key={room.id}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth="1"
                  />
                  {showLabel && (
                    <>
                      <text
                        x={x + w / 2}
                        y={y + h / 2 - 2}
                        textAnchor="middle"
                        fontSize={Math.min(10, w / 6.5)}
                        fontWeight="700"
                        fill="#173E2E"
                      >
                        {room.label}
                      </text>
                      <text
                        x={x + w / 2}
                        y={y + h / 2 + 9}
                        textAnchor="middle"
                        fontSize="6.5"
                        fill="#687A70"
                      >
                        {(Math.abs(room.w * room.h) / 100).toFixed(0)}% area
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            <g>
              <circle
                cx={viewW - 42}
                cy={42}
                r="21"
                fill="#FBF9F2"
                stroke="#173E2E"
                strokeWidth="1"
              />
              <path
                d={`M${viewW - 42} 26 L${viewW - 36} 46 L${viewW - 42} 42 L${viewW - 48} 46 Z`}
                fill="#DD6B45"
              />
              <text
                x={viewW - 42}
                y={72}
                textAnchor="middle"
                fontSize="7"
                fontWeight="700"
                fill="#687A70"
              >
                N
              </text>
            </g>

            <g>
              <rect
                x={originX + plotW / 2 - 34}
                y={viewH - 34}
                width="68"
                height="18"
                rx="9"
                fill="#D9FF6A"
              />
              <text
                x={originX + plotW / 2}
                y={viewH - 21.5}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="800"
                fill="#10231B"
              >
                {FACING_LABELS[plan.facing].toUpperCase()} ENTRY
              </text>
            </g>
          </svg>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-4 text-muted">
          <Info className="mt-0.5 size-3 shrink-0" />
          Rooms are sized proportionally for illustration. Structural grids,
          stair geometry, plumbing shafts, and light/ventilation need an
          architect&apos;s validation.
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-[22px] border border-ink/10 bg-ink p-6 text-paper-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-paper-2/50">
              <Compass className="size-3.5 text-lime" />
              Vastu score
            </div>
            <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-ink">
              {plan.vastuScore}/100
            </span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-paper-2/10">
            <div
              className="h-full rounded-full bg-lime transition-all duration-500"
              style={{ width: `${plan.vastuScore}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] leading-5 text-paper-2/55">
            {FACING_LABELS[facing]} facing entry. Pooja in the north-east,
            kitchen in the south-east. A Vastu consultant can refine placements
            before structural drawings.
          </p>
        </div>

        <div className="rounded-[22px] border border-ink/10 bg-paper-2 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Planning notes
          </p>
          <ul className="mt-3 space-y-2.5">
            {plan.notes.map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 text-[11.5px] leading-5 text-ink/65"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[22px] border border-ink/10 bg-paper-2 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            Buildable envelope
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <p className="text-muted">Front setback</p>
              <p className="font-bold">{plan.setbacks.frontFt} ft</p>
            </div>
            <div>
              <p className="text-muted">Rear setback</p>
              <p className="font-bold">{plan.setbacks.rearFt} ft</p>
            </div>
            <div>
              <p className="text-muted">Side setback</p>
              <p className="font-bold">{plan.setbacks.sideFt} ft each</p>
            </div>
            <div>
              <p className="text-muted">Buildable width</p>
              <p className="font-bold">{plan.footprint.widthFt} ft</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
