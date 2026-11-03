"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Download,
  FileText,
  Layers,
  MapPin,
  Package,
  Printer,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { FloorPlanPreview } from "./floor-plan";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { matchBuilders } from "@/lib/builders";
import { GROUP_META, type CostGroup } from "@/lib/scoping/pricing";
import type { ScopingResult } from "@/lib/scoping/types";
import type { ScopingInput } from "@/lib/scoping/input";
import {
  FACING_LABELS,
  QUALITY_META,
  getFloorLabel,
} from "@/lib/scoping/rules";
import {
  cn,
  compactINR,
  formatINR,
  formatNumber,
} from "@/lib/utils";

const TABS = [
  { key: "overview", label: "Overview", icon: Layers },
  { key: "boq", label: "BOQ", icon: FileText },
  { key: "materials", label: "Materials", icon: Package },
  { key: "plan", label: "Floor plan", icon: MapPin },
  { key: "builders", label: "Builders", icon: BadgeCheck },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const severityTone = {
  HIGH: "bg-clay text-white",
  MEDIUM: "bg-[#E5C15C]/35 text-[#7a5c14]",
  LOW: "bg-sage text-forest",
} as const;

function downloadCsv(result: ScopingResult) {
  const rows = [
    [
      "Stage",
      "Category",
      "Code",
      "Description",
      "Quantity",
      "Unit",
      "Rate (INR)",
      "Amount (INR)",
    ],
    ...result.lineItems.map((item) => [
      item.stage,
      item.category,
      item.code,
      item.description,
      String(item.quantity),
      item.unit,
      String(item.rate),
      String(item.amount),
    ]),
    ["", "", "", "TOTAL", "", "", "", String(result.estimate.totalCost)],
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sahibuild-boq-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ScopingResults({
  result,
  input,
  onReset,
}: {
  result: ScopingResult;
  input: ScopingInput;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<TabKey>("overview");
  const [showAllApprovals, setShowAllApprovals] = useState(false);
  const estimate = result.estimate;

  const builders = useMemo(
    () =>
      matchBuilders({
        zoneSlug: input.zoneSlug,
        qualityTier: input.qualityTier,
        budget: estimate.ratePerSqft,
        limit: 5,
      }),
    [input.zoneSlug, input.qualityTier, estimate.ratePerSqft],
  );

  const totalPct = (amount: number) =>
    (amount / Math.max(1, estimate.totalCost)) * 100;

  return (
    <section id="results" className="scroll-mt-28 border-t border-line bg-paper-2">
      <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={result.aiMode === "llm" ? "lime" : "sage"}>
                <Sparkles className="size-3" />
                {result.aiMode === "llm" ? "AI-enriched BOQ" : "Rules-based BOQ"}
              </Badge>
              <Badge tone="outline">
                {Math.round(result.confidence * 100)}% confidence
              </Badge>
              <Badge tone="outline">v{result.engineVersion}</Badge>
            </div>
            <h2 className="mt-4 font-display text-[34px] leading-none tracking-[-0.04em] sm:text-[42px]">
              {input.title ||
                `${input.plotWidthFt}×${input.plotLengthFt} ft · ${getFloorLabel(
                  input.totalFloors,
                )} · ${QUALITY_META[input.qualityTier].label}`}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {estimate.zone.name}, {input.pincode}
              </span>
              <span className="size-1 rounded-full bg-line" />
              <span>{FACING_LABELS[input.facing]} facing</span>
              <span className="size-1 rounded-full bg-line" />
              <span>{estimate.area.floorLabel}</span>
              <span className="size-1 rounded-full bg-line" />
              <span>{input.purpose.replace("_", " ").toLowerCase()}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => downloadCsv(result)}>
              <Download className="size-3.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-3.5" />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="size-3.5" />
              New estimate
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] bg-ink p-6 text-paper-2 md:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-paper-2/45">
                  Estimated all-in project cost
                </p>
                <p className="mt-2 font-display text-[46px] leading-none tracking-[-0.045em] text-lime sm:text-[54px]">
                  {formatINR(estimate.totalCost)}
                </p>
                <p className="mt-2 text-[11.5px] text-paper-2/55">
                  {formatINR(estimate.effectiveRatePerSqft)}/sq.ft all-in ·{" "}
                  {formatNumber(estimate.area.builtupSqft)} sq.ft built-up
                </p>
              </div>
              <div className="rounded-xl border border-paper-2/10 bg-paper-2/[0.04] px-4 py-3 text-right">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-paper-2/40">
                  Construction rate
                </p>
                <p className="mt-1 text-[20px] font-bold text-paper-2">
                  ₹{estimate.ratePerSqft.toLocaleString("en-IN")}
                  <span className="text-[10px] font-medium text-paper-2/45">
                    /sq.ft
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-5 border-t border-paper-2/10 pt-4 text-[12px] leading-6 text-paper-2/65">
              {result.narrative}
            </p>
          </div>

          <div className="rounded-[20px] border border-ink/10 bg-paper p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Planning envelope
            </p>
            <div className="mt-3 space-y-2.5 text-[12px]">
              {[
                ["Plot area", `${formatNumber(estimate.area.plotAreaSqft)} sq.ft`],
                ["Ground coverage", `${estimate.area.coveragePct}%`],
                ["Footprint", `${formatNumber(estimate.area.footprintSqft)} sq.ft`],
                ["FAR used", `${estimate.area.farUsed} / ${estimate.area.farLimit}`],
                ["Built-up", `${formatNumber(estimate.area.builtupSqft)} sq.ft`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
              ))}
            </div>
            {estimate.area.farCapped && (
              <p className="mt-4 rounded-lg bg-clay-soft px-3 py-2 text-[10px] leading-4 text-[#8f3c21]">
                FAR capped at {estimate.area.maxFloorsByFar} floors. Reduce
                floors or get a planning opinion.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-line pb-px hide-scrollbar">
          {TABS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-[12px] font-bold transition-colors",
                  tab === item.key
                    ? "border-ink text-ink"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="pt-8">
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      Stage-wise cost
                    </p>
                    <span className="text-[10.5px] text-muted">
                      {formatINR(estimate.constructionSubtotal)} construction
                    </span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {estimate.stageBudgets.map((stage) => {
                      const group = GROUP_META[stage.group as CostGroup];
                      return (
                        <div key={stage.stage}>
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[12px] font-semibold">
                                {stage.label}
                              </p>
                              <p className="text-[10px] text-muted">
                                {stage.description}
                              </p>
                            </div>
                            <p className="shrink-0 text-[12px] font-bold tabular">
                              {compactINR(stage.amount)}
                            </p>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-mist">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${stage.pctOfConstruction}%`,
                                backgroundColor: group.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      All-in composition
                    </p>
                    <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-mist">
                      {estimate.breakdown.map((group) => (
                        <div
                          key={group.group}
                          style={{
                            width: `${Math.max(2, totalPct(group.amount))}%`,
                            backgroundColor: group.color,
                          }}
                        />
                      ))}
                      <div
                        className="bg-lime"
                        style={{
                          width: `${Math.max(
                            2,
                            totalPct(estimate.approvalsTotal),
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-4 space-y-2.5">
                      {estimate.breakdown.map((group) => (
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
                          <span className="tabular font-semibold">
                            {formatINR(group.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="flex items-center gap-2 text-ink/65">
                          <span className="size-2 rounded-full bg-lime" />
                          Fees & approvals
                        </span>
                        <span className="tabular font-semibold">
                          {formatINR(estimate.approvalsTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      GST & contingency
                    </p>
                    <div className="mt-3 space-y-2.5 text-[11.5px]">
                      <div className="flex justify-between">
                        <span className="text-muted">Construction subtotal</span>
                        <span className="font-semibold">
                          {formatINR(estimate.constructionSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Contingency (3%)</span>
                        <span className="font-semibold">
                          {formatINR(estimate.contingency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">GST (18%)</span>
                        <span className="font-semibold">
                          {formatINR(estimate.gst)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-line pt-2.5 text-[12.5px] font-bold">
                        <span>All-in estimate</span>
                        <span>{formatINR(estimate.totalCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-clay" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      Risk flags
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {result.riskFlags.map((flag) => (
                      <div
                        key={flag.title}
                        className="rounded-xl border border-line bg-paper-2 p-3.5"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider",
                              severityTone[flag.severity],
                            )}
                          >
                            {flag.severity}
                          </span>
                          <p className="text-[12px] font-semibold">{flag.title}</p>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-muted">
                          {flag.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Fees & approvals
                  </p>
                  <div className="mt-4 space-y-2">
                    {estimate.approvals
                      .slice(0, showAllApprovals ? undefined : 4)
                      .map((item) => (
                        <div
                          key={item.code}
                          className="flex items-start justify-between gap-4 rounded-lg border border-line bg-paper-2 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-[11px] font-semibold">
                              {item.label}
                            </p>
                            <p className="text-[9.5px] text-muted">{item.note}</p>
                          </div>
                          <span className="shrink-0 text-[11px] font-bold tabular">
                            {formatINR(item.amount)}
                          </span>
                        </div>
                      ))}
                    {!showAllApprovals && estimate.approvals.length > 4 && (
                      <button
                        type="button"
                        onClick={() => setShowAllApprovals(true)}
                        className="text-[10.5px] font-bold text-forest hover:text-clay"
                      >
                        Show all {estimate.approvals.length} items
                      </button>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px] font-bold">
                    <span>Approvals total</span>
                    <span>{formatINR(estimate.approvalsTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Assumptions
                  </p>
                  <ul className="mt-3 space-y-2">
                    {result.assumptions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[11px] leading-5 text-ink/65"
                      >
                        <Check className="mt-0.5 size-3 shrink-0 text-forest" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[22px] border border-ink/10 bg-paper p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Exclusions
                  </p>
                  <ul className="mt-3 space-y-2">
                    {result.exclusions.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-[11px] leading-5 text-ink/65"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-clay" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="rounded-xl border border-line bg-paper px-4 py-3 text-[10.5px] leading-5 text-muted">
                {result.disclaimer}
              </p>
            </div>
          )}

          {tab === "boq" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Bill of quantities
                  </p>
                  <p className="mt-1 text-[12px] text-ink/60">
                    {result.lineItems.length} line items ·{" "}
                    {result.lineItems.filter((item) => item.source === "LLM").length}{" "}
                    AI-enriched · all amounts in INR
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCsv(result)}
                >
                  <Download className="size-3.5" />
                  Export CSV
                </Button>
              </div>

              <div className="mt-5 overflow-hidden rounded-[20px] border border-ink/10 bg-paper">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-line bg-sage/40 text-[9px] font-bold uppercase tracking-[0.12em] text-ink/50">
                        <th className="px-4 py-3">Stage</th>
                        <th className="px-4 py-3">Line item</th>
                        <th className="px-4 py-3 text-right">Qty</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.lineItems.map((item) => (
                        <tr
                          key={item.code}
                          className="border-b border-line/70 text-[11.5px] last:border-0 hover:bg-paper-2"
                        >
                          <td className="px-4 py-3 align-top">
                            <span className="rounded bg-mist px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-ink/55">
                              {item.stage.replaceAll("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <p className="font-medium leading-5">
                              {item.description}
                            </p>
                            <p className="mt-0.5 text-[9.5px] text-muted">
                              {item.source === "LLM" ? "AI-enriched" : "SahiBuild rule"} ·{" "}
                              {item.category.toLowerCase()}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right align-top tabular text-ink/65">
                            {formatNumber(item.quantity)} {item.unit}
                          </td>
                          <td className="px-4 py-3 text-right align-top tabular text-ink/65">
                            {formatINR(item.rate)}
                          </td>
                          <td className="px-4 py-3 text-right align-top font-semibold tabular">
                            {formatINR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-ink text-paper-2">
                        <td className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.12em]" colSpan={4}>
                          Total all-in estimate
                        </td>
                        <td className="px-4 py-4 text-right text-[14px] font-bold tabular">
                          {formatINR(estimate.totalCost)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-5 text-muted">
                Approvals, contingency, and GST are shown as separate line
                items. Material costs are embedded in construction rates; the
                material schedule is for procurement planning.
              </p>
            </div>
          )}

          {tab === "materials" && (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Material schedule
                  </p>
                  <p className="mt-1 text-[12px] text-ink/60">
                    Planning quantities for {formatNumber(estimate.area.builtupSqft)} sq.ft
                    of built-up area, including normal wastage.
                  </p>
                </div>
                <Badge tone="sage">
                  <TrendingUp className="size-3" />
                  2026 Bengaluru rates
                </Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {estimate.materials.map((material) => (
                  <div
                    key={material.material}
                    className="rounded-[18px] border border-ink/10 bg-paper p-5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      {material.material}
                    </p>
                    <p className="mt-2 font-display text-[28px] leading-none tracking-[-0.03em]">
                      {material.displayQuantity}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10.5px]">
                      <span className="text-muted">
                        ₹{material.unitRate}/{material.unit}
                      </span>
                      <span className="font-bold">
                        {formatINR(material.amount)}
                      </span>
                    </div>
                    <p className="mt-2 text-[9.5px] leading-4 text-muted">
                      Indicative procurement value; embedded in stage rates.
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-[18px] border border-ink/10 bg-paper p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                  How to use this schedule
                </p>
                <div className="mt-3 grid gap-4 text-[11px] leading-5 text-ink/65 sm:grid-cols-3">
                  <p>
                    Ask each builder to quote the same material brands and
                    grades. A lower rate with weaker grade is not comparable.
                  </p>
                  <p>
                    Steel and cement quantities move with structural design.
                    Treat these as planning numbers until the structural
                    engineer signs off.
                  </p>
                  <p>
                    Buy cement and steel against a schedule, not a lump sum.
                    Track deliveries and wastage at the site gate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === "plan" && (
            <FloorPlanPreview
              widthFt={input.plotWidthFt}
              lengthFt={input.plotLengthFt}
              totalFloors={input.totalFloors}
              facing={input.facing}
              vastuPreferred={input.vastuPreferred}
            />
          )}

          {tab === "builders" && (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                    Matched for this project
                  </p>
                  <p className="mt-1 text-[12px] text-ink/60">
                    Ranked by zone, finish tier, rate fit, insurance, and
                    verified volume.
                  </p>
                </div>
                <ButtonLink
                  href={`/builders?zone=${input.zoneSlug}&tier=${input.qualityTier}`}
                  variant="outline"
                  size="sm"
                >
                  Open directory
                  <ArrowUpRight className="size-3.5" />
                </ButtonLink>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {builders.map((builder, index) => (
                  <div
                    key={builder.id}
                    className="rounded-[20px] border border-ink/10 bg-paper p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid size-11 place-items-center rounded-xl text-[12px] font-bold text-white"
                          style={{ backgroundColor: builder.accent }}
                        >
                          {builder.initials}
                        </span>
                        <div>
                          <p className="font-display text-[22px] leading-none tracking-[-0.03em]">
                            {builder.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-[10.5px] text-muted">
                            <Star className="size-3 fill-clay text-clay" />
                            {builder.rating} · {builder.reviews} reviews ·{" "}
                            {builder.completed} homes
                          </p>
                        </div>
                      </div>
                      <div className="rounded-lg bg-lime px-2 py-1 text-center">
                        <p className="text-[14px] font-bold leading-none">
                          {builder.matchScore}%
                        </p>
                        <p className="text-[7.5px] font-bold uppercase tracking-wider">
                          match
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11.5px] leading-5 text-ink/60">
                      {builder.bio}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {builder.matchReasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full bg-sage px-2 py-0.5 text-[9px] font-semibold text-forest"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                      <span className="text-[10.5px] text-muted">
                        ₹{builder.minRate.toLocaleString("en-IN")}–
                        {builder.maxRate.toLocaleString("en-IN")}/sq.ft ·{" "}
                        {builder.leadTime}
                      </span>
                      <Button size="sm" variant={index === 0 ? "primary" : "outline"}>
                        Request intro
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-[18px] bg-ink p-5 text-paper-2 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[13px] font-bold">
                    Share this BOQ with all builders.
                  </p>
                  <p className="mt-0.5 text-[11px] text-paper-2/55">
                    Same scope, same line items, comparable quotes. No
                    apples-to-oranges.
                  </p>
                </div>
                <ButtonLink
                  href="/builders"
                  variant="lime"
                  size="sm"
                  className="shrink-0"
                >
                  Get 3–5 quotes
                  <ArrowUpRight className="size-3.5" />
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
