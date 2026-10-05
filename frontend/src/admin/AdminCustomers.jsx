import { useEffect, useState } from "react";
import { api, fmtDateTime } from "./api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get("/admin/customers").then((r) => setCustomers(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-customers-page" className="max-w-5xl">
      <p className="hud-label mb-2">PELANGGAN</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Database Pelanggan</h1>
      <p className="mt-2 text-sm text-alv-mist">Riwayat pelanggan berdasarkan booking yang masuk.</p>

      <div className="mt-8 space-y-3">
        {customers.length === 0 && (
          <div className="glass rounded-2xl p-8 border border-white/10 text-center text-sm text-alv-dim">Belum ada data pelanggan.</div>
        )}
        {customers.map((c, i) => (
          <div key={c.phone || i} data-testid={`customer-row-${i}`} className="glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-alv-green/10 border border-alv-green/25 flex items-center justify-center font-display font-bold text-alv-green">
              {(c.name || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-alv-snow">{c.name}</p>
              <p className="font-mono text-[11px] text-alv-dim">{c.phone}</p>
            </div>
            <div className="text-sm text-alv-mist">
              <span className="text-alv-snow font-semibold">{c.total_bookings}</span> booking
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.packages.map((p) => (
                <span key={p} className="rounded-full border border-alv-green/25 bg-alv-green/5 text-alv-green font-mono text-[9px] tracking-wider px-2.5 py-1">{p}</span>
              ))}
            </div>
            <p className="font-mono text-[10px] text-alv-dim whitespace-nowrap">Terakhir: {fmtDateTime(c.last_booking)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
