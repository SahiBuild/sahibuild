import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin/admin-console";

export const metadata: Metadata = {
  title: "Admin console",
  description:
    "SahiBuild operations console for projects, builder verification, quote audits, and zone demand.",
};

export default function AdminPage() {
  return <AdminConsole />;
}
