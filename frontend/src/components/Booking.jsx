import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { toast } from "sonner";
import { DroneModel, CinematicLights } from "@/components/three/DroneModel";
import { API_URL, WA_NUMBER, IS_MOBILE } from "@/lib/config";
import Magnetic from "@/components/Magnetic";

function BookingDrone({ mode }) {
  const drone = useRef();
  useFrame((state, d) => {
    if (!drone.current) return;
    const t = state.clock.elapsedTime;
    drone.current.position.y = Math.sin(t * 1.2) * 0.12;
    if (mode === "CINEMATIC") {
      drone.current.rotation.y += d * 0.45;
      drone.current.rotation.z = THREE.MathUtils.damp(drone.current.rotation.z, 0.06, 3, d);
    } else if (mode === "PREMIUM") {
      drone.current.rotation.y += d * 1.1;
      drone.current.rotation.z = Math.sin(t * 0.8) * 0.16;
      drone.current.position.x = Math.sin(t * 0.5) * 0.25;
    } else {
      drone.current.rotation.y = THREE.MathUtils.damp(drone.current.rotation.y, 0.6, 3, d);
      drone.current.rotation.z = THREE.MathUtils.damp(drone.current.rotation.z, 0, 3, d);
    }
  });
  return (
    <group ref={drone}>
      <DroneModel scale={1.35} />
    </group>
  );
}

const inputCls =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-sm text-alv-snow placeholder:text-alv-dim outline-none focus:border-alv-green/60 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(114,240,168,0.08)] transition-all duration-300";

export default function Booking() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    location: "",
    package: "CINEMATIC",
    category: "Wedding",
    notes: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onPkg = (e) => setForm((f) => ({ ...f, package: e.detail }));
    window.addEventListener("alveolus:package", onPkg);
    return () => window.removeEventListener("alveolus:package", onPkg);
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    try {
      await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      toast.success("Booking tersimpan — membuka WhatsApp...");
    } catch {
      toast.warning("Koneksi server lambat — tetap membuka WhatsApp.");
    }

    const msg = [
      "Halo ALVEOLUS.STUDIO! Saya ingin booking DJI Mini 3.",
      "",
      `Nama: ${form.name}`,
      `Nomor WhatsApp: ${form.phone}`,
      `Tanggal Sewa: ${form.date}`,
      `Lokasi: ${form.location}`,
      `Paket: ${form.package}`,
      `Kebutuhan: ${form.category}`,
      `Catatan: ${form.notes || "-"}`,
    ].join("\n");

    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    setSending(false);
  };

  return (
    <section id="booking" data-testid="booking-section" className="relative bg-alv-pine py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(114,240,168,0.06),transparent_55%)]" />
      <div className="section-pad max-w-7xl mx-auto relative">
        <div className="text-center mb-14">
          <p className="hud-label mb-4">07 — BOOKING</p>
          <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-tight text-4xl sm:text-5xl lg:text-6xl">
            Siap Terbang <span className="text-alv-green">Bersama Kami?</span>
          </h2>
          <p className="mt-5 text-alv-mist text-sm sm:text-base max-w-md mx-auto">
            "Isi detail kebutuhanmu dan kami akan menghubungimu melalui WhatsApp."
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <form
            data-testid="booking-form"
            onSubmit={submit}
            className="glass rounded-3xl p-7 sm:p-9 border border-alv-green/15 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="hud-label block mb-2">Nama</label>
                <input data-testid="booking-input-name" required value={form.name} onChange={set("name")} placeholder="Nama lengkap" className={inputCls} />
              </div>
              <div>
                <label className="hud-label block mb-2">Nomor WhatsApp</label>
                <input data-testid="booking-input-phone" required type="tel" value={form.phone} onChange={set("phone")} placeholder="08xx xxxx xxxx" className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="hud-label block mb-2">Tanggal Sewa</label>
                <input data-testid="booking-input-date" required type="date" value={form.date} onChange={set("date")} className={`${inputCls} [color-scheme:dark]`} />
              </div>
              <div>
                <label className="hud-label block mb-2">Lokasi</label>
                <input data-testid="booking-input-location" required value={form.location} onChange={set("location")} placeholder="Cth: Ubud, Bali" className={inputCls} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="hud-label block mb-2">Pilih Paket</label>
                <select data-testid="booking-select-package" value={form.package} onChange={set("package")} className={inputCls}>
                  <option value="BASIC">Basic — Drone Only</option>
                  <option value="CINEMATIC">Cinematic — Drone + Editing</option>
                  <option value="PREMIUM">Premium — Full Experience</option>
                </select>
              </div>
              <div>
                <label className="hud-label block mb-2">Jenis Kebutuhan</label>
                <select data-testid="booking-select-category" value={form.category} onChange={set("category")} className={inputCls}>
                  {["Wedding", "Prewedding", "Event", "Tourism", "Property", "Hiking", "UMKM / Bisnis", "Social Media", "Lainnya"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="hud-label block mb-2">Catatan / Detail Project</label>
              <textarea data-testid="booking-input-notes" rows={3} value={form.notes} onChange={set("notes")} placeholder="Ceritakan konsep atau kebutuhan khusus..." className={`${inputCls} resize-none`} />
            </div>

            <Magnetic className="w-full">
              <button
                data-testid="booking-submit-btn"
                data-cursor="SEND"
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-6 py-4 hover:shadow-[0_0_40px_rgba(114,240,168,0.5)] transition-all duration-300 disabled:opacity-60"
              >
                {sending ? "Memproses..." : "Booking via WhatsApp →"}
              </button>
            </Magnetic>
            <p className="text-center font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase">
              Respon cepat · Tanpa biaya tersembunyi
            </p>
          </form>

          <div className="relative h-[380px] sm:h-[480px] hidden md:block">
            <Canvas
              dpr={IS_MOBILE ? [1, 1.5] : [1, 2]}
              camera={{ position: [0, 0.3, 5.4], fov: 40 }}
              gl={{ antialias: true, alpha: true }}
            >
              <fog attach="fog" args={["#0D0F0E", 8, 18]} />
              <CinematicLights />
              <BookingDrone mode={form.package} />
            </Canvas>
            <div className="absolute bottom-4 inset-x-0 text-center">
              <p className="font-mono text-[10px] tracking-[0.3em] text-alv-dim uppercase">
                MODE: <span className="text-alv-green">{form.package}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
