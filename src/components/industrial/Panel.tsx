import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PanelProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function Panel({
  title,
  subtitle,
  action,
  icon,
  className,
  bodyClassName,
  children,
}: PanelProps) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-display text-sm font-semibold tracking-wide uppercase text-foreground/90">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "flat";
  trendLabel?: string;
  tone?: "default" | "primary" | "success" | "warning" | "destructive";
}

const toneMap = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
} as const;

export function StatCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendLabel,
  tone = "default",
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-success"
      : trend === "down"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div className="panel relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-display text-3xl font-semibold tabular-nums",
                toneMap[tone],
              )}
            >
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {trendLabel && (
            <p className={cn("mt-2 text-xs font-medium", trendColor)}>
              {trendLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
