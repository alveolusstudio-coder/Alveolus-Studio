import { motion } from "framer-motion";
import { Clapperboard, BatteryCharging, MessagesSquare, SlidersHorizontal } from "lucide-react";

const REASONS = [
  { icon: Clapperboard, t: "VISUAL LEBIH BERKELAS", d: "Cinematic perspective untuk membuat konten lebih menarik." },
  { icon: BatteryCharging, t: "PERALATAN SIAP TERBANG", d: "DJI Mini 3 dengan perlengkapan yang siap digunakan." },
  { icon: MessagesSquare, t: "BOOKING MUDAH", d: "Proses booking cepat dan praktis melalui WhatsApp." },
  { icon: SlidersHorizontal, t: "FLEKSIBEL", d: "Sesuaikan paket dengan kebutuhan project kamu." },
];

export default function WhyAlveolus() {
  return (
    <section id="keunggulan" data-testid="why-section" className="relative bg-alv-ink py-24 sm:py-32">
      <div className="section-pad max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="hud-label mb-4">08 — WHY ALVEOLUS</p>
          <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
            Kenapa <span className="text-alv-green">Alveolus?</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.t}
              data-testid={`why-card-${i}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group glass rounded-2xl p-7 border border-white/10 hover:border-alv-green/35 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
            >
              <div className="w-11 h-11 rounded-xl bg-alv-green/10 border border-alv-green/25 flex items-center justify-center mb-6 group-hover:bg-alv-green/20 transition-colors duration-500">
                <r.icon className="w-5 h-5 text-alv-green" strokeWidth={1.6} />
              </div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-alv-dim mb-2">0{i + 1}</p>
              <h3 className="font-display font-bold text-base sm:text-lg text-alv-snow uppercase tracking-tight leading-snug">
                {r.t}
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-alv-mist leading-relaxed">{r.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
