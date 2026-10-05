import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg, fmtDateTime } from "./api";

export default function AdminSettings() {
  const [settings, setSettings] = useState({ studio_name: "", whatsapp: "" });
  const [logs, setLogs] = useState([]);

  const load = async () => {
    try {
      const [s, l] = await Promise.all([api.get("/admin/settings"), api.get("/admin/audit-logs")]);
      setSettings({ studio_name: s.data.studio_name || "", whatsapp: s.data.whatsapp || "" });
      setLogs(l.data);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await api.patch("/admin/settings", settings);
      toast.success("Pengaturan berhasil disimpan.");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-alv-snow outline-none focus:border-alv-green/60 transition-colors";

  return (
    <div data-testid="admin-settings-page" className="max-w-4xl">
      <p className="hud-label mb-2">PENGATURAN</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Pengaturan Studio</h1>

      <div className="mt-8 glass rounded-2xl border border-white/10 p-7 space-y-5">
        <div>
          <label className="hud-label block mb-2">Nama Studio</label>
          <input data-testid="settings-studio-name" value={settings.studio_name} onChange={(e) => setSettings({ ...settings, studio_name: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="hud-label block mb-2">Nomor WhatsApp Booking</label>
          <input data-testid="settings-whatsapp" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} className={inputCls} />
        </div>
        <button data-testid="settings-save-btn" onClick={save} className="rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-6 py-3 hover:shadow-[0_0_25px_rgba(114,240,168,0.4)] transition-shadow">
          Simpan Pengaturan
        </button>
      </div>

      <h2 className="mt-12 font-display font-bold text-xl text-alv-snow">Audit Log</h2>
      <p className="mt-1 text-sm text-alv-mist">Catatan aktivitas penting admin.</p>

      <div className="mt-4 glass rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-white/10">
                {["Waktu", "Admin", "Aksi", "Target", "IP"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-alv-dim text-sm">Belum ada aktivitas tercatat.</td></tr>
              )}
              {logs.map((l) => (
                <tr key={l.id} data-testid={`audit-row-${l.id}`} className="border-b border-white/5">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-alv-mist whitespace-nowrap">{fmtDateTime(l.created_at)}</td>
                  <td className="px-5 py-3.5 text-alv-snow/80">{l.admin_email}</td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-full border border-alv-green/25 bg-alv-green/5 text-alv-green font-mono text-[10px] tracking-wider px-2.5 py-1">{l.action}</span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-alv-dim">{l.target_type}{l.target_id ? ` · ${String(l.target_id).slice(-6)}` : ""}</td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-alv-dim">{l.ip_address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
