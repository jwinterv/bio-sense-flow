import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = "max-w-md",
}: DrawerProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full bg-surface-elevated border-l border-border shadow-2xl transition-transform duration-300 ease-out",
          width,
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            {title && (
              <h3 className="font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(100vh - 89px)" }}>
          {children}
        </div>
      </aside>
    </div>
  );
}
