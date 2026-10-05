import { useRef } from "react";
import { motion } from "framer-motion";
import { IMG, scrollToId } from "@/lib/config";

const MISSIONS = [
  { t: "WEDDING", d: "Abadikan hari spesial dari sudut yang lebih luas.", img: IMG.wedding, span: "md:col-span-2 md:row-span-2" },
  { t: "PREWEDDING", d: "Bangun cerita visual yang lebih cinematic.", img: IMG.prewedding, span: "" },
  { t: "EVENT", d: "Dokumentasikan momen besar dari udara.", img: IMG.concert, span: "" },
  { t: "TOURISM", d: "Promosikan destinasi dengan perspektif yang lebih menarik.", img: IMG.volcano, span: "md:row-span-2" },
  { t: "PROPERTY", d: "Tampilkan properti dengan visual yang lebih profesional.", img: IMG.villa, span: "" },
  { t: "HIKING", d: "Abadikan perjalanan dan pemandangan dari atas.", img: IMG.hiker, span: "" },
  { t: "UMKM", d: "Buat konten bisnis yang lebih menarik.", img: IMG.food, span: "" },
  { t: "SOCIAL MEDIA", d: "Konten lebih standout untuk Instagram, TikTok, dan media sosial.", img: IMG.creator, span: "md:col-span-2" },
];

function MissionCard({ m, i }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg)`;
  };
  const onLeave = () => {
    ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <motion.button
      ref={ref}
      data-testid={`mission-card-${m.t.toLowerCase().replace(/\s/g, "-")}`}
      data-cursor="EXPLORE"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => scrollToId("booking")}
      className={`group relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-0 text-left transition-shadow duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.6)] ${m.span}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <img
        src={m.img}
        alt={m.t}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-alv-ink via-alv-ink/25 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_120%,rgba(114,240,168,0.18),transparent_60%)]" />
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <p className="font-mono text-[9px] tracking-[0.3em] text-alv-green mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
          MISSION 0{i + 1}
        </p>
        <h3 className="font-display font-bold uppercase tracking-tight text-xl sm:text-2xl text-alv-snow group-hover:tracking-wide transition-all duration-500">
          {m.t}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-alv-snow/60 max-w-xs leading-relaxed">{m.d}</p>
      </div>
    </motion.button>
  );
}

export default function Missions() {
  return (
    <section id="layanan" data-testid="missions-section" className="relative bg-alv-pine py-24 sm:py-32">
      <div className="section-pad max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <div>
            <p className="hud-label mb-4">03 — MISSION SELECTOR</p>
            <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
              What are we <span className="text-outline-green">capturing?</span>
            </h2>
          </div>
          <p className="text-alv-mist text-sm sm:text-base max-w-xs leading-relaxed">
            "Kamu punya momen. Kami bantu melihatnya dari perspektif berbeda."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[230px] gap-4">
          {MISSIONS.map((m, i) => (
            <MissionCard key={m.t} m={m} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
