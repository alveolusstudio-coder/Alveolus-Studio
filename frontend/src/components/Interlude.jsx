import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { DroneModel } from "@/components/three/DroneModel";
import { IS_MOBILE } from "@/lib/config";

const LINES = ["YOU'RE NOT", "RENTING A DRONE.", "YOU'RE RENTING", "A DIFFERENT", "PERSPECTIVE."];

function EmergenceScene({ progress }) {
  const drone = useRef();
  const spot = useRef();
  useFrame((state, d) => {
    const p = progress.current.v;
    if (drone.current) {
      drone.current.position.z = THREE.MathUtils.damp(drone.current.position.z, THREE.MathUtils.lerp(-9, -2.2, p), 3, d);
      drone.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 0.1;
      drone.current.rotation.y += d * 0.15;
    }
    if (spot.current) {
      spot.current.intensity = THREE.MathUtils.damp(spot.current.intensity, THREE.MathUtils.lerp(2, 40, p), 3, d);
    }
  });
  return (
    <>
      <ambientLight intensity={0.04} />
      <spotLight ref={spot} position={[0, 5, 2]} angle={0.5} penumbra={0.8} intensity={2} color="#e8fff1" />
      <pointLight position={[0, -2, 1]} intensity={0.4} color="#72F0A8" distance={5} />
      <group ref={drone} position={[0, 0, -9]}>
        <DroneModel scale={1.4} />
      </group>
    </>
  );
}

export default function Interlude() {
  const rootRef = useRef(null);
  const progress = useRef({ v: 0 });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const trigger = {
        trigger: rootRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
      };
      gsap.timeline({
        scrollTrigger: { ...trigger, onUpdate: (s) => (progress.current.v = s.progress) },
      });

      const tl = gsap.timeline({ scrollTrigger: trigger });
      LINES.forEach((_, i) => {
        tl.fromTo(
          `.inter-line-${i}`,
          { autoAlpha: 0, y: 50, filter: "blur(8px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out" },
          i * 0.9 + 0.2
        );
      });
      tl.fromTo(
        ".inter-id",
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.3, ease: "power2.out" },
        LINES.length * 0.9 + 0.4
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} data-testid="interlude-section" className="relative h-[420vh] bg-black">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-90">
          <Canvas
            dpr={IS_MOBILE ? [1, 1.5] : [1, 2]}
            camera={{ position: [0, 0.2, 4.5], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
          >
            <fog attach="fog" args={["#000000", 3.5, 11]} />
            <EmergenceScene progress={progress} />
          </Canvas>
        </div>

        <div className="relative z-10 text-center px-6">
          <h2 className="font-display font-extrabold uppercase leading-[1.02] tracking-tight text-[9vw] sm:text-6xl lg:text-7xl">
            {LINES.map((l, i) => (
              <span
                key={l}
                className={`inter-line-${i} block opacity-0 will-change-transform ${
                  l === "PERSPECTIVE." ? "text-alv-green" : "text-alv-snow"
                }`}
              >
                {l}
              </span>
            ))}
          </h2>
          <div className="mt-10 space-y-2">
            <p className="inter-id opacity-0 text-sm sm:text-lg text-alv-snow/80 font-display">
              "Kamu bukan hanya menyewa drone."
            </p>
            <p className="inter-id opacity-0 text-sm sm:text-lg text-alv-green font-display italic">
              "Kamu menyewa sebuah perspektif."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
