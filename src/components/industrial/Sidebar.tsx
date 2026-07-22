import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Boxes,
  Cpu,
  Gauge,
  History,
  LayoutDashboard,
  Settings,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/monitoramento", label: "Monitoramento", icon: Activity },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/relatorios", label: "Relatórios", icon: FileText },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/usuarios", label: "Usuários", icon: Users },
] as const;

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-sidebar-border bg-sidebar z-30">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow shadow-[0_0_20px_-4px_var(--primary)]">
          <Boxes className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-sidebar-foreground">
            Planta Piloto de Bioconversão
          </p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            CBR Ambiental
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Operação
        </p>
        {items.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
        <div className="flex items-center gap-2 text-xs">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </div>
          <span className="font-medium text-sidebar-foreground">Sistema online</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Raspberry Pi · rede local
        </p>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Cpu className="h-3 w-3" />
          <span>CPU 24%</span>
          <span className="mx-1">·</span>
          <Gauge className="h-3 w-3" />
          <span>Uplink OK</span>
        </div>
      </div>
    </aside>
  );
}