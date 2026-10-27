import { DashboardTopBar } from "@/components/layout/dashboard-top-bar";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="flex min-h-full flex-col">
      <DashboardTopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 border-r border-border p-4">
          <h2 className="text-lg font-semibold tracking-tight">Sidebar</h2>
        </aside>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
