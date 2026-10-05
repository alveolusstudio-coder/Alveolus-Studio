import { useEffect, useRef } from "react";
import gsap from "gsap";
import { DroneGlyph, IMG, LogoMark, WA_NUMBER, scrollToId } from "@/lib/config";
import Magnetic from "@/components/Magnetic";
import Marquee from "@/components/Marquee";

export default function FinalFlight() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });
      tl.fromTo(".final-bg", { scale: 1.18 }, { scale: 1, duration: 4, ease: "none" }, 0)
        .fromTo(
          ".final-drone",
          { y: 0, scale: 1, opacity: 1 },
          { y: -320, scale: 0.14, opacity: 0.85, duration: 2.6, ease: "power1.in" },
          0.2
        )
        .fromTo(".final-line-1", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.2)
        .fromTo(".final-line-2", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.55)
        .fromTo(".final-line-3", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.0)
        .fromTo(".final-brand", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 2.5)
        .fromTo(".final-cta", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.9);
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="akhir" ref={rootRef} data-testid="final-flight-section" className="relative h-[380vh] bg-alv-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <img src={IMG.volcano} alt="" className="final-bg absolute inset-0 w-full h-full object-cover opacity-70 will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-b from-alv-ink via-transparent to-alv-ink/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,rgba(215,181,109,0.14),transparent_60%)]" />

        <div className="final-drone absolute left-1/2 top-[58%] -translate-x-1/2 will-change-transform">
          <DroneGlyph className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_25px_rgba(0,0,0,0.8)]" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
          <h2 className="font-display font-extrabold uppercase leading-[0.98] tracking-tight text-[10vw] sm:text-6xl lg:text-8xl">
            <span className="final-line-1 block opacity-0 text-alv-snow">The world is bigger</span>
            <span className="final-line-2 block opacity-0 text-alv-green">from up here.</span>
          </h2>
          <p className="final-line-3 opacity-0 mt-6 text-sm sm:text-lg text-alv-snow/75 font-display italic">
            "Dunia terlihat berbeda dari atas."
          </p>

          <div className="final-brand opacity-0 mt-14 flex flex-col items-center gap-4">
            <LogoMark className="w-12 h-12" />
            <p className="font-display font-extrabold tracking-[0.25em] text-xl sm:text-2xl text-alv-snow">
              ALVEOLUS<span className="text-alv-green">.STUDIO</span>
            </p>
            <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-alv-gold uppercase">
              See the world differently.
            </p>
          </div>

          <div className="final-cta opacity-0 mt-10">
            <Magnetic>
              <button
                data-testid="final-booking-btn"
                data-cursor="BOOKING"
                onClick={() => scrollToId("booking")}
                className="rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-8 py-4 hover:shadow-[0_0_50px_rgba(114,240,168,0.55)] transition-shadow duration-300"
              >
                Booking Drone →
              </button>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 inset-x-0 z-20">
        <Marquee
          items={["ALVEOLUS.STUDIO", "DRONE RENTAL & VISUAL PRODUCTION", "DJI MINI 3", "BALI & BEYOND"]}
          className="bg-alv-ink/80 backdrop-blur"
        />
        <footer className="bg-alv-ink/90 backdrop-blur border-t border-white/5 section-pad py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2.5">
              <LogoMark className="w-5 h-5" />
              <span className="font-mono text-[10px] tracking-[0.25em] text-alv-mist uppercase">
                © 2026 Alveolus.Studio
              </span>
            </div>
            <div className="flex items-center gap-6">
              {["home", "paket", "portfolio", "booking"].map((id) => (
                <button
                  key={id}
                  data-testid={`footer-link-${id}`}
                  onClick={() => scrollToId(id)}
                  className="font-mono text-[10px] tracking-[0.25em] text-alv-dim hover:text-alv-green uppercase transition-colors"
                >
                  {id}
                </button>
              ))}
              <a
                data-testid="footer-whatsapp-link"
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] tracking-[0.25em] text-alv-green uppercase hover:text-alv-snow transition-colors"
              >
                WhatsApp ↗
              </a>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
