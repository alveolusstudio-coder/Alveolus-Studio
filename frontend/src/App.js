import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import Lenis from "lenis";
import { Toaster } from "sonner";

import BootSequence from "@/components/BootSequence";
import CustomCursor from "@/components/CustomCursor";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ScrollFly from "@/components/ScrollFly";
import Showcase from "@/components/Showcase";
import Missions from "@/components/Missions";
import Packages from "@/components/Packages";
import FlightPath from "@/components/FlightPath";
import Portfolio from "@/components/Portfolio";
import Interlude from "@/components/Interlude";
import Booking from "@/components/Booking";
import WhyAlveolus from "@/components/WhyAlveolus";
import FinalFlight from "@/components/FinalFlight";

import AdminGuard from "@/admin/AdminGuard";
import AdminLogin from "@/admin/AdminLogin";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/Dashboard";
import AdminBookings from "@/admin/AdminBookings";
import AdminCalendar from "@/admin/AdminCalendar";
import AdminCustomers from "@/admin/AdminCustomers";
import AdminPackages from "@/admin/AdminPackages";
import AdminEquipment from "@/admin/AdminEquipment";
import AdminSettings from "@/admin/AdminSettings";
import AdminProfile from "@/admin/AdminProfile";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

function PublicSite() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.09, smoothWheel: !reduce });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (booted) {
      const t = setTimeout(() => ScrollTrigger.refresh(), 300);
      return () => clearTimeout(t);
    }
  }, [booted]);

  return (
    <>
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <Navbar visible={booted} />
      <main>
        <Hero started={booted} />
        <Marquee items={["ALVEOLUS.STUDIO", "SEE THE WORLD DIFFERENTLY", "DRONE RENTAL & VISUAL PRODUCTION", "DJI MINI 3"]} />
        <ScrollFly />
        <Showcase />
        <Missions />
        <Packages />
        <FlightPath />
        <Portfolio />
        <Interlude />
        <Booking />
        <WhyAlveolus />
        <FinalFlight />
      </main>
    </>
  );
}

function App() {
  return (
    <div className="bg-alv-ink text-alv-snow antialiased">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSite />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminLayout />
              </AdminGuard>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="equipment" element={<AdminEquipment />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <CustomCursor />
      <div className="grain-overlay" aria-hidden="true" />
      <Toaster theme="dark" position="bottom-center" toastOptions={{ style: { background: "#121614", border: "1px solid rgba(114,240,168,0.25)", color: "#F5F5F5" } }} />
    </div>
  );
}

export default App;
