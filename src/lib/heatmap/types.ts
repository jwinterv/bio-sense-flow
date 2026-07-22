export interface HeatmapPoint {
  id: string | number;
  nome: string;

  x: number;
  y: number;

  value: number;
}

export interface HeatmapDimensions {
  width: number;
  height: number;
}