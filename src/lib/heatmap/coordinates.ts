import { HeatmapDimensions } from "./types";


export function geometryToWorld(
  x: number,
  y: number,
  dimensions: HeatmapDimensions
) {
  return {
    x: x + dimensions.width / 2,
    y: dimensions.height / 2 - y,
  };
}


export function worldToThree(
  x: number,
  y: number,
  dimensions: HeatmapDimensions
) {
  return {
    x: x - dimensions.width / 2,
    z: dimensions.height / 2 - y,
  };
}