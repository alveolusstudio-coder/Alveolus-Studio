export default function Marquee({ items, className = "", dark = false }) {
  const row = items.join("\u00A0\u00A0//\u00A0\u00A0") + "\u00A0\u00A0//\u00A0\u00A0";
  return (
    <div
      className={`marquee border-y py-4 sm:py-5 ${
        dark ? "border-white/5 bg-alv-ink" : "border-alv-green/10 bg-alv-pine/60"
      } ${className}`}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {[0, 1].map((i) => (
          <span
            key={i}
            className="font-display font-bold uppercase tracking-[0.3em] text-sm sm:text-base text-alv-snow/15"
          >
            {row}
            <span className="text-alv-green/40">SEE THE WORLD DIFFERENTLY</span>
            {"\u00A0\u00A0//\u00A0\u00A0"}
          </span>
        ))}
      </div>
    </div>
  );
}
