import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_URL}/api`,
  withCredentials: true,
});

export const errMsg = (e, fallback = "Terjadi kesalahan. Silakan coba lagi.") => {
  const d = e?.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || "").filter(Boolean).join(" ");
  return fallback;
};

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const fmtDateTime = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${fmtDate(iso)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export const rupiah = (n) => `Rp${Number(n || 0).toLocaleString("id-ID")}`;

export const STATUS_META = {
  menunggu: { label: "Menunggu Konfirmasi", dot: "🟡", cls: "text-yellow-300 border-yellow-400/30 bg-yellow-400/10" },
  dikonfirmasi: { label: "Dikonfirmasi", dot: "🟢", cls: "text-alv-green border-alv-green/30 bg-alv-green/10" },
  ditolak: { label: "Ditolak", dot: "🔴", cls: "text-red-400 border-red-400/30 bg-red-400/10" },
  dibatalkan: { label: "Dibatalkan", dot: "⚫", cls: "text-alv-mist border-white/15 bg-white/5" },
};

export const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.menunggu;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider ${m.cls}`}>
      <span className="text-[9px]">{m.dot}</span>
      {m.label}
    </span>
  );
};
