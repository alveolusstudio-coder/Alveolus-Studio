import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errMsg, fmtDate, rupiah, StatusBadge } from "./api";
import { useAdmin } from "./AdminGuard";

const CARDS = [
  { key: "booking_hari_ini", label: "BOOKING HARI INI", money: false },
  { key: "menunggu_konfirmasi", label: "BOOKING MENUNGGU KONFIRMASI", money: false },
  { key: "booking_aktif", label: "BOOKING AKTIF", money: false },
  { key: "total_bulan_ini", label: "TOTAL BOOKING BULAN INI", money: false },
  { key: "estimasi_pendapatan", label: "ESTIMASI PENDAPATAN", money: true },
];

export default function Dashboard() {
  const { user } = useAdmin();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [s, b] = await Promise.all([api.get("/admin/stats"), api.get("/admin/bookings")]);
      setStats(s.data);
      setRecent(b.data.slice(0, 6));
    } catch (e) {
      setError(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (b, status) => {
    try {
      await api.patch(`/admin/bookings/${b.id}/status`, { status });
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <div data-testid="admin-dashboard" className="max-w-6xl">
      <p className="hud-label mb-2">DASHBOARD</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">
        Selamat datang, <span className="text-alv-green">{user?.name || "Admin"}.</span>
      </h1>
      <p className="mt-2 text-sm text-alv-mist">Ringkasan operasional ALVEOLUS.STUDIO hari ini.</p>

      {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
        {CARDS.map((c) => (
          <div key={c.key} data-testid={`stat-${c.key}`} className="glass rounded-2xl p-5 border border-white/10">
            <p className="font-mono text-[9px] tracking-[0.2em] text-alv-dim uppercase leading-relaxed">{c.label}</p>
            <p className={`mt-3 font-display font-extrabold ${c.money ? "text-base sm:text-lg text-alv-gold" : "text-3xl text-alv-snow"}`}>
              {stats ? (c.money ? rupiah(stats[c.key]) : stats[c.key]) : "—"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-display font-bold text-xl text-alv-snow">Booking Terbaru</h2>
        <Link to="/admin/bookings" data-testid="dashboard-view-all" className="font-mono text-[11px] tracking-[0.2em] text-alv-green uppercase hover:text-alv-snow transition-colors">
          Lihat Semua →
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {recent.length === 0 && (
          <div className="glass rounded-2xl p-8 border border-white/10 text-center text-sm text-alv-dim">
            Belum ada booking masuk.
          </div>
        )}
        {recent.map((b) => (
          <div key={b.id} data-testid={`recent-booking-${b.id}`} className="glass rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-[0.2em] text-alv-green">{b.booking_code}</p>
              <p className="mt-1 font-display font-bold text-alv-snow truncate">{b.name}</p>
              <p className="text-xs text-alv-mist mt-0.5">
                {b.package} · {fmtDate(b.date)} · {b.location}
              </p>
            </div>
            <StatusBadge status={b.status} />
            <div className="flex gap-2">
              <button
                data-testid={`recent-detail-${b.id}`}
                onClick={() => setDetail(b)}
                className="rounded-full border border-white/15 text-alv-snow text-xs px-4 py-2 hover:border-alv-green hover:text-alv-green transition-colors"
              >
                Lihat Detail
              </button>
              {b.status === "menunggu" && (
                <>
                  <button
                    data-testid={`recent-confirm-${b.id}`}
                    onClick={() => setStatus(b, "dikonfirmasi")}
                    className="rounded-full bg-alv-green text-alv-ink text-xs font-semibold px-4 py-2 hover:shadow-[0_0_20px_rgba(114,240,168,0.4)] transition-shadow"
                  >
                    Konfirmasi
                  </button>
                  <button
                    data-testid={`recent-reject-${b.id}`}
                    onClick={() => setStatus(b, "ditolak")}
                    className="rounded-full border border-red-400/40 text-red-400 text-xs px-4 py-2 hover:bg-red-400/10 transition-colors"
                  >
                    Tolak
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
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
            <div className="mt-5"><StatusBadge status={detail.status} /></div>
            <button onClick={() => setDetail(null)} className="mt-6 w-full rounded-full border border-white/15 text-alv-snow text-sm px-5 py-3 hover:border-alv-green hover:text-alv-green transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
