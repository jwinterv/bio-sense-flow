import { cn } from "@/lib/utils";
import type { AlertStatus, EntityStatus, Severity } from "@/types";
import { AlertCircle, AlertOctagon, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "destructive" | "muted" | "primary" | "info";

const toneClass: Record<Tone, string> = {
  success:
    "bg-success/15 text-success border-success/30",
  warning:
    "bg-warning/15 text-warning border-warning/30",
  destructive:
    "bg-destructive/15 text-destructive border-destructive/30",
  muted:
    "bg-muted text-muted-foreground border-border",
  primary:
    "bg-primary/15 text-primary border-primary/30",
  info:
    "bg-accent text-accent-foreground border-border-strong",
};

export function StatusBadge({
  status,
  className,
  children,
}: {
  status: EntityStatus | AlertStatus | Severity | "custom";
  className?: string;
  children?: ReactNode;
}) {
  const map: Record<string, { tone: Tone; label: string; dot: boolean }> = {
    online: { tone: "success", label: "Online", dot: true },
    offline: { tone: "destructive", label: "Offline", dot: true },
    manutencao: { tone: "warning", label: "Manutenção", dot: true },
    ativo: { tone: "destructive", label: "Ativo", dot: true },
    reconhecido: { tone: "warning", label: "Reconhecido", dot: false },
    resolvido: { tone: "success", label: "Resolvido", dot: false },
    baixa: { tone: "muted", label: "Baixa", dot: false },
    media: { tone: "info", label: "Média", dot: false },
    alta: { tone: "warning", label: "Alta", dot: false },
    critica: { tone: "destructive", label: "Crítica", dot: true },
    custom: { tone: "muted", label: "", dot: false },
  };
  const cfg = map[status] ?? map.custom;
  const icon =
    status === "critica" ? (
      <AlertOctagon className="h-3.5 w-3.5" />
    ) : status === "alta" ? (
      <AlertTriangle className="h-3.5 w-3.5" />
    ) : status === "media" ? (
      <AlertCircle className="h-3.5 w-3.5" />
    ) : status === "baixa" ? (
      <Info className="h-3.5 w-3.5" />
    ) : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        toneClass[cfg.tone],
        className,
      )}
    >
      {cfg.dot ? (
        <span className="relative flex h-1.5 w-1.5">
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
              cfg.tone === "success" && "bg-success",
              cfg.tone === "destructive" && "bg-destructive",
              cfg.tone === "warning" && "bg-warning",
            )}
          />
          <span
            className={cn(
              "relative inline-flex h-1.5 w-1.5 rounded-full",
              cfg.tone === "success" && "bg-success",
              cfg.tone === "destructive" && "bg-destructive",
              cfg.tone === "warning" && "bg-warning",
            )}
          />
        </span>
      ) : (
        icon
      )}
      {children ?? cfg.label}
    </span>
  );
}
