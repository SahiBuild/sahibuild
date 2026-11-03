"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Download,
  FileSearch,
  FolderKanban,
  HardHat,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { BUILDERS } from "@/lib/builders";
import {
  BENGALURU_ZONES,
  QUALITY_META,
  type QualityTier,
  type ZoneSlug,
} from "@/lib/scoping/rules";
import { cn, compactINR, formatINR, formatNumber } from "@/lib/utils";

type Section = "overview" | "projects" | "builders" | "audits";

type ProjectStatus =
  | "New lead"
  | "Estimated"
  | "Builder matched"
  | "Quote audit"
  | "Won";

interface AdminProject {
  id: string;
  title: string;
  owner: string;
  zone: ZoneSlug;
  builtupSqft: number;
  tier: QualityTier;
  totalCost: number;
  status: ProjectStatus;
  createdAt: string;
  aiMode: "AI" | "Rules";
}

interface AdminAudit {
  id: string;
  fileName: string;
  builder: string;
  projectId: string;
  riskScore: number;
  quotedTotal: number;
  benchmarkTotal: number;
  findings: number;
  createdAt: string;
}

const ADMIN_PROJECTS: AdminProject[] = [
  {
    id: "BW-1042",
    title: "Sarjapur 30×40 G+1",
    owner: "Ananya Rao",
    zone: "sarjapur-road",
    builtupSqft: 1680,
    tier: "STANDARD",
    totalCost: 5298251,
    status: "Builder matched",
    createdAt: "02 Nov 2026",
    aiMode: "AI",
  },
  {
    id: "BW-1041",
    title: "Whitefield 40×60 villa",
    owner: "Karthik Menon",
    zone: "whitefield",
    builtupSqft: 4032,
    tier: "PREMIUM",
    totalCost: 14820000,
    status: "Quote audit",
    createdAt: "01 Nov 2026",
    aiMode: "AI",
  },
  {
    id: "BW-1039",
    title: "Yelahanka rental floors",
    owner: "Namma Nest Projects",
    zone: "yelahanka",
    builtupSqft: 3150,
    tier: "BASIC",
    totalCost: 7140000,
    status: "Won",
    createdAt: "30 Oct 2026",
    aiMode: "Rules",
  },
  {
    id: "BW-1038",
    title: "HSR redevelopment",
    owner: "Priya Shetty",
    zone: "hsr-layout",
    builtupSqft: 2760,
    tier: "LUXURY",
    totalCost: 12140000,
    status: "Estimated",
    createdAt: "29 Oct 2026",
    aiMode: "AI",
  },
  {
    id: "BW-1036",
    title: "JP Nagar family home",
    owner: "Rohan Iyer",
    zone: "jp-nagar",
    builtupSqft: 1980,
    tier: "STANDARD",
    totalCost: 5820000,
    status: "New lead",
    createdAt: "28 Oct 2026",
    aiMode: "Rules",
  },
  {
    id: "BW-1034",
    title: "Hebbal G+3 home",
    owner: "Meera Nair",
    zone: "hebbal",
    builtupSqft: 5040,
    tier: "PREMIUM",
    totalCost: 18640000,
    status: "Builder matched",
    createdAt: "27 Oct 2026",
    aiMode: "AI",
  },
  {
    id: "BW-1031",
    title: "Electronic City compact",
    owner: "Suresh Kumar",
    zone: "electronic-city",
    builtupSqft: 1440,
    tier: "BASIC",
    totalCost: 3580000,
    status: "Quote audit",
    createdAt: "25 Oct 2026",
    aiMode: "Rules",
  },
  {
    id: "BW-1029",
    title: "Indiranagar luxury home",
    owner: "Aditi Bose",
    zone: "indiranagar",
    builtupSqft: 4480,
    tier: "LUXURY",
    totalCost: 22400000,
    status: "Won",
    createdAt: "24 Oct 2026",
    aiMode: "AI",
  },
  {
    id: "BW-1027",
    title: "Kengeri value home",
    owner: "Manoj Gowda",
    zone: "kengeri",
    builtupSqft: 1680,
    tier: "STANDARD",
    totalCost: 4910000,
    status: "New lead",
    createdAt: "23 Oct 2026",
    aiMode: "Rules",
  },
];

const ADMIN_AUDITS: AdminAudit[] = [
  {
    id: "QA-208",
    fileName: "Sattva_BOQ_Sarjapur.pdf",
    builder: "Sattva Build Studio",
    projectId: "BW-1042",
    riskScore: 72,
    quotedTotal: 4770000,
    benchmarkTotal: 5490539,
    findings: 11,
    createdAt: "02 Nov 2026",
  },
  {
    id: "QA-207",
    fileName: "Whitefield_villa_quote.pdf",
    builder: "Greenline Turnkey",
    projectId: "BW-1041",
    riskScore: 58,
    quotedTotal: 16200000,
    benchmarkTotal: 14820000,
    findings: 8,
    createdAt: "01 Nov 2026",
  },
  {
    id: "QA-206",
    fileName: "NammaNest_quote_v3.pdf",
    builder: "Namma Nest Projects",
    projectId: "BW-1039",
    riskScore: 34,
    quotedTotal: 6980000,
    benchmarkTotal: 7140000,
    findings: 5,
    createdAt: "30 Oct 2026",
  },
  {
    id: "QA-205",
    fileName: "HSR_premium_estimate.pdf",
    builder: "Terra & Stone",
    projectId: "BW-1038",
    riskScore: 63,
    quotedTotal: 13400000,
    benchmarkTotal: 12140000,
    findings: 9,
    createdAt: "29 Oct 2026",
  },
  {
    id: "QA-204",
    fileName: "Hebbal_turnkey.pdf",
    builder: "Indus Frame Constructions",
    projectId: "BW-1034",
    riskScore: 41,
    quotedTotal: 19100000,
    benchmarkTotal: 18640000,
    findings: 6,
    createdAt: "27 Oct 2026",
  },
  {
    id: "QA-203",
    fileName: "ECity_quote.pdf",
    builder: "BLR Build Co.",
    projectId: "BW-1031",
    riskScore: 26,
    quotedTotal: 3490000,
    benchmarkTotal: 3580000,
    findings: 3,
    createdAt: "25 Oct 2026",
  },
  {
    id: "QA-202",
    fileName: "Indiranagar_spec.pdf",
    builder: "Terra & Stone",
    projectId: "BW-1029",
    riskScore: 49,
    quotedTotal: 23100000,
    benchmarkTotal: 22400000,
    findings: 7,
    createdAt: "24 Oct 2026",
  },
  {
    id: "QA-201",
    fileName: "Jayanagar_quote.pdf",
    builder: "Vaastu Craft",
    projectId: "BW-1035",
    riskScore: 77,
    quotedTotal: 6340000,
    benchmarkTotal: 5210000,
    findings: 12,
    createdAt: "22 Oct 2026",
  },
];

const ZONE_DEMAND: Array<{ zone: ZoneSlug; leads: number }> = [
  { zone: "whitefield", leads: 38 },
  { zone: "sarjapur-road", leads: 32 },
  { zone: "yelahanka", leads: 24 },
  { zone: "hsr-layout", leads: 21 },
  { zone: "hebbal", leads: 18 },
  { zone: "jp-nagar", leads: 14 },
  { zone: "electronic-city", leads: 12 },
  { zone: "kengeri", leads: 9 },
];

const MONTHLY_ESTIMATES = [
  { month: "Jun", value: 18 },
  { month: "Jul", value: 24 },
  { month: "Aug", value: 21 },
  { month: "Sep", value: 33 },
  { month: "Oct", value: 41 },
  { month: "Nov", value: 46 },
];

const NAV: Array<{
  key: Section;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "builders", label: "Builders", icon: HardHat },
  { key: "audits", label: "Quote audits", icon: FileSearch },
];

const PAGE_COPY: Record<
  Section,
  { eyebrow: string; title: string; description: string }
> = {
  overview: {
    eyebrow: "Operations",
    title: "Everything moving, at a glance.",
    description:
      "Projects, quote audits, builder supply, and zone demand across the marketplace.",
  },
  projects: {
    eyebrow: "Demand",
    title: "Homeowner projects.",
    description:
      "Every estimate request, its planning envelope, budget, and current match stage.",
  },
  builders: {
    eyebrow: "Supply",
    title: "Builder network.",
    description:
      "Verification status, tier fit, coverage, and tracked delivery for the partner bench.",
  },
  audits: {
    eyebrow: "Trust",
    title: "Quote audits.",
    description:
      "PDF quotations screened for missing scope, vague charges, and benchmark variance.",
  },
};

const statusTone: Record<ProjectStatus, string> = {
  "New lead": "bg-[#EDEAE0] text-ink/60",
  Estimated: "bg-[#F5E7B8] text-[#7a5c14]",
  "Builder matched": "bg-sage text-forest",
  "Quote audit": "bg-clay-soft text-[#8f3c21]",
  Won: "bg-forest text-lime",
};

function riskTone(score: number) {
  if (score >= 65)
    return {
      label: "High",
      className: "bg-clay text-white",
      bar: "bg-clay",
    };
  if (score >= 40)
    return {
      label: "Medium",
      className: "bg-[#FBF3D8] text-[#7a5c14]",
      bar: "bg-[#D9A93E]",
    };
  return {
    label: "Low",
    className: "bg-sage text-forest",
    bar: "bg-forest",
  };
}

function downloadCsv(
  fileName: string,
  rows: Array<Array<string | number>>,
) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof Wallet;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[18px] border p-4",
        accent
          ? "border-ink bg-ink text-paper-2"
          : "border-ink/10 bg-paper-2",
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-[8.5px] font-bold uppercase tracking-[0.12em]",
            accent ? "text-paper-2/45" : "text-muted",
          )}
        >
          {label}
        </p>
        <Icon
          className={cn("size-3.5", accent ? "text-lime" : "text-forest/45")}
        />
      </div>
      <p className="mt-2 font-display text-[27px] leading-none tracking-[-0.04em]">
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-[9px]",
          accent ? "text-paper-2/45" : "text-muted",
        )}
      >
        {note}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  note,
  action,
}: {
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          {title}
        </h2>
        {note && <p className="mt-1 text-[10px] text-muted">{note}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminConsole() {
  const [section, setSection] = useState<Section>("overview");
  const [projectQuery, setProjectQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | "all">(
    "all",
  );
  const [builderQuery, setBuilderQuery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [auditQuery, setAuditQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low">(
    "all",
  );
  const [verification, setVerification] = useState<Record<string, boolean>>({});
  const copy = PAGE_COPY[section];

  const totals = useMemo(() => {
    const active = ADMIN_PROJECTS.filter(
      (project) => project.status !== "Won",
    );
    const pipeline = active.reduce(
      (sum, project) => sum + project.totalCost,
      0,
    );
    const verified = BUILDERS.filter(
      (builder) => verification[builder.id] ?? builder.verified,
    ).length;
    const highRisk = ADMIN_AUDITS.filter((audit) => audit.riskScore >= 65);
    const avgRisk = Math.round(
      ADMIN_AUDITS.reduce((sum, audit) => sum + audit.riskScore, 0) /
        ADMIN_AUDITS.length,
    );
    return {
      active: active.length,
      pipeline,
      verified,
      highRisk: highRisk.length,
      avgRisk,
      won: ADMIN_PROJECTS.filter((project) => project.status === "Won").length,
    };
  }, [verification]);

  const filteredProjects = useMemo(() => {
    const term = projectQuery.trim().toLowerCase();
    return ADMIN_PROJECTS.filter((project) => {
      if (projectStatus !== "all" && project.status !== projectStatus)
        return false;
      if (!term) return true;
      return [project.title, project.owner, project.id, BENGALURU_ZONES[project.zone].name]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [projectQuery, projectStatus]);

  const filteredBuilders = useMemo(() => {
    const term = builderQuery.trim().toLowerCase();
    return BUILDERS.filter((builder) => {
      if (verifiedOnly && !(verification[builder.id] ?? builder.verified))
        return false;
      if (!term) return true;
      return [
        builder.name,
        builder.tagline,
        ...builder.specialties,
        ...builder.zones.map((zone) => BENGALURU_ZONES[zone].name),
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [builderQuery, verifiedOnly, verification]);

  const filteredAudits = useMemo(() => {
    const term = auditQuery.trim().toLowerCase();
    return ADMIN_AUDITS.filter((audit) => {
      if (riskFilter === "high" && audit.riskScore < 65) return false;
      if (
        riskFilter === "medium" &&
        (audit.riskScore < 40 || audit.riskScore >= 65)
      )
        return false;
      if (riskFilter === "low" && audit.riskScore >= 40) return false;
      if (!term) return true;
      return [audit.fileName, audit.builder, audit.projectId, audit.id]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [auditQuery, riskFilter]);

  function exportProjects(rows: AdminProject[]) {
    downloadCsv("sahibuild-projects.csv", [
      ["ID", "Project", "Owner", "Zone", "Built-up sq.ft", "Tier", "Estimate INR", "Status", "Created", "BOQ mode"],
      ...rows.map((project) => [
        project.id,
        project.title,
        project.owner,
        BENGALURU_ZONES[project.zone].name,
        project.builtupSqft,
        QUALITY_META[project.tier].label,
        project.totalCost,
        project.status,
        project.createdAt,
        project.aiMode,
      ]),
    ]);
  }

  function exportAudits(rows: AdminAudit[]) {
    downloadCsv("sahibuild-quote-audits.csv", [
      ["ID", "File", "Builder", "Project", "Risk score", "Quoted INR", "Benchmark INR", "Findings", "Date"],
      ...rows.map((audit) => [
        audit.id,
        audit.fileName,
        audit.builder,
        audit.projectId,
        audit.riskScore,
        audit.quotedTotal,
        audit.benchmarkTotal,
        audit.findings,
        audit.createdAt,
      ]),
    ]);
  }

  const maxZone = Math.max(...ZONE_DEMAND.map((item) => item.leads));
  const maxMonth = Math.max(...MONTHLY_ESTIMATES.map((item) => item.value));

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[218px_1fr]">
          <aside className="lg:sticky lg:top-[112px] lg:self-start">
            <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-3 shadow-soft">
              <div className="flex items-center gap-2.5 rounded-xl bg-ink px-3 py-2.5 text-paper-2">
                <span className="grid size-8 place-items-center rounded-lg bg-lime font-display text-[13px] text-ink">
                  BW
                </span>
                <div>
                  <p className="text-[10.5px] font-bold leading-none">
                    Admin console
                  </p>
                  <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-paper-2/40">
                    Bengaluru ops
                  </p>
                </div>
              </div>

              <nav className="mt-3 hidden space-y-1 lg:block">
                {NAV.map((item) => {
                  const active = section === item.key;
                  const count =
                    item.key === "projects"
                      ? ADMIN_PROJECTS.length
                      : item.key === "builders"
                        ? BUILDERS.length
                        : item.key === "audits"
                          ? ADMIN_AUDITS.length
                          : undefined;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setSection(item.key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[11.5px] font-semibold transition-colors",
                        active
                          ? "bg-sage text-forest"
                          : "text-ink/55 hover:bg-ink/[0.04] hover:text-ink",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="size-3.5" />
                        {item.label}
                      </span>
                      {count !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[8px] font-bold",
                            active
                              ? "bg-forest text-paper-2"
                              : "bg-ink/[0.06] text-ink/45",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="mt-3 hidden rounded-xl bg-sage/50 px-3 py-2.5 lg:block">
                <p className="flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-forest/60">
                  <Sparkles className="size-2.5" />
                  Demo data
                </p>
                <p className="mt-1 text-[9px] leading-4 text-ink/55">
                  Seeded marketplace data. Wire Prisma and auth for live
                  operations.
                </p>
              </div>

              <div className="mt-3 border-t border-line pt-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-muted hover:bg-ink/[0.04] hover:text-ink"
                >
                  <ArrowLeft className="size-3" />
                  Back to site
                </Link>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                  Admin <span className="text-ink/25">/</span> {copy.eyebrow}
                </p>
                <h1 className="mt-2 text-balance font-display text-[34px] leading-[1.02] tracking-[-0.04em] sm:text-[42px]">
                  {copy.title}
                </h1>
                <p className="mt-2 max-w-2xl text-[11.5px] leading-5 text-ink/55">
                  {copy.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone="outline" className="bg-paper-2">
                  <span className="size-1.5 rounded-full bg-clay" />
                  Demo mode
                </Badge>
                <ButtonLink href="/" variant="outline" size="sm">
                  View site
                  <ArrowUpRight className="size-3.5" />
                </ButtonLink>
              </div>
            </div>

            <div className="mt-4 flex gap-1 overflow-x-auto rounded-xl border border-ink/10 bg-paper-2 p-1 lg:hidden">
              {NAV.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSection(item.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[10.5px] font-semibold transition-colors",
                    section === item.key
                      ? "bg-ink text-paper-2"
                      : "text-ink/50",
                  )}
                >
                  <item.icon className="size-3" />
                  {item.label}
                </button>
              ))}
            </div>

            {section === "overview" && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
                  <KpiCard
                    label="Active projects"
                    value={String(totals.active)}
                    note={`${totals.won} won · ${ADMIN_PROJECTS.length} total`}
                    icon={FolderKanban}
                    accent
                  />
                  <KpiCard
                    label="Open pipeline"
                    value={compactINR(totals.pipeline)}
                    note="Estimated project value"
                    icon={Wallet}
                  />
                  <KpiCard
                    label="Quote audits"
                    value={String(ADMIN_AUDITS.length)}
                    note={`${totals.highRisk} high-risk findings`}
                    icon={FileSearch}
                  />
                  <KpiCard
                    label="Verified builders"
                    value={`${totals.verified}/${BUILDERS.length}`}
                    note="Active partner bench"
                    icon={BadgeCheck}
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
                    <SectionHeading
                      title="Recent estimates"
                      note="Latest homeowner demand"
                      action={
                        <button
                          type="button"
                          onClick={() => setSection("projects")}
                          className="flex items-center gap-1 text-[9.5px] font-semibold text-forest hover:underline"
                        >
                          All projects
                          <ArrowRight className="size-3" />
                        </button>
                      }
                    />
                    <div className="mt-3 divide-y divide-line">
                      {ADMIN_PROJECTS.slice(0, 5).map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center gap-3 py-2.5"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-sage text-[9px] font-bold text-forest">
                            {project.aiMode === "AI" ? "AI" : "RB"}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11.5px] font-bold">
                              {project.title}
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-muted">
                              {project.owner} ·{" "}
                              {BENGALURU_ZONES[project.zone].name} ·{" "}
                              {formatNumber(project.builtupSqft)} sq.ft
                            </p>
                          </div>
                          <div className="hidden text-right sm:block">
                            <p className="text-[11px] font-bold">
                              {compactINR(project.totalCost)}
                            </p>
                            <p className="mt-0.5 text-[8.5px] text-muted">
                              {project.createdAt}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "hidden shrink-0 rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.06em] md:block",
                              statusTone[project.status],
                            )}
                          >
                            {project.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
                      <SectionHeading title="Estimate volume" note="Last 6 months" />
                      <div className="mt-4 flex h-[96px] items-end gap-2">
                        {MONTHLY_ESTIMATES.map((item) => (
                          <div
                            key={item.month}
                            className="flex flex-1 flex-col items-center gap-1.5"
                          >
                            <span className="text-[7.5px] font-semibold text-muted">
                              {item.value}
                            </span>
                            <div
                              className={cn(
                                "w-full rounded-t-[4px]",
                                item.month === "Nov" ? "bg-lime" : "bg-forest/80",
                              )}
                              style={{
                                height: `${Math.max(10, (item.value / maxMonth) * 100)}%`,
                              }}
                            />
                            <span className="text-[7.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                              {item.month}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
                      <SectionHeading
                        title="Audit risk mix"
                        note={`Average score ${totals.avgRisk}/100`}
                      />
                      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-mist">
                        {(["high", "medium", "low"] as const).map((key) => {
                          const count = ADMIN_AUDITS.filter((audit) => {
                            if (key === "high") return audit.riskScore >= 65;
                            if (key === "medium")
                              return (
                                audit.riskScore >= 40 && audit.riskScore < 65
                              );
                            return audit.riskScore < 40;
                          }).length;
                          return (
                            <div
                              key={key}
                              className={cn(
                                key === "high"
                                  ? "bg-clay"
                                  : key === "medium"
                                    ? "bg-[#D9A93E]"
                                    : "bg-forest",
                              )}
                              style={{
                                width: `${(count / ADMIN_AUDITS.length) * 100}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                      <div className="mt-2 flex justify-between text-[8.5px] text-muted">
                        <span>High {ADMIN_AUDITS.filter((a) => a.riskScore >= 65).length}</span>
                        <span>Medium {ADMIN_AUDITS.filter((a) => a.riskScore >= 40 && a.riskScore < 65).length}</span>
                        <span>Low {ADMIN_AUDITS.filter((a) => a.riskScore < 40).length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
                    <SectionHeading title="Zone demand" note="Leads by locality" />
                    <div className="mt-3 space-y-2">
                      {ZONE_DEMAND.map((item) => (
                        <div key={item.zone} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 truncate text-[9.5px] text-ink/55">
                            {BENGALURU_ZONES[item.zone].name}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
                            <div
                              className="h-full rounded-full bg-forest"
                              style={{
                                width: `${(item.leads / maxZone) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-5 text-right text-[9px] font-bold tabular">
                            {item.leads}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-ink/10 bg-paper-2 p-4 sm:p-5">
                    <SectionHeading
                      title="High-risk audits"
                      note="Needs manual review"
                      action={
                        <button
                          type="button"
                          onClick={() => setSection("audits")}
                          className="flex items-center gap-1 text-[9.5px] font-semibold text-forest hover:underline"
                        >
                          View all
                          <ArrowRight className="size-3" />
                        </button>
                      }
                    />
                    <div className="mt-3 space-y-2">
                      {ADMIN_AUDITS.filter((audit) => audit.riskScore >= 65)
                        .slice(0, 3)
                        .map((audit) => {
                          const tone = riskTone(audit.riskScore);
                          return (
                            <div
                              key={audit.id}
                              className="flex items-center gap-2.5 rounded-xl border border-line px-3 py-2.5"
                            >
                              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-clay-soft text-clay">
                                <ShieldAlert className="size-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-bold">
                                  {audit.fileName}
                                </p>
                                <p className="mt-0.5 truncate text-[8.5px] text-muted">
                                  {audit.builder}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold",
                                  tone.className,
                                )}
                              >
                                {audit.riskScore}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {section === "projects" && (
              <div className="mt-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-full border border-ink/12 bg-paper-2 px-3 sm:max-w-xs">
                      <Search className="size-3 text-muted" />
                      <input
                        type="search"
                        value={projectQuery}
                        onChange={(event) => setProjectQuery(event.target.value)}
                        placeholder="Search project, owner, zone…"
                        className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
                      />
                    </div>
                    <select
                      value={projectStatus}
                      onChange={(event) =>
                        setProjectStatus(
                          event.target.value as ProjectStatus | "all",
                        )
                      }
                      className="h-9 rounded-full border border-ink/12 bg-paper-2 px-3 text-[10.5px] font-semibold outline-none"
                    >
                      <option value="all">All statuses</option>
                      {(
                        [
                          "New lead",
                          "Estimated",
                          "Builder matched",
                          "Quote audit",
                          "Won",
                        ] as ProjectStatus[]
                      ).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-paper-2"
                    onClick={() => exportProjects(filteredProjects)}
                  >
                    <Download className="size-3.5" />
                    Export CSV
                  </Button>
                </div>

                <div className="mt-3 overflow-hidden rounded-[18px] border border-ink/10 bg-paper-2">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left">
                      <thead className="border-b border-line bg-sage/30">
                        <tr className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">
                          <th className="px-4 py-2.5">Project</th>
                          <th className="px-3 py-2.5">Owner</th>
                          <th className="px-3 py-2.5">Zone</th>
                          <th className="px-3 py-2.5 text-right">Built-up</th>
                          <th className="px-3 py-2.5">Tier</th>
                          <th className="px-3 py-2.5 text-right">Estimate</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {filteredProjects.map((project) => (
                          <tr key={project.id} className="hover:bg-sage/20">
                            <td className="px-4 py-3">
                              <p className="text-[10.5px] font-bold">
                                {project.title}
                              </p>
                              <p className="mt-0.5 text-[8.5px] text-muted">
                                {project.id} · {project.aiMode} BOQ
                              </p>
                            </td>
                            <td className="px-3 py-3 text-[10px] text-ink/60">
                              {project.owner}
                            </td>
                            <td className="px-3 py-3 text-[10px] text-ink/60">
                              {BENGALURU_ZONES[project.zone].name}
                            </td>
                            <td className="px-3 py-3 text-right text-[10px] font-semibold tabular">
                              {formatNumber(project.builtupSqft)}
                            </td>
                            <td className="px-3 py-3 text-[9.5px] text-ink/60">
                              {QUALITY_META[project.tier].label}
                            </td>
                            <td className="px-3 py-3 text-right text-[10px] font-bold tabular">
                              {compactINR(project.totalCost)}
                            </td>
                            <td className="px-3 py-3">
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 text-[7.5px] font-bold uppercase tracking-[0.06em]",
                                  statusTone[project.status],
                                )}
                              >
                                {project.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-[9px] text-muted">
                              {project.createdAt}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredProjects.length === 0 && (
                    <div className="px-5 py-10 text-center text-[10.5px] text-muted">
                      No projects match those filters.
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[9px] text-muted">
                  Showing {filteredProjects.length} of {ADMIN_PROJECTS.length}{" "}
                  seeded projects.
                </p>
              </div>
            )}

            {section === "builders" && (
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {[
                    ["Builders", String(BUILDERS.length)],
                    [
                      "Verified",
                      String(
                        BUILDERS.filter(
                          (builder) =>
                            verification[builder.id] ?? builder.verified,
                        ).length,
                      ),
                    ],
                    [
                      "Insured",
                      String(BUILDERS.filter((builder) => builder.insured).length),
                    ],
                    [
                      "Avg. rating",
                      (
                        BUILDERS.reduce(
                          (sum, builder) => sum + builder.rating,
                          0,
                        ) / BUILDERS.length
                      ).toFixed(2),
                    ],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-ink/10 bg-paper-2 px-3 py-2.5"
                    >
                      <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">
                        {label}
                      </p>
                      <p className="mt-1 font-display text-[21px] leading-none tracking-[-0.03em]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-full border border-ink/12 bg-paper-2 px-3 sm:max-w-xs">
                      <Search className="size-3 text-muted" />
                      <input
                        type="search"
                        value={builderQuery}
                        onChange={(event) => setBuilderQuery(event.target.value)}
                        placeholder="Search builder, zone, specialty…"
                        className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerifiedOnly((value) => !value)}
                      className={cn(
                        "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold transition-colors",
                        verifiedOnly
                          ? "border-forest bg-sage text-forest"
                          : "border-ink/12 bg-paper-2 text-ink/55",
                      )}
                    >
                      <BadgeCheck className="size-3" />
                      Verified only
                    </button>
                  </div>
                  <p className="text-[9px] text-muted">
                    Toggle verification to model the admin workflow.
                  </p>
                </div>

                <div className="mt-3 overflow-hidden rounded-[18px] border border-ink/10 bg-paper-2">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] text-left">
                      <thead className="border-b border-line bg-sage/30">
                        <tr className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">
                          <th className="px-4 py-2.5">Builder</th>
                          <th className="px-3 py-2.5">Coverage</th>
                          <th className="px-3 py-2.5">Tiers</th>
                          <th className="px-3 py-2.5 text-right">Rate band</th>
                          <th className="px-3 py-2.5 text-right">Rating</th>
                          <th className="px-3 py-2.5 text-right">Projects</th>
                          <th className="px-3 py-2.5">Trust</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {filteredBuilders.map((builder) => {
                          const isVerified =
                            verification[builder.id] ?? builder.verified;
                          return (
                            <tr key={builder.id} className="hover:bg-sage/20">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="grid size-7 shrink-0 place-items-center rounded-lg text-[8px] font-bold text-paper-2"
                                    style={{ backgroundColor: builder.accent }}
                                  >
                                    {builder.initials}
                                  </span>
                                  <div>
                                    <p className="text-[10.5px] font-bold">
                                      {builder.name}
                                    </p>
                                    <p className="mt-0.5 max-w-[180px] truncate text-[8.5px] text-muted">
                                      {builder.tagline}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-0.5">
                                  {builder.zones.slice(0, 2).map((zone) => (
                                    <span
                                      key={zone}
                                      className="rounded-full bg-sage/70 px-1.5 py-0.5 text-[7.5px] font-semibold text-forest"
                                    >
                                      {BENGALURU_ZONES[zone].name}
                                    </span>
                                  ))}
                                  {builder.zones.length > 2 && (
                                    <span className="text-[8px] text-muted">
                                      +{builder.zones.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-3 py-3 text-[9px] text-ink/60">
                                {builder.tiers
                                  .map((tier) => QUALITY_META[tier].label)
                                  .join(", ")}
                              </td>
                              <td className="px-3 py-3 text-right text-[9.5px] font-semibold tabular">
                                {formatINR(builder.minRate)}+
                              </td>
                              <td className="px-3 py-3 text-right">
                                <span className="flex items-center justify-end gap-0.5 text-[10px] font-bold">
                                  <Star className="size-2.5 fill-[#D9A93E] text-[#D9A93E]" />
                                  {builder.rating}
                                </span>
                              </td>
                              <td className="px-3 py-3 text-right text-[10px] font-semibold tabular">
                                {builder.completed}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1">
                                  <span
                                    className={cn(
                                      "rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.06em]",
                                      isVerified
                                        ? "bg-sage text-forest"
                                        : "bg-[#EDEAE0] text-ink/50",
                                    )}
                                  >
                                    {isVerified ? "Verified" : "Pending"}
                                  </span>
                                  {builder.insured && (
                                    <span className="rounded-full bg-sage/60 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.06em] text-forest/70">
                                      Insured
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVerification((current) => ({
                                      ...current,
                                      [builder.id]: !isVerified,
                                    }))
                                  }
                                  className={cn(
                                    "rounded-full border px-2.5 py-1 text-[8.5px] font-semibold transition-colors",
                                    isVerified
                                      ? "border-ink/12 text-muted hover:border-clay/40 hover:text-clay"
                                      : "border-forest/30 bg-sage text-forest",
                                  )}
                                >
                                  {isVerified ? "Unverify" : "Verify"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredBuilders.length === 0 && (
                    <div className="px-5 py-10 text-center text-[10.5px] text-muted">
                      No builders match those filters.
                    </div>
                  )}
                </div>
              </div>
            )}

            {section === "audits" && (
              <div className="mt-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-full border border-ink/12 bg-paper-2 px-3 sm:max-w-xs">
                      <Search className="size-3 text-muted" />
                      <input
                        type="search"
                        value={auditQuery}
                        onChange={(event) => setAuditQuery(event.target.value)}
                        placeholder="Search file, builder, project…"
                        className="w-full bg-transparent text-[11px] outline-none placeholder:text-muted"
                      />
                    </div>
                    <div className="flex items-center gap-1 rounded-full border border-ink/12 bg-paper-2 p-1">
                      {(["all", "high", "medium", "low"] as const).map((risk) => (
                        <button
                          key={risk}
                          type="button"
                          onClick={() => setRiskFilter(risk)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[9.5px] font-semibold capitalize transition-colors",
                            riskFilter === risk
                              ? "bg-ink text-paper-2"
                              : "text-ink/50 hover:text-ink",
                          )}
                        >
                          {risk}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-paper-2"
                    onClick={() => exportAudits(filteredAudits)}
                  >
                    <Download className="size-3.5" />
                    Export CSV
                  </Button>
                </div>

                <div className="mt-3 overflow-hidden rounded-[18px] border border-ink/10 bg-paper-2">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left">
                      <thead className="border-b border-line bg-sage/30">
                        <tr className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">
                          <th className="px-4 py-2.5">Document</th>
                          <th className="px-3 py-2.5">Builder</th>
                          <th className="px-3 py-2.5">Project</th>
                          <th className="px-3 py-2.5">Risk</th>
                          <th className="px-3 py-2.5 text-right">Quoted</th>
                          <th className="px-3 py-2.5 text-right">Benchmark</th>
                          <th className="px-3 py-2.5 text-right">Findings</th>
                          <th className="px-4 py-2.5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {filteredAudits.map((audit) => {
                          const tone = riskTone(audit.riskScore);
                          const delta = audit.quotedTotal - audit.benchmarkTotal;
                          return (
                            <tr key={audit.id} className="hover:bg-sage/20">
                              <td className="px-4 py-3">
                                <p className="max-w-[210px] truncate text-[10.5px] font-bold">
                                  {audit.fileName}
                                </p>
                                <p className="mt-0.5 text-[8.5px] text-muted">
                                  {audit.id}
                                </p>
                              </td>
                              <td className="px-3 py-3 text-[9.5px] text-ink/60">
                                {audit.builder}
                              </td>
                              <td className="px-3 py-3 text-[9.5px] text-ink/60">
                                {audit.projectId}
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-12 overflow-hidden rounded-full bg-mist">
                                    <div
                                      className={cn("h-full", tone.bar)}
                                      style={{ width: `${audit.riskScore}%` }}
                                    />
                                  </div>
                                  <span
                                    className={cn(
                                      "rounded-full px-1.5 py-0.5 text-[7.5px] font-bold",
                                      tone.className,
                                    )}
                                  >
                                    {audit.riskScore} {tone.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-3 text-right text-[9.5px] font-semibold tabular">
                                {compactINR(audit.quotedTotal)}
                              </td>
                              <td className="px-3 py-3 text-right text-[9.5px] tabular">
                                {compactINR(audit.benchmarkTotal)}
                              </td>
                              <td className="px-3 py-3 text-right text-[9.5px] font-semibold tabular">
                                {audit.findings}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <p className="text-[9px] text-muted">
                                  {audit.createdAt}
                                </p>
                                <p
                                  className={cn(
                                    "mt-0.5 text-[8px] font-semibold",
                                    delta > 0 ? "text-clay" : "text-forest",
                                  )}
                                >
                                  {delta > 0 ? "+" : ""}
                                  {compactINR(delta)} vs bench
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filteredAudits.length === 0 && (
                    <div className="px-5 py-10 text-center text-[10.5px] text-muted">
                      No audits match those filters.
                    </div>
                  )}
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "High risk",
                      value: ADMIN_AUDITS.filter((a) => a.riskScore >= 65).length,
                      note: "Manual review",
                      tone: "bg-clay-soft text-[#8f3c21]",
                      icon: ShieldAlert,
                    },
                    {
                      label: "Medium risk",
                      value: ADMIN_AUDITS.filter(
                        (a) => a.riskScore >= 40 && a.riskScore < 65,
                      ).length,
                      note: "Tighten scope",
                      tone: "bg-[#FBF3D8] text-[#7a5c14]",
                      icon: Activity,
                    },
                    {
                      label: "Low risk",
                      value: ADMIN_AUDITS.filter((a) => a.riskScore < 40).length,
                      note: "Scope looks complete",
                      tone: "bg-sage text-forest",
                      icon: ShieldCheck,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper-2 px-3 py-2.5"
                    >
                      <span
                        className={cn(
                          "grid size-8 place-items-center rounded-lg",
                          item.tone,
                        )}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <div>
                        <p className="font-display text-[19px] leading-none">
                          {item.value}
                        </p>
                        <p className="mt-0.5 text-[8.5px] text-muted">
                          {item.label} · {item.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-sage/40 px-4 py-3">
              <p className="flex items-center gap-2 text-[9px] leading-4 text-muted">
                <Users className="size-3.5 shrink-0" />
                Admin console is running on seeded data. Add auth, roles, and
                Prisma persistence before inviting operators.
              </p>
              <div className="flex items-center gap-2 text-[9px] font-semibold text-forest">
                <CalendarDays className="size-3" />
                Updated 03 Nov 2026
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
