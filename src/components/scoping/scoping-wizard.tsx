"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Compass,
  Hammer,
  Info,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Ruler,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScopingResults } from "./results";
import { buildEstimate } from "@/lib/scoping/pricing";
import { finalizeEstimate } from "@/lib/scoping/reconcile";
import {
  DEFAULT_SCOPING_INPUT,
  ScopingInputSchema,
  type ScopingInput,
} from "@/lib/scoping/input";
import {
  BENGALURU_ZONES,
  FACING_LABELS,
  FACINGS,
  FLOOR_OPTIONS,
  PLOT_PRESETS,
  PURPOSE_META,
  QUALITY_META,
  QUALITY_TIERS,
  type QualityTier,
  type ZoneSlug,
} from "@/lib/scoping/rules";
import type { ScopingResult, SavedProject } from "@/lib/scoping/types";
import { readProjects, writeProjects } from "@/lib/project-storage";
import { cn, compactINR, formatINR, formatNumber } from "@/lib/utils";

const STEPS = [
  { title: "Plot", subtitle: "Dimensions & envelope", icon: Ruler },
  { title: "Location", subtitle: "Zone & purpose", icon: MapPin },
  { title: "Build", subtitle: "Floors & finishes", icon: Hammer },
  { title: "Review", subtitle: "Confirm & generate", icon: Sparkles },
];

const popularZones: ZoneSlug[] = [
  "whitefield",
  "sarjapur-road",
  "yelahanka",
  "electronic-city",
  "hebbal",
  "hsr-layout",
  "jayanagar",
  "jp-nagar",
  "thanisandra",
  "hennur",
  "bannerghatta-road",
  "kengeri",
  "rajajinagar",
  "indiranagar",
  "other",
];

const LOADING_MESSAGES = [
  "Checking BBMP coverage and FAR assumptions…",
  "Pricing 2026 Bengaluru material rates…",
  "Building stage-wise BOQ line items…",
  "Running Vastu and builder-match checks…",
];

function StepProgress({
  step,
  onJump,
}: {
  step: number;
  onJump: (step: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {STEPS.map((item, index) => {
        const active = index === step;
        const done = index < step;
        return (
          <button
            key={item.title}
            type="button"
            onClick={() => index <= step && onJump(index)}
            className={cn(
              "group rounded-xl border px-2.5 py-2.5 text-left transition-colors",
              active
                ? "border-ink bg-ink text-paper-2"
                : done
                  ? "border-forest/20 bg-sage/60 text-forest"
                  : "border-ink/10 bg-paper text-ink/40",
            )}
          >
            <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.1em]">
              <span
                className={cn(
                  "grid size-4 place-items-center rounded-full text-[8px]",
                  active
                    ? "bg-lime text-ink"
                    : done
                      ? "bg-forest text-lime"
                      : "bg-mist text-ink/40",
                )}
              >
                {done ? <Check className="size-2.5" /> : index + 1}
              </span>
              <span className="hidden sm:inline">{item.title}</span>
            </span>
            <span
              className={cn(
                "mt-1 block truncate text-[10px] font-medium",
                active ? "text-paper-2/55" : "text-muted",
              )}
            >
              {item.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NumberStepper({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          {label}
        </label>
        <span className="text-[9.5px] text-muted">
          {min}–{max} {suffix}
        </span>
      </div>
      <div className="mt-2 flex items-center rounded-xl border border-ink/12 bg-paper">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step))}
          className="grid size-10 place-items-center text-ink/50 hover:text-ink"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-3.5" />
        </button>
        <div className="flex flex-1 items-baseline justify-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(event) => onChange(clamp(Number(event.target.value)))}
            className="w-16 bg-transparent text-center font-display text-[24px] leading-none tracking-[-0.03em] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[10px] font-semibold text-muted">{suffix}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(clamp(value + step))}
          className="grid size-10 place-items-center text-ink/50 hover:text-ink"
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ScopingWizard() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<ScopingInput>(DEFAULT_SCOPING_INPUT);
  const [result, setResult] = useState<ScopingResult | null>(null);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const estimate = useMemo(() => buildEstimate(input), [input]);
  const validation = ScopingInputSchema.safeParse(input);
  const canContinue = validation.success;

  function update<K extends keyof ScopingInput>(
    key: K,
    value: ScopingInput[K],
  ) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setResult(null);
    setSaved(false);
    setNotice(null);
  }

  function selectPreset(index: number) {
    const preset = PLOT_PRESETS[index];
    setInput((previous) => ({
      ...previous,
      plotWidthFt: preset.widthFt,
      plotLengthFt: preset.lengthFt,
    }));
    setResult(null);
    setSaved(false);
  }

  async function generate() {
    const parsed = ScopingInputSchema.safeParse(input);
    if (!parsed.success) {
      setStep(0);
      return;
    }

    setGenerating(true);
    setNotice(null);
    setResult(null);
    setLoadingIndex(0);

    const interval = window.setInterval(() => {
      setLoadingIndex((index) => (index + 1) % LOADING_MESSAGES.length);
    }, 1700);

    try {
      const response = await fetch("/api/scoping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        throw new Error("The scoping API returned an error.");
      }

      const payload = (await response.json()) as ScopingResult;
      setResult(payload);
      saveProject(payload);
    } catch {
      const fallback = finalizeEstimate(estimate, null);
      setResult(fallback);
      saveProject(fallback);
      setNotice(
        "AI enrichment was unavailable, so we generated the rules-based BOQ. All numbers are intact.",
      );
    } finally {
      window.clearInterval(interval);
      setGenerating(false);
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }
  }

  function saveProject(payload: ScopingResult) {
    try {
      const project: SavedProject = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        input: {
          title: input.title,
          plotWidthFt: input.plotWidthFt,
          plotLengthFt: input.plotLengthFt,
          totalFloors: input.totalFloors,
          zoneSlug: input.zoneSlug,
          locality: input.locality,
          pincode: input.pincode,
          qualityTier: input.qualityTier,
          purpose: input.purpose,
          facing: input.facing,
          roadWidthFt: input.roadWidthFt,
        },
        result: payload,
      };
      writeProjects([project, ...readProjects()].slice(0, 20));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function reset() {
    setResult(null);
    setSaved(false);
    setNotice(null);
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const plotArea = input.plotWidthFt * input.plotLengthFt;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -right-24 top-0 -z-10 size-[400px] rounded-full bg-lime/30 blur-[100px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <Badge tone="outline" className="bg-paper-2/80">
                <Sparkles className="size-3 text-clay" />
                AI scoping engine
              </Badge>
              <h1 className="mt-4 max-w-2xl text-balance font-display text-[42px] leading-[0.98] tracking-[-0.045em] sm:text-[56px]">
                Tell us the plot.
                <br />
                We&apos;ll show you the real cost.
              </h1>
              <p className="mt-4 max-w-xl text-[13.5px] leading-6 text-ink/60">
                Built for Bengaluru&apos;s 30×40, 40×60, and odd-shaped sites.
                Live numbers, stage-wise BOQ, materials, approvals, and a
                conceptual Vastu plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-muted">
              <span className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1.5">
                <BadgeCheck className="size-3.5 text-forest" />
                No signup to estimate
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1.5">
                <Wallet className="size-3.5 text-forest" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-2 px-3 py-1.5">
                <Compass className="size-3.5 text-forest" />
                Vastu-aware
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-paper">
        <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-14">
          <div className="rounded-[24px] border border-ink/10 bg-paper-2 p-5 shadow-card sm:p-7">
            <StepProgress step={step} onJump={setStep} />

            <div className="mt-7 min-h-[390px]">
              {step === 0 && (
                <div>
                  <h2 className="font-display text-[28px] leading-none tracking-[-0.035em]">
                    Start with the site.
                  </h2>
                  <p className="mt-2 text-[12px] text-muted">
                    Bengaluru plots are usually quoted width × depth. Pick a
                    preset or dial in your own.
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PLOT_PRESETS.map((preset, index) => {
                      const active =
                        input.plotWidthFt === preset.widthFt &&
                        input.plotLengthFt === preset.lengthFt;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => selectPreset(index)}
                          className={cn(
                            "rounded-xl border px-3 py-3 text-left transition-colors",
                            active
                              ? "border-ink bg-ink text-paper-2"
                              : "border-ink/10 bg-paper hover:border-ink/30",
                          )}
                        >
                          <p className="text-[13px] font-bold">{preset.label}</p>
                          <p
                            className={cn(
                              "mt-0.5 text-[9.5px]",
                              active ? "text-paper-2/50" : "text-muted",
                            )}
                          >
                            {preset.note}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <NumberStepper
                      label="Plot width"
                      value={input.plotWidthFt}
                      min={15}
                      max={100}
                      suffix="ft"
                      onChange={(value) => update("plotWidthFt", value)}
                    />
                    <NumberStepper
                      label="Plot depth"
                      value={input.plotLengthFt}
                      min={15}
                      max={200}
                      suffix="ft"
                      onChange={(value) => update("plotLengthFt", value)}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-sage/60 px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest/60">
                        Plot area
                      </p>
                      <p className="mt-0.5 font-display text-[24px] leading-none tracking-[-0.03em]">
                        {formatNumber(plotArea)} sq.ft
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest/60">
                        Max footprint @ 70%
                      </p>
                      <p className="mt-0.5 font-display text-[24px] leading-none tracking-[-0.03em]">
                        {formatNumber(Math.floor(plotArea * 0.7))} sq.ft
                      </p>
                    </div>
                  </div>
                  {input.plotWidthFt > input.plotLengthFt && (
                    <p className="mt-2 text-[10px] text-clay">
                      Plot depth must be at least the plot width.
                    </p>
                  )}

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        Facing
                      </label>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {FACINGS.map((facing) => (
                          <button
                            key={facing}
                            type="button"
                            onClick={() => update("facing", facing)}
                            className={cn(
                              "rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
                              input.facing === facing
                                ? "border-forest bg-forest text-paper-2"
                                : "border-ink/10 text-ink/55 hover:border-ink/30",
                            )}
                          >
                            {FACING_LABELS[facing]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        Road width
                      </label>
                      <div className="mt-2 flex gap-1.5">
                        {[20, 30, 40, 60].map((width) => (
                          <button
                            key={width}
                            type="button"
                            onClick={() => update("roadWidthFt", width)}
                            className={cn(
                              "flex-1 rounded-lg border py-2 text-[10.5px] font-bold transition-colors",
                              input.roadWidthFt === width
                                ? "border-ink bg-ink text-paper-2"
                                : "border-ink/10 text-ink/55 hover:border-ink/30",
                            )}
                          >
                            {width} ft
                          </button>
                        ))}
                      </div>
                      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[11px] text-ink/60">
                        <input
                          type="checkbox"
                          checked={input.hasBasement}
                          onChange={(event) =>
                            update("hasBasement", event.target.checked)
                          }
                          className="size-3.5 accent-forest"
                        />
                        Include a basement (extra cost)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-display text-[28px] leading-none tracking-[-0.035em]">
                    Where in Bengaluru?
                  </h2>
                  <p className="mt-2 text-[12px] text-muted">
                    Location changes labour, logistics, and finish expectations.
                    Pick the closest zone.
                  </p>

                  <div className="mt-5 grid max-h-[270px] grid-cols-2 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-3">
                    {popularZones.map((slug) => {
                      const zone = BENGALURU_ZONES[slug];
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => update("zoneSlug", slug)}
                          className={cn(
                            "rounded-xl border px-3 py-2.5 text-left transition-colors",
                            input.zoneSlug === slug
                              ? "border-forest bg-sage"
                              : "border-ink/10 bg-paper hover:border-ink/30",
                          )}
                        >
                          <p className="text-[11px] font-bold">{zone.name}</p>
                          <p className="mt-0.5 truncate text-[9px] text-muted">
                            {zone.note}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        Pincode
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={input.pincode}
                        maxLength={6}
                        onChange={(event) =>
                          update(
                            "pincode",
                            event.target.value.replace(/\D/g, "").slice(0, 6),
                          )
                        }
                        placeholder="560035"
                        className="mt-2 h-11 w-full rounded-xl border border-ink/12 bg-paper px-3 text-[13px] font-semibold outline-none focus:border-forest"
                      />
                      {input.pincode.length > 0 &&
                        !/^[1-9][0-9]{5}$/.test(input.pincode) && (
                          <p className="mt-1 text-[10px] text-clay">
                            Enter a valid 6-digit pincode.
                          </p>
                        )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                        Locality (optional)
                      </label>
                      <input
                        type="text"
                        value={input.locality ?? ""}
                        onChange={(event) =>
                          update("locality", event.target.value)
                        }
                        placeholder="e.g. Kasavanahalli"
                        className="mt-2 h-11 w-full rounded-xl border border-ink/12 bg-paper px-3 text-[13px] outline-none focus:border-forest"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      What is this build for?
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {(
                        Object.keys(PURPOSE_META) as Array<
                          keyof typeof PURPOSE_META
                        >
                      ).map((purpose) => (
                        <button
                          key={purpose}
                          type="button"
                          onClick={() => update("purpose", purpose)}
                          className={cn(
                            "rounded-xl border px-3 py-3 text-left transition-colors",
                            input.purpose === purpose
                              ? "border-ink bg-ink text-paper-2"
                              : "border-ink/10 bg-paper hover:border-ink/30",
                          )}
                        >
                          <p className="text-[11.5px] font-bold">
                            {PURPOSE_META[purpose].label}
                          </p>
                          <p
                            className={cn(
                              "mt-0.5 text-[9px] leading-4",
                              input.purpose === purpose
                                ? "text-paper-2/50"
                                : "text-muted",
                            )}
                          >
                            {PURPOSE_META[purpose].description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-display text-[28px] leading-none tracking-[-0.035em]">
                    How much house, and how finished?
                  </h2>
                  <p className="mt-2 text-[12px] text-muted">
                    The finish tier is the biggest controllable variable after
                    plot size.
                  </p>

                  <div className="mt-5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      Floors
                    </label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {FLOOR_OPTIONS.map((floor) => (
                        <button
                          key={floor.totalFloors}
                          type="button"
                          onClick={() =>
                            update("totalFloors", floor.totalFloors)
                          }
                          className={cn(
                            "rounded-xl border px-2 py-3 text-center transition-colors",
                            input.totalFloors === floor.totalFloors
                              ? "border-ink bg-ink text-paper-2"
                              : "border-ink/10 bg-paper hover:border-ink/30",
                          )}
                        >
                          <p className="text-[18px] font-bold leading-none">
                            {floor.short}
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[8.5px]",
                              input.totalFloors === floor.totalFloors
                                ? "text-paper-2/50"
                                : "text-muted",
                            )}
                          >
                            {floor.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      Finish tier
                    </label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {QUALITY_TIERS.map((tier) => {
                        const meta = QUALITY_META[tier];
                        const active = input.qualityTier === tier;
                        return (
                          <button
                            key={tier}
                            type="button"
                            onClick={() =>
                              update("qualityTier", tier as QualityTier)
                            }
                            className={cn(
                              "relative overflow-hidden rounded-xl border px-4 py-3 text-left transition-colors",
                              active
                                ? "border-forest bg-sage"
                                : "border-ink/10 bg-paper hover:border-ink/30",
                            )}
                          >
                            <span
                              className="absolute inset-y-0 left-0 w-1"
                              style={{ backgroundColor: meta.accent }}
                            />
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] font-bold">
                                {meta.label}
                              </p>
                              <p className="text-[9px] font-semibold text-muted">
                                {meta.range}
                              </p>
                            </div>
                            <p className="mt-1 text-[9.5px] leading-4 text-muted">
                              {meta.blurb}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-ink/10 bg-paper px-3.5 py-3 text-[11px] text-ink/60">
                    <input
                      type="checkbox"
                      checked={input.vastuPreferred}
                      onChange={(event) =>
                        update("vastuPreferred", event.target.checked)
                      }
                      className="mt-0.5 size-3.5 accent-forest"
                    />
                    <span>
                      Prefer a Vastu-aware layout
                      <span className="mt-0.5 block text-[9.5px] text-muted">
                        Pooja in the north-east, kitchen in the south-east,
                        master bedroom in the south-west.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-display text-[28px] leading-none tracking-[-0.035em]">
                    One last look.
                  </h2>
                  <p className="mt-2 text-[12px] text-muted">
                    We&apos;ll generate a stage-wise BOQ, material schedule,
                    approvals, risk flags, and a conceptual floor plan.
                  </p>

                  <div className="mt-5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                      Project name (optional)
                    </label>
                    <input
                      type="text"
                      value={input.title ?? ""}
                      onChange={(event) =>
                        update(
                          "title",
                          event.target.value.trim().length
                            ? event.target.value
                            : undefined,
                        )
                      }
                      placeholder={`${input.plotWidthFt}×${input.plotLengthFt} ${BENGALURU_ZONES[input.zoneSlug].name} home`}
                      className="mt-2 h-11 w-full rounded-xl border border-ink/12 bg-paper px-3 text-[13px] outline-none focus:border-forest"
                    />
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {[
                      ["Plot", `${input.plotWidthFt} × ${input.plotLengthFt} ft`],
                      ["Plot area", `${formatNumber(plotArea)} sq.ft`],
                      ["Zone", BENGALURU_ZONES[input.zoneSlug].name],
                      ["Pincode", input.pincode],
                      ["Facing", FACING_LABELS[input.facing]],
                      ["Floors", `G+${Math.max(0, input.totalFloors - 1)}`],
                      ["Purpose", PURPOSE_META[input.purpose].label],
                      ["Finish tier", QUALITY_META[input.qualityTier].label],
                      ["Road width", `${input.roadWidthFt} ft`],
                      ["Basement", input.hasBasement ? "Yes" : "No"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[10.5px]"
                      >
                        <span className="text-muted">{label}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-lime/50 px-3.5 py-3 text-[10.5px] leading-5 text-ink/70">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    <p>
                      Built-up area is capped by 70% coverage and a{" "}
                      {estimate.area.farLimit} FAR assumption for a{" "}
                      {input.roadWidthFt} ft road. A licensed architect must
                      confirm setbacks and sanction.
                    </p>
                  </div>

                  {!validation.success && (
                    <p className="mt-3 text-[10.5px] text-clay">
                      Check the plot dimensions, pincode, and floor count before
                      generating.
                    </p>
                  )}

                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="mt-5 w-full"
                    onClick={generate}
                    disabled={!canContinue || generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {LOADING_MESSAGES[loadingIndex]}
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate my BOQ & floor plan
                      </>
                    )}
                  </Button>
                  <p className="mt-2 text-center text-[9.5px] text-muted">
                    Free · no signup · export to CSV
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || generating}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setStep((s) => Math.min(3, s + 1))}
                  disabled={generating}
                >
                  Continue
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <span className="text-[10px] text-muted">
                  {saved ? "Saved to workspace" : "Step 4 of 4"}
                </span>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[24px] border border-ink/12 bg-paper-2 shadow-card">
              <div className="flex items-center justify-between bg-ink px-5 py-3.5 text-paper-2">
                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <span className="relative flex size-2">
                    <span className="pulse-dot absolute size-2 rounded-full bg-lime" />
                    <span className="relative size-2 rounded-full bg-lime" />
                  </span>
                  Live estimate
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-paper-2/45">
                  2026 rates
                </span>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
                  All-in project cost
                </p>
                <p className="mt-1 font-display text-[42px] leading-none tracking-[-0.045em]">
                  {compactINR(estimate.totalCost)}
                </p>
                <p className="mt-1.5 text-[11px] text-muted">
                  {formatINR(estimate.effectiveRatePerSqft)}/sq.ft all-in ·{" "}
                  {formatNumber(estimate.area.builtupSqft)} sq.ft
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-sage/60 px-3 py-2">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest/50">
                      Built-up
                    </p>
                    <p className="mt-0.5 text-[13px] font-bold">
                      {formatNumber(estimate.area.builtupSqft)} sq.ft
                    </p>
                  </div>
                  <div className="rounded-lg bg-sage/60 px-3 py-2">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest/50">
                      Rate
                    </p>
                    <p className="mt-0.5 text-[13px] font-bold">
                      ₹{estimate.ratePerSqft.toLocaleString("en-IN")}/sq.ft
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-mist">
                  {estimate.breakdown.map((group) => (
                    <div
                      key={group.group}
                      style={{
                        width: `${Math.max(
                          2,
                          (group.amount / estimate.totalCost) * 100,
                        )}%`,
                        backgroundColor: group.color,
                      }}
                    />
                  ))}
                  <div
                    className="bg-lime"
                    style={{
                      width: `${Math.max(
                        2,
                        (estimate.approvalsTotal / estimate.totalCost) * 100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  {estimate.breakdown.map((group) => (
                    <div
                      key={group.group}
                      className="flex items-center justify-between text-[11px]"
                    >
                      <span className="flex items-center gap-2 text-ink/60">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        {group.label}
                      </span>
                      <span className="font-semibold tabular">
                        {compactINR(group.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-2 text-ink/60">
                      <span className="size-2 rounded-full bg-lime" />
                      Fees & approvals
                    </span>
                    <span className="font-semibold tabular">
                      {compactINR(estimate.approvalsTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-line pt-2 text-[11px]">
                    <span className="text-ink/60">GST + contingency</span>
                    <span className="font-semibold tabular">
                      {compactINR(estimate.gst + estimate.contingency)}
                    </span>
                  </div>
                </div>

                {estimate.area.farCapped && (
                  <div className="mt-4 rounded-lg bg-clay-soft px-3 py-2.5 text-[10px] leading-4 text-[#8f3c21]">
                    <p className="font-bold">FAR cap reached</p>
                    <p className="mt-0.5">
                      Only {estimate.area.maxFloorsByFar} floors fit at this
                      road width. Reduce floors or consult an architect.
                    </p>
                  </div>
                )}

                <div className="mt-5 flex items-start gap-2 rounded-xl border border-ink/10 bg-paper px-3 py-2.5 text-[9.5px] leading-4 text-muted">
                  <Info className="mt-0.5 size-3 shrink-0" />
                  Planning-grade. Confirm FAR, setbacks, and approvals before
                  purchase or contract.
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "Structure", value: `${Math.round((estimate.breakdown.find((b) => b.group === "STRUCTURE")?.amount ?? 0) / Math.max(1, estimate.constructionSubtotal) * 100)}%` },
                { label: "Finishes", value: `${Math.round((estimate.breakdown.find((b) => b.group === "FINISHES")?.amount ?? 0) / Math.max(1, estimate.constructionSubtotal) * 100)}%` },
                { label: "Overhead", value: `${Math.round((estimate.breakdown.find((b) => b.group === "OVERHEAD")?.amount ?? 0) / Math.max(1, estimate.constructionSubtotal) * 100)}%` },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-ink/10 bg-paper-2 px-3 py-2.5 text-center"
                >
                  <p className="font-display text-[21px] leading-none tracking-[-0.03em]">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div ref={resultsRef}>
        {notice && result && (
          <div className="mx-auto max-w-[1240px] px-5 pt-6 sm:px-8">
            <div className="rounded-xl border border-[#E5C15C]/50 bg-[#FBF3D8] px-4 py-3 text-[11px] text-[#7a5c14]">
              {notice}
            </div>
          </div>
        )}
        {result && (
          <ScopingResults result={result} input={input} onReset={reset} />
        )}
      </div>
    </>
  );
}
