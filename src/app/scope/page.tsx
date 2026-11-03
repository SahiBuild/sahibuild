import type { Metadata } from "next";
import { ScopingWizard } from "@/components/scoping/scoping-wizard";

export const metadata: Metadata = {
  title: "Instant BOQ & cost estimate",
  description:
    "Get a stage-wise construction estimate, material schedule, approvals, risk flags, and a conceptual Vastu floor plan for your Bengaluru plot.",
};

export default function ScopePage() {
  return <ScopingWizard />;
}
