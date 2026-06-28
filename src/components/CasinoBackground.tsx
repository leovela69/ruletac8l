"use client";

export default function CasinoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Main background image - C8L Casino premium */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/casino-bg.jpg')",
          backgroundColor: "#0a0a0a",
        }}
      />

      {/* Very light overlay - just enough to read text over bright areas */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}
