import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "lime" | "outline" | "ghost" | "clay" | "white";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper-2 hover:bg-forest shadow-[0_10px_30px_-16px_rgba(16,35,27,0.8)]",
  lime: "bg-lime text-ink hover:bg-lime-deep shadow-[0_10px_30px_-18px_rgba(184,230,63,0.9)]",
  outline:
    "border border-ink/20 bg-transparent text-ink hover:border-ink/50 hover:bg-ink/[0.03]",
  ghost: "text-ink/75 hover:bg-ink/[0.06] hover:text-ink",
  clay: "bg-clay text-white hover:bg-[#c85b38]",
  white: "bg-paper-2 text-ink hover:bg-white border border-ink/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[12.5px] gap-1.5",
  md: "h-11 px-5 text-[13.5px] gap-2",
  lg: "h-[52px] px-6 text-[14.5px] gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-[-0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
