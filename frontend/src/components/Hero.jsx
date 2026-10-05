import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { DroneModel, Particles, CinematicLights } from "@/components/three/DroneModel";
import { IMG, IS_MOBILE, scrollToId } from "@/lib/config";
import Magnetic from "@/components/Magnetic";

function HeroRig({ pointer }) {
  const drone = useRef();
  const base = IS_MOBILE ? [0, 2.5, -2.2] : [1.6, 0.85, 0];
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (drone.current) {
      drone.current.position.y = base[1] + Math.sin(t * 1.1) * 0.14;
      drone.current.rotation.y = THREE.MathUtils.lerp(drone.current.rotation.y, 0.55 + pointer.current.x * 0.45, 0.045);
      drone.current.rotation.x = THREE.MathUtils.lerp(drone.current.rotation.x, pointer.current.y * 0.18, 0.045);
      drone.current.rotation.z = THREE.MathUtils.lerp(drone.current.rotation.z, -pointer.current.x * 0.12, 0.045);
    }
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, pointer.current.x * 0.55, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 0.35 - pointer.current.y * 0.35, 0.04);
    state.camera.lookAt(base[0] * 0.6, base[1] * 0.6, 0);
  });
  return (
    <group ref={drone} position={base}>
      <DroneModel scale={IS_MOBILE ? 0.7 : 1.1} />
    </group>
  );
}

const line = {
  hidden: { y: "115%" },
  show: (i) => ({
    y: 0,
    transition: { delay: 0.15 + i * 0.13, duration: 1.0, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Hero({ started }) {
  const pointer = useRef({ x: 0, y: 0 });

  const onMove = (e) => {
    pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  return (
    <section
      id="home"
      data-testid="hero-section"
      onMouseMove={onMove}
      className="relative min-h-screen overflow-hidden bg-alv-ink"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${IMG.hero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-alv-ink/80 via-alv-ink/30 to-alv-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(215,181,109,0.12),transparent_60%)]" />

      <div className="absolute inset-0 z-[2]">
        <Canvas
          dpr={IS_MOBILE ? [1, 1.5] : [1, 2]}
          camera={{ position: [0, 0.35, 6.4], fov: 38 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <fog attach="fog" args={["#050505", 9, 20]} />
          <CinematicLights />
          <HeroRig pointer={pointer} />
          <Particles count={IS_MOBILE ? 110 : 300} />
        </Canvas>
      </div>

      {/* HUD corners */}
      <div className="absolute top-24 left-6 sm:left-10 z-10 hidden sm:block">
        <p className="hud-label">DJI MINI 3 — UNIT 01</p>
        <p className="font-mono text-[10px] text-alv-dim mt-1 tracking-widest">STATUS: READY TO FLY</p>
      </div>
      <div className="absolute top-24 right-6 sm:right-10 z-10 text-right hidden sm:block">
        <p className="hud-label text-alv-gold">4K / 30FPS HDR</p>
        <p className="font-mono text-[10px] text-alv-dim mt-1 tracking-widest">S-8.4093° E-115.1889°</p>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col justify-end section-pad pb-24 sm:pb-16 pointer-events-none">
        <div className="w-full">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="hud-label mb-5"
          >
            DRONE RENTAL & CREATIVE VISUAL STUDIO — INDONESIA
          </motion.p>

          <h1 className="font-display font-extrabold uppercase leading-[0.92] tracking-tight text-[8.6vw] sm:text-[10vw] lg:text-[7.4vw]">
            {["TERBANG.", "ABADIKAN.", "CERITAKAN."].map((l, i) => (
              <span key={l} className="block overflow-hidden pb-1">
                <motion.span
                  custom={i}
                  variants={line}
                  initial="hidden"
                  animate={started ? "show" : "hidden"}
                  className={`block will-change-transform ${i === 2 ? "text-alv-green" : "text-alv-snow"}`}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={started ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-14"
          >
            <div className="max-w-md">
              <p className="font-display text-lg sm:text-xl text-alv-snow/90 italic">"See the world differently."</p>
              <p className="mt-3 text-sm sm:text-base text-alv-mist leading-relaxed">
                Sewa DJI Mini 3 untuk mengubah momen biasa menjadi perspektif luar biasa.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
              <Magnetic>
                <button
                  data-testid="hero-booking-btn"
                  data-cursor="BOOKING"
                  onClick={() => scrollToId("booking")}
                  className="rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-7 py-3.5 hover:shadow-[0_0_40px_rgba(114,240,168,0.5)] transition-shadow duration-300"
                >
                  Booking Drone →
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  data-testid="hero-packages-btn"
                  data-cursor="EXPLORE"
                  onClick={() => scrollToId("paket")}
                  className="rounded-full border border-alv-snow/25 text-alv-snow text-sm px-7 py-3.5 hover:border-alv-green hover:text-alv-green transition-colors duration-300"
                >
                  Lihat Paket ↓
                </button>
              </Magnetic>
            </div>
          </motion.div>
        </div>

        {/* Spec chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={started ? { opacity: 1 } : {}}
          transition={{ delay: 1.05, duration: 1 }}
          className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-5"
        >
          {["DJI MINI 3", "4K VIDEO", "3-AXIS GIMBAL", "LIGHTWEIGHT"].map((s) => (
            <span key={s} className="font-mono text-[10px] sm:text-xs tracking-[0.25em] text-alv-mist">
              <span className="text-alv-green mr-2">●</span>
              {s}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 right-6 sm:right-10 z-10 hidden sm:flex flex-col items-center gap-3">
        <span className="font-mono text-[9px] tracking-[0.3em] text-alv-dim uppercase [writing-mode:vertical-lr]">
          Scroll to fly
        </span>
        <div className="scroll-cue relative w-px h-16 overflow-hidden bg-white/5" />
      </div>
    </section>
  );
}
