import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return <DashboardShell>{children}</DashboardShell>;
}
