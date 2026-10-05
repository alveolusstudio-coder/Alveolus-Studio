import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { api, errMsg } from "./api";
import { LogoMark } from "@/lib/config";

export default function AdminLogin() {
  const rootRef = useRef(null);
  const flashRef = useRef(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "ADMIN PORTAL — ALVEOLUS.STUDIO";
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".al-dot", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4 })
        .to(".al-dot", { scale: 1.5, repeat: 1, yoyo: true, duration: 0.18 })
        .fromTo(".al-brand", { yPercent: 110 }, { yPercent: 0, duration: 0.6 }, "-=0.1")
        .fromTo(".al-portal", { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.35em", duration: 0.5 }, "-=0.2")
        .fromTo(".al-form", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.15")
        .fromTo(".al-back", { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.2");
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/login", { email: form.email.trim(), password: form.password });
      // post-auth transition: green circle expands (< 1s)
      await new Promise((resolve) => {
        gsap
          .timeline({ onComplete: resolve })
          .to(".al-dot", { scale: 80, duration: 0.65, ease: "power3.in" })
          .to(flashRef.current, { opacity: 1, duration: 0.15 }, "-=0.2");
      });
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(errMsg(err, "Email atau password tidak sesuai."));
      setLoading(false);
      gsap.fromTo(".al-form", { x: -8 }, { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" });
    }
  };

  const inputCls =
    "w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-sm text-alv-snow placeholder:text-alv-dim outline-none focus:border-alv-green/60 focus:shadow-[0_0_0_3px_rgba(114,240,168,0.08)] transition-all duration-300";

  return (
    <div ref={rootRef} data-testid="admin-login-page" className="min-h-screen bg-alv-ink flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(114,240,168,0.06),transparent_55%)]" />
      <div ref={flashRef} className="absolute inset-0 bg-alv-green opacity-0 pointer-events-none z-20" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="al-dot w-2.5 h-2.5 rounded-full bg-alv-green shadow-[0_0_24px_rgba(114,240,168,0.9)] mb-8" />

        <div className="overflow-hidden mb-2">
          <div className="al-brand flex items-center gap-2.5">
            <LogoMark className="w-6 h-6" />
            <span className="font-display font-extrabold tracking-[0.18em] text-lg text-alv-snow">
              ALVEOLUS<span className="text-alv-green">.STUDIO</span>
            </span>
          </div>
        </div>
        <p className="al-portal font-mono text-[11px] uppercase text-alv-gold tracking-[0.35em] mb-2">Admin Portal</p>
        <p className="al-form text-xs text-alv-mist mb-8 text-center">Kelola booking, jadwal, paket, dan operasional drone.</p>

        <form onSubmit={submit} className="al-form w-full glass rounded-3xl p-7 border border-alv-green/15 space-y-5">
          <div>
            <label className="hud-label block mb-2">Email Admin</label>
            <input
              data-testid="admin-login-email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@alveolus.studio"
              className={inputCls}
            />
          </div>
          <div>
            <label className="hud-label block mb-2">Password</label>
            <input
              data-testid="admin-login-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••"
              className={inputCls}
            />
          </div>

          {error && (
            <p data-testid="admin-login-error" className="text-xs text-red-400 bg-red-400/10 border border-red-400/25 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-alv-green text-alv-ink font-semibold text-sm px-6 py-3.5 hover:shadow-[0_0_35px_rgba(114,240,168,0.45)] transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Memverifikasi..." : "Masuk ke Dashboard →"}
          </button>
        </form>

        <Link data-testid="admin-login-back" to="/" className="al-back mt-7 font-mono text-[11px] tracking-[0.2em] text-alv-dim hover:text-alv-green uppercase transition-colors">
          ← Kembali ke Website
        </Link>
      </div>
    </div>
  );
}
