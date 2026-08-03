import { Canvas } from "@react-three/fiber";
import { Html, Line, OrbitControls, Text } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";

import { HeatmapDimensions, HeatmapLayers, HeatmapPoint } from "@/lib/heatmap/types";
import { interpolateValue } from "@/lib/heatmap/interpolation";
import { geometryToWorld } from "@/lib/heatmap/coordinates";

interface Heatmap3DProps {
  layers: HeatmapLayers;
  dimensions?: HeatmapDimensions;
  height?: number;
}

const DEFAULT_LEIRA = { width: 4, height: 3 };
const GRID = { x: 36, y: 28 };
const SURFACE_GAP = 1.5;

interface HoveredPoint {
  point: HeatmapPoint;
  layer: "Superior" | "Inferior";
}

export function Heatmap3D({ layers, dimensions, height = 360 }: Heatmap3DProps) {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const leira = dimensions ?? DEFAULT_LEIRA;
  const largestSide = Math.max(leira.width, leira.height);
  const centeredLayers = useMemo(() => {
    const points = [...layers.superior, ...layers.inferior];

    if (points.length === 0) {
      return layers;
    }

    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const offsetX = leira.width / 2 - (minX + maxX) / 2;
    const offsetY = leira.height / 2 - (minY + maxY) / 2;
    const center = (layer: HeatmapLayers["superior"]) => layer.map((point) => ({
      ...point,
      x: point.x + offsetX,
      y: point.y + offsetY,
    }));

    return { superior: center(layers.superior), inferior: center(layers.inferior) };
  }, [layers, leira.height, leira.width]);

  const domain = useMemo(() => {
    const values = [...centeredLayers.superior, ...centeredLayers.inferior]
      .map((point) => point.value)
      .filter(Number.isFinite);
    const min = Math.min(...values);
    const max = Math.max(...values);
    return values.length ? { min, max: max === min ? min + 1 : max } : { min: 0, max: 1 };
  }, [centeredLayers]);

  const surfaces = useMemo(() => {
    const createSurface = (points: HeatmapLayers["superior"]) => {
      const geometry = new THREE.PlaneGeometry(leira.width, leira.height, GRID.x, GRID.y);
      const positions = geometry.attributes.position;
      const colors = new Float32Array(positions.count * 3);
      const color = new THREE.Color();

      for (let index = 0; index < positions.count; index += 1) {
        const world = geometryToWorld(positions.getX(index), positions.getY(index), leira);
        const value = interpolateValue(world.x, world.y, points);
        const normalized = Number.isFinite(value)
          ? THREE.MathUtils.clamp((value - domain.min) / (domain.max - domain.min), 0, 1)
          : 0;
        color.setHSL(0.66 - normalized * 0.66, 1, 0.46);
        colors.set([color.r, color.g, color.b], index * 3);
      }

      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return geometry;
    };

    return { superior: createSurface(centeredLayers.superior), inferior: createSurface(centeredLayers.inferior) };
  }, [centeredLayers, domain, leira.height, leira.width]);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-border" style={{ height }}>
      <Canvas camera={{ position: [leira.width * 0.6, largestSide * 1.1, leira.height + largestSide * 0.7], fov: 45 }}>
        <ambientLight intensity={1.1} />
        <Line points={[[0, 0.02, 0], [leira.width, 0.02, 0]]} color="#e2e8f0" lineWidth={1.5} />
        <Line points={[[0, 0.02, 0], [0, 0.02, leira.height]]} color="#e2e8f0" lineWidth={1.5} />
        <Line points={[[0, 0.02, 0], [0, SURFACE_GAP + 0.16, 0]]} color="#e2e8f0" lineWidth={1.5} />
        <Text position={[leira.width + largestSide * 0.02, 0.02, 0]} fontSize={largestSide * 0.035} color="#e2e8f0" anchorX="left" anchorY="middle">
          X
        </Text>
        <Text position={[0, 0.02, leira.height + largestSide * 0.02]} fontSize={largestSide * 0.035} color="#e2e8f0" anchorX="center" anchorY="top">
          Y
        </Text>
        <Text position={[0, SURFACE_GAP + largestSide * 0.04, 0]} fontSize={largestSide * 0.035} color="#e2e8f0" anchorX="center" anchorY="bottom">
          Z
        </Text>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[leira.width / 2, SURFACE_GAP, leira.height / 2]}>
          <primitive object={surfaces.superior} attach="geometry" />
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[leira.width / 2, 0.012, leira.height / 2]}>
          <primitive object={surfaces.inferior} attach="geometry" />
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
        </mesh>

        {centeredLayers.superior.map((point) => (
          <group
            key={`superior-${point.id}`}
            position={[point.x, SURFACE_GAP + 0.04, point.y]}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHoveredPoint({ point, layer: "Superior" });
            }}
            onPointerOut={() => setHoveredPoint(null)}
          >
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {centeredLayers.inferior.map((point) => (
          <group
            key={`inferior-${point.id}`}
            position={[point.x, 0.08, point.y]}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHoveredPoint({ point, layer: "Inferior" });
            }}
            onPointerOut={() => setHoveredPoint(null)}
          >
            <mesh>
              <sphereGeometry args={[0.18, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color="#e2e8f0" />
            </mesh>
          </group>
        ))}
        {hoveredPoint && (
          <Html
            position={[
              hoveredPoint.point.x,
              hoveredPoint.layer === "Superior" ? SURFACE_GAP + 0.18 : 0.18,
              hoveredPoint.point.y,
            ]}
            center
          >
            <div className="whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-lg">
              <p className="text-muted-foreground">Valor: {hoveredPoint.point.value.toFixed(2)}</p>
              {hoveredPoint.point.nome} · sensor {hoveredPoint.layer.toLowerCase()}
            </div>
          </Html>
        )}
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-background/95 to-transparent px-3 pb-2 pt-8 text-xs text-foreground">
        <div><span className="font-medium">Superior</span><br />Sensor 1</div>
        <div className="text-center"><span className="font-medium">Inferior</span><br />Sensor 2</div>
        <div className="text-right"><span className="font-medium">Escala</span><br />{domain.min.toFixed(1)} → {domain.max.toFixed(1)}</div>
      </div>
    </div>
  );
}
