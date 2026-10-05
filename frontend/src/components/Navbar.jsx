import { useEffect, useState } from "react";
import { LogoMark, scrollToId } from "@/lib/config";
import Magnetic from "@/components/Magnetic";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "drone", label: "Drone" },
  { id: "layanan", label: "Layanan" },
  { id: "paket", label: "Paket" },
  { id: "portfolio", label: "Portfolio" },
  { id: "booking", label: "Booking" },
];

export default function Navbar({ visible }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-38% 0px -55% 0px" }
    );
    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);

  const go = (id) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      data-testid="main-nav"
      className={`fixed top-0 inset-x-0 z-[110] transition-all duration-700 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div
        className={`mx-auto mt-3 sm:mt-5 max-w-6xl px-4 transition-all duration-500 ${
          scrolled ? "" : ""
        }`}
      >
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 sm:px-6 py-3 transition-all duration-500 border ${
            scrolled
              ? "glass border-alv-green/15 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              : "bg-transparent border-transparent"
          }`}
        >
          <button
            data-testid="nav-logo"
            data-cursor="HOME"
            onClick={() => go("home")}
            className="flex items-center gap-2.5 group"
          >
            <LogoMark className="w-6 h-6 transition-transform duration-500 group-hover:rotate-[360deg]" />
            <span className="font-display font-bold tracking-[0.2em] text-xs sm:text-sm text-alv-snow">
              ALVEOLUS<span className="text-alv-green">.STUDIO</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-7">
            {LINKS.map(({ id, label }) => (
              <button
                key={id}
                data-testid={`nav-link-${id}`}
                onClick={() => go(id)}
                className="relative font-mono text-[10px] uppercase tracking-[0.25em] text-alv-mist hover:text-alv-snow transition-colors duration-300 py-1"
              >
                {label}
                <span
                  className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-alv-green transition-all duration-300 ${
                    active === id ? "opacity-100 scale-100 shadow-[0_0_8px_rgba(114,240,168,0.9)]" : "opacity-0 scale-0"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Magnetic>
              <button
                data-testid="nav-booking-btn"
                data-cursor="BOOKING"
                onClick={() => go("booking")}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-alv-green text-alv-ink font-semibold text-xs px-5 py-2.5 tracking-wide hover:shadow-[0_0_30px_rgba(114,240,168,0.45)] transition-shadow duration-300"
              >
                Booking Sekarang
                <span aria-hidden>→</span>
              </button>
            </Magnetic>
            <button
              data-testid="nav-menu-toggle"
              aria-label="Menu"
              onClick={() => setOpen(!open)}
              className="lg:hidden flex flex-col gap-1.5 p-2"
            >
              <span className={`w-6 h-px bg-alv-snow transition-transform duration-300 ${open ? "rotate-45 translate-y-[3.5px]" : ""}`} />
              <span className={`w-6 h-px bg-alv-snow transition-transform duration-300 ${open ? "-rotate-45 -translate-y-[3.5px]" : ""}`} />
            </button>
          </div>
        </nav>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-500 ${
            open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
          }`}
        >
          <div className="glass rounded-2xl p-5 flex flex-col gap-4 border border-alv-green/15">
            {LINKS.map(({ id, label }) => (
              <button
                key={id}
                data-testid={`nav-mobile-${id}`}
                onClick={() => go(id)}
                className={`text-left font-display font-bold uppercase tracking-wider text-lg ${
                  active === id ? "text-alv-green" : "text-alv-snow"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              data-testid="nav-mobile-booking-btn"
              onClick={() => go("booking")}
              className="mt-2 rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-5 py-3"
            >
              Booking Sekarang →
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
