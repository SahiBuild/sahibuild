"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Download,
  FileSearch,
  FolderOpen,
  HardDrive,
  Home,
  Layers,
  Loader2,
  MapPin,
  Plus,
  Ruler,
  Sparkles,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  BENGALURU_ZONES,
  QUALITY_META,
  getFloorLabel,
  type QualityTier,
  type ZoneSlug,
} from "@/lib/scoping/rules";
import type { SavedProject } from "@/lib/scoping/types";
import {
  PROJECTS_STORAGE_EVENT,
  readProjectsRaw,
  writeProjects,
} from "@/lib/project-storage";
import {
  cn,
  compactINR,
  formatINR,
  formatNumber,
} from "@/lib/utils";

const EMPTY_PROJECTS: SavedProject[] = [];

let cachedRaw: string | null | undefined;
let cachedProjects: SavedProject[] = EMPTY_PROJECTS;

function subscribeToProjects(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(PROJECTS_STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(PROJECTS_STORAGE_EVENT, callback);
  };
}

function getProjectsSnapshot(): SavedProject[] {
  const raw = readProjectsRaw();
  if (raw === cachedRaw) return cachedProjects;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as SavedProject[]) : [];
    cachedProjects = Array.isArray(parsed) ? parsed : EMPTY_PROJECTS;
  } catch {
    cachedProjects = EMPTY_PROJECTS;
  }
  return cachedProjects;
}

function getProjectsServerSnapshot(): SavedProject[] {
  return EMPTY_PROJECTS;
}

function subscribeToHydration() {
  return () => {};
}

function projectTitle(project: SavedProject) {
  if (project.input.title) return project.input.title;
  const zone =
    BENGALURU_ZONES[project.input.zoneSlug as ZoneSlug]?.name ?? "Bengaluru";
  return `${project.input.plotWidthFt}×${project.input.plotLengthFt} ${zone} home`;
}

function projectZone(project: SavedProject) {
  return (
    BENGALURU_ZONES[project.input.zoneSlug as ZoneSlug]?.name ??
    project.input.zoneSlug
  );
}

function projectTier(project: SavedProject) {
  return (
    QUALITY_META[project.input.qualityTier as QualityTier]?.label ??
    project.input.qualityTier
  );
}

function exportProject(project: SavedProject) {
  const rows = [
    ["Project", projectTitle(project)],
    ["Zone", projectZone(project)],
    ["Plot", `${project.input.plotWidthFt} x ${project.input.plotLengthFt} ft`],
    ["Floors", getFloorLabel(project.input.totalFloors)],
    ["Tier", projectTier(project)],
    ["Built-up sq.ft", String(project.result.estimate.area.builtupSqft)],
    ["Total cost INR", String(project.result.estimate.totalCost)],
    [],
    ["Stage", "Description", "Amount INR"],
    ...project.result.estimate.stageBudgets.map((stage) => [
      stage.stage,
      stage.label,
      String(stage.amount),
    ]),
    ["APPROVALS", "Fees & approvals", String(project.result.estimate.approvalsTotal)],
    ["CONTINGENCY", "Contingency", String(project.result.estimate.contingency)],
    ["TAX", "GST", String(project.result.estimate.gst)],
  ];
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `sahibuild-${project.id.slice(0, 8)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function StatCard({
  label,
  value,
  note,
  icon: Icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Home;
}) {
  return (
    <div className="rounded-[18px] border border-ink/10 bg-paper-2 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
          {label}
        </p>
        <Icon className="size-3.5 text-forest/45" />
      </div>
      <p className="mt-2 font-display text-[27px] leading-none tracking-[-0.04em]">
        {value}
      </p>
      <p className="mt-1 text-[9px] text-muted">{note}</p>
    </div>
  );
}

export function Workspace() {
  const projects = useSyncExternalStore(
    subscribeToProjects,
    getProjectsSnapshot,
    getProjectsServerSnapshot,
  );
  const loaded = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  function persist(next: SavedProject[]) {
    try {
      writeProjects(next);
    } catch {
      // Storage can be unavailable in private modes.
    }
  }

  function remove(id: string) {
    persist(projects.filter((project) => project.id !== id));
    if (expanded === id) setExpanded(null);
  }

  const stats = useMemo(() => {
    if (projects.length === 0) {
      return { total: 0, avgRate: 0, latest: "—" };
    }
    const total = projects.reduce(
      (sum, project) => sum + project.result.estimate.totalCost,
      0,
    );
    const avgRate =
      projects.reduce(
        (sum, project) => sum + project.result.estimate.effectiveRatePerSqft,
        0,
      ) / projects.length;
    const latest = new Date(
      Math.max(
        ...projects.map((project) => new Date(project.createdAt).getTime()),
      ),
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return { total, avgRate: Math.round(avgRate), latest };
  }, [projects]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="blueprint-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -right-20 top-0 -z-10 size-[360px] rounded-full bg-lime/25 blur-[100px]" />
        <div className="mx-auto max-w-[1240px] px-5 pb-9 pt-12 sm:px-8 sm:pb-12 sm:pt-16">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <Badge tone="outline" className="bg-paper-2/80">
                <Layers className="size-3 text-clay" />
                Workspace
              </Badge>
              <h1 className="mt-4 font-display text-[42px] leading-[0.98] tracking-[-0.045em] sm:text-[52px]">
                Your builds,
                <br />
                in one place.
              </h1>
              <p className="mt-3 max-w-lg text-[12.5px] leading-5 text-ink/60">
                Every estimate you generate is saved on this device. Compare
                scenarios, export BOQs, and line up builders.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/scope" variant="primary" size="md">
                <Plus className="size-4" />
                New estimate
              </ButtonLink>
              <ButtonLink href="/audit" variant="outline" size="md">
                <FileSearch className="size-4" />
                Audit a quote
              </ButtonLink>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <StatCard
              label="Saved projects"
              value={String(projects.length)}
              note="On this device"
              icon={FolderOpen}
            />
            <StatCard
              label="Combined value"
              value={projects.length ? compactINR(stats.total) : "—"}
              note="All saved estimates"
              icon={Wallet}
            />
            <StatCard
              label="Avg. all-in rate"
              value={projects.length ? `${formatINR(stats.avgRate)}` : "—"}
              note="Per built-up sq.ft"
              icon={TrendingUp}
            />
            <StatCard
              label="Last updated"
              value={stats.latest}
              note="Local to this browser"
              icon={CalendarDays}
            />
          </div>
        </div>
      </section>

      <section className="bg-paper">
        <div className="mx-auto grid max-w-[1240px] gap-6 px-5 py-9 sm:px-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
                Saved estimates
              </h2>
              {projects.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove all saved projects on this device?")) {
                      persist([]);
                    }
                  }}
                  className="text-[10px] font-semibold text-muted hover:text-clay"
                >
                  Clear all
                </button>
              )}
            </div>

            {!loaded ? (
              <div className="mt-4 flex items-center justify-center rounded-2xl border border-line bg-paper-2 py-20">
                <Loader2 className="size-5 animate-spin text-muted" />
              </div>
            ) : projects.length === 0 ? (
              <div className="mt-4 overflow-hidden rounded-[22px] border border-dashed border-ink/15 bg-paper-2">
                <div className="px-6 py-12 text-center sm:px-10">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-sage text-forest">
                    <Home className="size-6" />
                  </div>
                  <h3 className="mt-4 font-display text-[27px] leading-none tracking-[-0.035em]">
                    No builds yet.
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-muted">
                    Start with your plot dimensions. In under a minute you&apos;ll
                    have a stage-wise BOQ, material schedule, approvals, and a
                    conceptual plan.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <ButtonLink href="/scope" variant="primary" size="md">
                      <Sparkles className="size-4" />
                      Estimate my build
                    </ButtonLink>
                    <ButtonLink href="/builders" variant="outline" size="md">
                      Browse builders
                      <ArrowRight className="size-4" />
                    </ButtonLink>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-px border-t border-line bg-line">
                  {[
                    ["1", "Plot details"],
                    ["2", "Instant BOQ"],
                    ["3", "Compare & build"],
                  ].map(([step, label]) => (
                    <div key={step} className="bg-paper px-3 py-3 text-center">
                      <p className="font-display text-[18px] leading-none">
                        {step}
                      </p>
                      <p className="mt-1 text-[8.5px] font-semibold text-muted">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {projects.map((project) => {
                  const estimate = project.result.estimate;
                  const isOpen = expanded === project.id;
                  return (
                    <article
                      key={project.id}
                      className="rounded-[18px] border border-ink/10 bg-paper-2 p-4 transition-shadow hover:shadow-card sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink font-display text-[15px] text-lime">
                            {estimate.area.totalFloors}×
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-[13.5px] font-bold">
                                {projectTitle(project)}
                              </h3>
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.08em]",
                                  project.result.aiMode === "llm"
                                    ? "bg-lime text-ink"
                                    : "bg-sage text-forest",
                                )}
                              >
                                {project.result.aiMode === "llm"
                                  ? "AI BOQ"
                                  : "Rules BOQ"}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[9.5px] text-muted">
                              <span className="flex items-center gap-1">
                                <MapPin className="size-2.5" />
                                {projectZone(project)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Ruler className="size-2.5" />
                                {formatNumber(estimate.area.builtupSqft)} sq.ft
                              </span>
                              <span>
                                {getFloorLabel(project.input.totalFloors)} ·{" "}
                                {projectTier(project)}
                              </span>
                              <span>
                                {new Date(project.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-[22px] leading-none tracking-[-0.035em]">
                            {compactINR(estimate.totalCost)}
                          </p>
                          <p className="mt-1 text-[9px] text-muted">
                            {formatINR(estimate.effectiveRatePerSqft)}/sq.ft
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpanded(isOpen ? null : project.id)
                            }
                            className="flex items-center gap-1 rounded-full border border-ink/12 px-2.5 py-1 text-[9px] font-semibold text-ink/60 hover:border-ink/30"
                          >
                            {isOpen ? "Hide BOQ" : "Quick BOQ"}
                          </button>
                          <button
                            type="button"
                            onClick={() => exportProject(project)}
                            className="flex items-center gap-1 rounded-full border border-ink/12 px-2.5 py-1 text-[9px] font-semibold text-ink/60 hover:border-ink/30"
                          >
                            <Download className="size-2.5" />
                            CSV
                          </button>
                          <Link
                            href="/builders"
                            className="hidden items-center gap-1 rounded-full border border-ink/12 px-2.5 py-1 text-[9px] font-semibold text-ink/60 hover:border-ink/30 sm:flex"
                          >
                            <BadgeCheck className="size-2.5" />
                            Builders
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/scope"
                            className="flex items-center gap-1 text-[9px] font-semibold text-forest hover:underline"
                          >
                            Refine
                            <ArrowUpRight className="size-2.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => remove(project.id)}
                            className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-clay-soft hover:text-clay"
                            aria-label="Delete project"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="mt-3 space-y-1.5 rounded-xl bg-paper p-3">
                          {estimate.stageBudgets.map((stage) => (
                            <div
                              key={stage.stage}
                              className="flex items-center justify-between text-[9.5px]"
                            >
                              <span className="text-ink/55">{stage.label}</span>
                              <span className="font-semibold tabular">
                                {compactINR(stage.amount)}
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between border-t border-line pt-1.5 text-[9.5px]">
                            <span className="text-ink/55">
                              Approvals + contingency + GST
                            </span>
                            <span className="font-semibold tabular">
                              {compactINR(
                                estimate.approvalsTotal +
                                  estimate.contingency +
                                  estimate.gst,
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span>Total</span>
                            <span className="tabular">
                              {formatINR(estimate.totalCost)}
                            </span>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-3">
            <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-5">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-forest/50" />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
                  Local workspace
                </p>
              </div>
              <p className="mt-2 text-[10.5px] leading-4 text-ink/60">
                Estimates are saved in this browser using local storage. No
                account, no upload. Clearing browser data will remove them.
              </p>
              <div className="mt-3 rounded-lg bg-sage/50 px-3 py-2 text-[9.5px] leading-4 text-forest">
                Account sync and shared team workspaces are on the roadmap.
              </div>
            </div>

            <div className="rounded-[20px] bg-ink p-5 text-paper-2">
              <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-lime">
                <Sparkles className="size-3" />
                Next best action
              </p>
              {projects.length === 0 ? (
                <>
                  <p className="mt-2 font-display text-[23px] leading-tight tracking-[-0.03em]">
                    Start with the plot.
                  </p>
                  <p className="mt-1.5 text-[10px] leading-4 text-paper-2/55">
                    A 30×40 site in Sarjapur Road is the fastest way to see the
                    full product.
                  </p>
                  <ButtonLink
                    href="/scope"
                    variant="lime"
                    size="sm"
                    className="mt-3"
                  >
                    Open estimator
                    <ArrowRight className="size-3.5" />
                  </ButtonLink>
                </>
              ) : (
                <>
                  <p className="mt-2 font-display text-[23px] leading-tight tracking-[-0.03em]">
                    Get 3 builder quotes.
                  </p>
                  <p className="mt-1.5 text-[10px] leading-4 text-paper-2/55">
                    Use your estimate as the benchmark. Audit every quote before
                    comparing totals.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink href="/builders" variant="lime" size="sm">
                      Compare builders
                      <ArrowRight className="size-3.5" />
                    </ButtonLink>
                    <ButtonLink href="/audit" variant="outline" size="sm" className="border-paper-2/25 text-paper-2 hover:bg-paper-2/10 hover:text-paper-2">
                      Audit a quote
                    </ButtonLink>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-[20px] border border-ink/10 bg-sage/40 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest/60">
                Reminder
              </p>
              <p className="mt-1.5 text-[10px] leading-4 text-ink/60">
                Estimates are planning-grade. Confirm FAR, setbacks, khata, and
                approvals with a licensed architect before purchase or contract.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
