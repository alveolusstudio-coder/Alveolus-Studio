import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "./api";
import { Plane } from "lucide-react";

const STATUS = {
  siap: { label: "Siap", cls: "text-alv-green border-alv-green/30 bg-alv-green/10" },
  disewa: { label: "Disewa", cls: "text-alv-gold border-alv-gold/30 bg-alv-gold/10" },
  maintenance: { label: "Maintenance", cls: "text-red-400 border-red-400/30 bg-red-400/10" },
};

export default function AdminEquipment() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const r = await api.get("/admin/equipment");
      setItems(r.data);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (item, status) => {
    try {
      await api.patch(`/admin/equipment/${item.key}`, { status });
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div data-testid="admin-equipment-page" className="max-w-4xl">
      <p className="hud-label mb-2">PERALATAN</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Armada & Peralatan</h1>

      <div className="mt-8 space-y-3">
        {items.map((it) => (
          <div key={it.key} data-testid={`equipment-${it.key}`} className="glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-alv-green/10 border border-alv-green/25 flex items-center justify-center">
              <Plane className="w-4.5 h-4.5 text-alv-green w-5 h-5" strokeWidth={1.6} />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-alv-snow">{it.name}</p>
              <p className="font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase">{it.type}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider ${STATUS[it.status]?.cls || STATUS.siap.cls}`}>
              {STATUS[it.status]?.label || it.status}
            </span>
            <div className="flex gap-2">
              {Object.keys(STATUS).filter((s) => s !== it.status).map((s) => (
                <button
                  key={s}
                  data-testid={`equipment-${it.key}-${s}`}
                  onClick={() => setStatus(it, s)}
                  className="rounded-full border border-white/15 text-alv-mist text-[11px] px-3 py-1.5 hover:border-alv-green hover:text-alv-green transition-colors"
                >
                  → {STATUS[s].label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
