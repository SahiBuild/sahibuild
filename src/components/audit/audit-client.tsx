"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileSearch,
  FileText,
  Info,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { analyzeQuote, type AuditResult } from "@/lib/audit/analyze";
import {
  BENGALURU_ZONES,
  BASE_RATE_2026,
  QUALITY_META,
  QUALITY_TIERS,
  ZoneSlugSchema,
  type QualityTier,
  type ZoneSlug,
} from "@/lib/scoping/rules";
import { cn, compactINR, formatINR, formatNumber } from "@/lib/utils";

const SAMPLE_QUOTE = `QUOTATION FOR RESIDENTIAL CONSTRUCTION
Site: 30x40 plot, Kasavanahalli, Bengaluru 560035
Built-up area: 1,800 sq.ft (G+1)

Scope of work
1. Excavation and earthwork
2. RCC structure with Fe500 steel and M25 concrete
3. Masonry with solid blocks and internal plaster
4. Plumbing with CPVC concealed lines and sanitary fittings
5. Electrical wiring with conduits and switches
6. Vitrified tile flooring and bathroom wall tiles
7. Main door and internal doors with UPVC windows
8. Painting with emulsion and primer
9. Modular kitchen and wardrobes
10. Staircase with granite finish and MS railing

Payment terms: 30% advance, 40% on slab, 20% on finishing, 10% on handover.

Rate: Rs 2,650 per sq.ft. Total project cost: Rs 47,70,000.
GST extra at 18%. Labour cess included.

Exclusions
- Compound wall and gate
- Sump and overhead tank
- BESCOM and BWSSB connection charges
- Waterproofing
- Rainwater harvesting
- Site development and miscellaneous charges
- Contractor supervision and coordination charges`;

const STAGES = [
  "Reading your PDF…",
  "Extracting quantities and rates…",
  "Checking for missing scope and hidden charges…",
  "Scoring risk and preparing the review…",
];

const severityStyles = {
  HIGH: {
    chip: "bg-clay text-white",
    border: "border-l-clay",
    icon: AlertTriangle,
  },
  MEDIUM: {
    chip: "bg-[#FBF3D8] text-[#7a5c14]",
    border: "border-l-[#D9A93E]",
    icon: AlertTriangle,
  },
  LOW: {
    chip: "bg-sage text-forest",
    border: "border-l-forest/40",
    icon: Info,
  },
} as const;

function benchmarkFor(
  builtupSqft: number,
  tier: QualityTier,
  zone: ZoneSlug,
): number {
  const rate = BASE_RATE_2026[tier] * BENGALURU_ZONES[zone].multiplier;
  const construction = builtupSqft * rate;
  const approvals = Math.max(25000, builtupSqft * 12) + 110000;
  return Math.round(
    construction +
      construction * 0.03 +
      approvals +
      construction * 1.03 * 0.18,
  );
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 65 ? "#DD6B45" : score >= 40 ? "#D9A93E" : "#173E2E";
  const label = score >= 65 ? "High risk" : score >= 40 ? "Needs work" : "Low risk";

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative grid size-[104px] shrink-0 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${score * 3.6}deg, #E8E4D8 0)`,
        }}
      >
        <div className="grid size-[84px] place-items-center rounded-full bg-paper-2">
          <div className="text-center">
            <p className="font-display text-[30px] leading-none tracking-[-0.04em]">
              {score}
            </p>
            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-muted">
              / 100
            </p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          Contract risk
        </p>
        <p className="mt-1 font-display text-[24px] leading-none tracking-[-0.03em]">
          {label}
        </p>
        <p className="mt-1.5 max-w-xs text-[10.5px] leading-4 text-muted">
          Based on missing scope, vague charges, rate outliers, and overall
          quote completeness.
        </p>
      </div>
    </div>
  );
}

export function AuditClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sampleName, setSampleName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [builtupSqft, setBuiltupSqft] = useState(1800);
  const [tier, setTier] = useState<QualityTier>("STANDARD");
  const [zone, setZone] = useState<ZoneSlug>("sarjapur-road");
  const [quotedTotal, setQuotedTotal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const benchmark = useMemo(
    () => benchmarkFor(builtupSqft, tier, zone),
    [builtupSqft, tier, zone],
  );

  function chooseFile(next: File | null) {
    if (!next) return;
    if (next.type && next.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (next.size > 10 * 1024 * 1024) {
      setError("This PDF is larger than 10 MB. Try compressing it first.");
      return;
    }
    setFile(next);
    setSampleName(null);
    setResult(null);
    setError(null);
  }

  function runSample() {
    const parsedQuoted = Number(quotedTotal);
    const sampleResult = analyzeQuote(SAMPLE_QUOTE, {
      quotedTotal:
        Number.isFinite(parsedQuoted) && parsedQuoted > 0
          ? parsedQuoted
          : 4770000,
      benchmarkTotal: benchmark,
      pages: 3,
    });
    setResult(sampleResult);
    setSampleName("Sample builder quotation.pdf");
    setFile(null);
    setError(null);
    window.setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100,
    );
  }

  async function audit() {
    if (!file) {
      setError("Upload a PDF quotation first, or load the sample.");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setStage(0);

    const interval = window.setInterval(() => {
      setStage((current) => Math.min(STAGES.length - 1, current + 1));
    }, 1400);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("builtupSqft", String(builtupSqft));
      form.append("qualityTier", tier);
      form.append("zoneSlug", zone);
      if (quotedTotal.trim()) form.append("quotedTotal", quotedTotal);

      const response = await fetch("/api/audit", { method: "POST", body: form });
      const payload = (await response.json()) as AuditResult & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The audit could not be completed.");
      }

      setResult(payload);
      window.setTimeout(
        () => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        100,
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong while auditing the PDF.",
      );
    } finally {
      window.clearInterval(interval);
      setAnalyzing(false);
    }
  }

  const selectedName = file?.name ?? sampleName;

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -left-20 top-10 -z-10 size-[360px] rounded-full bg-sage/70 blur-[90px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <Badge tone="outline" className="bg-paper-2/80">
                <FileSearch className="size-3 text-clay" />
                Quote audit
              </Badge>
              <h1 className="mt-4 max-w-2xl text-balance font-display text-[42px] leading-[0.98] tracking-[-0.045em] sm:text-[56px]">
                Find the gaps before
                <br />
                you sign the quote.
              </h1>
              <p className="mt-4 max-w-xl text-[13.5px] leading-6 text-ink/60">
                Upload a builder&apos;s PDF quotation. We extract the text,
                compare it against Bengaluru scope and 2026 rates, and flag the
                lines that become change orders later.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Missing scope", value: "16 checks" },
                { label: "Hidden charges", value: "13 terms" },
                { label: "Rate outliers", value: "2026 bands" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-ink/10 bg-paper-2 px-3 py-3"
                >
                  <p className="font-display text-[20px] leading-none tracking-[-0.03em]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-14">
          <div className="rounded-[24px] border border-ink/10 bg-paper-2 p-5 shadow-card sm:p-7">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                chooseFile(event.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "relative rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors",
                dragging
                  ? "border-forest bg-sage/70"
                  : selectedName
                    ? "border-forest/40 bg-sage/40"
                    : "border-ink/15 bg-paper hover:border-ink/30",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
              />
              {selectedName ? (
                <div>
                  <div className="mx-auto grid size-11 place-items-center rounded-xl bg-forest text-lime">
                    <FileText className="size-5" />
                  </div>
                  <p className="mt-3 max-w-full truncate text-[13px] font-bold">
                    {selectedName}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">
                    {file
                      ? `${(file.size / 1024 / 1024).toFixed(2)} MB · PDF ready`
                      : "Demo document · client-side analysis"}
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                    >
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setSampleName(null);
                        setResult(null);
                      }}
                    >
                      <X className="size-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mx-auto grid size-12 place-items-center rounded-xl bg-sage text-forest">
                    <UploadCloud className="size-6" />
                  </div>
                  <p className="mt-3 text-[14px] font-bold">
                    Drop your quotation PDF here
                  </p>
                  <p className="mt-1 text-[10.5px] text-muted">
                    Native or scanned PDF · up to 10 MB · never stored
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                    >
                      Choose PDF
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={runSample}
                    >
                      <Sparkles className="size-3.5" />
                      Try sample
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-clay/40 bg-clay-soft px-3.5 py-3 text-[11px] text-[#8f3c21]">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                  Optional benchmark
                </h2>
                <span className="text-[9px] text-muted">
                  Sharper comparison
                </span>
              </div>
              <p className="mt-1.5 text-[10.5px] leading-4 text-muted">
                Add the built-up area, finish tier, and zone to compare the
                quote against a SahiBuild estimate.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">
                    Built-up area
                  </label>
                  <div className="mt-1.5 flex h-10 items-center rounded-lg border border-ink/12 bg-paper px-3">
                    <input
                      type="number"
                      min={200}
                      max={20000}
                      value={builtupSqft}
                      onChange={(event) =>
                        setBuiltupSqft(
                          Math.max(200, Number(event.target.value) || 200),
                        )
                      }
                      className="w-full bg-transparent text-[12.5px] font-semibold outline-none"
                    />
                    <span className="text-[9px] text-muted">sq.ft</span>
                  </div>
                </div>
                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">
                    Quoted total (optional)
                  </label>
                  <div className="mt-1.5 flex h-10 items-center rounded-lg border border-ink/12 bg-paper px-3">
                    <span className="text-[11px] text-muted">₹</span>
                    <input
                      type="number"
                      min={0}
                      value={quotedTotal}
                      placeholder="Auto-detect"
                      onChange={(event) => setQuotedTotal(event.target.value)}
                      className="w-full bg-transparent pl-1 text-[12.5px] font-semibold outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">
                    Finish tier
                  </label>
                  <select
                    value={tier}
                    onChange={(event) =>
                      setTier(event.target.value as QualityTier)
                    }
                    className="mt-1.5 h-10 w-full rounded-lg border border-ink/12 bg-paper px-2.5 text-[12px] font-semibold outline-none"
                  >
                    {QUALITY_TIERS.map((option) => (
                      <option key={option} value={option}>
                        {QUALITY_META[option].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted">
                    Zone
                  </label>
                  <select
                    value={zone}
                    onChange={(event) => setZone(event.target.value as ZoneSlug)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-ink/12 bg-paper px-2.5 text-[12px] font-semibold outline-none"
                  >
                    {ZoneSlugSchema.options.map((option) => (
                      <option key={option} value={option}>
                        {BENGALURU_ZONES[option].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-sage/60 px-3 py-2 text-[10px] text-forest/70">
                Benchmark for {formatNumber(builtupSqft)} sq.ft ·{" "}
                {QUALITY_META[tier].label} · {BENGALURU_ZONES[zone].name}:{" "}
                <span className="font-bold text-forest">
                  {compactINR(benchmark)}
                </span>
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                className="mt-4 w-full"
                onClick={audit}
                disabled={analyzing || !file}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {STAGES[stage]}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    Audit this quotation
                  </>
                )}
              </Button>
              <p className="mt-2 text-center text-[9px] text-muted">
                Your PDF is processed in memory and never stored.
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-[24px] border border-ink/12 bg-paper-2 shadow-card">
              <div className="bg-ink px-5 py-4 text-paper-2">
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em]">
                  <ShieldAlert className="size-3.5 text-lime" />
                  What we look for
                </p>
                <p className="mt-2 font-display text-[26px] leading-none tracking-[-0.03em]">
                  The 7 silent
                  <br />
                  budget killers.
                </p>
              </div>
              <div className="space-y-0 divide-y divide-line px-5">
                {[
                  ["Compound wall & gate", "Often ₹1.5–4 L extra"],
                  ["Sump & overhead tank", "Excluded from many turnkey quotes"],
                  ["BESCOM & BWSSB deposits", "Statutory, rarely itemised"],
                  ["Waterproofing", "The #1 Bengaluru monsoon failure"],
                  ["Vague 'miscellaneous'", "A blank cheque for extras"],
                  ["GST treatment", "Included, extra, or partial?"],
                  ["Labour cess & plan sanction", "Easy to bury in a lump sum"],
                ].map(([title, detail]) => (
                  <div key={title} className="flex items-start gap-3 py-3">
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-clay-soft">
                      <Check className="size-2.5 text-clay" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold">{title}</p>
                      <p className="mt-0.5 text-[9.5px] text-muted">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-line bg-paper px-5 py-4">
                <div className="flex items-start gap-2 text-[10px] leading-4 text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  This is a first-pass risk screen, not a quantity survey. Use it
                  to ask better questions before signing.
                </div>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-ink/10 bg-sage/50 p-4">
              <p className="text-[11px] font-bold">
                Don&apos;t have a quote yet?
              </p>
              <p className="mt-1 text-[10px] leading-4 text-ink/60">
                Generate a planning-grade BOQ first, then compare every builder
                against it.
              </p>
              <ButtonLink
                href="/scope"
                variant="outline"
                size="sm"
                className="mt-3 bg-paper-2"
              >
                Build an estimate
                <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          </aside>
        </div>
      </section>

      {result && (
        <section
          ref={resultsRef}
          className="border-t border-line bg-paper-2 py-10 sm:py-14"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Badge tone="clay">
                  <FileSearch className="size-3" />
                  Audit complete
                </Badge>
                <h2 className="mt-3 font-display text-[34px] leading-none tracking-[-0.04em] sm:text-[42px]">
                  Quote review
                </h2>
                <p className="mt-2 max-w-xl text-[12px] leading-5 text-muted">
                  {result.summary}
                </p>
              </div>
              <div className="flex gap-2 text-[10px] text-muted">
                <span className="rounded-full border border-ink/10 px-3 py-1.5">
                  {result.stats.pages ? `${result.stats.pages} pages` : "PDF"}
                </span>
                <span className="rounded-full border border-ink/10 px-3 py-1.5">
                  {formatNumber(result.stats.words)} words
                </span>
                <span className="rounded-full border border-ink/10 px-3 py-1.5">
                  {result.stats.amountSignals} amount signals
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[20px] border border-ink/10 bg-paper p-5">
                <RiskGauge score={result.riskScore} />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-sage/60 px-3 py-2.5">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest/50">
                      Quoted total
                    </p>
                    <p className="mt-0.5 text-[15px] font-bold">
                      {result.quotedTotal
                        ? compactINR(result.quotedTotal)
                        : "Not found"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-sage/60 px-3 py-2.5">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest/50">
                      Benchmark
                    </p>
                    <p className="mt-0.5 text-[15px] font-bold">
                      {result.benchmarkTotal
                        ? compactINR(result.benchmarkTotal)
                        : "—"}
                    </p>
                  </div>
                </div>
                {result.deltaPct !== null && (
                  <div
                    className={cn(
                      "mt-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-[11px]",
                      result.deltaPct > 15 || result.deltaPct < -18
                        ? "bg-clay-soft text-[#8f3c21]"
                        : "bg-sage/60 text-forest",
                    )}
                  >
                    <span className="font-semibold">
                      {result.deltaPct > 0 ? "Above" : "Below"} benchmark
                    </span>
                    <span className="font-bold">
                      {result.deltaPct > 0 ? "+" : ""}
                      {result.deltaPct}% ·{" "}
                      {result.deltaAmount
                        ? compactINR(Math.abs(result.deltaAmount))
                        : ""}
                    </span>
                  </div>
                )}
                <div className="mt-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                    Detected scope ({result.detected.length})
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {result.detected.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-sage px-2 py-0.5 text-[9px] font-semibold text-forest"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">
                    Missing scope ({result.missing.length})
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {result.missing.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-clay-soft px-2 py-0.5 text-[9px] font-semibold text-[#8f3c21]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                    Findings ({result.findings.length})
                  </p>
                  <p className="text-[9px] text-muted">
                    Highest severity first
                  </p>
                </div>
                <div className="mt-2 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                  {result.findings.map((finding) => {
                    const style = severityStyles[finding.severity];
                    return (
                      <div
                        key={finding.id}
                        className={cn(
                          "rounded-xl border border-ink/10 border-l-[3px] bg-paper px-4 py-3.5",
                          style.border,
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <style.icon className="mt-0.5 size-3.5 shrink-0 text-ink/40" />
                            <p className="text-[12px] font-bold leading-4">
                              {finding.title}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em]",
                              style.chip,
                            )}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        <p className="mt-1.5 pl-5.5 text-[10.5px] leading-4 text-ink/60">
                          {finding.detail}
                        </p>
                        <div className="mt-2 ml-5.5 rounded-lg bg-sage/50 px-2.5 py-2 text-[10px] leading-4 text-forest">
                          <span className="font-bold">Do this: </span>
                          {finding.recommendation}
                        </div>
                        {(finding.quotedAmount || finding.fairAmount) && (
                          <div className="mt-1.5 ml-5.5 flex gap-3 text-[9px] text-muted">
                            {finding.quotedAmount && (
                              <span>
                                Quoted: {formatINR(finding.quotedAmount)}
                              </span>
                            )}
                            {finding.fairAmount && (
                              <span>
                                Benchmark: {formatINR(finding.fairAmount)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-sage/40 px-4 py-3">
              <p className="max-w-2xl text-[9.5px] leading-4 text-muted">
                {result.disclaimer}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-paper-2"
                onClick={() => {
                  setResult(null);
                  setFile(null);
                  setSampleName(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <CheckCircle2 className="size-3.5" />
                Audit another
              </Button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
