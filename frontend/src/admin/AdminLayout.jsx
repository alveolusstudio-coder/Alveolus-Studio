import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, ClipboardList, Users, Plane, Wallet, Settings, LogOut, Menu, X } from "lucide-react";
import { useAdmin } from "./AdminGuard";
import { LogoMark } from "@/lib/config";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/calendar", label: "Kalender", icon: Calendar },
  { to: "/admin/bookings", label: "Booking", icon: ClipboardList },
  { to: "/admin/customers", label: "Pelanggan", icon: Users },
  { to: "/admin/equipment", label: "Peralatan", icon: Plane },
  { to: "/admin/packages", label: "Paket & Harga", icon: Wallet },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();

  const doLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-8">
        <LogoMark className="w-6 h-6" />
        <span className="font-display font-extrabold tracking-[0.15em] text-sm text-alv-snow">
          ALVEOLUS<span className="text-alv-green">.STUDIO</span>
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`admin-nav-${label.toLowerCase().replace(/\s|&/g, "-")}`}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                isActive
                  ? "bg-alv-green/10 text-alv-green border border-alv-green/25"
                  : "text-alv-mist hover:text-alv-snow hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={1.7} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <NavLink
          to="/admin/profile"
          data-testid="admin-nav-profile"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-alv-green/15 border border-alv-green/30 flex items-center justify-center font-display font-bold text-alv-green text-sm">
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-alv-snow truncate">{user?.name || "Admin"}</p>
            <p className="font-mono text-[10px] text-alv-dim truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          data-testid="admin-logout-btn"
          onClick={doLogout}
          className="mt-2 w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.7} />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-alv-ink flex">
      <aside className="hidden lg:block w-64 shrink-0 border-r border-white/5 bg-alv-pine/60 backdrop-blur sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-alv-green/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark className="w-5 h-5" />
          <span className="font-display font-bold tracking-[0.15em] text-xs text-alv-snow">ALVEOLUS<span className="text-alv-green">.STUDIO</span></span>
        </div>
        <button data-testid="admin-mobile-menu" onClick={() => setOpen(!open)} className="p-2 text-alv-snow" aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden fixed inset-0 z-30 bg-alv-ink/95 backdrop-blur pt-16">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-10 pt-20 lg:pt-10">
        <Outlet />
      </main>
    </div>
  );
}
