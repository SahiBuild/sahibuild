import type { Metadata } from "next";
import { AuditClient } from "@/components/audit/audit-client";

export const metadata: Metadata = {
  title: "Audit a builder quote",
  description:
    "Upload a builder PDF quotation and find missing scope, hidden charges, rate outliers, and contract risk before you sign.",
};

export default function AuditPage() {
  return <AuditClient />;
}
