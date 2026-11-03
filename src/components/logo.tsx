import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center rounded-[11px] bg-ink",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <path
          d="M4 11.2 12 4l8 7.2"
          stroke="#D9FF6A"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.4 12.5v7.1h11.2v-7.1"
          stroke="#F3EFE3"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 19.6v-4.2h4v4.2"
          stroke="#D9FF6A"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label="SahiBuild home"
    >
      <LogoMark />
      <span className="flex items-baseline gap-1.5">
        <span className="text-[19px] font-bold tracking-[-0.045em] text-ink">
          Sahi<span className="text-forest">Build</span>
        </span>
        {!compact && (
          <span className="rounded-full border border-ink/15 px-1.5 py-px text-[8px] font-bold tracking-[0.16em] text-muted">
            BLR
          </span>
        )}
      </span>
    </Link>
  );
}
