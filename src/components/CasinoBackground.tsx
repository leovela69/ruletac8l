"use client";

export default function CasinoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Main background image - C8L Casino premium */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/casino-bg.jpg')",
          backgroundColor: "#0a0a0a", // Fallback while image loads
        }}
      />

      {/* Fallback gradient if image doesn't load (same vibe: black + gold) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, rgba(180, 140, 40, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, rgba(180, 140, 40, 0.05) 0%, transparent 30%), linear-gradient(180deg, #0a0a0a 0%, #111108 50%, #0a0a0a 100%)",
        }}
      />

      {/* Dark overlay to ensure game elements are readable */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Gold accent line at top (like chandelier light) */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent 10%, rgba(201,164,53,0.3) 50%, transparent 90%)",
        }}
      />
    </div>
  );
}
