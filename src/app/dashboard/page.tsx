import type { Metadata } from "next";
import { Workspace } from "@/components/dashboard/workspace";

export const metadata: Metadata = {
  title: "Your workspace",
  description:
    "Compare saved Bengaluru construction estimates, export BOQs, and line up verified builders.",
};

export default function DashboardPage() {
  return <Workspace />;
}
