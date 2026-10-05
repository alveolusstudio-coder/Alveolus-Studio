import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { DroneModel, CinematicLights } from "@/components/three/DroneModel";
import { IMG, IS_MOBILE } from "@/lib/config";

const KEYS = [
  { p: 0.0, pos: [0, -0.15, -2.6], rotY: 0.55, camZ: 7.2, camY: 0.35 },
  { p: 0.16, pos: [0, 0, -0.4], rotY: 0.55, camZ: 7.2, camY: 0.35 },
  { p: 0.32, pos: [0, 0, 1.4], rotY: 0.55, camZ: 5.8, camY: 0.3 },
  { p: 0.48, pos: [0, 0, 1.4], rotY: 0.55 + Math.PI / 2, camZ: 5.8, camY: 0.3 },
  { p: 0.64, pos: [0, 1.6, 1.6], rotY: 0.55 + Math.PI / 2, camZ: 5.4, camY: -1.0 },
  { p: 0.8, pos: [0, 1.6, 2.1], rotY: 0.55 + Math.PI, camZ: 5.4, camY: -1.0 },
  { p: 0.94, pos: [0, 0.6, 4.4], rotY: 0.55 + Math.PI + 0.4, camZ: 5.4, camY: 0.1 },
  { p: 1.0, pos: [0, 0.35, 5.1], rotY: 0.55 + Math.PI + 0.5, camZ: 5.4, camY: 0.1 },
];

function poseAt(p) {
  let a = KEYS[0];
  let b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (p >= KEYS[i].p && p <= KEYS[i + 1].p) {
      a = KEYS[i];
      b = KEYS[i + 1];
      break;
    }
  }
  const span = b.p - a.p || 1;
  const t = THREE.MathUtils.smoothstep((p - a.p) / span, 0, 1);
  return {
    pos: [
      THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
      THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
      THREE.MathUtils.lerp(a.pos[2], b.pos[2], t),
    ],
    rotY: THREE.MathUtils.lerp(a.rotY, b.rotY, t),
    camZ: THREE.MathUtils.lerp(a.camZ, b.camZ, t),
    camY: THREE.MathUtils.lerp(a.camY, b.camY, t),
  };
}

function FlyScene({ progress }) {
  const drone = useRef();
  useFrame((state, d) => {
    const t = poseAt(progress.current.v);
    if (drone.current) {
      drone.current.position.x = THREE.MathUtils.damp(drone.current.position.x, t.pos[0], 5, d);
      drone.current.position.y = THREE.MathUtils.damp(drone.current.position.y, t.pos[1] + Math.sin(state.clock.elapsedTime * 1.3) * 0.08, 5, d);
      drone.current.position.z = THREE.MathUtils.damp(drone.current.position.z, t.pos[2], 5, d);
      drone.current.rotation.y = THREE.MathUtils.damp(drone.current.rotation.y, t.rotY, 4, d);
    }
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, t.camZ, 4, d);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, t.camY, 4, d);
    state.camera.lookAt(drone.current ? drone.current.position : new THREE.Vector3());
  });
  return (
    <group ref={drone}>
      <DroneModel scale={1.35} />
    </group>
  );
}

const STEPS = [
  ["SCROLL 01", "Drone bergerak maju."],
  ["SCROLL 02", "Camera mendekat."],
  ["SCROLL 03", "Drone berputar 90°."],
  ["SCROLL 04", "Camera bergerak ke bawah drone."],
  ["SCROLL 05", "Drone berputar 180°."],
  ["SCROLL 06", "Camera zoom ke lensa."],
];

export default function ScrollFly() {
  const rootRef = useRef(null);
  const portalRef = useRef(null);
  const progress = useRef({ v: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = {
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
      };
      gsap.timeline({ scrollTrigger: { ...trigger, onUpdate: (s) => (progress.current.v = s.progress) } });

      const tl = gsap.timeline({ scrollTrigger: trigger });
      STEPS.forEach((_, i) => {
        tl.fromTo(
          `.fly-cap-${i}`,
          { autoAlpha: 0, y: 44 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
          i * 1.55 + 0.15
        ).to(`.fly-cap-${i}`, { autoAlpha: 0, y: -44, duration: 0.5 }, i * 1.55 + 1.25);
      });
      tl.fromTo(
        portalRef.current,
        { clipPath: "circle(0% at 50% 50%)" },
        { clipPath: "circle(75% at 50% 50%)", duration: 1.6, ease: "power2.inOut" },
        STEPS.length * 1.55 - 0.4
      )
        .fromTo(".portal-text", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5")
        .to(".fly-canvas-wrap", { autoAlpha: 0, duration: 0.4 }, "<");
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="terbang" ref={rootRef} data-testid="scroll-fly-section" className="relative h-[620vh] bg-alv-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="fly-canvas-wrap absolute inset-0">
          <Canvas
            dpr={IS_MOBILE ? [1, 1.5] : [1, 2]}
            camera={{ position: [0, 0.35, 7.2], fov: 40 }}
            gl={{ antialias: true, alpha: true }}
          >
            <fog attach="fog" args={["#050505", 8, 22]} />
            <CinematicLights />
            <FlyScene progress={progress} />
          </Canvas>
        </div>

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <p className="hud-label text-center">SCROLL TO FLY — INTERACTIVE FLIGHT SEQUENCE</p>
        </div>

        {STEPS.map(([k, v], i) => (
          <div
            key={k}
            className={`fly-cap-${i} absolute inset-x-0 bottom-[18%] z-10 text-center px-6 opacity-0`}
          >
            <p className="hud-label mb-2">{k}</p>
            <p className="font-display font-bold text-2xl sm:text-4xl text-alv-snow uppercase tracking-tight">{v}</p>
          </div>
        ))}

        {/* Lens portal */}
        <div ref={portalRef} className="absolute inset-0 z-20" style={{ clipPath: "circle(0% at 50% 50%)" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${IMG.aerialVolcano})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-alv-ink via-transparent to-alv-ink/60" />
          <div className="portal-text absolute inset-0 flex flex-col items-center justify-center text-center px-6 opacity-0">
            <p className="hud-label mb-4">THROUGH THE LENS</p>
            <h2 className="font-display font-extrabold uppercase text-4xl sm:text-6xl lg:text-7xl leading-[0.95] text-alv-snow max-w-4xl">
              From here, everything looks <span className="text-alv-green">different.</span>
            </h2>
            <p className="mt-5 text-sm sm:text-base text-alv-snow/70 max-w-md">
              Karena sudut pandang yang berbeda bisa mengubah cara kita bercerita.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
