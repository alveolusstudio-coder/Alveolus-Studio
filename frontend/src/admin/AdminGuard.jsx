import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api } from "./api";
import { LogoMark } from "@/lib/config";

const AdminCtx = createContext(null);
export const useAdmin = () => useContext(AdminCtx);

export default function AdminGuard({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });
  const location = useLocation();

  useEffect(() => {
    let live = true;
    api
      .get("/auth/me")
      .then((r) => live && setState({ status: "ok", user: r.data }))
      .catch(() => live && setState({ status: "no", user: null }));
    return () => {
      live = false;
    };
  }, [location.pathname]);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen bg-alv-ink flex flex-col items-center justify-center gap-5">
        <LogoMark className="w-10 h-10 animate-pulse" />
        <p className="font-mono text-[10px] tracking-[0.3em] text-alv-mist uppercase">Memverifikasi sesi...</p>
      </div>
    );
  }

  if (state.status === "no") {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
  };

  return <AdminCtx.Provider value={{ user: state.user, setUser: (u) => setState({ status: "ok", user: u }), logout }}>{children}</AdminCtx.Provider>;
}
