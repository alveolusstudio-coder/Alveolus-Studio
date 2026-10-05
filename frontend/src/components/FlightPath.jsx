import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DroneGlyph, IMG } from "@/lib/config";

const STAGES = [
  { n: "01", t: "RENCANA", d: "Menentukan kebutuhan dan konsep pengambilan.", pos: "left-[6%] top-[58%]" },
  { n: "02", t: "TERBANG", d: "Menentukan lokasi dan jalur penerbangan.", pos: "left-[30%] top-[16%]" },
  { n: "03", t: "ABADIKAN", d: "Mengambil footage dari perspektif terbaik.", pos: "right-[30%] top-[52%]" },
  { n: "04", t: "CERITAKAN", d: "Mengolah footage menjadi visual yang siap digunakan.", pos: "right-[5%] top-[12%]" },
];

export default function FlightPath() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = rootRef.current.querySelector("#flight-path-line");
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      tl.to(path, { strokeDashoffset: 0, duration: 4, ease: "none" }, 0)
        .to(
          "#flight-marker",
          {
            motionPath: {
              path: "#flight-path-line",
              align: "#flight-path-line",
              alignOrigin: [0.5, 0.5],
            },
            duration: 4,
            ease: "none",
          },
          0
        )
        .fromTo(".flight-bg", { scale: 1.15 }, { scale: 1, duration: 4, ease: "none" }, 0);

      STAGES.forEach((_, i) => {
        tl.fromTo(
          `.flight-stage-${i}`,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          i + 0.25
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="proses" ref={rootRef} data-testid="flight-path-section" className="relative h-[420vh] bg-alv-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img
          src={IMG.jungle}
          alt=""
          className="flight-bg absolute inset-0 w-full h-full object-cover opacity-25 will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-alv-ink via-alv-ink/40 to-alv-ink" />

        <div className="absolute top-10 inset-x-0 text-center z-10 px-6">
          <p className="hud-label mb-3">05 — FLIGHT PATH</p>
          <h2 className="font-display font-extrabold uppercase tracking-tight text-4xl sm:text-5xl lg:text-6xl">
            Dari Ide Menjadi <span className="text-alv-green">Visual.</span>
          </h2>
        </div>

        <svg
          viewBox="0 0 1200 620"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d="M 60 540 C 260 500 240 300 430 290 C 620 280 580 470 760 420 C 920 376 950 190 1140 130"
            stroke="rgba(114,240,168,0.12)"
            strokeWidth="2"
            strokeDasharray="6 8"
          />
          <path
            id="flight-path-line"
            d="M 60 540 C 260 500 240 300 430 290 C 620 280 580 470 760 420 C 920 376 950 190 1140 130"
            stroke="#72F0A8"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(114,240,168,0.7))" }}
          />
        </svg>

        <div id="flight-marker" className="absolute top-0 left-0 z-10 will-change-transform">
          <div className="relative -translate-y-1/2">
            <DroneGlyph className="w-12 h-12 sm:w-16 sm:h-16 drop-shadow-[0_0_18px_rgba(114,240,168,0.6)]" />
            <span className="led-blink absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-alv-green shadow-[0_0_10px_rgba(114,240,168,1)]" />
          </div>
        </div>

        {STAGES.map((s, i) => (
          <div key={s.n} className={`flight-stage-${i} absolute ${s.pos} z-10 max-w-[240px] sm:max-w-xs opacity-0 px-2`}>
            <div className="glass rounded-2xl p-5 border border-alv-green/20">
              <p className="font-mono text-[10px] tracking-[0.3em] text-alv-green mb-2">{s.n} —</p>
              <h3 className="font-display font-bold uppercase text-lg sm:text-xl text-alv-snow">{s.t}</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-alv-mist leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
