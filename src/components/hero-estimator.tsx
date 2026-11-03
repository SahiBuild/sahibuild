"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { buildEstimate } from "@/lib/scoping/pricing";
import {
  FLOOR_OPTIONS,
  PLOT_PRESETS,
  QUALITY_META,
  type QualityTier,
} from "@/lib/scoping/rules";
import { compactINR, formatINR, formatNumber } from "@/lib/utils";

const tierKeys: QualityTier[] = ["BASIC", "STANDARD", "PREMIUM", "LUXURY"];

export function HeroEstimator() {
  const [plot, setPlot] = useState(0);
  const [floors, setFloors] = useState(2);
  const [tier, setTier] = useState<QualityTier>("STANDARD");

  const preset = PLOT_PRESETS[plot];

  const estimate = useMemo(
    () =>
      buildEstimate({
        plotWidthFt: preset.widthFt,
        plotLengthFt: preset.lengthFt,
        facing: "EAST",
        zoneSlug: "sarjapur-road",
        pincode: "560035",
        roadWidthFt: 30,
        totalFloors: floors,
        hasBasement: false,
        purpose: "SELF_USE",
        qualityTier: tier,
      }),
    [preset, floors, tier],
  );

  const groups = [
    ...estimate.breakdown,
    {
      group: "APPROVALS" as const,
      label: "Fees & approvals",
      color: "#D9FF6A",
      amount: estimate.approvalsTotal,
      pctOfTotal:
        (estimate.approvalsTotal / Math.max(1, estimate.totalCost)) * 100,
    },
  ];

  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[36px] bg-ink/[0.04] blur-2xl" />
      <div className="overflow-hidden rounded-[26px] border border-ink/12 bg-paper-2 shadow-soft">
        <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-3.5 text-paper-2">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="pulse-dot absolute inline-flex size-2 rounded-full bg-lime" />
              <span className="relative inline-flex size-2 rounded-full bg-lime" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
              Live estimate
            </span>
          </div>
          <span className="rounded-full border border-paper-2/15 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-paper-2/60">
            2026 rates · BLR
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap gap-1.5">
            {PLOT_PRESETS.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setPlot(index)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                  plot === index
                    ? "border-ink bg-ink text-paper-2"
                    : "border-ink/12 bg-paper text-ink/60 hover:border-ink/30"
                }`}
              >
                {item.label}
                <span
                  className={`ml-1.5 font-medium ${
                    plot === index ? "text-paper-2/50" : "text-muted"
                  }`}
                >
                  {item.note}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {FLOOR_OPTIONS.map((option) => (
              <button
                key={option.totalFloors}
                type="button"
                onClick={() => setFloors(option.totalFloors)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  floors === option.totalFloors
                    ? "border-forest bg-sage text-forest"
                    : "border-ink/12 text-ink/55 hover:border-ink/30"
                }`}
              >
                {option.short}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-line" />
            {tierKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTier(key)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  tier === key
                    ? "border-clay bg-clay-soft text-[#8f3c21]"
                    : "border-ink/12 text-ink/55 hover:border-ink/30"
                }`}
              >
                {QUALITY_META[key].label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                Estimated all-in cost
              </p>
              <p className="mt-1 font-display text-[42px] leading-none tracking-[-0.04em] text-ink sm:text-[46px]">
                {compactINR(estimate.totalCost)}
              </p>
              <p className="mt-2 text-[11.5px] text-muted">
                {formatNumber(estimate.area.builtupSqft)} sq.ft built-up ·{" "}
                {formatINR(estimate.effectiveRatePerSqft)}/sq.ft all-in
              </p>
            </div>
            <div className="rounded-xl bg-lime px-3 py-2 text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink/55">
                Build-up
              </p>
              <p className="text-lg font-bold leading-tight">
                {formatNumber(estimate.area.builtupSqft)}
              </p>
              <p className="text-[9px] font-semibold text-ink/55">sq.ft</p>
            </div>
          </div>

          <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-mist">
            {groups.map((group) => (
              <div
                key={group.group}
                style={{
                  width: `${Math.max(2, group.pctOfTotal)}%`,
                  backgroundColor: group.color,
                }}
                className="h-full transition-all duration-500"
              />
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {groups.slice(0, 4).map((group) => (
              <div
                key={group.group}
                className="flex items-center justify-between text-[11.5px]"
              >
                <span className="flex items-center gap-2 text-ink/65">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  {group.label}
                </span>
                <span className="tabular font-semibold text-ink">
                  {compactINR(group.amount)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-3.5 py-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-lime">
                <Sparkles className="size-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold">AI BOQ ready</p>
                <p className="text-[10px] text-muted">
                  {estimate.area.floorLabel} · {QUALITY_META[tier].label} ·{" "}
                  {estimate.area.coveragePct}% coverage
                </p>
              </div>
            </div>
            <Link
              href="/scope"
              className="flex items-center gap-1 text-[11px] font-bold text-forest hover:text-clay"
            >
              Open
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <p className="mt-3 px-2 text-center text-[9.5px] leading-4 text-muted">
        Planning-grade only. Not a BBMP sanction or contractor quote.
      </p>
    </div>
  );
}
