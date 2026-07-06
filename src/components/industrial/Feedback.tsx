import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function Loading({
  label = "Carregando...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      {label}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h4 className="font-display text-base font-semibold text-foreground">
          {title}
        </h4>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
