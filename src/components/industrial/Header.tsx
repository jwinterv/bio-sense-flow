import { Bell, Search } from "lucide-react";
import type { ReactNode } from "react";

export function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-6 lg:px-8 py-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            <span>Leira 01 · Pátio Norte</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span className="capitalize">{fmt}</span>
          </div>
          <h1 className="mt-0.5 font-display text-xl font-semibold text-foreground truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-muted-foreground min-w-[240px]">
          <Search className="h-4 w-4" />
          <input
            className="w-full bg-transparent outline-none placeholder:text-muted-foreground/60"
            placeholder="Buscar hastes, sensores..."
          />
        </div>

        <button
          className="relative rounded-md border border-border bg-surface p-2 text-muted-foreground hover:text-foreground hover:border-border-strong transition-colors"
          aria-label="Alertas"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </button>

        {action}

        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary text-xs font-semibold">
            AR
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-foreground leading-tight">
              Ana Rocha
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
              Administrador
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
