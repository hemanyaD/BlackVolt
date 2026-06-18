"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

/*
  Procedural BlackVolt bottle — no model asset, just primitives:
  dark-glass body/shoulder/neck, gold cap, cream label with gold rings.
  Auto-rotates and can be dragged to spin (OrbitControls). Rendered only on the
  client via the dynamic wrapper in Bottle3DView.tsx.
*/

const CHARCOAL = "#2E1F14";
const GOLD = "#C9A24B";
const CREAM = "#ECE9E1";

function Bottle({ accent = GOLD }: { accent?: string }) {
  return (
    <group position={[0, 0.1, 0]}>
      {/* body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 2, 64]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.25} metalness={0.2} />
      </mesh>
      {/* shoulder */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.3, 0.7, 0.45, 64]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.25} metalness={0.2} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.35, 48]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.3} metalness={0.15} />
      </mesh>
      {/* cap */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.34, 48]} />
        <meshStandardMaterial color={accent} roughness={0.3} metalness={0.85} />
      </mesh>
      {/* label band */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.715, 0.715, 0.9, 64, 1, true]} />
        <meshStandardMaterial
          color={CREAM}
          roughness={0.6}
          metalness={0.05}
          side={2}
        />
      </mesh>
      {/* gold rings at the label edges */}
      {[0.3, -0.6].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.05, 64, 1, true]} />
          <meshStandardMaterial
            color={accent}
            roughness={0.35}
            metalness={0.8}
            side={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export function Bottle3D({
  accent,
  className = "",
}: {
  accent?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 4.4], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 6, 5]} intensity={1.4} />
        <directionalLight position={[-4, 1, -4]} intensity={0.5} color={GOLD} />
        <pointLight position={[0, 3, 2]} intensity={0.4} />

        <Bottle accent={accent} />

        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.4}
          scale={6}
          blur={2.6}
          far={3}
          color="#000000"
        />
        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.6}
          target={[0, 0.1, 0]}
          minPolarAngle={Math.PI / 2 - 0.55}
          maxPolarAngle={Math.PI / 2 + 0.25}
        />
      </Canvas>
    </div>
  );
}
