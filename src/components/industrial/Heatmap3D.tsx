import { Box, Layers } from "lucide-react";
import { EmptyState } from "./Feedback";

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
}

interface Heatmap3DProps {
  height?: number;
  title?: string;
  unit?: string;
  values?: HeatmapCell[];
}

export function Heatmap3D({ height = 360, title, unit }: Heatmap3DProps) {
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
          title={title ?? "Heatmap 3D"}
          description={`Placeholder para visualização de ${title?.toLowerCase() ?? "heatmap"}. A seleção de variável permanece disponível para uso futuro.`}
          action={
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              {unit ? `${unit} · placeholder` : "Placeholder"}
            </div>
          }
        />
      </div>
    </div>
  );
}
