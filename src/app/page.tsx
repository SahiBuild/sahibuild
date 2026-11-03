import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Calculator,
  Check,
  Compass,
  FileSearch,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingDown,
  Users,
} from "lucide-react";
import { HeroEstimator } from "@/components/hero-estimator";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { BUILDERS } from "@/lib/builders";
import { BENGALURU_ZONES } from "@/lib/scoping/rules";

export const metadata: Metadata = {
  title: "SahiBuild — Build with the numbers on the table",
  description:
    "Instant AI construction estimates, BOQ quote audits, Vastu floor plans, and pre-verified builders across Bengaluru. Know the cost before you dig.",
};

const stats = [
  { value: "₹1,950–3,500", label: "2026 rate band / sq.ft" },
  { value: "70%", label: "Ground coverage modelled" },
  { value: "15", label: "Bengaluru zones mapped" },
  { value: "3–5", label: "Verified builder matches" },
];

const sampleFindings = [
  {
    severity: "HIGH",
    title: "Compound wall, sump & BWSSB not itemised",
    detail: "Common ₹2.8–5.4 L gap in offline turnkey quotes.",
  },
  {
    severity: "HIGH",
    title: "“Miscellaneous charges” of ₹1,80,000",
    detail: "No unit basis, no cap, no approval process.",
  },
  {
    severity: "MEDIUM",
    title: "Steel quoted at ₹92/kg",
    detail: "Above the 2026 Bengaluru planning band of ₹70–82/kg.",
  },
  {
    severity: "MEDIUM",
    title: "No waterproofing specification",
    detail: "Terrace and bathroom tanking are usually the first failure point.",
  },
];

function MiniPlan() {
  return (
    <svg viewBox="0 0 200 150" className="mt-5 w-full" aria-hidden>
      <rect x="5" y="5" width="190" height="140" rx="3" fill="#FBF9F2" stroke="#173E2E" strokeWidth="1.5" strokeDasharray="4 3" />
      <rect x="18" y="18" width="164" height="114" fill="none" stroke="#173E2E" strokeWidth="1.5" />
      <rect x="18" y="18" width="62" height="48" fill="#DCE5D6" stroke="#173E2E" strokeWidth="1" />
      <rect x="80" y="18" width="34" height="24" fill="#D8E4E7" stroke="#173E2E" strokeWidth="1" />
      <rect x="114" y="18" width="24" height="24" fill="#F5E7B8" stroke="#173E2E" strokeWidth="1" />
      <rect x="138" y="18" width="44" height="48" fill="#F0DDD2" stroke="#173E2E" strokeWidth="1" />
      <rect x="18" y="66" width="88" height="32" fill="#E8E1CF" stroke="#173E2E" strokeWidth="1" />
      <rect x="106" y="66" width="76" height="32" fill="#EDE5C9" stroke="#173E2E" strokeWidth="1" />
      <rect x="18" y="98" width="54" height="34" fill="#DDDCD5" stroke="#173E2E" strokeWidth="1" />
      <rect x="72" y="98" width="54" height="34" fill="#D9E7D4" stroke="#173E2E" strokeWidth="1" />
      <rect x="126" y="98" width="56" height="34" fill="#E4E0CE" stroke="#173E2E" strokeWidth="1" />
      <circle cx="186" cy="138" r="8" fill="#D9FF6A" stroke="#173E2E" strokeWidth="1" />
      <path d="M186 133v10M181 138h10" stroke="#173E2E" strokeWidth="1.4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-70" />
        <div className="absolute -right-32 top-10 -z-10 size-[520px] rounded-full bg-lime/35 blur-[120px]" />
        <div className="absolute -left-40 top-96 -z-10 size-[420px] rounded-full bg-clay/10 blur-[100px]" />

        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <div>
            <Reveal>
              <Badge tone="outline" className="gap-2 bg-paper-2/80">
                <Sparkles className="size-3 text-clay" />
                AI-first construction marketplace
              </Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 text-balance font-display text-[52px] leading-[0.95] tracking-[-0.045em] text-ink sm:text-[68px] lg:text-[76px]">
                Build in Bengaluru
                <br />
                with the{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 italic">numbers</span>
                  <span className="absolute bottom-1 left-0 z-0 h-[18px] w-full -rotate-1 bg-lime sm:h-[24px]" />
                </span>{" "}
                on the table.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-[520px] text-[16px] leading-7 text-ink/65 sm:text-[17px]">
                Know your built-up area, material quantities, and real
                2026 costs before you meet a contractor. Then match with
                pre-verified local builders — no hidden charges, no guesswork.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/scope" variant="primary" size="lg">
                  Estimate my build
                  <ArrowRight className="size-4" />
                </ButtonLink>
                <ButtonLink href="/audit" variant="outline" size="lg">
                  <FileSearch className="size-4" />
                  Audit a quote
                </ButtonLink>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-2">
                    {BUILDERS.slice(0, 4).map((builder) => (
                      <span
                        key={builder.id}
                        className="grid size-8 place-items-center rounded-full border-2 border-paper text-[9px] font-bold text-white"
                        style={{ backgroundColor: builder.accent }}
                      >
                        {builder.initials}
                      </span>
                    ))}
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-[11.5px] font-bold">
                      4.8/5 average rating
                      <Star className="size-3 fill-clay text-clay" />
                    </p>
                    <p className="text-[10.5px] text-muted">
                      across 340+ verified reviews
                    </p>
                  </div>
                </div>
                <div className="hidden h-8 w-px bg-line sm:block" />
                <div>
                  <p className="flex items-center gap-1 text-[11.5px] font-bold">
                    <ShieldCheck className="size-3.5 text-forest" />
                    Verification-first
                  </p>
                  <p className="text-[10.5px] text-muted">
                    GST, license, insurance & site checks
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <HeroEstimator />
          </Reveal>
        </div>

        <div className="border-y border-line bg-paper-2/70">
          <div className="mx-auto grid max-w-[1240px] grid-cols-2 divide-x divide-line px-5 sm:px-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-5 first:pl-0 sm:px-6">
                <p className="font-display text-[26px] leading-none tracking-[-0.03em] text-ink">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-xl">
                <Badge tone="sage">The platform</Badge>
                <h2 className="mt-4 text-balance font-display text-[38px] leading-[1.02] tracking-[-0.04em] sm:text-[50px]">
                  Four tools that replace the WhatsApp quote.
                </h2>
              </div>
              <p className="max-w-[300px] text-[13px] leading-6 text-muted">
                Built specifically for Bengaluru&apos;s plot sizes, BBMP
                envelopes, BESCOM/BWSSB approvals, and local finish tiers.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            <Reveal className="lg:col-span-2 lg:row-span-2">
              <div className="relative flex h-full min-h-[440px] flex-col justify-between overflow-hidden rounded-[26px] bg-ink p-7 text-paper-2 sm:p-9">
                <div className="blueprint-grid-fine absolute inset-0 opacity-[0.14]" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-xl bg-lime text-ink">
                      <Calculator className="size-5" />
                    </span>
                    <span className="rounded-full border border-paper-2/15 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-paper-2/50">
                      Core engine
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[34px] leading-none tracking-[-0.035em]">
                    AI scoping engine
                  </h3>
                  <p className="mt-3 max-w-sm text-[13.5px] leading-6 text-paper-2/60">
                    Plot dimensions, floors, facing, purpose, and finish tier
                    become a built-up area, material schedule, and stage-wise
                    BOQ in seconds.
                  </p>
                </div>

                <div className="relative mt-8 rounded-2xl border border-paper-2/10 bg-paper-2/[0.04] p-5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-paper-2/45">
                    <span>30 × 40 · G+1 · Standard</span>
                    <span className="text-lime">₹48.6 L</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Structure", 46, "bg-lime"],
                      ["Finishes", 26, "bg-clay"],
                      ["MEP", 11, "bg-[#8FB49A]"],
                      ["External", 5, "bg-[#B9A15B]"],
                      ["Overhead", 10, "bg-paper-2/30"],
                    ].map(([label, width, color]) => (
                      <div key={label as string}>
                        <div className="flex justify-between text-[10.5px] text-paper-2/55">
                          <span>{label}</span>
                          <span>{width}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-paper-2/10">
                          <div
                            className={`h-full rounded-full ${color}`}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-paper-2/10 pt-4">
                    <span className="flex items-center gap-1.5 text-[10.5px] text-paper-2/55">
                      <Sparkles className="size-3.5 text-lime" />
                      32 line items · 6 approvals
                    </span>
                    <Link
                      href="/scope"
                      className="flex items-center gap-1 text-[11px] font-bold text-lime hover:text-white"
                    >
                      Run the numbers
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05} className="lg:col-span-2">
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-clay p-7 text-white sm:p-8">
                <div className="blueprint-grid-fine absolute inset-0 opacity-10" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-white/15">
                      <FileSearch className="size-5" />
                    </span>
                    <span className="rounded-full border border-white/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-white/70">
                      Quote defence
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[30px] leading-none tracking-[-0.035em]">
                    Audit the PDF before you sign.
                  </h3>
                  <p className="mt-2.5 max-w-md text-[13px] leading-6 text-white/75">
                    We parse the quote, flag missing line items, and benchmark
                    material rates against the 2026 Bengaluru market.
                  </p>
                </div>
                <div className="relative mt-6 space-y-2">
                  {sampleFindings.slice(0, 3).map((finding) => (
                    <div
                      key={finding.title}
                      className="flex items-start gap-2.5 rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur"
                    >
                      <span
                        className={`mt-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${
                          finding.severity === "HIGH"
                            ? "bg-white text-clay"
                            : "bg-white/15 text-white/80"
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <div>
                        <p className="text-[11.5px] font-semibold leading-4">
                          {finding.title}
                        </p>
                        <p className="text-[10px] leading-4 text-white/55">
                          {finding.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/audit"
                  className="relative mt-5 inline-flex items-center gap-1 text-[12px] font-bold text-white hover:text-ink"
                >
                  Audit a quote free
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex h-full flex-col rounded-[26px] border border-ink/10 bg-paper-2 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-sage text-forest">
                  <Compass className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-[24px] leading-none tracking-[-0.03em]">
                  Vastu floor plans
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-muted">
                  A conceptual 2D layout with room zones, setbacks, and a Vastu
                  score.
                </p>
                <MiniPlan />
                <Link
                  href="/scope"
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-bold text-forest hover:text-clay"
                >
                  Preview a plan
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex h-full flex-col rounded-[26px] border border-ink/10 bg-paper-2 p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-lime text-ink">
                  <Users className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-[24px] leading-none tracking-[-0.03em]">
                  Builder matching
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-muted">
                  Verified local contractors matched by zone, tier, and budget.
                </p>
                <div className="mt-4 space-y-2">
                  {BUILDERS.slice(0, 2).map((builder) => (
                    <div
                      key={builder.id}
                      className="flex items-center gap-2.5 rounded-lg border border-line bg-paper px-2.5 py-2"
                    >
                      <span
                        className="grid size-7 place-items-center rounded-full text-[8px] font-bold text-white"
                        style={{ backgroundColor: builder.accent }}
                      >
                        {builder.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[10.5px] font-bold">
                          {builder.name}
                        </p>
                        <p className="text-[9px] text-muted">
                          {builder.rating} ★ · {builder.zones.length} zones
                        </p>
                      </div>
                      <BadgeCheck className="ml-auto size-3.5 shrink-0 text-forest" />
                    </div>
                  ))}
                </div>
                <Link
                  href="/builders"
                  className="mt-auto inline-flex items-center gap-1 pt-4 text-[11.5px] font-bold text-forest hover:text-clay"
                >
                  Meet builders
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-line bg-paper-2">
        <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <Badge tone="sage">How it works</Badge>
              <h2 className="mt-4 text-balance font-display text-[38px] leading-[1.02] tracking-[-0.04em] sm:text-[50px]">
                From plot to signed contract, without the fog.
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Scope the build",
                body: "Enter 30×40 or 40×60, floors, facing, location, and finish tier. We calculate coverage, FAR, built-up area, and a live cost band.",
                icon: Calculator,
              },
              {
                step: "02",
                title: "Stress-test the quote",
                body: "Upload any contractor PDF. We flag missing compound walls, sumps, BESCOM/BWSSB approvals, vague charges, and inflated rates.",
                icon: FileSearch,
              },
              {
                step: "03",
                title: "Match and compare",
                body: "Share the BOQ with 3–5 pre-verified builders in your zone. Compare fixed line items, timelines, and portfolios — not sales talk.",
                icon: BadgeCheck,
              },
            ].map((item, index) => (
              <Reveal key={item.step} delay={index * 0.08}>
                <div className="relative h-full rounded-[22px] border border-ink/10 bg-paper p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-clay">
                      {item.step}
                    </span>
                    <span className="grid size-9 place-items-center rounded-full bg-sage text-forest">
                      <item.icon className="size-4" />
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-[26px] leading-none tracking-[-0.03em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-6 text-ink/60">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[30px] bg-clay/10 blur-xl" />
              <div className="overflow-hidden rounded-[24px] border border-ink/12 bg-paper-2 shadow-card">
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-clay" />
                    <span className="size-2 rounded-full bg-[#E5C15C]" />
                    <span className="size-2 rounded-full bg-[#8FB49A]" />
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted">
                    Quote_Ramesh_Construction.pdf
                  </span>
                </div>
                <div className="p-5 sm:p-7">
                  <div className="flex items-start justify-between border-b border-line pb-4">
                    <div>
                      <p className="font-display text-[22px] leading-none">
                        Ramesh Constructions
                      </p>
                      <p className="mt-1 text-[10px] text-muted">
                        Turnkey estimate · 30×40 · G+1
                      </p>
                    </div>
                    <p className="font-mono text-[14px] font-bold">₹52.4 L</p>
                  </div>
                  <div className="mt-4 space-y-2.5 font-mono text-[10.5px] text-ink/60">
                    {[
                      ["Excavation & foundation", "₹3,10,000"],
                      ["RCC structure", "₹14,80,000"],
                      ["Masonry & plaster", "₹6,20,000"],
                      ["Flooring & tiles", "₹4,40,000"],
                      ["Electrical", "₹2,10,000"],
                      ["Miscellaneous charges", "₹1,80,000"],
                    ].map(([label, amount]) => (
                      <div key={label} className="flex justify-between gap-4">
                        <span>{label}</span>
                        <span className="tabular">{amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-dashed border-line pt-2.5 font-bold text-ink">
                      <span>Total</span>
                      <span>₹52,40,000</span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-xl bg-clay-soft/70 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8f3c21]">
                      <TrendingDown className="size-3.5" />
                      Missing from this quote
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-[#8f3c21]/80">
                      Compound wall · sump · BESCOM · BWSSB · waterproofing ·
                      plan sanction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <Badge tone="clay">Quote audit</Badge>
            <h2 className="mt-4 text-balance font-display text-[38px] leading-[1.02] tracking-[-0.04em] sm:text-[50px]">
              A low quote is not a saving.
              <br />
              It&apos;s an incomplete scope.
            </h2>
            <p className="mt-5 max-w-lg text-[14px] leading-7 text-ink/65">
              Offline quotes are designed to look comparable. The difference is
              usually in what&apos;s missing, what&apos;s vague, and what gets
              added after the foundation is poured.
            </p>
            <div className="mt-7 space-y-3">
              {sampleFindings.map((finding) => (
                <div
                  key={finding.title}
                  className="flex items-start gap-3 rounded-xl border border-ink/10 bg-paper-2 px-4 py-3"
                >
                  <span
                    className={`mt-0.5 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wider ${
                      finding.severity === "HIGH"
                        ? "bg-clay text-white"
                        : "bg-[#E5C15C]/30 text-[#7a5c14]"
                    }`}
                  >
                    {finding.severity}
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold">{finding.title}</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-muted">
                      {finding.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <ButtonLink href="/audit" variant="primary" size="md" className="mt-6">
              Audit my PDF
              <ArrowUpRight className="size-4" />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-sage/40">
        <div className="mx-auto max-w-[1240px] px-5 py-20 sm:px-8 sm:py-24">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <Badge tone="outline">Verified network</Badge>
                <h2 className="mt-4 max-w-xl text-balance font-display text-[38px] leading-[1.02] tracking-[-0.04em] sm:text-[50px]">
                  Builders who actually build in your zone.
                </h2>
              </div>
              <ButtonLink href="/builders" variant="outline" size="md">
                Browse all builders
                <ArrowUpRight className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {BUILDERS.slice(0, 3).map((builder, index) => (
              <Reveal key={builder.id} delay={index * 0.06}>
                <div className="flex h-full flex-col rounded-[22px] border border-ink/10 bg-paper-2 p-6">
                  <div className="flex items-start justify-between">
                    <span
                      className="grid size-12 place-items-center rounded-2xl text-[13px] font-bold text-white"
                      style={{ backgroundColor: builder.accent }}
                    >
                      {builder.initials}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-lime px-2 py-1 text-[10px] font-bold">
                      {builder.rating}
                      <Star className="size-3 fill-ink" />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[23px] leading-none tracking-[-0.03em]">
                    {builder.name}
                  </h3>
                  <p className="mt-2 text-[11.5px] leading-5 text-muted">
                    {builder.tagline}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {builder.specialties.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-ink/10 px-2 py-1 text-[9px] font-semibold text-ink/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-[10.5px]">
                    <span className="text-muted">
                      {builder.completed} homes · {builder.years} yrs
                    </span>
                    <span className="font-bold">
                      ₹{builder.minRate.toLocaleString("en-IN")}+/sq.ft
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Badge tone="sage">Pricing</Badge>
              <h2 className="mt-4 text-balance font-display text-[38px] leading-[1.02] tracking-[-0.04em] sm:text-[50px]">
                Start free. Pay only when a human adds value.
              </h2>
              <p className="mt-4 text-[13.5px] leading-6 text-muted">
                The scoping engine and PDF screen are free. A detailed QS
                review and verified builder introductions are paid.
              </p>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                name: "Estimate",
                price: "Free",
                note: "For every landowner",
                features: [
                  "Instant built-up area & FAR check",
                  "Stage-wise cost + material schedule",
                  "Conceptual Vastu floor plan",
                  "Saved workspace & PDF export",
                ],
                cta: "Start free",
                href: "/scope",
                featured: false,
              },
              {
                name: "QS review",
                price: "₹4,999",
                note: "One quote, human-reviewed",
                features: [
                  "Everything in Estimate",
                  "Human quantity surveyor review",
                  "Line-by-line negotiation notes",
                  "45-minute call with a QS",
                  "Contract red-flag checklist",
                ],
                cta: "Request review",
                href: "/audit",
                featured: true,
              },
              {
                name: "Builder match",
                price: "₹9,999",
                note: "Credited against your build",
                features: [
                  "Everything in QS review",
                  "3–5 verified builder introductions",
                  "Fixed-format quote comparison",
                  "Zone + tier + budget matching",
                  "Site-visit coordination",
                ],
                cta: "Get matched",
                href: "/builders",
                featured: false,
              },
            ].map((plan, index) => (
              <Reveal key={plan.name} delay={index * 0.05}>
                <div
                  className={`flex h-full flex-col rounded-[22px] border p-6 ${
                    plan.featured
                      ? "border-ink bg-ink text-paper-2 shadow-soft"
                      : "border-ink/10 bg-paper-2"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
                      {plan.name}
                    </p>
                    {plan.featured && (
                      <span className="rounded-full bg-lime px-2 py-0.5 text-[9px] font-bold text-ink">
                        Most useful
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-5 font-display text-[40px] leading-none tracking-[-0.04em] ${
                      plan.featured ? "text-lime" : "text-ink"
                    }`}
                  >
                    {plan.price}
                  </p>
                  <p
                    className={`mt-1.5 text-[11px] ${
                      plan.featured ? "text-paper-2/50" : "text-muted"
                    }`}
                  >
                    {plan.note}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2 text-[12px] ${
                          plan.featured ? "text-paper-2/75" : "text-ink/65"
                        }`}
                      >
                        <Check
                          className={`mt-0.5 size-3.5 shrink-0 ${
                            plan.featured ? "text-lime" : "text-forest"
                          }`}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <ButtonLink
                    href={plan.href}
                    variant={plan.featured ? "lime" : "outline"}
                    size="md"
                    className="mt-7"
                  >
                    {plan.cta}
                    <ArrowUpRight className="size-3.5" />
                  </ButtonLink>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[30px] bg-lime px-6 py-14 sm:px-12 sm:py-16">
          <div className="blueprint-grid absolute inset-0 opacity-25" />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/55">
                <MapPin className="size-3.5" />
                Bengaluru only. On purpose.
              </p>
              <h2 className="mt-4 max-w-2xl text-balance font-display text-[42px] leading-[0.98] tracking-[-0.045em] text-ink sm:text-[58px]">
                Your plot. Your numbers. No surprises.
              </h2>
              <p className="mt-4 max-w-lg text-[13.5px] leading-6 text-ink/65">
                Free instant estimate in under two minutes. No sales call
                required to see the cost.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/scope" variant="primary" size="lg">
                Start my estimate
                <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/builders" variant="white" size="lg">
                See builders
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-paper-2">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted sm:px-8">
          <span>Coverage:</span>
          {Object.values(BENGALURU_ZONES)
            .filter((zone) => zone.name !== "Elsewhere in Bengaluru")
            .slice(0, 10)
            .map((zone) => (
              <span key={zone.name} className="text-ink/45">
                {zone.name}
              </span>
            ))}
          <span className="text-clay">+ 5 more</span>
        </div>
      </section>
    </>
  );
}
