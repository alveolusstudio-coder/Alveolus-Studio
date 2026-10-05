import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DroneGlyph } from "@/lib/config";

const BOOT_LINES = [
  "INITIALIZING SYSTEM...",
  "CAMERA 4K ONLINE",
  "3-AXIS GIMBAL BALANCED",
  "GPS LOCKED — 14 SATELLITES",
  "READY TO FLY",
];

export default function BootSequence({ onDone }) {
  const rootRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    window.__lenis?.stop();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.__lenis?.start();
      onDone?.();
    };

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.to(rootRef.current, { autoAlpha: 0, duration: 0.4, delay: 0.4, onComplete: finish });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".boot-dot", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 })
        .to(".boot-dot", { scale: 1.6, repeat: 2, yoyo: true, duration: 0.28 }, ">")
        .fromTo(
          ".boot-brand span",
          { yPercent: 120 },
          { yPercent: 0, duration: 0.9, stagger: 0.045, ease: "power4.out" },
          "-=0.3"
        )
        .fromTo(
          ".boot-line",
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: 0.32, stagger: 0.42, ease: "power2.out" },
          "-=0.2"
        )
        .fromTo(".boot-bar-fill", { scaleX: 0 }, { scaleX: 1, duration: 2.1, ease: "power1.inOut" }, "<")
        .fromTo(".boot-drone", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.1 }, "-=1.4")
        .fromTo(".boot-spot", { opacity: 0 }, { opacity: 1, duration: 1.1 }, "<")
        .to(".boot-drone", { scale: 14, opacity: 0, duration: 0.9, ease: "power3.in" }, "+=0.35")
        .to(".boot-flash", { opacity: 0.9, duration: 0.12 }, "-=0.55")
        .to(".boot-flash", { opacity: 0, duration: 0.4 })
        .to(rootRef.current, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.inOut",
          onComplete: finish,
        }, "-=0.35");
    }, rootRef);

    const skip = () => finish();
    const el = rootRef.current;
    el.addEventListener("click", skip);
    return () => {
      el.removeEventListener("click", skip);
      ctx.revert();
    };
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      data-testid="boot-sequence"
      className="fixed inset-0 z-[120] bg-alv-ink flex items-center justify-center overflow-hidden"
    >
      <div className="boot-spot absolute inset-0 opacity-0 bg-[radial-gradient(circle_at_50%_45%,rgba(114,240,168,0.14),transparent_55%)]" />
      <div className="boot-flash absolute inset-0 bg-alv-green opacity-0 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <div className="boot-dot w-2.5 h-2.5 rounded-full bg-alv-green shadow-[0_0_24px_rgba(114,240,168,0.9)]" />

        <div className="overflow-hidden">
          <h1 className="boot-brand font-display font-extrabold tracking-[0.18em] text-2xl sm:text-4xl text-alv-snow">
            {"ALVEOLUS.STUDIO".split("").map((c, i) => (
              <span key={i} className="inline-block will-change-transform">
                {c === "." ? <span className="text-alv-green">.</span> : c}
              </span>
            ))}
          </h1>
        </div>

        <div className="boot-drone opacity-0">
          <DroneGlyph className="w-20 h-20 sm:w-24 sm:h-24" stroke="#F5F5F5" />
        </div>

        <div className="flex flex-col items-start gap-1.5 min-h-[110px]">
          {BOOT_LINES.map((l, i) => (
            <p key={l} className="boot-line opacity-0 font-mono text-[10px] sm:text-xs tracking-[0.25em] text-alv-mist">
              <span className="text-alv-green mr-2">▸</span>
              {l}
              {i === BOOT_LINES.length - 1 && <span className="text-alv-green ml-2">✓</span>}
            </p>
          ))}
        </div>

        <div className="w-48 h-px bg-white/10 overflow-hidden">
          <div className="boot-bar-fill h-full w-full bg-alv-green origin-left" />
        </div>

        <p className="font-mono text-[9px] tracking-[0.3em] text-alv-dim uppercase">Click anywhere to skip</p>
      </div>
    </div>
  );
}
