import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "SahiBuild — Build with the numbers on the table",
    template: "%s · SahiBuild",
  },
  description:
    "AI-powered construction estimates, BOQ audits, Vastu floor plans, and a verified builder network for Bengaluru landowners.",
  keywords: [
    "Bengaluru construction cost",
    "BBMP house plan",
    "BOQ audit",
    "verified builders Bengaluru",
    "construction estimate",
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
