import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 1,
});

export function formatINR(value: number): string {
  return inr.format(Math.round(value));
}

export function formatNumber(value: number): string {
  return number.format(Math.round(value));
}

export function formatDecimal(value: number): string {
  return decimal.format(value);
}

export function compactINR(value: number): string {
  if (value >= 1_00_00_000) {
    return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (value >= 1_00_000) {
    return `₹${(value / 1_00_000).toFixed(2)} L`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}K`;
  }
  return formatINR(value);
}

export function compactNumber(value: number): string {
  if (value >= 1_00_00_000) {
    return `${(value / 1_00_00_000).toFixed(1)}Cr`;
  }
  if (value >= 1_00_000) {
    return `${(value / 1_00_000).toFixed(1)}L`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return String(Math.round(value));
}

export function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function uid(prefix = "bw"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
