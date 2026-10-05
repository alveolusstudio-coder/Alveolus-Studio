import { useEffect, useState } from "react";
import { api, errMsg, fmtDate, rupiah, StatusBadge } from "./api";

const TABS = [
  { key: "", label: "Semua" },
  { key: "menunggu", label: "Menunggu" },
  { key: "dikonfirmasi", label: "Dikonfirmasi" },
  { key: "ditolak", label: "Ditolak" },
  { key: "dibatalkan", label: "Dibatalkan" },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("");
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const load = async (status = tab) => {
    try {
      const r = await api.get("/admin/bookings", { params: status ? { status } : {} });
      setBookings(r.data);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const setStatus = async (b, status) => {
    try {
      await api.patch(`/admin/bookings/${b.id}/status`, { status });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div data-testid="admin-bookings-page" className="max-w-6xl">
      <p className="hud-label mb-2">BOOKING</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Semua Booking</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            data-testid={`booking-tab-${t.key || "all"}`}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all ${
              tab === t.key ? "bg-alv-green text-alv-ink font-semibold" : "border border-white/15 text-alv-mist hover:text-alv-snow hover:border-alv-green/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

      <div className="mt-6 glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10">
                {["Kode", "Pelanggan", "Paket", "Tanggal", "Lokasi", "Estimasi", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-alv-dim text-sm">Tidak ada booking pada kategori ini.</td>
                </tr>
              )}
              {bookings.map((b) => (
                <tr key={b.id} data-testid={`booking-row-${b.id}`} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] text-alv-green">{b.booking_code}</td>
                  <td className="px-5 py-4">
                    <p className="text-alv-snow font-medium">{b.name}</p>
                    <p className="font-mono text-[10px] text-alv-dim">{b.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-alv-snow/80">{b.package}</td>
                  <td className="px-5 py-4 text-alv-mist whitespace-nowrap">{fmtDate(b.date)}</td>
                  <td className="px-5 py-4 text-alv-mist">{b.location}</td>
                  <td className="px-5 py-4 text-alv-gold whitespace-nowrap">{rupiah(b.price_estimate)}</td>
                  <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button data-testid={`booking-detail-${b.id}`} onClick={() => setDetail(b)} className="rounded-full border border-white/15 text-alv-snow text-[11px] px-3 py-1.5 hover:border-alv-green hover:text-alv-green transition-colors">Detail</button>
                      {b.status === "menunggu" && (
                        <>
                          <button data-testid={`booking-confirm-${b.id}`} onClick={() => setStatus(b, "dikonfirmasi")} className="rounded-full bg-alv-green/15 border border-alv-green/40 text-alv-green text-[11px] px-3 py-1.5 hover:bg-alv-green hover:text-alv-ink transition-colors">✓</button>
                          <button data-testid={`booking-reject-${b.id}`} onClick={() => setStatus(b, "ditolak")} className="rounded-full border border-red-400/40 text-red-400 text-[11px] px-3 py-1.5 hover:bg-red-400/10 transition-colors">✕</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-alv-ink/80 backdrop-blur flex items-center justify-center p-6" onClick={() => setDetail(null)}>
          <div data-testid="booking-detail-modal" className="glass rounded-3xl p-8 max-w-md w-full border border-alv-green/20" onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-alv-green mb-1">{detail.booking_code}</p>
            <h3 className="font-display font-bold text-2xl text-alv-snow">{detail.name}</h3>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["WhatsApp", detail.phone],
                ["Tanggal Sewa", fmtDate(detail.date)],
                ["Lokasi", detail.location],
                ["Paket", detail.package],
                ["Kebutuhan", detail.category || "-"],
                ["Catatan", detail.notes || "-"],
                ["Estimasi", rupiah(detail.price_estimate)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-white/5 pb-2">
                  <span className="text-alv-dim">{k}</span>
                  <span className="text-alv-snow text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <StatusBadge status={detail.status} />
              {detail.status === "menunggu" && (
                <div className="flex gap-2">
                  <button onClick={() => { setStatus(detail, "dikonfirmasi"); setDetail(null); }} className="rounded-full bg-alv-green text-alv-ink text-xs font-semibold px-4 py-2">Konfirmasi</button>
                  <button onClick={() => { setStatus(detail, "ditolak"); setDetail(null); }} className="rounded-full border border-red-400/40 text-red-400 text-xs px-4 py-2">Tolak</button>
                </div>
              )}
            </div>
            <button onClick={() => setDetail(null)} className="mt-6 w-full rounded-full border border-white/15 text-alv-snow text-sm px-5 py-3 hover:border-alv-green hover:text-alv-green transition-colors">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
