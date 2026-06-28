"use client";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimensions = {
    sm: { w: 120, h: 50, text: "text-[10px]", sub: "text-[7px]" },
    md: { w: 200, h: 70, text: "text-sm", sub: "text-[9px]" },
    lg: { w: 300, h: 100, text: "text-lg", sub: "text-xs" },
  };

  const d = dimensions[size];

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Logo icon - Roulette wheel + Lion */}
      <div className="relative">
        <svg
          width={size === "sm" ? 36 : size === "md" ? 50 : 70}
          height={size === "sm" ? 36 : size === "md" ? 50 : 70}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer golden ring */}
          <circle cx="50" cy="50" r="47" stroke="url(#goldGrad)" strokeWidth="4" fill="none" />
          <circle cx="50" cy="50" r="43" stroke="rgba(201,164,53,0.3)" strokeWidth="1" fill="none" />
          
          {/* Roulette segments (simplified) */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            const x1 = 50 + Math.cos(angle) * 25;
            const y1 = 50 + Math.sin(angle) * 25;
            const x2 = 50 + Math.cos(angle) * 40;
            const y2 = 50 + Math.sin(angle) * 40;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 2 === 0 ? "#c62828" : "#333"}
                strokeWidth="2"
                opacity="0.6"
              />
            );
          })}

          {/* Inner circle */}
          <circle cx="50" cy="50" r="22" fill="url(#darkGrad)" stroke="#c9a435" strokeWidth="1.5" />
          
          {/* Lion silhouette (crown shape for simplicity) */}
          <path
            d="M40 55 L43 45 L46 50 L50 42 L54 50 L57 45 L60 55 Z"
            fill="url(#goldGrad)"
            stroke="#4a3508"
            strokeWidth="0.5"
          />
          {/* Lion mane simplified */}
          <circle cx="50" cy="52" r="6" fill="none" stroke="#c9a435" strokeWidth="1" opacity="0.5" />
          
          {/* 8 in center */}
          <text x="50" y="62" textAnchor="middle" fill="#e6c84d" fontSize="10" fontWeight="bold" fontFamily="Georgia">
            8
          </text>

          {/* Ball */}
          <circle cx="72" cy="28" r="4" fill="url(#ballGrad)" />
          <circle cx="71" cy="27" r="1.5" fill="rgba(255,255,255,0.6)" />

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6c84d" />
              <stop offset="50%" stopColor="#c9a435" />
              <stop offset="100%" stopColor="#8b6914" />
            </linearGradient>
            <radialGradient id="darkGrad" cx="40%" cy="40%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id="ballGrad" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e0e0e0" />
              <stop offset="100%" stopColor="#888888" />
            </radialGradient>
          </defs>
        </svg>

        {/* Animated glow */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(201,164,53,0.15) 0%, transparent 70%)",
            animation: "pulse-gold 3s ease-in-out infinite",
          }}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className={`font-game font-bold tracking-wider bg-gradient-to-r from-yellow-300 via-casino-gold to-yellow-600 bg-clip-text text-transparent ${d.text}`}>
            C.8.L
          </span>
          <span className={`font-game text-casino-gold/60 ${d.sub}`}>
            ™
          </span>
        </div>
        <span className={`font-game uppercase tracking-[0.25em] text-casino-gold/80 -mt-0.5 ${d.sub}`}>
          Ruleta Casino
        </span>
        <span className={`font-game uppercase tracking-[0.4em] text-gray-500 ${size === "sm" ? "text-[5px]" : "text-[7px]"}`}>
          Agency
        </span>
      </div>
    </div>
  );
}
