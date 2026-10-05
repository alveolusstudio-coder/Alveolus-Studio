import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg, rupiah } from "./api";

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [prices, setPrices] = useState({});

  const load = async () => {
    try {
      const r = await api.get("/admin/packages");
      setPackages(r.data);
      setPrices(Object.fromEntries(r.data.map((p) => [p.key, p.price])));
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (p, patch) => {
    try {
      await api.patch(`/admin/packages/${p.key}`, patch);
      toast.success("Paket berhasil diperbarui.");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div data-testid="admin-packages-page" className="max-w-5xl">
      <p className="hud-label mb-2">PAKET & HARGA</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Kelola Paket Sewa</h1>
      <p className="mt-2 text-sm text-alv-mist">Perubahan harga tercatat di audit log.</p>

      <div className="mt-8 grid md:grid-cols-3 gap-5">
        {packages.map((p) => (
          <div key={p.key} data-testid={`admin-package-${p.key}`} className={`glass rounded-2xl p-6 border ${p.is_active ? "border-alv-green/20" : "border-white/10 opacity-60"}`}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-alv-dim uppercase">{p.sub}</p>
            <h3 className="mt-1 font-display font-extrabold text-2xl text-alv-snow">{p.name}</h3>

            <label className="hud-label block mt-6 mb-2">Harga / Hari (Rp)</label>
            <input
              data-testid={`package-price-${p.key}`}
              type="number"
              min="0"
              value={prices[p.key] ?? ""}
              onChange={(e) => setPrices({ ...prices, [p.key]: Number(e.target.value) })}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-alv-snow outline-none focus:border-alv-green/60 transition-colors"
            />
            <p className="mt-1.5 font-mono text-[10px] text-alv-dim">Saat ini: {rupiah(p.price)}</p>

            <div className="mt-5 flex gap-2">
              <button
                data-testid={`package-save-${p.key}`}
                onClick={() => save(p, { price: prices[p.key] })}
                className="flex-1 rounded-full bg-alv-green text-alv-ink text-xs font-semibold px-4 py-2.5 hover:shadow-[0_0_20px_rgba(114,240,168,0.4)] transition-shadow"
              >
                Simpan Harga
              </button>
              <button
                data-testid={`package-toggle-${p.key}`}
                onClick={() => save(p, { is_active: !p.is_active })}
                className={`rounded-full border text-xs px-4 py-2.5 transition-colors ${
                  p.is_active ? "border-red-400/40 text-red-400 hover:bg-red-400/10" : "border-alv-green/40 text-alv-green hover:bg-alv-green/10"
                }`}
              >
                {p.is_active ? "Nonaktifkan" : "Aktifkan"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
