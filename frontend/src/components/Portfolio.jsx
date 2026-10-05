import { useEffect, useRef } from "react";
import gsap from "gsap";
import { IMG } from "@/lib/config";

const PROJECTS = [
  { img: IMG.aerialVolcano, loc: "MOUNT BATUR, BALI", type: "AERIAL", meta: "DJI MINI 3 · 4K/30 · ISO 100" },
  { img: IMG.aerialCoast, loc: "ULUWATU CLIFF, BALI", type: "CINEMATIC", meta: "DJI MINI 3 · 4K/30 · GOLDEN HOUR" },
  { img: IMG.aerialRice, loc: "TEGALLALANG, UBUD", type: "TOURISM", meta: "DJI MINI 3 · 4K/30 · TOP-DOWN" },
  { img: IMG.cityDusk, loc: "JAKARTA SELATAN", type: "EVENT", meta: "DJI MINI 3 · 4K/30 · BLUE HOUR" },
  { img: IMG.jungle, loc: "UBUD RAINFOREST", type: "AERIAL", meta: "DJI MINI 3 · 4K/30 · MISTY AM" },
  { img: IMG.villaPool, loc: "CANGGU VILLA", type: "PROPERTY", meta: "DJI MINI 3 · 4K/30 · TOP-DOWN" },
];

export default function Portfolio() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      const track = trackRef.current;
      const dist = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: () => `+=${dist()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="portfolio" ref={rootRef} data-testid="portfolio-section" className="relative bg-alv-pine overflow-hidden">
      <div className="md:h-screen flex flex-col justify-center py-24 md:py-0">
        <div className="section-pad max-w-7xl mx-auto w-full mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="hud-label mb-4">06 — PORTFOLIO</p>
            <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
              Captured <span className="text-outline">From Above.</span>
            </h2>
          </div>
          <p className="text-alv-mist text-sm sm:text-base max-w-xs leading-relaxed">
            "Beberapa cerita yang kami lihat dari perspektif berbeda."
          </p>
        </div>

        <div className="overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none" data-lenis-prevent>
          <div ref={trackRef} className="flex gap-5 px-6 sm:px-10 lg:px-20 w-max will-change-transform">
            {PROJECTS.map((p, i) => (
              <article
                key={p.loc}
                data-testid={`portfolio-card-${i}`}
                data-cursor="VIEW"
                className="group relative w-[78vw] sm:w-[52vw] md:w-[38vw] lg:w-[32vw] shrink-0 snap-center overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[4/4] border border-white/5"
              >
                <img
                  src={p.img}
                  alt={p.loc}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-alv-ink via-transparent to-alv-ink/30 opacity-85 group-hover:opacity-95 transition-opacity duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.12] transition-opacity duration-500 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence baseFrequency=%220.8%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

                <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-alv-green bg-alv-ink/60 backdrop-blur px-3 py-1.5 rounded-full border border-alv-green/20">
                    {p.type}
                  </span>
                  <span className="font-mono text-[9px] tracking-[0.2em] text-alv-snow/40">
                    {String(i + 1).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-6">
                  <h3 className="font-display font-bold uppercase text-xl sm:text-2xl text-alv-snow tracking-tight group-hover:tracking-wider transition-all duration-500">
                    {p.loc}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-alv-mist">{p.meta}</p>
                  <div className="mt-3 h-px w-0 group-hover:w-full bg-alv-green transition-all duration-700" />
                </div>
              </article>
            ))}

            <div className="shrink-0 w-[60vw] md:w-[28vw] flex items-center justify-center">
              <p className="font-mono text-xs tracking-[0.3em] text-alv-dim uppercase [writing-mode:vertical-lr] rotate-180">
                More missions coming soon ↗
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
