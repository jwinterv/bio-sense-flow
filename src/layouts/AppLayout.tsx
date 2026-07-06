import type { ReactNode } from "react";
import { Sidebar } from "@/components/industrial/Sidebar";
import { Header } from "@/components/industrial/Header";

export function AppLayout({
  title,
  subtitle,
  headerAction,
  children,
}: {
  title: string;
  subtitle?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-64">
        <Header title={title} subtitle={subtitle} action={headerAction} />
        <main className="px-6 lg:px-8 py-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
