import { Box, Layers } from "lucide-react";
import { EmptyState } from "./Feedback";

/**
 * Placeholder para o Heatmap 3D.
 * Integração real (ex: Three.js) será adicionada futuramente.
 * Recebe o array de hastes para já reservar a área proporcional.
 */
export function Heatmap3D({ height = 360 }: { height?: number }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(ellipse_at_top,theme(colors.primary/15%),transparent_60%),linear-gradient(180deg,var(--surface-elevated),var(--surface))]"
      style={{ height }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="relative flex h-full items-center justify-center">
        <EmptyState
          icon={<Box className="h-6 w-6" />}
          title="Heatmap 3D"
          description="Área reservada para visualização volumétrica da leira. Renderização será integrada em breve."
          action={
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              Placeholder
            </div>
          }
        />
      </div>
    </div>
  );
}
