import { useState } from "react";
import { toast } from "sonner";
import { api, errMsg, fmtDateTime } from "./api";
import { useAdmin } from "./AdminGuard";

export default function AdminProfile() {
  const { user, setUser } = useAdmin();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pw, setPw] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const inputCls =
    "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-alv-snow outline-none focus:border-alv-green/60 transition-colors";

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const r = await api.patch("/admin/profile", profile);
      setUser(r.data);
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      toast.error(errMsg(err));
    }
    setSavingProfile(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.new_password !== pw.confirm_password) {
      toast.error("Konfirmasi password tidak sama.");
      return;
    }
    setSavingPw(true);
    try {
      await api.post("/admin/change-password", pw);
      toast.success("Password berhasil diperbarui.");
      setPw({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(errMsg(err));
    }
    setSavingPw(false);
  };

  return (
    <div data-testid="admin-profile-page" className="max-w-3xl">
      <p className="hud-label mb-2">PROFIL ADMIN</p>
      <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-alv-snow tracking-tight">Akun Admin</h1>

      <div className="mt-8 glass rounded-2xl border border-white/10 p-7">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-alv-green/15 border border-alv-green/30 flex items-center justify-center font-display font-extrabold text-alv-green text-xl">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-alv-snow">{user?.name}</p>
            <p className="font-mono text-xs text-alv-mist">{user?.email}</p>
          </div>
          <span className="ml-auto rounded-full border border-alv-green/30 bg-alv-green/10 text-alv-green font-mono text-[10px] tracking-[0.2em] px-3 py-1.5 uppercase">
            {user?.role}
          </span>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-white/5 rounded-xl p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase">Tanggal Dibuat</p>
            <p className="mt-1.5 text-alv-snow">{fmtDateTime(user?.created_at)}</p>
          </div>
          <div className="border border-white/5 rounded-xl p-4">
            <p className="font-mono text-[10px] tracking-[0.2em] text-alv-dim uppercase">Login Terakhir</p>
            <p className="mt-1.5 text-alv-snow">{user?.last_login ? fmtDateTime(user.last_login) : "—"}</p>
          </div>
        </div>
      </div>

      <form onSubmit={saveProfile} className="mt-6 glass rounded-2xl border border-white/10 p-7 space-y-5">
        <h2 className="font-display font-bold text-lg text-alv-snow">Ubah Profil</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="hud-label block mb-2">Nama</label>
            <input data-testid="profile-name-input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="hud-label block mb-2">Email</label>
            <input data-testid="profile-email-input" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={inputCls} />
          </div>
        </div>
        <button data-testid="profile-save-btn" disabled={savingProfile} className="rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-6 py-3 disabled:opacity-60 hover:shadow-[0_0_25px_rgba(114,240,168,0.4)] transition-shadow">
          {savingProfile ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </form>

      <form onSubmit={savePassword} className="mt-6 glass rounded-2xl border border-white/10 p-7 space-y-5">
        <h2 className="font-display font-bold text-lg text-alv-snow">Ganti Password</h2>
        <div>
          <label className="hud-label block mb-2">Password Lama</label>
          <input data-testid="password-old-input" type="password" required value={pw.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} className={inputCls} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="hud-label block mb-2">Password Baru</label>
            <input data-testid="password-new-input" type="password" required minLength={8} value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="hud-label block mb-2">Konfirmasi Password Baru</label>
            <input data-testid="password-confirm-input" type="password" required value={pw.confirm_password} onChange={(e) => setPw({ ...pw, confirm_password: e.target.value })} className={inputCls} />
          </div>
        </div>
        <button data-testid="password-save-btn" disabled={savingPw} className="rounded-full border border-alv-green/50 text-alv-green font-semibold text-sm px-6 py-3 disabled:opacity-60 hover:bg-alv-green hover:text-alv-ink transition-colors">
          {savingPw ? "Memproses..." : "Perbarui Password"}
        </button>
      </form>
    </div>
  );
}
