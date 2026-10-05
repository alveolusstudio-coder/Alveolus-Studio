export const WA_NUMBER = "6285702253873";
export const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const IS_MOBILE =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px)").matches;

export const scrollToId = (id) => {
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(`#${id}`, { offset: 0, duration: 1.6 });
  else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

export const IMG = {
  hero: "https://images.unsplash.com/photo-1687226012369-36ec24bec4c4?crop=entropy&cs=srgb&fm=jpg&q=85&w=2000&auto=format&fit=crop",
  volcano:
    "https://images.unsplash.com/photo-1705905272120-70576178b4d3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  rice: "https://images.unsplash.com/photo-1559628233-eb1b1a45564b?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  coast:
    "https://images.pexels.com/photos/6209728/pexels-photo-6209728.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  villa:
    "https://images.unsplash.com/photo-1627616010739-78ee1aacf431?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  wedding:
    "https://images.unsplash.com/photo-1562826772-be179f321470?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  hiker:
    "https://images.unsplash.com/photo-1699302150582-bffc5309a8c8?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  cliff:
    "https://images.pexels.com/photos/15663631/pexels-photo-15663631.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  aerialVolcano:
    "https://images.unsplash.com/photo-1783427091805-c6cc3baacf2d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  aerialCoast:
    "https://images.unsplash.com/photo-1506472634167-c6776cd44d07?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  aerialRice:
    "https://images.unsplash.com/photo-1556490496-45afc7b8b8e5?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  cityDusk:
    "https://images.unsplash.com/photo-1782811559906-f2b99e515c72?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  jungle:
    "https://images.unsplash.com/photo-1697350978674-4b40261b0dc3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  villaPool:
    "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600&auto=format&fit=crop",
  prewedding:
    "https://images.unsplash.com/photo-1692716039986-8bdfb063574a?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  concert:
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  creator:
    "https://images.unsplash.com/photo-1630797160666-38e8c5ba44c1?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
  food: "https://images.unsplash.com/photo-1690983322070-22861e13ce47?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400&auto=format&fit=crop",
};

export const LogoMark = ({ className = "w-7 h-7" }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <path d="M32 8 L56 56 H45.5 L32 29.5 L18.5 56 H8 Z" fill="#F5F5F5" />
    <circle cx="32" cy="45" r="4.5" fill="#72F0A8" />
  </svg>
);

export const DroneGlyph = ({ className = "w-16 h-16", stroke = "#F5F5F5" }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
    <rect x="38" y="38" width="24" height="24" rx="7" fill={stroke} />
    <path d="M42 42 L24 24 M58 42 L76 24 M42 58 L24 76 M58 58 L76 76" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="13" stroke={stroke} strokeWidth="3" opacity="0.9" />
    <circle cx="80" cy="20" r="13" stroke={stroke} strokeWidth="3" opacity="0.9" />
    <circle cx="20" cy="80" r="13" stroke={stroke} strokeWidth="3" opacity="0.9" />
    <circle cx="80" cy="80" r="13" stroke={stroke} strokeWidth="3" opacity="0.9" />
    <circle cx="50" cy="63" r="4" fill="#72F0A8" />
  </svg>
);
