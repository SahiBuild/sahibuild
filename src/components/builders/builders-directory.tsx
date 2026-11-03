"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Filter,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { BUILDERS, type Builder } from "@/lib/builders";
import {
  BENGALURU_ZONES,
  QUALITY_META,
  QUALITY_TIERS,
  type QualityTier,
  type ZoneSlug,
} from "@/lib/scoping/rules";
import { cn, formatINR } from "@/lib/utils";

type SortKey = "rating" | "completed" | "rate";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "rating", label: "Top rated" },
  { key: "completed", label: "Most built" },
  { key: "rate", label: "Lowest rate" },
];

function initialsColor(builder: Builder) {
  return { backgroundColor: builder.accent };
}

function BuilderCard({ builder }: { builder: Builder }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="group flex flex-col rounded-[20px] border border-ink/10 bg-paper-2 p-5 transition-shadow hover:shadow-card">
      <div className="flex items-start gap-3">
        <div
          className="grid size-12 shrink-0 place-items-center rounded-xl font-display text-[19px] text-paper-2"
          style={initialsColor(builder)}
        >
          {builder.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="truncate text-[14px] font-bold leading-tight">
                {builder.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">
                {builder.tagline}
              </p>
            </div>
            {builder.verified && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-sage px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-forest">
                <BadgeCheck className="size-2.5" />
                Verified
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[9.5px] text-muted">
            <span className="flex items-center gap-0.5 font-bold text-ink">
              <Star className="size-3 fill-[#D9A93E] text-[#D9A93E]" />
              {builder.rating}
            </span>
            <span>·</span>
            <span>{builder.reviews} reviews</span>
            <span>·</span>
            <span>{builder.years} yrs</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1.5">
        <div className="rounded-lg bg-sage/50 px-2 py-1.5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-forest/50">
            Projects
          </p>
          <p className="mt-0.5 text-[12px] font-bold">{builder.completed}</p>
        </div>
        <div className="rounded-lg bg-sage/50 px-2 py-1.5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-forest/50">
            Rate / sq.ft
          </p>
          <p className="mt-0.5 text-[11px] font-bold">
            {formatINR(builder.minRate)}+
          </p>
        </div>
        <div className="rounded-lg bg-sage/50 px-2 py-1.5">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-forest/50">
            Tiers
          </p>
          <p className="mt-0.5 truncate text-[9.5px] font-bold">
            {builder.tiers.map((tier) => QUALITY_META[tier].label).join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {builder.specialties.map((specialty) => (
          <span
            key={specialty}
            className="rounded-full border border-ink/10 px-2 py-0.5 text-[8.5px] font-semibold text-ink/55"
          >
            {specialty}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-[9px] text-muted">
        <span className="flex items-center gap-1">
          <MapPin className="size-2.5" />
          {builder.zones
            .slice(0, 2)
            .map((zone) => BENGALURU_ZONES[zone].name)
            .join(", ")}
          {builder.zones.length > 2 && ` +${builder.zones.length - 2}`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-2.5" />
          {builder.leadTime}
        </span>
        {builder.insured && (
          <span className="flex items-center gap-1 text-forest">
            <ShieldCheck className="size-2.5" />
            Insured
          </span>
        )}
      </div>

      {expanded && (
        <p className="mt-3 rounded-lg bg-paper px-3 py-2.5 text-[10px] leading-4 text-ink/60">
          {builder.bio}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <ButtonLink
          href="/scope"
          variant="primary"
          size="sm"
          className="flex-1"
        >
          Get matched
          <ArrowRight className="size-3.5" />
        </ButtonLink>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="grid size-9 place-items-center rounded-full border border-ink/12 text-ink/50 transition-colors hover:border-ink/30 hover:text-ink"
          aria-label={expanded ? "Show less" : "Show more"}
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>
    </article>
  );
}

export function BuildersDirectory() {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState<ZoneSlug | "all">("all");
  const [tier, setTier] = useState<QualityTier | "all">("all");
  const [sort, setSort] = useState<SortKey>("rating");
  const [showFilters, setShowFilters] = useState(false);

  const activeZones = useMemo(() => {
    const set = new Set<ZoneSlug>();
    BUILDERS.forEach((builder) =>
      builder.zones.forEach((builderZone) => set.add(builderZone)),
    );
    return [...set];
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = BUILDERS.filter((builder) => {
      if (zone !== "all" && !builder.zones.includes(zone)) return false;
      if (tier !== "all" && !builder.tiers.includes(tier)) return false;
      if (!term) return true;
      const haystack = [
        builder.name,
        builder.tagline,
        builder.bio,
        ...builder.specialties,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });

    return list.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
      if (sort === "completed") return b.completed - a.completed;
      return a.minRate - b.minRate;
    });
  }, [query, zone, tier, sort]);

  const activeFilterCount =
    (zone !== "all" ? 1 : 0) + (tier !== "all" ? 1 : 0) + (query ? 1 : 0);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute right-0 top-0 -z-10 size-[420px] rounded-full bg-lime/25 blur-[110px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
          <Badge tone="outline" className="bg-paper-2/80">
            <Building2 className="size-3 text-clay" />
            Verified builders
          </Badge>
          <h1 className="mt-4 max-w-2xl text-balance font-display text-[42px] leading-[0.98] tracking-[-0.045em] sm:text-[56px]">
            Contractors who
            <br />
            build in your zone.
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] leading-6 text-ink/60">
            Compare verified Bengaluru builders by zone, finish tier, rate band,
            and tracked delivery. Every profile is screened for registration,
            insurance, and completed projects.
          </p>
          <div className="mt-6 grid max-w-lg grid-cols-3 gap-2">
            {[
              ["8", "Verified builders"],
              ["507", "Homes tracked"],
              ["14", "Zones covered"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-xl border border-ink/10 bg-paper-2 px-3 py-2.5"
              >
                <p className="font-display text-[24px] leading-none tracking-[-0.03em]">
                  {value}
                </p>
                <p className="mt-1 text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto max-w-[1240px] px-5 py-8 sm:px-8">
          <div className="flex flex-col gap-3 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-10 flex-1 items-center gap-2 rounded-full border border-ink/12 bg-paper-2 px-4 lg:max-w-xs">
                <Search className="size-3.5 text-muted" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search builder, specialty, or style…"
                  className="w-full bg-transparent text-[12px] outline-none placeholder:text-muted"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="size-3.5 text-muted" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[11px] font-semibold transition-colors lg:hidden",
                  showFilters || activeFilterCount
                    ? "border-forest bg-sage text-forest"
                    : "border-ink/12 text-ink/60",
                )}
              >
                <Filter className="size-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid size-4 place-items-center rounded-full bg-forest text-[8px] text-paper-2">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <div
              className={cn(
                "flex flex-wrap items-center gap-1.5",
                !showFilters && "hidden lg:flex",
              )}
            >
              <select
                value={zone}
                onChange={(event) =>
                  setZone(event.target.value as ZoneSlug | "all")
                }
                className="h-9 rounded-full border border-ink/12 bg-paper-2 px-3 text-[11px] font-semibold outline-none"
              >
                <option value="all">All zones</option>
                {activeZones.map((option) => (
                  <option key={option} value={option}>
                    {BENGALURU_ZONES[option].name}
                  </option>
                ))}
              </select>

              <select
                value={tier}
                onChange={(event) =>
                  setTier(event.target.value as QualityTier | "all")
                }
                className="h-9 rounded-full border border-ink/12 bg-paper-2 px-3 text-[11px] font-semibold outline-none"
              >
                <option value="all">All tiers</option>
                {QUALITY_TIERS.map((option) => (
                  <option key={option} value={option}>
                    {QUALITY_META[option].label}
                  </option>
                ))}
              </select>

              <div className="hidden items-center gap-1 rounded-full border border-ink/12 bg-paper-2 p-1 sm:flex">
                {SORTS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors",
                      sort === option.key
                        ? "bg-ink text-paper-2"
                        : "text-ink/50 hover:text-ink",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-[11px] text-muted">
              <span className="font-bold text-ink">{filtered.length}</span>{" "}
              builder{filtered.length === 1 ? "" : "s"} match your filters
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setZone("all");
                  setTier("all");
                }}
                className="flex items-center gap-1 text-[10px] font-semibold text-muted hover:text-ink"
              >
                <X className="size-3" />
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-ink/15 bg-paper-2 px-6 py-14 text-center">
              <SlidersHorizontal className="mx-auto size-7 text-muted" />
              <p className="mt-3 font-display text-[24px] tracking-[-0.03em]">
                No builders match that combination.
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-[11px] text-muted">
                Try a nearby zone or a different finish tier. Our matching
                engine can also work from your plot details.
              </p>
              <ButtonLink href="/scope" variant="primary" size="sm" className="mt-4">
                Match from my plot
                <ArrowRight className="size-3.5" />
              </ButtonLink>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((builder) => (
                <BuilderCard key={builder.id} builder={builder} />
              ))}
            </div>
          )}

          <div
            id="verification"
            className="mt-8 scroll-mt-24 rounded-[24px] border border-ink/10 bg-ink p-6 text-paper-2 sm:p-8"
          >
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <Check className="size-3.5" />
                  How verification works
                </p>
                <h2 className="mt-2 font-display text-[30px] leading-none tracking-[-0.035em] sm:text-[36px]">
                  We check the boring,
                  <br />
                  important things.
                </h2>
                <p className="mt-3 max-w-lg text-[11.5px] leading-5 text-paper-2/55">
                  GST registration, labour insurance, completed-project proofs,
                  and homeowner references. Profiles are re-checked every
                  quarter. Verification is not a guarantee — always inspect,
                  contract, and stage payments.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["GST & registration", "Document checked"],
                  ["Insurance", "Labour cover verified"],
                  ["Project proofs", "Completed homes tracked"],
                  ["References", "Homeowner calls sampled"],
                ].map(([title, note]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-paper-2/10 bg-paper-2/[0.05] px-3 py-3"
                  >
                    <ShieldCheck className="size-4 text-lime" />
                    <p className="mt-2 text-[10.5px] font-bold">{title}</p>
                    <p className="mt-0.5 text-[9px] text-paper-2/45">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-[9px] leading-4 text-muted">
            Builder profiles are illustrative for this MVP. Always verify
            registration, insurance, and references directly.{" "}
            <Link href="/audit" className="underline hover:text-ink">
              Audit the quote
            </Link>{" "}
            before signing.
          </p>
        </div>
      </section>
    </>
  );
}
