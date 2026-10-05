import { useRef } from "react";
import { motion } from "framer-motion";
import { scrollToId } from "@/lib/config";
import Magnetic from "@/components/Magnetic";

const PACKAGES = [
  {
    id: "basic",
    tag: "PAKET 01",
    name: "BASIC",
    sub: "Drone Only",
    price: "Mulai Rp350.000",
    features: ["DJI Mini 3", "Remote Controller", "Baterai", "Perlengkapan dasar", "Briefing penggunaan"],
    desc: "Untuk kamu yang sudah terbiasa menerbangkan drone.",
    popular: false,
  },
  {
    id: "cinematic",
    tag: "PAKET 02",
    name: "CINEMATIC",
    sub: "Drone + Editing",
    price: "Mulai Rp500.000",
    features: ["DJI Mini 3", "Remote Controller", "Baterai", "Briefing penggunaan", "Editing video cinematic", "File hasil pengambilan"],
    desc: "Untuk kamu yang ingin langsung mendapatkan footage siap digunakan.",
    popular: true,
  },
  {
    id: "premium",
    tag: "PAKET 03",
    name: "PREMIUM",
    sub: "Full Experience",
    price: "Mulai Rp600.000",
    features: ["DJI Mini 3", "Remote Controller", "Baterai", "Briefing penggunaan", "Bantuan pilot", "Editing video cinematic", "Prioritas layanan"],
    desc: "Untuk kebutuhan project yang membutuhkan bantuan lebih lengkap.",
    popular: false,
  },
];

function TiltCard({ p, i }) {
  const ref = useRef(null);
  const glowRef = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-8px)`;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(114,240,168,0.16), transparent 55%)`;
    }
  };
  const onLeave = () => {
    ref.current.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateY(0)";
  };

  const choose = () => {
    window.dispatchEvent(new CustomEvent("alveolus:package", { detail: p.name }));
    scrollToId("booking");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className={p.popular ? "lg:-mt-8" : ""}
    >
      <div
        ref={ref}
        data-testid={`package-card-${p.id}`}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`relative glass rounded-3xl p-8 sm:p-9 transition-[box-shadow,border-color] duration-500 ease-out will-change-transform ${
          p.popular
            ? "border-alv-green/45 shadow-[0_0_70px_rgba(114,240,168,0.14)]"
            : "border-white/10 hover:border-alv-green/30 hover:shadow-[0_0_50px_rgba(114,240,168,0.08)]"
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div ref={glowRef} className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-300" />

        {p.popular && (
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-alv-green text-alv-ink font-mono text-[10px] font-semibold tracking-[0.2em] px-4 py-1.5 shadow-[0_0_25px_rgba(114,240,168,0.5)]">
            PALING POPULER
          </span>
        )}

        <p className="font-mono text-[10px] tracking-[0.3em] text-alv-dim">{p.tag}</p>
        <h3 className={`mt-3 font-display font-extrabold uppercase text-3xl tracking-tight ${p.popular ? "text-alv-green" : "text-alv-snow"}`}>
          {p.name}
        </h3>
        <p className="font-mono text-xs tracking-[0.2em] text-alv-mist uppercase mt-1">{p.sub}</p>

        <p className="mt-6 font-display font-bold text-xl sm:text-2xl text-alv-snow whitespace-nowrap">
          {p.price}
          <span className="block font-mono text-[10px] font-normal tracking-[0.2em] text-alv-dim mt-1">/ HARI</span>
        </p>

        <ul className="mt-7 space-y-2.5 border-t border-white/10 pt-6">
          {p.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-alv-snow/80">
              <span className="text-alv-green mt-0.5">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-xs text-alv-dim leading-relaxed">{p.desc}</p>

        <Magnetic className="w-full mt-7">
          <button
            data-testid={`package-cta-${p.id}`}
            data-cursor="SELECT"
            onClick={choose}
            className={`w-full rounded-full font-semibold text-sm px-6 py-3.5 transition-all duration-300 ${
              p.popular
                ? "bg-alv-green text-alv-ink hover:shadow-[0_0_35px_rgba(114,240,168,0.5)]"
                : "border border-alv-snow/25 text-alv-snow hover:border-alv-green hover:text-alv-green"
            }`}
          >
            Pilih Paket →
          </button>
        </Magnetic>
      </div>
    </motion.div>
  );
}

export default function Packages() {
  return (
    <section id="paket" data-testid="packages-section" className="relative bg-alv-ink py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(114,240,168,0.05),transparent_55%)]" />
      <div className="section-pad max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="hud-label mb-4">04 — PAKET SEWA</p>
          <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
            Pilih Cara <span className="text-alv-green">Terbangmu.</span>
          </h2>
          <p className="mt-5 text-alv-mist text-sm sm:text-base max-w-md mx-auto">
            "Sesuaikan paket dengan kebutuhan pengambilan gambar kamu."
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {PACKAGES.map((p, i) => (
            <TiltCard key={p.id} p={p} i={i} />
          ))}
        </div>

        <p className="mt-12 text-center font-mono text-[10px] tracking-[0.25em] text-alv-dim uppercase">
          Harga mulai — final menyesuaikan durasi, lokasi & kebutuhan project
        </p>
      </div>
    </section>
  );
}
