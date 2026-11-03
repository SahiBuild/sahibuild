import type { Metadata } from "next";
import { BuildersDirectory } from "@/components/builders/builders-directory";

export const metadata: Metadata = {
  title: "Verified Bengaluru builders",
  description:
    "Compare verified Bengaluru construction builders by zone, finish tier, rate band, and tracked delivery.",
};

export default function BuildersPage() {
  return <BuildersDirectory />;
}
