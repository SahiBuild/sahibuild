import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { BENGALURU_ZONES } from "@/lib/scoping/rules";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Instant estimate", href: "/scope" },
      { label: "BOQ quote audit", href: "/audit" },
      { label: "Verified builders", href: "/builders" },
      { label: "Workspace", href: "/dashboard" },
      { label: "Admin console", href: "/admin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Trust & verification", href: "/builders#verification" },
      { label: "Contact", href: "mailto:hello@sahibuild.in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-paper-2">
      <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr]">
          <div>
            <div className="[&_span.text-ink]:text-paper-2">
              <Logo />
            </div>
            <p className="mt-5 max-w-xs text-[13.5px] leading-6 text-paper-2/55">
              Transparent construction estimates, BOQ audits, and a verified
              builder network for Bengaluru landowners.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-paper-2/15 px-3 py-1.5 text-[11px] text-paper-2/65">
              <span className="size-1.5 rounded-full bg-lime" />
              Serving {Object.keys(BENGALURU_ZONES).length - 1} Bengaluru zones
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper-2/40">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-[13.5px] text-paper-2/70 transition-colors hover:text-lime"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper-2/40">
              The fine print
            </h3>
            <p className="mt-4 text-[12px] leading-5 text-paper-2/50">
              Estimates are planning-grade, based on 2026 Bengaluru market
              bands and 70% ground coverage assumptions. They are not a BBMP
              sanction, structural certificate, or contractor quotation.
              Verify final FAR, setbacks, and approvals with a licensed
              professional.
            </p>
            <p className="mt-4 text-[12px] leading-5 text-paper-2/50">
              © 2026 SahiBuild Technologies. Made in Bengaluru.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
