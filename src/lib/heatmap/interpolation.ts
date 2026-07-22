import { HeatmapPoint } from "./types";

export function interpolateValue(
  x: number,
  y: number,
  points: HeatmapPoint[],
  power = 2
): number {

  let numerator = 0;
  let denominator = 0;

  for (const point of points) {
    const dx = x - point.x;
    const dy = y - point.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.0001) {
      return point.value;
    }

    const weight = 1 / Math.pow(distance, power);

    numerator += point.value * weight;
    denominator += weight;
  }

  return numerator / denominator;
}