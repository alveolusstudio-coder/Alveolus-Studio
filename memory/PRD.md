# ALVEOLUS.STUDIO — PRD

## Original Problem Statement
Ultra-premium cinematic interactive 3D website for ALVEOLUS.STUDIO — DJI Mini 3 drone rental + creative visual studio (Indonesia). Mixed English/Bahasa Indonesia copy. DJI × Apple × Awwwards feel. 18 spec sections: boot sequence, 3D hero, scroll-to-fly lens portal, product hotspots, mission selector, paket sewa (glass 3D cards), flight path, portfolio, typographic interlude, WhatsApp booking, why-us, final flight, floating nav, custom cursor, mobile premium mode.
Second request: full admin authentication system — separated admin portal (/admin/*), server-side sessions, RBAC, rate limiting, audit logs, dashboard/bookings/calendar/customers/equipment/packages/settings/profile, password change, Indonesian error messages.

## User Personas
- Indonesian couples (wedding/prewedding), event organizers, property owners, tourism marketers, UMKM owners, content creators → book drone via WhatsApp.
- Studio admin → manages bookings, schedule, packages, equipment.

## Architecture
- Frontend: React 19 (CRA/craco), React Three Fiber 9 + drei (procedural DJI Mini 3), GSAP ScrollTrigger + MotionPath, Lenis smooth scroll, framer-motion, Tailwind, sonner.
- Backend: FastAPI + MongoDB (motor). Public: POST /api/bookings. Auth: opaque server-side sessions (alv_session httpOnly cookie, 60-min sliding idle expiry, 12h absolute), bcrypt hashes, login_attempts lockout (5 fails / 15 min), audit_logs collection.
- Admin seed: ADMIN_EMAIL/ADMIN_PASSWORD env vars, seeded only when missing (in-app password changes persist).

## Implemented (2026-10-05)
- Public site: boot sequence, 3D hero w/ mouse parallax + particles, scroll-to-fly 6-step sequence + lens portal, hotspot showcase, 8 mission cards, 3 paket glass tilt cards, flight path motion-path timeline, pinned horizontal portfolio, typographic interlude w/ drone emergence, WhatsApp booking form (wa.me/6285702253873 + MongoDB lead save, booking codes ALV-YYYYMMDD-###), why-alveolus, final flight + footer marquee, custom cursor, grain overlay, floating glass nav, mobile-tuned effects.
- Admin: /admin/login (cinematic intro + <1s post-auth transition), guard w/ server verification, sidebar layout, dashboard (5 stats + booking terbaru + confirm/reject/detail modal), bookings table + filters, calendar, customers, packages (price/active edit), equipment status, settings + audit log viewer, profile (name/email edit, password change w/ old+confirm).
- Verified: login/logout/back-button, 401/400/429 Indonesian errors, lockout after 5 fails, admin API 401 without session, booking confirm audit trail, WA popup message content, portal + interlude + mobile hero screenshots.

## Backlog
- P0: none blocking.
- P1: connect public paket prices to admin-managed packages collection; booking date double-booking warning on calendar; export bookings CSV.
- P2: multi-admin/staff roles (schema-ready), password reset flow, 2FA, email notifications on new booking, WebGL bloom/DOF post-processing upgrade, real GLB DJI Mini 3 model.
