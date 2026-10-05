import { useEffect, useMemo, useState } from "react";
import { api, fmtDate, StatusBadge } from "./api";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function AdminCalendar() {
  const [bookings, setBookings] = useState([]);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/admin/bookings").then((r) => setBookings(r.data)).catch(() => {});
  }, []);

  const byDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.date) return;
      (map[b.date] = map[b.date] || []).push(b);
    });
    return map;
  }, [bookings]);

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [cursor]);

  const move = (dir) => {
    setCursor(({ y, m }) => {
      const d = new Date(y, m + dir, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
    setSelected(null);
  };

  const dateKey = (d) => `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <div data-testid="admin-calendar-page" className="max-w-5xl">
      <p className="hud-label mb-2">KALENDER</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Jadwal Penerbangan</h1>

      <div className="mt-8 glass rounded-3xl border border-white/10 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <button data-testid="cal-prev" onClick={() => move(-1)} className="rounded-full border border-white/15 text-alv-snow px-4 py-2 text-sm hover:border-alv-green hover:text-alv-green transition-colors">←</button>
          <h2 className="font-display font-bold text-xl text-alv-snow">{MONTHS[cursor.m]} {cursor.y}</h2>
          <button data-testid="cal-next" onClick={() => move(1)} className="rounded-full border border-white/15 text-alv-snow px-4 py-2 text-sm hover:border-alv-green hover:text-alv-green transition-colors">→</button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => (
            <div key={d} className="text-center font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase py-2">{d}</div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const key = dateKey(d);
            const dayBookings = byDate[key] || [];
            const isSelected = selected === key;
            return (
              <button
                key={key}
                data-testid={`cal-day-${key}`}
                onClick={() => setSelected(key)}
                className={`aspect-square rounded-xl border text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? "border-alv-green bg-alv-green/15 text-alv-green"
                    : dayBookings.length
                    ? "border-alv-green/25 bg-alv-green/5 text-alv-snow hover:border-alv-green/60"
                    : "border-white/5 text-alv-mist hover:border-white/20"
                }`}
              >
                {d}
                {dayBookings.length > 0 && (
                  <span className="flex gap-0.5">
                    {dayBookings.slice(0, 3).map((b, j) => (
                      <span key={j} className={`w-1.5 h-1.5 rounded-full ${b.status === "dikonfirmasi" ? "bg-alv-green" : b.status === "menunggu" ? "bg-yellow-400" : "bg-alv-dim"}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <div data-testid="cal-day-detail" className="mt-6 glass rounded-2xl border border-white/10 p-6">
          <h3 className="font-display font-bold text-lg text-alv-snow">{fmtDate(selected)}</h3>
          <div className="mt-4 space-y-3">
            {(byDate[selected] || []).length === 0 && <p className="text-sm text-alv-dim">Tidak ada booking pada tanggal ini.</p>}
            {(byDate[selected] || []).map((b) => (
              <div key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border-b border-white/5 pb-3">
                <div className="flex-1">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-alv-green">{b.booking_code}</p>
                  <p className="text-alv-snow font-medium">{b.name} — {b.package}</p>
                  <p className="text-xs text-alv-mist">{b.location}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
