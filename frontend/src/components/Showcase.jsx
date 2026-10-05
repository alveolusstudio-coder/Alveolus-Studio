import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { DroneModel, Particles, CinematicLights } from "@/components/three/DroneModel";
import { IS_MOBILE } from "@/lib/config";

const HOTSPOTS = [
  {
    id: "4k",
    label: "4K VIDEO",
    title: "4K VIDEO",
    desc: "Rekam momen dengan detail yang lebih tajam dan sinematik.",
    pos: { left: "50%", top: "74%" },
    rotY: 0.2,
    zoom: 4.1,
  },
  {
    id: "gimbal",
    label: "3-AXIS GIMBAL",
    title: "3-AXIS GIMBAL",
    desc: "Gerakan kamera lebih stabil untuk hasil video yang lebih halus.",
    pos: { left: "36%", top: "60%" },
    rotY: -0.7,
    zoom: 4.3,
  },
  {
    id: "light",
    label: "LIGHTWEIGHT",
    title: "LIGHTWEIGHT",
    desc: "Ringkas, praktis, dan mudah dibawa ke berbagai lokasi.",
    pos: { left: "72%", top: "26%" },
    rotY: 2.4,
    zoom: 5.0,
  },
  {
    id: "aerial",
    label: "AERIAL PERSPECTIVE",
    title: "AERIAL PERSPECTIVE",
    desc: "Ubah tempat biasa menjadi visual yang luar biasa.",
    pos: { left: "24%", top: "24%" },
    rotY: 1.3,
    zoom: 5.0,
  },
];

function ShowcaseScene({ active }) {
  const drone = useRef();
  useFrame((state, d) => {
    const target = active === null ? { rotY: state.clock.elapsedTime * 0.25, zoom: 5.6 } : HOTSPOTS[active];
    if (drone.current) {
      drone.current.rotation.y = THREE.MathUtils.damp(
        drone.current.rotation.y,
        active === null ? drone.current.rotation.y + d * 0.25 : target.rotY,
        3.2,
        d
      );
      drone.current.position.y = Math.sin(state.clock.elapsedTime * 1.15) * 0.12;
    }
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, active === null ? 5.6 : target.zoom, 3, d);
    state.camera.lookAt(0, 0, 0);
  });
  return (
    <group ref={drone}>
      <DroneModel scale={1.5} />
    </group>
  );
}

export default function Showcase() {
  const [active, setActive] = useState(null);

  return (
    <section id="drone" data-testid="showcase-section" className="relative bg-alv-ink py-24 sm:py-32 overflow-hidden">
      <div className="section-pad grid lg:grid-cols-2 gap-12 lg:gap-6 items-center max-w-7xl mx-auto">
        <div className="relative z-10">
          <p className="hud-label mb-4">02 — THE MACHINE</p>
          <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
            Small Drone.
            <br />
            <span className="text-alv-green">Big Perspective.</span>
          </h2>
          <p className="mt-6 text-alv-mist text-sm sm:text-base leading-relaxed max-w-md">
            DJI Mini 3 menghadirkan perspektif udara yang lebih luas dalam perangkat yang ringkas dan mudah dibawa.
          </p>

          <div className="mt-10 min-h-[130px]">
            <AnimatePresence mode="wait">
              {active !== null ? (
                <motion.div
                  key={HOTSPOTS[active].id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  data-testid="hotspot-info"
                  className="glass rounded-2xl p-6 max-w-md border border-alv-green/25"
                >
                  <p className="hud-label mb-2">HOTSPOT 0{active + 1}</p>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-alv-snow">{HOTSPOTS[active].title}</h3>
                  <p className="mt-2 text-sm text-alv-mist leading-relaxed">{HOTSPOTS[active].desc}</p>
                </motion.div>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-mono text-xs tracking-[0.25em] text-alv-dim uppercase"
                >
                  ▸ Arahkan kursor ke titik hijau pada drone
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div
          className="relative h-[420px] sm:h-[520px] lg:h-[600px]"
          onMouseLeave={() => setActive(null)}
        >
          <div
            className={`absolute inset-0 z-10 transition-colors duration-500 pointer-events-none ${
              active !== null ? "bg-alv-ink/55" : "bg-transparent"
            }`}
          />
          <Canvas
            dpr={IS_MOBILE ? [1, 1.5] : [1, 2]}
            camera={{ position: [0, 0.3, 5.6], fov: 38 }}
            gl={{ antialias: true, alpha: true }}
          >
            <fog attach="fog" args={["#050505", 8, 18]} />
            <CinematicLights />
            <ShowcaseScene active={active} />
            <Particles count={IS_MOBILE ? 60 : 150} spread={[8, 6, 6]} opacity={0.35} />
          </Canvas>

          {HOTSPOTS.map((h, i) => (
            <button
              key={h.id}
              data-testid={`hotspot-${h.id}`}
              data-cursor="VIEW"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`hotspot-dot absolute z-20 w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                active === i ? "bg-alv-green scale-125 shadow-[0_0_20px_rgba(114,240,168,0.9)]" : "bg-alv-green/70 hover:bg-alv-green"
              }`}
              style={h.pos}
              aria-label={h.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
