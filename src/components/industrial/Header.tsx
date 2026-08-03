import { Bell, Moon, Sun } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { getAlertas } from "@/services/alertasService";
import { getSessao, limparSessao } from "@/services/authService";
import type { Alerta } from "@/types";

export function Header({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<Alerta[]>([]);
  const [usuario, setUsuario] = useState(() => getSessao()?.usuario ?? null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const useDarkMode = savedTheme === "dark";
    setDarkMode(useDarkMode);
    document.documentElement.classList.toggle("dark", useDarkMode);
  }, []);

  useEffect(() => {
    const refreshAlerts = () => {
      getAlertas({ status: "ativo" }).then(setActiveAlerts);
    };

    refreshAlerts();
    const intervalId = window.setInterval(refreshAlerts, 30_000);
    window.addEventListener("alertas:atualizados", refreshAlerts);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("alertas:atualizados", refreshAlerts);
    };
  }, []);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    localStorage.setItem("theme", nextDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", nextDarkMode);
  };

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
            <span>Leira 01</span>
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

        <div className="relative">
          <button
            onClick={() => setAlertsOpen((open) => !open)}
            className="relative rounded-md border border-border bg-surface p-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            aria-label="Abrir notificações"
            aria-expanded={alertsOpen}
          >
            <Bell className="h-4 w-4" />
            {activeAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {activeAlerts.length > 99 ? "99+" : activeAlerts.length}
              </span>
            )}
          </button>
          {alertsOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-80 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <p className="text-sm font-semibold text-popover-foreground">Alertas ativos</p>
                <span className="text-xs text-muted-foreground">{activeAlerts.length}</span>
              </div>
              {activeAlerts.length ? (
                <div className="max-h-80 overflow-y-auto py-1">
                  {activeAlerts.slice(0, 5).map((alert) => (
                    <Link
                      key={alert.id}
                      to="/alertas"
                      search={{ alerta: alert.id }}
                      onClick={() => setAlertsOpen(false)}
                      className="block border-b border-border/60 px-3 py-2.5 last:border-0 hover:bg-accent"
                    >
                      <p className="text-sm font-medium text-popover-foreground">Haste {alert.hasteId} · {alert.tipo}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{alert.mensagem}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Nenhum alerta ativo.</p>
              )}
              <Link
                to="/alertas"
                onClick={() => setAlertsOpen(false)}
                className="block border-t border-border px-3 py-2 text-center text-sm font-medium text-primary hover:bg-accent"
              >
                Ver todos os alertas
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          aria-label={darkMode ? "Ativar modo claro" : "Ativar modo escuro"}
          aria-pressed={darkMode}
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="hidden sm:inline">{darkMode ? "Claro" : "Escuro"}</span>
        </button>

        {action}

        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary text-xs font-semibold">
            {usuario?.nome.split(" ").map((nome) => nome[0]).slice(0, 2).join("").toUpperCase() ?? "--"}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-foreground leading-tight">
              {usuario?.nome ?? "Sessão não iniciada"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight">
              {usuario?.perfil ?? "Autenticação pendente"}
            </p>
          </div>
          <button
            onClick={() => {
              limparSessao();
              setUsuario(null);
              window.location.assign("/");
            }}
            className="ml-1 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Sair"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
