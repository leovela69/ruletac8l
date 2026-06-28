"use client";

export default function CasinoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base: rich casino green felt gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #1e6b35 0%, #145228 30%, #0d3a1c 60%, #071f10 85%, #030d06 100%)",
        }}
      />

      {/* Felt fabric texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='8' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4' cy='4' r='0.8' fill='%23000' opacity='0.15'/%3E%3Ccircle cx='1' cy='1' r='0.4' fill='%23000' opacity='0.1'/%3E%3Ccircle cx='7' cy='6' r='0.3' fill='%23000' opacity='0.08'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle radial light from center (like overhead casino lamp) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(201, 164, 53, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Vignette edges (dark corners like in a real casino) */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* C8L Logo Watermark - centered, subtle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg
          width="500"
          height="500"
          viewBox="0 0 500 500"
          className="opacity-[0.04]"
          fill="none"
        >
          {/* Outer decorative circle */}
          <circle cx="250" cy="250" r="230" stroke="#c9a435" strokeWidth="3" />
          <circle cx="250" cy="250" r="220" stroke="#c9a435" strokeWidth="1" strokeDasharray="8 4" />
          <circle cx="250" cy="250" r="210" stroke="#c9a435" strokeWidth="1" />

          {/* Roulette wheel segments (decorative) */}
          {Array.from({ length: 37 }).map((_, i) => {
            const angle = (i / 37) * Math.PI * 2;
            const x1 = 250 + Math.cos(angle) * 160;
            const y1 = 250 + Math.sin(angle) * 160;
            const x2 = 250 + Math.cos(angle) * 200;
            const y2 = 250 + Math.sin(angle) * 200;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a435" strokeWidth="1" />
            );
          })}

          {/* Inner decorative ring */}
          <circle cx="250" cy="250" r="155" stroke="#c9a435" strokeWidth="2" />

          {/* Crown shape (lion/king motif) */}
          <path
            d="M 200 270 L 210 240 L 220 255 L 235 225 L 250 245 L 265 225 L 280 255 L 290 240 L 300 270 Z"
            stroke="#c9a435"
            strokeWidth="3"
            fill="none"
          />

          {/* C.8.L text */}
          <text x="250" y="310" textAnchor="middle" fill="#c9a435" fontSize="48" fontWeight="bold" fontFamily="Georgia, serif">
            C.8.L
          </text>

          {/* RULETA AGENCY subtitle */}
          <text x="250" y="345" textAnchor="middle" fill="#c9a435" fontSize="16" fontFamily="Arial, sans-serif" letterSpacing="8">
            RULETA AGENCY
          </text>

          {/* Decorative bottom flourish */}
          <path
            d="M 180 365 Q 215 375 250 365 Q 285 375 320 365"
            stroke="#c9a435"
            strokeWidth="2"
            fill="none"
          />

          {/* Corner ornaments */}
          <path d="M 250 50 L 255 60 L 250 70 L 245 60 Z" fill="#c9a435" />
          <path d="M 250 430 L 255 440 L 250 450 L 245 440 Z" fill="#c9a435" />
          <path d="M 50 250 L 60 255 L 70 250 L 60 245 Z" fill="#c9a435" />
          <path d="M 430 250 L 440 255 L 450 250 L 440 245 Z" fill="#c9a435" />

          {/* Stars / sparkle decorations */}
          {[
            [120, 120], [380, 120], [120, 380], [380, 380],
            [180, 80], [320, 80], [80, 180], [420, 180],
          ].map(([x, y], i) => (
            <g key={i}>
              <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="#c9a435" strokeWidth="1" />
              <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="#c9a435" strokeWidth="1" />
            </g>
          ))}
        </svg>
      </div>

      {/* Subtle golden border accent at edges */}
      <div className="absolute inset-0 border border-amber-900/10 pointer-events-none" />
    </div>
  );
}
