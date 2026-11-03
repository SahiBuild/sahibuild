"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/scope", label: "Estimate" },
  { href: "/audit", label: "Audit a quote" },
  { href: "/builders", label: "Builders" },
  { href: "/dashboard", label: "Workspace" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-paper-2">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-2 text-[10.5px] font-medium tracking-[0.04em] sm:px-8">
          <p className="flex items-center gap-2">
            <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" />
            Independent estimates. Verified builders. No hidden costs.
          </p>
          <p className="hidden items-center gap-1.5 text-paper-2/55 sm:flex">
            Built for Bengaluru
            <span className="text-lime">•</span>
            2026 rates
          </p>
        </div>
      </div>
      <div className="border-b border-line/80 bg-paper/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-ink text-paper-2"
                      : "text-ink/65 hover:bg-ink/[0.05] hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink
              href="/scope"
              variant="lime"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Get an estimate
              <ArrowUpRight className="size-3.5" />
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full border border-ink/15 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-b border-line bg-paper-2 px-5 py-4 shadow-soft md:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-ink/[0.05]"
              >
                {item.label}
                <ArrowUpRight className="size-4 text-muted" />
              </Link>
            ))}
            <ButtonLink
              href="/scope"
              variant="primary"
              size="md"
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Start a free estimate
            </ButtonLink>
          </nav>
        </div>
      )}
    </header>
  );
}
