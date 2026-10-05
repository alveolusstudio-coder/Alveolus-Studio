import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor-active");

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let raf;

    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.16;
      ring.y += (pos.y - ring.y) * 0.16;
      if (ringRef.current) ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px)`;
      raf = requestAnimationFrame(loop);
    };

    const over = (e) => {
      const t = e.target.closest("[data-cursor], a, button, select, input, textarea, [role='button']");
      const label = t?.getAttribute?.("data-cursor");
      if (ringRef.current) {
        ringRef.current.dataset.state = t ? "hover" : "default";
      }
      if (labelRef.current) {
        labelRef.current.textContent = label || "";
        labelRef.current.style.opacity = label ? "1" : "0";
      }
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      cancelAnimationFrame(raf);
      document.body.classList.remove("custom-cursor-active");
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 z-[200] pointer-events-none -ml-[3px] -mt-[3px]">
        <div className="w-1.5 h-1.5 rounded-full bg-alv-green" />
      </div>
      <div
        ref={ringRef}
        data-state="default"
        className="fixed top-0 left-0 z-[199] pointer-events-none -ml-5 -mt-5 transition-[width,height,margin] duration-300 data-[state=hover]:-ml-8 data-[state=hover]:-mt-8"
      >
        <div className="w-10 h-10 rounded-full border border-alv-green/50 flex items-center justify-center transition-all duration-300 [*[data-state=hover]>&]:w-16 [*[data-state=hover]>&]:h-16 [*[data-state=hover]>&]:bg-alv-green/10 [*[data-state=hover]>&]:border-alv-green">
          <span ref={labelRef} className="font-mono text-[8px] tracking-[0.2em] text-alv-green opacity-0 transition-opacity duration-200" />
        </div>
      </div>
    </>
  );
}
