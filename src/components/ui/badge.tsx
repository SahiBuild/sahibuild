import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "sage",
  className,
}: {
  children: ReactNode;
  tone?: "sage" | "lime" | "clay" | "ink" | "outline";
  className?: string;
}) {
  const tones = {
    sage: "bg-sage text-forest",
    lime: "bg-lime text-ink",
    clay: "bg-clay-soft text-[#8f3c21]",
    ink: "bg-ink text-paper-2",
    outline: "border border-ink/15 bg-paper-2/60 text-ink/70",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
