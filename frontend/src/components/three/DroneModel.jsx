import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const WHITE = "#e9ebe9";
const DARK = "#17191c";

function Rotor({ position, speed = 28 }) {
  const prop = useRef();
  useFrame((_, d) => {
    if (prop.current) prop.current.rotation.y += d * speed;
  });
  return (
    <group position={position}>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.075, 0.095, 0.13, 20]} />
        <meshStandardMaterial color={DARK} roughness={0.4} metalness={0.55} />
      </mesh>
      <group ref={prop} position={[0, 0.05, 0]}>
        <mesh>
          <boxGeometry args={[0.64, 0.006, 0.05]} />
          <meshStandardMaterial color="#0b0c0d" roughness={0.3} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.64, 0.006, 0.05]} />
          <meshStandardMaterial color="#0b0c0d" roughness={0.3} transparent opacity={0.9} />
        </mesh>
      </group>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 32]} />
        <meshBasicMaterial color="#aebbb2" transparent opacity={0.07} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Arm({ angle, led }) {
  const len = 0.6;
  return (
    <group rotation={[0, angle, 0]}>
      <RoundedBox args={[len, 0.07, 0.12]} radius={0.03} position={[len / 2 + 0.28, 0.02, 0]}>
        <meshStandardMaterial color={WHITE} roughness={0.35} metalness={0.08} />
      </RoundedBox>
      <Rotor position={[len + 0.28, 0.1, 0]} />
      <mesh position={[len + 0.1, -0.03, 0]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color={led} />
      </mesh>
    </group>
  );
}

export function DroneModel(props) {
  return (
    <group {...props}>
      <RoundedBox args={[0.8, 0.24, 0.74]} radius={0.08} smoothness={8}>
        <meshStandardMaterial color={WHITE} roughness={0.3} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.52, 0.07, 0.5]} radius={0.025} position={[0, 0.145, 0.05]}>
        <meshStandardMaterial color="#dcdfdc" roughness={0.45} />
      </RoundedBox>
      <mesh position={[0, 0.02, -0.375]}>
        <boxGeometry args={[0.3, 0.1, 0.02]} />
        <meshStandardMaterial color={DARK} roughness={0.4} />
      </mesh>

      {/* front arms angled forward, rear arms angled back */}
      <Arm angle={-Math.PI / 2 + 0.5} led="#72F0A8" />
      <Arm angle={-Math.PI / 2 - 0.5} led="#72F0A8" />
      <Arm angle={Math.PI / 2 - 0.42} led="#ff5a4e" />
      <Arm angle={Math.PI / 2 + 0.42} led="#ff5a4e" />

      {/* 3-axis gimbal + camera */}
      <group position={[0, -0.17, -0.32]}>
        <mesh>
          <sphereGeometry args={[0.135, 24, 24]} />
          <meshStandardMaterial color={DARK} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.088, 0.088, 0.15, 24]} />
          <meshStandardMaterial color="#22262b" roughness={0.25} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, -0.178]} rotation={[0, 0, 0]}>
          <circleGeometry args={[0.055, 24]} />
          <meshStandardMaterial color="#04070a" roughness={0.05} metalness={0.95} emissive="#0e2f1e" emissiveIntensity={0.9} />
        </mesh>
        <mesh position={[0.055, 0.075, -0.1]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshBasicMaterial color="#72F0A8" />
        </mesh>
      </group>

      {/* landing legs */}
      {[[-0.2, -0.26], [0.2, -0.26]].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.2, z]}>
          <cylinderGeometry args={[0.018, 0.022, 0.16, 10]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} />
        </mesh>
      ))}
      {[[-0.16, 0.28], [0.16, 0.28]].map(([x, z], i) => (
        <mesh key={`r${i}`} position={[x, -0.18, z]}>
          <cylinderGeometry args={[0.016, 0.02, 0.12, 10]} />
          <meshStandardMaterial color={WHITE} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Particles({ count = 260, spread = [16, 8, 10], color = "#72F0A8", size = 0.035, opacity = 0.5 }) {
  const ref = useRef();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread[0];
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread[2];
  }
  useFrame((state, d) => {
    if (!ref.current) return;
    ref.current.rotation.y += d * 0.018;
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export function CinematicLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#2a3a30" />
      <directionalLight position={[0, 2.5, 8]} intensity={1.6} color="#f2fff7" />
      <directionalLight position={[6, 4, -4]} intensity={2.4} color="#D7B56D" />
      <directionalLight position={[-5, 2, 5]} intensity={0.55} color="#9fd8ff" />
      <pointLight position={[0, -1.6, 0.6]} intensity={1.4} color="#72F0A8" distance={7} />
    </>
  );
}
