import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

import { HeatmapPoint } from "@/lib/heatmap/types";
import { interpolateValue } from "@/lib/heatmap/interpolation";
import { geometryToWorld , worldToThree } from "@/lib/heatmap/coordinates";

interface Heatmap3DProps {
  points: HeatmapPoint[];
  height?: number;
}

const LEIRA = {
  width: 4,
  height: 3,
};

const GRID = {
  x: 40,
  y: 30,
};

export function Heatmap3D({
  points,
  height = 360,
}: Heatmap3DProps) {

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(
      LEIRA.width,
      LEIRA.height,
      GRID.x,
      GRID.y
    );
  }, []);


  const positions = geometry.attributes.position;

  console.log("Pontos recebidos:", points);

  const heatmapValues = useMemo(() => {

    const values: number[] = [];

    for (let i = 0; i < positions.count; i++) {

      const geometryX = positions.getX(i);
      const geometryY = positions.getY(i);

      const world = geometryToWorld(
        geometryX,
        geometryY,
        LEIRA
      );

      const value = interpolateValue(
        world.x,
        world.y,
        points
      );

      values.push(value);
    }

    return values;

  }, [points, positions]);

  console.log(
    "Valores gerados:",
    heatmapValues.slice(0,10)
  );

  return (
    <div
      className="w-full overflow-hidden rounded-lg border border-border"
      style={{ height }}
    >
      <Canvas
        camera={{
          position: [2, 5, 6],
          fov: 45,
        }}
      >

        {/* Iluminação */}
        <ambientLight intensity={0.8} />

        <directionalLight
          position={[5, 10, 5]}
          intensity={1.5}
        />


        {/* Grade da leira */}
        <gridHelper
          args={[
            LEIRA.width,
            GRID.x,
            "#888888",
            "#555555",
          ]}
          position={[
            LEIRA.width / 2,
            0,
            LEIRA.height / 2,
          ]}
        />


        {/* Superfície do heatmap */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            LEIRA.width / 2,
            0.001,
            LEIRA.height / 2,
          ]}
        >

          <primitive object={geometry} />

          <meshStandardMaterial
            color="#22c55e"
            wireframe
          />

        </mesh>


        {/* Sensores */}
        {points.map((point) => (
          <mesh
            key={point.id}
            position={[
              point.x,
              0.08,
              point.y,
            ]}
          >

            <sphereGeometry
              args={[
                0.08,
                24,
                24,
              ]}
            />

            <meshStandardMaterial
              color="#2563eb"
            />

          </mesh>
        ))}


        <OrbitControls />

      </Canvas>
    </div>
  );
}