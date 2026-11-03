export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface AuditFinding {
  id: string;
  severity: AuditSeverity;
  category: "missing_scope" | "hidden_charge" | "rate" | "benchmark" | "clarity";
  title: string;
  detail: string;
  recommendation: string;
  quotedAmount?: number;
  fairAmount?: number;
}

export interface AuditResult {
  riskScore: number;
  summary: string;
  quotedTotal: number | null;
  benchmarkTotal: number | null;
  deltaAmount: number | null;
  deltaPct: number | null;
  findings: AuditFinding[];
  detected: string[];
  missing: string[];
  stats: {
    words: number;
    amountSignals: number;
    pages: number | null;
  };
  generatedAt: string;
  disclaimer: string;
}

export const AUDIT_DISCLAIMER =
  "This audit is a first-pass risk screen, not a quantity survey or legal opinion. It compares the text of your PDF against common Bengaluru residential scope. A human QS review is recommended before signing any contract.";

const SCOPE_ITEMS: Array<{
  key: string;
  label: string;
  keywords: string[];
  severity: AuditSeverity;
  detail: string;
  recommendation: string;
}> = [
  {
    key: "compound-wall",
    label: "Compound wall",
    keywords: ["compound wall", "boundary wall", "parapet wall", "gate"],
    severity: "HIGH",
    detail:
      "Compound walls and gates are commonly excluded from per-sq.ft quotes, then billed as an extra ₹1.5–4 L.",
    recommendation:
      "Ask for the compound wall length, height, gate specification, and a fixed amount in the BOQ.",
  },
  {
    key: "sump",
    label: "Sump & overhead tank",
    keywords: ["sump", "overhead tank", "water tank", "oht", "ugt"],
    severity: "HIGH",
    detail:
      "A sump and overhead tank are essential for BWSSB supply and are often missing from turnkey quotes.",
    recommendation:
      "Confirm sump capacity (litres), tank capacity, pump, and plumbing up to the tank.",
  },
  {
    key: "bescom",
    label: "BESCOM connection",
    keywords: ["bescom", "electrical connection", "service connection", "power connection"],
    severity: "HIGH",
    detail:
      "BESCOM service connection deposits and meter costs are statutory and frequently excluded.",
    recommendation:
      "Add a BESCOM allowance and confirm who files the application and pays the deposit.",
  },
  {
    key: "bwssb",
    label: "BWSSB connection",
    keywords: ["bwssb", "water connection", "sanitary connection", "sewer connection"],
    severity: "HIGH",
    detail:
      "BWSSB water and sanitary connection charges vary by fixture count and are often treated as extras.",
    recommendation:
      "Ask the builder to include BWSSB application, deposits, and inspection in the contract.",
  },
  {
    key: "plan-sanction",
    label: "BBMP plan sanction",
    keywords: ["plan sanction", "bbmp", "building approval", "sanction plan", "khata"],
    severity: "HIGH",
    detail:
      "Plan sanction and khata-related fees are statutory costs that should be visible, not bundled into a vague 'approvals' line.",
    recommendation:
      "Request a break-up of BBMP plan sanction, betterment charges, and khata/EC costs.",
  },
  {
    key: "waterproofing",
    label: "Waterproofing",
    keywords: ["waterproof", "water proof", "tanking", "terrace treatment"],
    severity: "HIGH",
    detail:
      "Bengaluru's monsoon and clayey soil make terrace, bathroom, and basement waterproofing a common failure point.",
    recommendation:
      "Specify the waterproofing system, warranty period, and coverage of terraces, bathrooms, and sump.",
  },
  {
    key: "staircase",
    label: "Staircase & railing",
    keywords: ["staircase", "stair", "railing", "handrail"],
    severity: "MEDIUM",
    detail:
      "Staircase finishes and railings can be excluded from the per-sq.ft rate even though structure is included.",
    recommendation:
      "Confirm staircase material (granite/wood), railing type, and whether the cost is included.",
  },
  {
    key: "septic",
    label: "Septic / soak pit",
    keywords: ["septic", "soak pit", "sewage treatment", "stp"],
    severity: "MEDIUM",
    detail:
      "Sites outside the BWSSB sewer network need a septic tank or soak pit, which is often omitted.",
    recommendation:
      "Clarify the sewage strategy and get a fixed line item for the septic tank/soak pit.",
  },
  {
    key: "rainwater",
    label: "Rainwater harvesting",
    keywords: ["rainwater", "rain water", "rwh", "harvesting"],
    severity: "MEDIUM",
    detail:
      "Rainwater harvesting is required for many Bengaluru buildings and can be a late-stage surprise.",
    recommendation:
      "Confirm whether RWH is included and whether it meets BBMP/BWSSB requirements.",
  },
  {
    key: "gst",
    label: "GST",
    keywords: ["gst", "goods and services tax", "tax"],
    severity: "MEDIUM",
    detail:
      "Check whether GST is included, excluded, or calculated only on part of the contract.",
    recommendation:
      "Ask for the GST rate, taxable value, and whether input tax credit is passed through.",
  },
  {
    key: "labour-cess",
    label: "Labour cess",
    keywords: ["labour cess", "labor cess", "cess"],
    severity: "LOW",
    detail:
      "Labour cess is a statutory 1% levy on construction works and should appear explicitly.",
    recommendation:
      "Ask whether labour cess is included in the quoted amount or billed separately.",
  },
  {
    key: "contingency",
    label: "Contingency",
    keywords: ["contingency", "buffer", "variation"],
    severity: "LOW",
    detail:
      "A quote without a contingency may lead to change orders later. A 3–5% allowance is normal.",
    recommendation:
      "Agree on a contingency percentage and the approval process for variations.",
  },
  {
    key: "excavation",
    label: "Excavation & earthwork",
    keywords: ["excavation", "earthwork", "soil", "disposal"],
    severity: "MEDIUM",
    detail:
      "Excavation, soil disposal, and rock breaking are highly site-dependent and often excluded.",
    recommendation:
      "Add a site-specific earthwork allowance after a soil test and site visit.",
  },
  {
    key: "rcc",
    label: "RCC structure",
    keywords: ["rcc", "reinforcement", "steel", "concrete", "slab", "column"],
    severity: "HIGH",
    detail:
      "The structural scope is the largest cost bucket. Missing RCC detail makes the quote impossible to audit.",
    recommendation:
      "Ask for concrete grades, steel tonnage, slab thickness, and structural drawings.",
  },
  {
    key: "plumbing",
    label: "Plumbing",
    keywords: ["plumbing", "cpvc", "pvc", "drainage", "sanitary"],
    severity: "MEDIUM",
    detail:
      "Plumbing brands and concealed line coverage materially change the cost and quality.",
    recommendation:
      "Specify pipe brands, hot/cold line coverage, and sanitaryware brands.",
  },
  {
    key: "electrical",
    label: "Electrical",
    keywords: ["electrical", "wiring", "conduit", "switch", "db", "earthing"],
    severity: "MEDIUM",
    detail:
      "Electrical points and wiring brands are common areas for post-contract extras.",
    recommendation:
      "Agree on the number of points per room, wire brand, DB, and earthing specification.",
  },
];

const HIDDEN_CHARGE_TERMS = [
  "miscellaneous",
  "misc charges",
  "other charges",
  "handling charges",
  "escalation",
  "supervision charges",
  "coordination charges",
  "consultancy",
  "design charges",
  "site development",
  "infrastructure charges",
  "service charges",
  "management fee",
  "profit",
];

const RATE_CHECKS: Array<{
  label: string;
  regex: RegExp;
  ceiling: number;
  unit: string;
  recommendation: string;
}> = [
  {
    label: "Steel rate",
    regex: /steel[^0-9₹]{0,40}(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)?\s*(?:kg|kilogram)/i,
    ceiling: 85,
    unit: "kg",
    recommendation:
      "Ask for the steel brand, Fe500D certification, and a rate linked to the published market index.",
  },
  {
    label: "Cement rate",
    regex: /cement[^0-9₹]{0,40}(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)?\s*(?:bag|50\s*kg)/i,
    ceiling: 500,
    unit: "bag",
    recommendation:
      "Compare against OPC/PPC market rates and confirm the cement brand and grade.",
  },
  {
    label: "Tile rate",
    regex: /(?:tile|tiles|vitrified)[^0-9₹]{0,40}(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per)?\s*(?:sq\.?\s*ft|sqft|sft)/i,
    ceiling: 160,
    unit: "sq.ft",
    recommendation:
      "Ask for the tile brand, size, finish, and whether wastage and laying charges are included.",
  },
];

function parseAmount(raw: string): number {
  const normalized = raw.replace(/[₹,\s]/g, "").toLowerCase();
  if (!normalized) return 0;
  if (normalized.endsWith("cr") || normalized.endsWith("crore")) {
    return parseFloat(normalized) * 1_00_00_000;
  }
  if (
    normalized.endsWith("lakh") ||
    normalized.endsWith("lac") ||
    normalized.endsWith("l")
  ) {
    return parseFloat(normalized) * 1_00_000;
  }
  return parseFloat(normalized) || 0;
}

function extractTotal(text: string): number | null {
  const lines = text.split(/\r?\n/);
  let best: number | null = null;

  for (const line of lines) {
    if (
      !/(grand total|total amount|project cost|total cost|total estimate|net payable|final amount)/i.test(
        line,
      )
    ) {
      continue;
    }
    const matches = [...line.matchAll(/(?:₹|rs\.?|inr)?\s*([\d][\d,]*(?:\.\d+)?)\s*(lakh|lac|cr|crore)?/gi)];
    for (const match of matches) {
      const value = parseAmount(`${match[1]}${match[2] ?? ""}`);
      if (value > 10_000 && (!best || value > best)) best = value;
    }
  }

  if (best) return best;

  const all = [...text.matchAll(/(?:₹|rs\.?|inr)\s*([\d][\d,]*(?:\.\d+)?)\s*(lakh|lac|cr|crore)?/gi)]
    .map((match) => parseAmount(`${match[1]}${match[2] ?? ""}`))
    .filter((value) => value >= 100_000);

  return all.length ? Math.max(...all) : null;
}

function contextAround(text: string, index: number, length = 160): string {
  const start = Math.max(0, index - length);
  const end = Math.min(text.length, index + length);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function amountNear(text: string, index: number): number | undefined {
  const window = text.slice(Math.max(0, index - 80), index + 120);
  const match = window.match(
    /(?:₹|rs\.?|inr)\s*([\d][\d,]*(?:\.\d+)?)\s*(lakh|lac|cr|crore)?/i,
  );
  return match ? parseAmount(`${match[1]}${match[2] ?? ""}`) : undefined;
}

export function analyzeQuote(
  text: string,
  options: {
    quotedTotal?: number | null;
    benchmarkTotal?: number | null;
    pages?: number | null;
  } = {},
): AuditResult {
  const normalized = text.toLowerCase();
  const findings: AuditFinding[] = [];
  const detected: string[] = [];
  const missing: string[] = [];

  for (const item of SCOPE_ITEMS) {
    const found = item.keywords.some((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (found) {
      detected.push(item.label);
      continue;
    }
    missing.push(item.label);
    findings.push({
      id: `missing-${item.key}`,
      severity: item.severity,
      category: "missing_scope",
      title: `No clear ${item.label.toLowerCase()} line item`,
      detail: item.detail,
      recommendation: item.recommendation,
    });
  }

  for (const term of HIDDEN_CHARGE_TERMS) {
    const index = normalized.indexOf(term);
    if (index === -1) continue;
    const quotedAmount = amountNear(text, index);
    findings.push({
      id: `hidden-${term.replace(/\s+/g, "-")}`,
      severity:
        term === "miscellaneous" || term === "other charges" ? "HIGH" : "MEDIUM",
      category: "hidden_charge",
      title: `Vague line item: “${term}”`,
      detail: contextAround(text, index),
      recommendation:
        "Ask for a written break-up of this line item, the unit basis, and the maximum cap. If it cannot be itemised, move it into a fixed-price scope.",
      quotedAmount,
    });
  }

  for (const check of RATE_CHECKS) {
    const match = check.regex.exec(text);
    if (!match) continue;
    const rate = parseFloat(match[1].replace(/,/g, ""));
    if (rate <= check.ceiling) continue;
    findings.push({
      id: `rate-${check.label.toLowerCase().replace(/\s+/g, "-")}`,
      severity: "MEDIUM",
      category: "rate",
      title: `${check.label} looks above market`,
      detail: `The document shows ₹${rate.toLocaleString(
        "en-IN",
      )}/${check.unit}, above the ${check.ceiling}/${check.unit} planning ceiling for 2026 Bengaluru residential work.`,
      recommendation: check.recommendation,
      quotedAmount: rate,
    });
  }

  const inferredQuoted = options.quotedTotal ?? extractTotal(text);
  const benchmark = options.benchmarkTotal ?? null;
  let deltaAmount: number | null = null;
  let deltaPct: number | null = null;

  if (inferredQuoted && benchmark) {
    deltaAmount = Math.round(inferredQuoted - benchmark);
    deltaPct = Math.round((deltaAmount / benchmark) * 1000) / 10;

    if (deltaPct > 15) {
      findings.push({
        id: "benchmark-high",
        severity: "HIGH",
        category: "benchmark",
        title: "Quote is above the SahiBuild benchmark",
        detail: `The quote is ₹${Math.abs(deltaAmount).toLocaleString(
          "en-IN",
        )} (${deltaPct}%) above a comparable SahiBuild estimate for this built-up area and tier.`,
        recommendation:
          "Compare the BOQ line items against the benchmark, and ask the contractor to justify the premium or remove scope you do not need.",
        quotedAmount: inferredQuoted,
        fairAmount: benchmark,
      });
    } else if (deltaPct < -18) {
      findings.push({
        id: "benchmark-low",
        severity: "HIGH",
        category: "benchmark",
        title: "Quote is suspiciously below benchmark",
        detail: `The quote is ${Math.abs(deltaPct)}% below a comparable estimate. This usually signals missing scope, low material grades, or later change orders.`,
        recommendation:
          "Ask for the full material specification and a written list of exclusions. A low quote is not a saving if the scope is incomplete.",
        quotedAmount: inferredQuoted,
        fairAmount: benchmark,
      });
    } else {
      findings.push({
        id: "benchmark-ok",
        severity: "LOW",
        category: "benchmark",
        title: "Quote is broadly within the benchmark band",
        detail: `The quoted amount is ${deltaPct > 0 ? "+" : ""}${deltaPct}% versus a comparable SahiBuild estimate. That is within normal market variation, but line-item scope still matters.`,
        recommendation:
          "Use the missing-scope and hidden-charge findings above to tighten the contract before signing.",
        quotedAmount: inferredQuoted,
        fairAmount: benchmark,
      });
    }
  }

  if (text.trim().length < 400) {
    findings.push({
      id: "thin-document",
      severity: "MEDIUM",
      category: "clarity",
      title: "Very little extractable text",
      detail:
        "The PDF may be scanned or image-only. A rate without line-item detail is hard to audit.",
      recommendation:
        "Ask for a native PDF or Excel BOQ with quantities, rates, units, and totals. Avoid accepting a photo of a quote as the final contract.",
    });
  }

  const high = findings.filter((item) => item.severity === "HIGH").length;
  const medium = findings.filter((item) => item.severity === "MEDIUM").length;
  const low = findings.filter((item) => item.severity === "LOW").length;
  const riskScore = Math.min(
    97,
    10 + high * 13 + medium * 6 + low * 2,
  );

  const summary =
    riskScore >= 65
      ? "This quote has material gaps. Do not sign until the missing scope and vague charges are converted into fixed line items."
      : riskScore >= 40
        ? "The quote is broadly structured but has omissions that could become change orders. Tighten the scope before comparing builders."
        : "The quote covers most core scope. The remaining risk is in material specifications and payment terms, not missing categories.";

  const amountSignals = (
    text.match(/(?:₹|rs\.?|inr)\s*[\d,]+/gi) ?? []
  ).length;

  return {
    riskScore,
    summary,
    quotedTotal: inferredQuoted,
    benchmarkTotal: benchmark,
    deltaAmount,
    deltaPct,
    findings: findings.sort(
      (a, b) =>
        ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[a.severity] -
        ({ HIGH: 0, MEDIUM: 1, LOW: 2 })[b.severity],
    ),
    detected,
    missing,
    stats: {
      words: text.trim().split(/\s+/).filter(Boolean).length,
      amountSignals,
      pages: options.pages ?? null,
    },
    generatedAt: new Date().toISOString(),
    disclaimer: AUDIT_DISCLAIMER,
  };
}
