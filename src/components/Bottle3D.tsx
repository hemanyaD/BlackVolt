"use client";

import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";

/*
  Premium procedural BlackVolt bottle — no model asset, just primitives with
  physically-based materials (glossy dark glass body, mirror-gold cap, cream
  label). A studio Environment built from Lightformers gives real reflections
  without any network HDRI. Gently floats, slowly auto-rotates, drag to spin.
  Client-only via the dynamic wrapper in Bottle3DView.tsx.
*/

const CHARCOAL = "#2E1F14";
const GOLD = "#C9A24B";
const CREAM = "#ECE9E1";

function Bottle({ accent = GOLD }: { accent?: string }) {
  return (
    <group position={[0, 0.1, 0]}>
      {/* body — glossy dark glass */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 2, 96]} />
        <meshPhysicalMaterial
          color={CHARCOAL}
          roughness={0.16}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* shoulder */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.3, 0.7, 0.45, 96]} />
        <meshPhysicalMaterial
          color={CHARCOAL}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.12}
          envMapIntensity={1.4}
        />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.35, 64]} />
        <meshPhysicalMaterial color={CHARCOAL} roughness={0.2} envMapIntensity={1.2} />
      </mesh>
      {/* cap — mirror gold */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.34, 64]} />
        <meshStandardMaterial
          color={accent}
          roughness={0.18}
          metalness={1}
          envMapIntensity={1.6}
        />
      </mesh>
      {/* label */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.715, 0.715, 0.92, 96, 1, true]} />
        <meshStandardMaterial
          color={CREAM}
          roughness={0.55}
          metalness={0.05}
          side={2}
        />
      </mesh>
      {/* gold rings at the label edges */}
      {[0.31, -0.61].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.72, 0.72, 0.05, 96, 1, true]} />
          <meshStandardMaterial
            color={accent}
            roughness={0.2}
            metalness={1}
            envMapIntensity={1.6}
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
        camera={{ position: [0, 0.4, 4.2], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 6, 5]} intensity={1.1} />

        <Float speed={2} rotationIntensity={0.25} floatIntensity={0.7}>
          <Bottle accent={accent} />
        </Float>

        <ContactShadows
          position={[0, -1.3, 0]}
          opacity={0.45}
          scale={7}
          blur={2.8}
          far={3.2}
          color="#000000"
        />

        {/* Studio reflections (in-scene, no network HDRI) */}
        <Environment resolution={256}>
          <Lightformer
            form="rect"
            intensity={3}
            position={[0, 3, 3]}
            scale={[6, 3, 1]}
            color="#ffffff"
          />
          <Lightformer
            form="rect"
            intensity={1.4}
            position={[-4, 1, -2]}
            scale={[4, 5, 1]}
            color={GOLD}
          />
          <Lightformer
            form="ring"
            intensity={2}
            position={[4, 2, 2]}
            scale={2.5}
            color="#ffffff"
          />
        </Environment>

        <OrbitControls
          makeDefault
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.4}
          target={[0, 0.1, 0]}
          minPolarAngle={Math.PI / 2 - 0.5}
          maxPolarAngle={Math.PI / 2 + 0.22}
        />
      </Canvas>
    </div>
  );
}
